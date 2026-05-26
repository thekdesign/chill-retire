/**
 * 退休核心計算邏輯 — 年度逐年模擬版（M5 重構）。
 *
 * 跟舊的 steady-state 版本差別：
 *   - 過去：用 closed-form 公式 + 一次扣除預留估算
 *   - 現在：每一年單獨計算收入/支出/資產變化，時間維度精準
 *
 * 模型涵蓋（按年）：
 *   - 主薪資（含漸進式退休：55-60 過渡半薪可選）
 *   - 退休後 side income（顧問費/兼職）
 *   - 政府年金（65 歲後勞保+勞退+國民年金）
 *   - 月支出（含小孩 0–22 歲、房貸 N 年、退休後健保、長照 75+）
 *   - 房屋頭期款（一次性，計畫購買的那一年）
 *
 * 所有金額都以「今日購買力」為基準（已在外層 caller 用實質報酬率）。
 */

/**
 * 計算實質報酬率（扣除通膨後）
 */
export const realReturn = (nominalReturn, inflationRate) => (1 + nominalReturn) / (1 + inflationRate) - 1;

/**
 * 計算指定年齡的年度收入。
 */
const annualIncomeAt = (age, profile, retireAge) => {
    let income = 0;

    // 主薪資：退休前
    if (age < retireAge) {
        if (profile.gradualEnabled && age >= profile.gradualStartAge) {
            // 漸進式退休：55-60 期間半薪
            income += profile.monthlyIncome * 12 * profile.gradualPercentage;
        } else {
            income += profile.monthlyIncome * 12;
        }
    }

    // 退休後 side income（顧問/兼職）
    if (age >= retireAge && profile.sideIncomeMonthly > 0) {
        const startAge = profile.sideIncomeStartAge || retireAge;
        if (age >= startAge && age <= profile.sideIncomeEndAge) {
            income += profile.sideIncomeMonthly * 12;
        }
    }

    // 65 歲後政府年金
    if (age >= 65 && profile.twCashflow) {
        income += profile.twCashflow.totalMonthly * 12;
    }

    return income;
};

/**
 * 計算指定年齡的年度支出。
 *
 * 重要：scenario.expenseMultiplier（Lean 0.7 / Fat 1.5 等）只在「退休後」套用，
 * 累積期一律用使用者填的當前 monthlyExpense。
 * 這樣才符合 FIRE 變體的真實意涵：「退休後想過什麼生活水準」。
 */
const annualExpenseAt = (age, profile, retireAge, scenario) => {
    const multiplier = age > retireAge ? (scenario?.expenseMultiplier || 1) : 1;
    let expense = profile.monthlyExpense * 12 * multiplier;

    // 小孩扶養（從 currentAge 算起 N 年內）
    const yearsFromNow = age - profile.currentAge;
    if (profile.kidsCount > 0 && yearsFromNow < profile.kidsSupportYears) {
        expense += profile.kidsCount * profile.kidsCostPerMonth * 12;
    }

    // 房貸（計畫買 = 從 yearsUntilPurchase 開始付 mortgageYears 年；已買 = 假設含在 monthlyExpense 不重複）
    if (profile.housingStatus === 'planning') {
        const purchaseAge = profile.currentAge + (profile.housingYearsUntilPurchase || 0);
        if (age >= purchaseAge && age < purchaseAge + (profile.housingMortgageYears || 0)) {
            expense += (profile.housingMonthlyMortgage || 0) * 12;
        }
    }

    // 退休後健保自負額（無雇主補貼）
    if (age >= retireAge && profile.postRetirementNhiEnabled) {
        expense += (profile.postRetirementNhiMonthly || 0) * 12;
    }

    // 長照預備金
    if (profile.longTermCareEnabled && age >= profile.longTermCareStartAge) {
        expense += (profile.longTermCareMonthly || 0) * 12;
    }

    return expense;
};

/**
 * 計算一次性現金流（買房頭期款）
 */
const lumpSumOutflowAt = (age, profile) => {
    if (profile.housingStatus === 'planning'
        && age === profile.currentAge + profile.housingYearsUntilPurchase) {
        return profile.housingDownPayment || 0;
    }
    return 0;
};

/**
 * 年度逐年模擬：給定假設退休年齡，回傳資產軌跡與成敗。
 */
