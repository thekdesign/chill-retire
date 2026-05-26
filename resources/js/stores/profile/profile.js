import {defineStore} from 'pinia';
import {DEFAULT_ASSUMPTIONS} from 'data/assumptions';
import {FIRE_TYPES} from 'data/fireTypes';
import {getStressTest} from 'data/stressTests';
import {calculateScenario, realReturn} from 'libs/fireCalculator';
import {calculateTwRetirementCashflow} from 'libs/twPensionCalc';
import {runMonteCarlo} from 'libs/monteCarloSim';

const STORAGE_KEY = 'chill-retire:profile:v1';
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const defaultProfile = () => ({
    // Step 1 基本
    currentAge: 30,
    monthlyIncome: 60000,
    monthlyExpense: 35000,
    targetRetireAge: 55,
    // Step 2 資產
    currentAssets: 500000,
    emergencyFundCurrent: 100000,    // 緊急預備金（已準備）
    // Step 3 台灣專版（可選）
    twEnabled: false,
    averageInsuredSalary: 45800,
    laborInsuranceYears: 8,
    laborPensionBalance: 200000,
    laborPensionEmployeeRate: 0,
    nationalPensionYears: 0,
    laborInsurancePayout: 1.0,        // 勞保給付折扣（1.0 = 拿足）
    // Step 4 假設
    assumptions: {...DEFAULT_ASSUMPTIONS},
    // 壓力測試 mode（不持久化，重整就回基準）
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
        // 從現有資產扣除緊急預備金 = 可投資資產
        investableAssets(state) {
            return Math.max(0, state.currentAssets - (state.emergencyFundCurrent || 0));
        },
        stressTest: (state) => (state.stressMode ? getStressTest(state.stressMode) : null),
        effectiveAssumptions(state) {
            if (!state.stressMode) return state.assumptions;
            const stress = getStressTest(state.stressMode);
            return stress ? stress.modify(state.assumptions) : state.assumptions;
        },
        scenarios(state) {
            const assumptions = this.effectiveAssumptions;
            const investable = this.investableAssets;
            return FIRE_TYPES.map((type) => ({
                type,
                result: calculateScenario(type, {
                    currentAge: state.currentAge,
                    monthlyIncome: state.monthlyIncome,
                    monthlyExpense: state.monthlyExpense,
                    targetRetireAge: state.targetRetireAge,
                    currentAssets: investable,
                }, assumptions),
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
                currentAge: state.currentAge,
                currentAssets: this.investableAssets,
                annualContribution: this.monthlySavings * 12,
                annualExpense: primary.result.annualExpense,
                retireAge: primary.result.retireAge,
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
                    assumptions,
                } = this;
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    currentAge, monthlyIncome, monthlyExpense, targetRetireAge,
                    currentAssets, emergencyFundCurrent,
                    twEnabled, averageInsuredSalary, laborInsuranceYears,
                    laborPensionBalance, laborPensionEmployeeRate, nationalPensionYears,
                    laborInsurancePayout,
                    assumptions,
                }));
            } catch (e) {
                // ignore
            }
        },
    },
});
