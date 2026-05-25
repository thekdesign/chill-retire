/**
 * Monte Carlo 退休模擬。
 *
 * 核心想法：實際的市場報酬率不是固定 7%，而是有波動的。
 * 用 lognormal 分布（金融標準）產生 1000 條隨機路徑，看有多少 % 能撐到目標年齡。
 *
 * 為什麼要 seeded PRNG：
 *   滑桿拖動時 store 每次重算都會重抽隨機數，成功率會在 ±1-2% 跳動，
 *   使用者會以為是滑桿造成的。用固定 seed 確保「相同輸入 → 相同結果」。
 */

/**
 * Mulberry32 — 32-bit seeded PRNG，輕量、品質夠用、確定性。
 */
const mulberry32 = (seed) => {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

/**
 * Box-Muller 把 [0,1) uniform 轉成標準常態分布（mean=0, std=1）。
 */
const gaussian = (rand) => {
    let u = 0;
    let v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/**
 * 單條路徑模擬：每年抽一個隨機報酬率，累積/提領。
 *
 * @param {object} params
 * @param {number} [params.initialShock=0] 退休第一年強制套用的報酬率（壓力測試用，例如 -0.4 = 開局股災 40%）
 * @returns {{trajectory: Array<{age, assets}>, success: boolean, failedAge: number|null}}
 */
const simulatePath = (params, rand) => {
    const {
        currentAge,
        currentAssets,
        annualContribution,
        annualExpense,
        retireAge,
        lifeExpectancy,
        meanReturn,
        stdDev,
        initialShock = 0,
    } = params;

    let assets = currentAssets;
    const trajectory = [{age: currentAge, assets}];

    for (let age = currentAge + 1; age <= lifeExpectancy; age += 1) {
        // 退休後第一年套用 initialShock（若有指定）
        const isFirstRetirementYear = initialShock !== 0 && age === retireAge + 1;
        const r = isFirstRetirementYear
            ? initialShock
            : meanReturn + stdDev * gaussian(rand);
        if (age <= retireAge) {
            assets = assets * (1 + r) + annualContribution;
        } else {
            assets = (assets - annualExpense) * (1 + r);
        }
        if (assets < 0) {
            trajectory.push({age, assets: 0});
            return {trajectory, success: false, failedAge: age};
        }
        trajectory.push({age, assets});
    }

    return {trajectory, success: true, failedAge: null};
};

/**
 * 跑 N 次模擬，回傳成功率與每個年齡的百分位數（給 fan chart 用）。
 *
 * @param {object} params
 * @param {number} [params.iterations=1000]
 * @param {number} [params.seed=42]
 */
export const runMonteCarlo = (params) => {
    const {
        currentAge,
        currentAssets,
        annualContribution,
        annualExpense,
        retireAge,
        lifeExpectancy,
        meanReturn,
        stdDev,
        iterations = 1000,
        seed = 42,
    } = params;

    // 若退休年齡 null（永遠達不到目標），直接回 0% 成功率
    if (!retireAge || retireAge >= lifeExpectancy) {
        return {successRate: 0, iterations: 0, percentiles: [], failedAgeMedian: null};
    }

    const rand = mulberry32(seed);
    const paths = [];
    let successCount = 0;
    const failedAges = [];

    for (let i = 0; i < iterations; i += 1) {
        const path = simulatePath({
            currentAge,
            currentAssets,
            annualContribution,
            annualExpense,
            retireAge,
            lifeExpectancy,
            meanReturn,
            stdDev,
            initialShock: params.initialShock || 0,
        }, rand);
        paths.push(path);
        if (path.success) {
            successCount += 1;
        } else {
            failedAges.push(path.failedAge);
        }
    }

    // 每個年齡的百分位
    const numYears = lifeExpectancy - currentAge + 1;
    const percentiles = [];
    for (let i = 0; i < numYears; i += 1) {
        const age = currentAge + i;
        const values = paths
            .map((p) => p.trajectory[i]?.assets)
            .filter((v) => v !== undefined && Number.isFinite(v))
            .sort((a, b) => a - b);
        if (values.length === 0) {
            percentiles.push({age, p10: 0, p25: 0, p50: 0, p75: 0, p90: 0});
            continue;
        }
        const pickAt = (q) => values[Math.min(values.length - 1, Math.floor(values.length * q))];
        percentiles.push({
            age,
            p10: pickAt(0.10),
            p25: pickAt(0.25),
            p50: pickAt(0.50),
            p75: pickAt(0.75),
            p90: pickAt(0.90),
        });
    }

    failedAges.sort((a, b) => a - b);
    const failedAgeMedian = failedAges.length > 0
        ? failedAges[Math.floor(failedAges.length / 2)]
        : null;

    return {
        successRate: successCount / iterations,
        iterations,
        percentiles,
        failedAgeMedian,
    };
};
