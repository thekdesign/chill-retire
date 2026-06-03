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

/** 預設一位伴侶的欄位（給「+ 加入伴侶」用） */
const makeDefaultPartner = (id) => ({
    id,
    name: '',                          // 可選的暱稱（顯示用，沒填就 fallback「伴侶 N」）
    age: 32,
    monthlyIncome: 45000,
    averageInsuredSalary: 45800,
    laborInsuranceYears: 10,
    laborPensionBalance: 250000,
    laborPensionEmployeeRate: 0,
    nationalPensionYears: 0,
});

const defaultProfile = () => ({
    // Step 1 基本（參考主計處 2024 受僱員工經常性薪資中位數 NT$ 47,500）
    currentAge: 32,
    monthlyIncome: 47500,
    monthlyExpense: 32000,
    targetRetireAge: 60,
    // Step 2 資產
    currentAssets: 350000,
    emergencyFundCurrent: 80000,
    // Step 3 台灣專版
    twEnabled: true,
    averageInsuredSalary: 45800,
    laborInsuranceYears: 10,
    laborPensionBalance: 250000,
    laborPensionEmployeeRate: 0,
    nationalPensionYears: 0,
    laborInsurancePayout: 1.0,
    // 💑 household 伴侶模式（陣列、可多人；空陣列 = 單身）
    partners: [],
    // 進階生活情境
    housingStatus: 'none',
    housingDownPayment: 1500000,
    housingYearsUntilPurchase: 5,
    housingMonthlyMortgage: 25000,
    housingMortgageYears: 20,
    kidsCount: 0,
    kidsCostPerMonth: 15000,
    kidsSupportYears: 22,
    sideIncomeMonthly: 0,
    sideIncomeStartAge: 0,
    sideIncomeEndAge: 75,
    gradualEnabled: false,
    gradualStartAge: 55,
    gradualPercentage: 0.5,
    postRetirementNhiEnabled: true,
    postRetirementNhiMonthly: 6400,
    longTermCareEnabled: false,
    longTermCareStartAge: 75,
    longTermCareMonthly: 30000,
    // Step 4 假設
    assumptions: {...DEFAULT_ASSUMPTIONS},
    // 暫態
    stressMode: null,
});

/**
 * 把舊版 spouse* 欄位轉成 partners[] 結構。
 * 寫過配偶模式的使用者重整不會被洗掉。
 */
const migrateSpouseToPartners = (parsed) => {
    if (Array.isArray(parsed.partners) && parsed.partners.length > 0) return parsed;
    if (!parsed.coupleEnabled) return parsed;

    parsed.partners = [{
        id: 1,
        name: '',
        age: parsed.spouseAge ?? 32,
        monthlyIncome: parsed.spouseMonthlyIncome ?? 45000,
        averageInsuredSalary: parsed.spouseAverageInsuredSalary ?? 45800,
        laborInsuranceYears: parsed.spouseLaborInsuranceYears ?? 10,
        laborPensionBalance: parsed.spouseLaborPensionBalance ?? 250000,
        laborPensionEmployeeRate: parsed.spouseLaborPensionEmployeeRate ?? 0,
        nationalPensionYears: parsed.spouseNationalPensionYears ?? 0,
    }];
    return parsed;
};

const loadFromStorage = () => {
    if (!isBrowser) return defaultProfile();
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultProfile();
        let parsed = JSON.parse(raw);
        parsed = migrateSpouseToPartners(parsed);
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
        emergencyFundTarget(state) {
            return state.monthlyExpense * state.assumptions.emergencyFundMonths;
        },
        emergencyFundStatus(state) {
            const target = this.emergencyFundTarget;
            const current = state.emergencyFundCurrent || 0;
            const ratio = target > 0 ? current / target : 1;
            return {
                target, current,
                gap: Math.max(0, target - current),
                ratio: Math.min(1.5, ratio),
                achieved: ratio >= 1,
                level: ratio >= 1 ? 'achieved' : ratio >= 0.5 ? 'partial' : 'low',
            };
        },
        housingDeduction(state) {
            return state.housingStatus === 'planning' ? (state.housingDownPayment || 0) : 0;
        },
        kidsLifetimeCost(state) {
            return (state.kidsCount || 0) * (state.kidsCostPerMonth || 0) * 12 * (state.kidsSupportYears || 0);
        },
        investableAssets(state) {
            return Math.max(0, state.currentAssets - (state.emergencyFundCurrent || 0));
        },
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
        /**
         * 所有伴侶各自的台灣年金（陣列，跟 partners 對齊）
         * 沒啟用 twEnabled 就回 []
         */
        partnersTwCashflow(state) {
            if (!state.twEnabled) return [];
            return (state.partners || []).map((p) => calculateTwRetirementCashflow({
                currentAge: p.age,
                claimAge: 65,
                monthlySalary: p.averageInsuredSalary,
                laborInsuranceYears: p.laborInsuranceYears,
                laborPensionYears: p.laborInsuranceYears,
                laborPensionBalance: p.laborPensionBalance,
                laborPensionEmployeeRate: p.laborPensionEmployeeRate,
                nationalPensionYears: p.nationalPensionYears,
                laborInsurancePayout: state.laborInsurancePayout,
            }));
        },
        householdSize(state) {
            return 1 + (state.partners || []).length;
        },
        householdMonthlyIncome(state) {
            const partnersIncome = (state.partners || []).reduce((sum, p) => sum + (p.monthlyIncome || 0), 0);
            return state.monthlyIncome + partnersIncome;
        },
        simulationProfile(state) {
            return {
                currentAge: state.currentAge,
                monthlyIncome: state.monthlyIncome,
                monthlyExpense: state.monthlyExpense,
                targetRetireAge: state.targetRetireAge,
                investableAssets: this.investableAssets,
                // 伴侶（陣列）
                partners: state.partners,
                partnersTwCashflow: this.partnersTwCashflow,
                postRetirementExpenseRatio: this.effectiveAssumptions.postRetirementExpenseRatio,
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
                // side income
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
                // 政府年金
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
        // 👥 伴侶 CRUD
        addPartner() {
            const nextId = (this.partners.length === 0)
                ? 1
                : Math.max(...this.partners.map((p) => p.id)) + 1;
            this.partners = [...this.partners, makeDefaultPartner(nextId)];
            this.persist();
        },
        removePartner(id) {
            this.partners = this.partners.filter((p) => p.id !== id);
            this.persist();
        },
        updatePartner(id, patch) {
            this.partners = this.partners.map((p) => (p.id === id ? {...p, ...patch} : p));
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
        applyFromUrl(parsed) {
            if (!parsed || typeof parsed !== 'object') return;
            const migrated = migrateSpouseToPartners({...parsed});
            const {assumptions, ...rest} = migrated;
            Object.assign(this, rest);
            if (assumptions) {
                this.assumptions = {...this.assumptions, ...assumptions};
            }
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
                    partners,
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
                    partners,
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
