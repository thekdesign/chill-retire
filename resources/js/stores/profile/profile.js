import {defineStore} from 'pinia';
import {DEFAULT_ASSUMPTIONS} from 'data/assumptions';
import {FIRE_TYPES} from 'data/fireTypes';
import {getStressTest} from 'data/stressTests';
import {getStrategy, detectStrategy, INVESTMENT_STRATEGIES} from 'data/investmentStrategies';
import {calculateScenario, realReturn} from 'libs/fireCalculator';
import {calculateTwRetirementCashflow} from 'libs/twPensionCalc';
import {runMonteCarlo} from 'libs/monteCarloSim';

const STORAGE_KEY = 'chill-retire:profile:v1';
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const defaultProfile = () => ({
    // Step 1 基本（參考主計處 2024 受僱員工經常性薪資中位數 NT$ 47,500）
    currentAge: 32,
    monthlyIncome: 47500,              // 台灣月薪中位數
    monthlyExpense: 32000,             // 支出率約 67%
    targetRetireAge: 60,
    // Step 2 資產（多數人緊急預備金不足，預設低於目標）
    currentAssets: 350000,             // 約一年薪資
    emergencyFundCurrent: 80000,       // 約 2.5 個月支出，常見「不夠」狀態
    // Step 3 台灣專版 — 預設啟用（這是台灣工具）
    twEnabled: true,
    averageInsuredSalary: 45800,       // 勞保投保薪資上限
    laborInsuranceYears: 10,           // 32 歲約累積 10 年年資
    laborPensionBalance: 250000,       // 對應 10 年勞退累積
    laborPensionEmployeeRate: 0,       // 多數人沒自提
    nationalPensionYears: 0,
    laborInsurancePayout: 1.0,
    // 進階生活情境（摺疊區塊，預設「不買房、0 小孩」對主流程零影響）
    housingStatus: 'none',             // 'none' | 'planning' | 'owned'
    housingDownPayment: 1500000,       // 計畫買時的頭期款（NT$）
    housingYearsUntilPurchase: 5,      // 幾年後買
    housingMonthlyMortgage: 25000,     // 月貸款
    housingMortgageYears: 20,          // 貸款年限
    kidsCount: 0,
    kidsCostPerMonth: 15000,
    kidsSupportYears: 22,              // 0 → 22 歲扶養（國際標準）
    // 退休後 side income（顧問/兼職/版稅）
    sideIncomeMonthly: 0,              // 0 = 沒有
    sideIncomeStartAge: 0,             // 0 表示「從退休那年開始」
    sideIncomeEndAge: 75,              // 預設做到 75 歲
    // 漸進式退休（半薪過渡期）
    gradualEnabled: false,
    gradualStartAge: 55,               // 從幾歲開始半薪
    gradualPercentage: 0.5,            // 半薪 = 0.5
    // 退休後健保自負額（多數人忽略）
    postRetirementNhiEnabled: true,
    postRetirementNhiMonthly: 6400,    // 2026 級距估值（無雇主補貼）
    // 長照預備金（晚年加速上升）
    longTermCareEnabled: false,
    longTermCareStartAge: 75,
    longTermCareMonthly: 30000,
    // Step 4 假設（預設投資策略 = 平衡 60/40）
    assumptions: {...DEFAULT_ASSUMPTIONS},
    // 壓力測試 mode（不持久化）
    stressMode: null,
});

const loadFromStorage = () => {
    if (!isBrowser) return defaultProfile();
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultProfile();
        const parsed = JSON.parse(raw);
        return {
            ...defaultProfile(),
            ...parsed,
            assumptions: {...DEFAULT_ASSUMPTIONS, ...(parsed.assumptions || {})},
            stressMode: null,
        };
    } catch (e) {
        return defaultProfile();
    }
};

