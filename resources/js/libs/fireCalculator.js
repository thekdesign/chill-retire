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
 *
 * 邊界規則：retireAge 那一年算「最後一年工作」，仍有主薪資。
 * 從 retireAge + 1 開始才完全退休（NHI 自付、side income、退休後支出倍率全部套用）。
 *
 * Household 多人模式：所有伴侶同時退休（同 retireAge），各自年齡不同 → 65 歲年金各自獨立 trigger。
 */
const annualIncomeAt = (age, profile, retireAge) => {
    let income = 0;
    const yearsElapsed = age - profile.currentAge;

    // 主薪資：含 retireAge 那年（最後一年工作）
    if (age <= retireAge) {
        if (profile.gradualEnabled && age >= profile.gradualStartAge) {
            income += profile.monthlyIncome * 12 * profile.gradualPercentage;
        } else {
            income += profile.monthlyIncome * 12;
        }
        // 所有伴侶薪資（同時退休）
        (profile.partners || []).forEach((p) => {
            income += (p.monthlyIncome || 0) * 12;
        });
    }

    // 退休後 side income：retireAge + 1 起
    if (age > retireAge && profile.sideIncomeMonthly > 0) {
        const startAge = profile.sideIncomeStartAge || (retireAge + 1);
        if (age >= startAge && age <= profile.sideIncomeEndAge) {
            income += profile.sideIncomeMonthly * 12;
        }
    }

    // 65 歲後政府年金（主帳）
    if (age >= 65 && profile.twCashflow) {
        income += profile.twCashflow.totalMonthly * 12;
    }

    // 每位伴侶 65 歲後政府年金（依各自實際年齡）
    (profile.partners || []).forEach((p, idx) => {
        const partnerCashflow = profile.partnersTwCashflow?.[idx];
        if (!partnerCashflow) return;
        const partnerActualAge = (p.age ?? profile.currentAge) + yearsElapsed;
        if (partnerActualAge >= 65) {
            income += partnerCashflow.totalMonthly * 12;
        }
    });

    return income;
};

/**
 * 計算指定年齡的年度支出。
 *
 * 邊界：retireAge 那年仍算「最後一年工作」→ 用當前支出、無 NHI 自付。
 * 從 retireAge + 1 起套用 scenario.expenseMultiplier + 退休後健保。
 */
const annualExpenseAt = (age, profile, retireAge, scenario) => {
    const scenarioMul = scenario?.expenseMultiplier || 1;
    const retirementMul = profile.postRetirementExpenseRatio || 1.0;
    // 退休後 = 目前支出 × 場景倍率（Lean 0.7 / Fat 1.5）× 退休後比例（多數人 70-80%）
    const multiplier = age > retireAge ? (scenarioMul * retirementMul) : 1;
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

    // 退休後健保自負額（無雇主補貼）— retireAge + 1 起
    if (age > retireAge && profile.postRetirementNhiEnabled) {
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
