/**
 * 退休核心計算邏輯。
 *
 * 主要公式：
 *   - 退休金目標 = 退休後年支出 × (1 / 安全提領率)
 *     等同於 25x rule（4% rule 的反算）
 *   - 從現在到退休的資產成長 = FV = PV × (1+r)^n + PMT × [((1+r)^n - 1) / r]
 *     PV = 現有資產、PMT = 每年儲蓄、r = 報酬率、n = 年數
 *   - 通膨調整：所有未來金額換算為「今日購買力」
 */

/**
 * 計算未來資產（複利 + 定期投入）
 * @param {number} currentAssets 現有資產（今日購買力）
 * @param {number} annualContribution 每年儲蓄（今日購買力）
 * @param {number} realReturn 實質報酬率（已扣除通膨）
 * @param {number} years 年數
 * @returns {number} 未來資產（今日購買力）
 */
export const projectFutureAssets = (currentAssets, annualContribution, realReturn, years) => {
    if (years <= 0) return currentAssets;
    if (realReturn === 0) return currentAssets + annualContribution * years;
    const growthFactor = (1 + realReturn) ** years;
    const fvCurrent = currentAssets * growthFactor;
    const fvContributions = annualContribution * ((growthFactor - 1) / realReturn);
    return fvCurrent + fvContributions;
};

/**
 * 計算退休金目標（25x rule 或自訂 SWR）
 * @param {number} annualExpenseAtRetirement 退休時年支出（今日購買力）
 * @param {number} swr 安全提領率（如 0.04）
 * @returns {number} 退休金目標
 */
export const calculateRetirementTarget = (annualExpenseAtRetirement, swr) => annualExpenseAtRetirement / swr;

/**
 * 反推「幾歲可以退休」：給定每年儲蓄與目標，找出最早達標年齡
 * @param {object} params
 * @param {number} params.currentAge 現在年齡
 * @param {number} params.currentAssets 現有資產
 * @param {number} params.annualContribution 每年儲蓄
 * @param {number} params.realReturn 實質報酬率
 * @param {number} params.target 退休金目標
 * @param {number} params.maxAge 最晚試算到幾歲（避免無窮迴圈）
 * @returns {number|null} 達標年齡；若無法在 maxAge 前達標回傳 null
 */
export const findRetirementAge = ({
    currentAge,
    currentAssets,
    annualContribution,
    realReturn,
    target,
    maxAge = 80,
}) => {
    if (currentAssets >= target) return currentAge;
    for (let age = currentAge + 1; age <= maxAge; age += 1) {
        const years = age - currentAge;
        const assets = projectFutureAssets(currentAssets, annualContribution, realReturn, years);
        if (assets >= target) return age;
    }
    return null;
};

/**
 * 計算 Coast FIRE 狀態：「不再存錢，光複利就能在目標年齡達標」
 * @param {object} params
 * @param {number} params.currentAssets 現有資產
 * @param {number} params.realReturn 實質報酬率
 * @param {number} params.yearsUntilRetire 距離傳統退休年齡的年數
 * @param {number} params.target 退休金目標
 * @returns {{achieved: boolean, projected: number, shortfall: number}}
 */
export const calculateCoastFire = ({currentAssets, realReturn, yearsUntilRetire, target}) => {
    const projected = projectFutureAssets(currentAssets, 0, realReturn, yearsUntilRetire);
    return {
        achieved: projected >= target,
        projected,
        shortfall: Math.max(0, target - projected),
    };
};

/**
 * 計算「需要每月再多存多少才能在目標年齡達標」
 * @returns {number} 缺口（每月）；負值代表已綽綽有餘
 */
export const calculateMonthlyGap = ({
    currentAge,
    targetAge,
    currentAssets,
    realReturn,
    target,
}) => {
    const years = targetAge - currentAge;
    if (years <= 0) return Infinity;
    const projected = projectFutureAssets(currentAssets, 0, realReturn, years);
    const remainingNeed = target - projected;
    if (remainingNeed <= 0) return 0;
    // 反推：每年儲蓄 × annuity factor = remainingNeed
    const annuityFactor = realReturn === 0
        ? years
        : (((1 + realReturn) ** years) - 1) / realReturn;
    const annualNeeded = remainingNeed / annuityFactor;
    return annualNeeded / 12;
};

/**
 * 產生資產成長曲線（給圖表用）
 * @returns {Array<{age: number, assets: number}>}
 */
export const generateGrowthCurve = ({
    currentAge,
    currentAssets,
    annualContribution,
    realReturn,
    retireAge,
    annualExpense,
    postReturn,
    lifeExpectancy,
}) => {
    const curve = [];
    let assets = currentAssets;

    // 累積期
    for (let age = currentAge; age <= retireAge; age += 1) {
        curve.push({age, assets, phase: 'accumulation'});
        assets = assets * (1 + realReturn) + annualContribution;
    }

    // 提領期：每年從投資組合提領 annualExpense
    for (let age = retireAge + 1; age <= lifeExpectancy; age += 1) {
        assets = (assets - annualExpense) * (1 + postReturn);
        curve.push({age, assets: Math.max(0, assets), phase: 'withdrawal'});
    }

    return curve;
};

/**
 * 計算實質報酬率（扣除通膨後）
 * 公式：(1 + nominal) / (1 + inflation) - 1
 */
export const realReturn = (nominalReturn, inflationRate) => (1 + nominalReturn) / (1 + inflationRate) - 1;

/**
 * 給定情境定義 + 使用者狀態，回傳該情境的完整試算結果
 */
export const calculateScenario = (scenario, profile, assumptions) => {
    const annualExpense = profile.monthlyExpense * 12 * scenario.expenseMultiplier;
    const portfolioNeed = annualExpense * scenario.portfolioCoverage;
    const target = calculateRetirementTarget(portfolioNeed, assumptions.safeWithdrawalRate);

    const monthlyContribution = Math.max(0, profile.monthlyIncome - profile.monthlyExpense);
    const annualContribution = monthlyContribution * 12;
    const rReturn = realReturn(assumptions.preRetirementReturn, assumptions.inflationRate);
    const rPostReturn = realReturn(assumptions.postRetirementReturn, assumptions.inflationRate);

    const retireAge = scenario.fixedRetireAge
        || findRetirementAge({
            currentAge: profile.currentAge,
            currentAssets: profile.currentAssets,
            annualContribution,
            realReturn: rReturn,
            target,
        });

    const monthlyGap = retireAge === null
        ? calculateMonthlyGap({
            currentAge: profile.currentAge,
            targetAge: profile.targetRetireAge,
            currentAssets: profile.currentAssets,
            realReturn: rReturn,
            target,
        })
        : 0;

    return {
        scenarioKey: scenario.key,
        target,
        annualExpense,
        portfolioNeed,
        retireAge,
        yearsToRetire: retireAge === null ? null : retireAge - profile.currentAge,
        monthlyContribution,
        monthlyGap,
        achievable: retireAge !== null,
        growthCurve: retireAge ? generateGrowthCurve({
            currentAge: profile.currentAge,
            currentAssets: profile.currentAssets,
            annualContribution,
            realReturn: rReturn,
            retireAge,
            annualExpense,
            postReturn: rPostReturn,
            lifeExpectancy: assumptions.lifeExpectancy,
        }) : [],
    };
};