export const useProfileStore = defineStore('profile', {
    state: () => loadFromStorage(),

    getters: {
        monthlySavings: (state) => Math.max(0, state.monthlyIncome - state.monthlyExpense),
        savingsRate: (state) => {
            if (!state.monthlyIncome) return 0;
            return Math.max(0, (state.monthlyIncome - state.monthlyExpense) / state.monthlyIncome);
        },
        // 緊急預備金狀態
        emergencyFundTarget(state) {
            return state.monthlyExpense * state.assumptions.emergencyFundMonths;
        },
        emergencyFundStatus(state) {
            const target = this.emergencyFundTarget;
            const current = state.emergencyFundCurrent || 0;
            const ratio = target > 0 ? current / target : 1;
            return {
                target,
                current,
                gap: Math.max(0, target - current),
                ratio: Math.min(1.5, ratio),  // 上限 1.5 給 UI 視覺用
                achieved: ratio >= 1,
                level: ratio >= 1 ? 'achieved' : ratio >= 0.5 ? 'partial' : 'low',
            };
        },
        // 房屋總成本（資訊用 — 給 UI 顯示，年度模擬會分散到各年）
        housingDeduction(state) {
            return state.housingStatus === 'planning' ? (state.housingDownPayment || 0) : 0;
        },
        kidsLifetimeCost(state) {
            return (state.kidsCount || 0) * (state.kidsCostPerMonth || 0) * 12 * (state.kidsSupportYears || 0);
        },
        // 可投資資產 = 總資產 - 緊急預備金。
        // 房/小孩在年度模擬內逐年扣，這裡不預扣。
        investableAssets(state) {
            return Math.max(0, state.currentAssets - (state.emergencyFundCurrent || 0));
        },
        // 投資策略：從目前 assumptions 反推（手動改過就變 custom）
        investmentStrategyKey(state) {
            return detectStrategy(state.assumptions);
        },
        investmentStrategy(state) {
            return getStrategy(this.investmentStrategyKey);
        },
        stressTest: (state) => (state.stressMode ? getStressTest(state.stressMode) : null),
        effectiveAssumptions(state) {
            if (!state.stressMode) return state.assumptions;
            const stress = getStressTest(state.stressMode);
            return stress ? stress.modify(state.assumptions) : state.assumptions;
        },
        // 給 fireCalculator / monteCarloSim 用的「完整 profile snapshot」
        // 把所有跟年度模擬有關的欄位打包，避免每個 getter 重複寫
        simulationProfile(state) {
            return {
                currentAge: state.currentAge,
                monthlyIncome: state.monthlyIncome,
                monthlyExpense: state.monthlyExpense,
                targetRetireAge: state.targetRetireAge,
                investableAssets: this.investableAssets,
                // 房
                housingStatus: state.housingStatus,
                housingDownPayment: state.housingDownPayment,
                housingYearsUntilPurchase: state.housingYearsUntilPurchase,
                housingMonthlyMortgage: state.housingMonthlyMortgage,
                housingMortgageYears: state.housingMortgageYears,
                // 小孩
                kidsCount: state.kidsCount,
                kidsCostPerMonth: state.kidsCostPerMonth,
                kidsSupportYears: state.kidsSupportYears,
                // 退休後 side income
                sideIncomeMonthly: state.sideIncomeMonthly,
                sideIncomeStartAge: state.sideIncomeStartAge,
                sideIncomeEndAge: state.sideIncomeEndAge,
                // 漸進式退休
                gradualEnabled: state.gradualEnabled,
                gradualStartAge: state.gradualStartAge,
                gradualPercentage: state.gradualPercentage,
                // 退休後支出
                postRetirementNhiEnabled: state.postRetirementNhiEnabled,
                postRetirementNhiMonthly: state.postRetirementNhiMonthly,
                longTermCareEnabled: state.longTermCareEnabled,
                longTermCareStartAge: state.longTermCareStartAge,
                longTermCareMonthly: state.longTermCareMonthly,
                // 政府年金（讓 sim 65 歲後加入）
                twCashflow: this.twCashflow,
            };
        },
        scenarios(state) {
            const assumptions = this.effectiveAssumptions;
            const simProfile = this.simulationProfile;
            return FIRE_TYPES.map((type) => ({
                type,
                result: calculateScenario(type, simProfile, assumptions),
            }));
        },
        twCashflow(state) {
            if (!state.twEnabled) return null;
            return calculateTwRetirementCashflow({
                currentAge: state.currentAge,
                claimAge: 65,
                monthlySalary: state.averageInsuredSalary,
                laborInsuranceYears: state.laborInsuranceYears,
                laborPensionYears: state.laborInsuranceYears,
                laborPensionBalance: state.laborPensionBalance,
                laborPensionEmployeeRate: state.laborPensionEmployeeRate,
                nationalPensionYears: state.nationalPensionYears,
                laborInsurancePayout: state.laborInsurancePayout,
            });
        },
        primaryScenario() {
            return this.scenarios.find((s) => s.type.key === 'standard');
        },
        monteCarlo(state) {
            const primary = this.primaryScenario;
            const assumptions = this.effectiveAssumptions;
            if (!primary || !primary.result.achievable) {
                return {successRate: 0, iterations: 0, percentiles: [], failedAgeMedian: null};
            }
            const meanReturn = realReturn(assumptions.postRetirementReturn, assumptions.inflationRate);
            const stress = this.stressTest;
            return runMonteCarlo({
                profile: this.simulationProfile,
                retireAge: primary.result.retireAge,
                scenario: primary.type,
                lifeExpectancy: assumptions.lifeExpectancy,
                meanReturn,
                stdDev: assumptions.portfolioVolatility,
                iterations: assumptions.monteCarloIterations,
                seed: 42,
                initialShock: stress ? stress.initialShock : 0,
            });
        },
    },

    actions: {
        update(patch) {
            Object.assign(this, patch);
            this.persist();
        },
        updateAssumption(key, value) {
            this.assumptions = {...this.assumptions, [key]: value};
            this.persist();
        },
        setInvestmentStrategy(key) {
            const strategy = INVESTMENT_STRATEGIES.find((s) => s.key === key);
            if (!strategy) return;
            this.assumptions = {
                ...this.assumptions,
                preRetirementReturn: strategy.preRetirementReturn,
                postRetirementReturn: strategy.postRetirementReturn,
                portfolioVolatility: strategy.portfolioVolatility,
            };
            this.persist();
        },
        setStressMode(key) {
            this.stressMode = this.stressMode === key ? null : key;
        },
        clearStressMode() {
            this.stressMode = null;
        },
        reset() {
            Object.assign(this, defaultProfile());
            this.persist();
        },
        persist() {
            if (!isBrowser) return;
            try {
                const {
                    currentAge, monthlyIncome, monthlyExpense, targetRetireAge,
                    currentAssets, emergencyFundCurrent,
                    twEnabled, averageInsuredSalary, laborInsuranceYears,
                    laborPensionBalance, laborPensionEmployeeRate, nationalPensionYears,
                    laborInsurancePayout,
                    housingStatus, housingDownPayment, housingYearsUntilPurchase,
                    housingMonthlyMortgage, housingMortgageYears,
                    kidsCount, kidsCostPerMonth, kidsSupportYears,
                    sideIncomeMonthly, sideIncomeStartAge, sideIncomeEndAge,
                    gradualEnabled, gradualStartAge, gradualPercentage,
                    postRetirementNhiEnabled, postRetirementNhiMonthly,
                    longTermCareEnabled, longTermCareStartAge, longTermCareMonthly,
                    assumptions,
                } = this;
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    currentAge, monthlyIncome, monthlyExpense, targetRetireAge,
                    currentAssets, emergencyFundCurrent,
                    twEnabled, averageInsuredSalary, laborInsuranceYears,
                    laborPensionBalance, laborPensionEmployeeRate, nationalPensionYears,
                    laborInsurancePayout,
                    housingStatus, housingDownPayment, housingYearsUntilPurchase,
                    housingMonthlyMortgage, housingMortgageYears,
                    kidsCount, kidsCostPerMonth, kidsSupportYears,
                    sideIncomeMonthly, sideIncomeStartAge, sideIncomeEndAge,
                    gradualEnabled, gradualStartAge, gradualPercentage,
                    postRetirementNhiEnabled, postRetirementNhiMonthly,
                    longTermCareEnabled, longTermCareStartAge, longTermCareMonthly,
                    assumptions,
                }));
            } catch (e) {
                // ignore
            }
        },
    },
});