export const simulateYearByYear = ({
    profile,
    retireAge,
    realReturnRate,
    scenario = null,
    lifeExpectancy,
    randomReturns = null,    // Monte Carlo 用：每年的隨機報酬陣列
}) => {
    let assets = profile.investableAssets;
    const trajectory = [{age: profile.currentAge, assets, phase: 'start'}];

    for (let age = profile.currentAge + 1; age <= lifeExpectancy; age += 1) {
        const income = annualIncomeAt(age, profile, retireAge);
        const expense = annualExpenseAt(age, profile, retireAge, scenario);
        const lumpSum = lumpSumOutflowAt(age, profile);
        const r = randomReturns ? randomReturns[age - profile.currentAge - 1] : realReturnRate;

        // 先處理現金流，再算利息（保守）
        assets = assets - lumpSum + (income - expense);
        if (assets > 0) {
            assets *= (1 + r);
        }

        const phase = age <= retireAge ? 'accumulation' : 'withdrawal';
        trajectory.push({age, assets: Math.max(0, assets), phase});

        if (assets < 0) {
            return {trajectory, success: false, failedAge: age};
        }
    }

    return {trajectory, success: true, failedAge: null};
};

/**
 * 找最早可退休年齡：從 currentAge 開始，逐年試假設能撐到 lifeExpectancy。
 */
export const findRetirementAge = ({profile, realReturnRate, scenario, lifeExpectancy, maxAge = 80}) => {
    for (let age = profile.currentAge + 1; age <= maxAge; age += 1) {
        const sim = simulateYearByYear({profile, retireAge: age, realReturnRate, scenario, lifeExpectancy});
        if (sim.success) return age;
    }
    return null;
};

/**
 * 計算 FIRE 情境的完整結果（新版用逐年模擬，replace 舊 calculateScenario）。
 */
export const calculateScenario = (scenarioType, profile, assumptions) => {
    const realRate = realReturn(assumptions.preRetirementReturn, assumptions.inflationRate);
    const realPostRate = realReturn(assumptions.postRetirementReturn, assumptions.inflationRate);
    const blendedRate = (realRate + realPostRate) / 2;   // 累積期 + 提領期混合用（簡化）

    // 套用情境的支出倍率
    const adjustedProfile = {
        ...profile,
        // 給 scenario object 一個簡單 hook 進去用
    };

    const retireAge = scenarioType.fixedRetireAge
        || findRetirementAge({
            profile: adjustedProfile,
            realReturnRate: blendedRate,
            scenario: scenarioType,
            lifeExpectancy: assumptions.lifeExpectancy,
        });

    const annualExpenseAtRetire = profile.monthlyExpense * 12 * scenarioType.expenseMultiplier;
    const target = annualExpenseAtRetire / assumptions.safeWithdrawalRate * scenarioType.portfolioCoverage;

    const monthlyContribution = Math.max(0, profile.monthlyIncome - profile.monthlyExpense);

    let monthlyGap = 0;
    let growthCurve = [];

    if (retireAge !== null) {
        // 成功 — 跑一次完整 sim 拿 trajectory
        const sim = simulateYearByYear({
            profile: adjustedProfile,
            retireAge,
            realReturnRate: blendedRate,
            scenario: scenarioType,
            lifeExpectancy: assumptions.lifeExpectancy,
        });
        growthCurve = sim.trajectory;
    } else {
        // 失敗 — 估算缺口
        const sim = simulateYearByYear({
            profile: adjustedProfile,
            retireAge: profile.targetRetireAge,
            realReturnRate: blendedRate,
            scenario: scenarioType,
            lifeExpectancy: assumptions.lifeExpectancy,
        });
        // 估缺口：失敗那年還欠多少 / 剩多少年複利
        const yearsToTarget = profile.targetRetireAge - profile.currentAge;
        if (yearsToTarget > 0 && sim.failedAge) {
            // 粗估每月需多存
            const shortfallTotal = annualExpenseAtRetire * (assumptions.lifeExpectancy - profile.targetRetireAge);
            const annuityFactor = blendedRate === 0
                ? yearsToTarget
                : (((1 + blendedRate) ** yearsToTarget) - 1) / blendedRate;
            monthlyGap = (shortfallTotal / annuityFactor) / 12;
        }
        growthCurve = sim.trajectory;
    }

    return {
        scenarioKey: scenarioType.key,
        target,
        annualExpense: annualExpenseAtRetire,
        portfolioNeed: annualExpenseAtRetire * scenarioType.portfolioCoverage,
        retireAge,
        yearsToRetire: retireAge === null ? null : retireAge - profile.currentAge,
        monthlyContribution,
        monthlyGap,
        achievable: retireAge !== null,
        growthCurve,
    };
};
