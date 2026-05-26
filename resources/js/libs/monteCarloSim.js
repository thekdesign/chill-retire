/**
 * Monte Carlo 退休模擬（M5 重構：共用 fireCalculator 的 simulateYearByYear）。
 *
 * 跟 fireCalculator 用同一個 sim engine，差別只在：
 *   - 確定性版本：所有年度套同一個實質報酬率
 *   - Monte Carlo：每年抽一個隨機報酬（lognormal 分布近似）
 *
 * Seeded PRNG（Mulberry32）確保滑桿拖動時成功率穩定。
 */

import {simulateYearByYear} from 'libs/fireCalculator';

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

const gaussian = (rand) => {
    let u = 0;
    let v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/**
 * 跑 N 次模擬，回傳成功率與每個年齡的百分位數。
 *
 * @param {object} params
 * @param {object} params.profile — 從 store.simulationProfile 來
 * @param {object} params.scenario — FIRE 情境 (給支出 multiplier)
 * @param {number} params.retireAge
 * @param {number} params.lifeExpectancy
 * @param {number} params.meanReturn — 實質報酬率
 * @param {number} params.stdDev — 波動率
 * @param {number} [params.iterations=1000]
 * @param {number} [params.seed=42]
 * @param {number} [params.initialShock=0] — 退休第一年強制套用的報酬率（黑天鵝測試）
 */
export const runMonteCarlo = (params) => {
    const {
        profile, scenario, retireAge, lifeExpectancy,
        meanReturn, stdDev,
        iterations = 1000, seed = 42, initialShock = 0,
    } = params;

    if (!retireAge || retireAge >= lifeExpectancy) {
        return {successRate: 0, iterations: 0, percentiles: [], failedAgeMedian: null};
    }

    const rand = mulberry32(seed);
    const paths = [];
    let successCount = 0;
    const failedAges = [];

    for (let i = 0; i < iterations; i += 1) {
        // 為這條 path 產生每年的隨機報酬序列
        const numYears = lifeExpectancy - profile.currentAge;
        const randomReturns = [];
        for (let y = 0; y < numYears; y += 1) {
            const currentAge = profile.currentAge + y + 1;
            const isFirstRetirementYear = initialShock !== 0 && currentAge === retireAge + 1;
            randomReturns.push(
                isFirstRetirementYear
                    ? initialShock
                    : meanReturn + stdDev * gaussian(rand),
            );
        }

        const path = simulateYearByYear({
            profile,
            retireAge,
            realReturnRate: meanReturn,    // fallback；實際被 randomReturns override
            scenario,
            lifeExpectancy,
            randomReturns,
        });

        paths.push(path);
        if (path.success) {
            successCount += 1;
        } else {
            failedAges.push(path.failedAge);
        }
    }

    // 百分位
    const numYears = lifeExpectancy - profile.currentAge + 1;
    const percentiles = [];
    for (let i = 0; i < numYears; i += 1) {
        const age = profile.currentAge + i;
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
