/**
 * 退休試算的預設假設值。
 * 來源參考：NerdWallet / Vanguard / Bankrate 的 calculator defaults（2026）。
 * 使用者可在進階表單覆寫。
 */
export const DEFAULT_ASSUMPTIONS = Object.freeze({
    inflationRate: 0.025,           // 年通膨 2.5%（台灣近 10 年平均約 1.5-2%，預留緩衝）
    preRetirementReturn: 0.07,      // 退休前報酬率 7%（全球股 60% / 債 40% 長期）
    postRetirementReturn: 0.05,     // 退休後 5%（轉趨保守）
    safeWithdrawalRate: 0.04,       // 4% rule
    safeWithdrawalRateEarly: 0.035, // 早退（>40 年週期）建議 3.5%
    lifeExpectancy: 90,             // 預期壽命（FIRE 算法常用 90，避免長壽風險）
    salaryGrowthRate: 0.02,         // 年薪資成長 2%
    portfolioVolatility: 0.12,      // 投資組合年化波動率 12%（60/40 portfolio 歷史值）
    monteCarloIterations: 1000,     // Monte Carlo 模擬次數
    emergencyFundMonths: 6,         // 緊急預備金目標（月支出倍數）；常見 3 / 6 / 12
    postRetirementExpenseRatio: 1.0, // 退休後支出佔目前的比例（多數研究顯示 70-80%）
});

/**
 * 滑桿/輸入欄位的合理範圍與步進，避免使用者填出 200% 報酬率這種值。
 */
export const ASSUMPTION_RANGES = Object.freeze({
    age: {min: 18, max: 70, step: 1},
    targetRetireAge: {min: 35, max: 75, step: 1},
    monthlyIncome: {min: 0, max: 1000000, step: 1000},
    monthlyExpense: {min: 0, max: 500000, step: 1000},
    currentAssets: {min: 0, max: 100000000, step: 10000},
    inflationRate: {min: 0, max: 0.1, step: 0.005},
    preRetirementReturn: {min: 0, max: 0.15, step: 0.005},
    postRetirementReturn: {min: 0, max: 0.1, step: 0.005},
    safeWithdrawalRate: {min: 0.02, max: 0.06, step: 0.0025},
    lifeExpectancy: {min: 70, max: 100, step: 1},
});
