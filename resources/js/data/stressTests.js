/**
 * 黑天鵝壓力測試情境定義。
 *
 * 每個情境定義：標籤、emoji、說明、以及在 store 內如何修改 assumptions。
 * 「crash」需要特別處理（影響 Monte Carlo 第一年的報酬），其他直接覆寫 assumptions。
 */

export const STRESS_TESTS = Object.freeze([
    {
        key: 'crash',
        emoji: '📉',
        label: '退休首年股災 -40%',
        tagline: '序列風險最致命',
        description: '退休後的第一年遇到 2008 等級的崩盤。同樣的本金、同樣的提領，但開局就被腰斬，後續復原時間有限。',
        // 不改 assumptions，特別在 Monte Carlo 加 initialShock
        modify: (a) => a,
        initialShock: -0.40,
    },
    {
        key: 'inflation',
        emoji: '🔥',
        label: '持續高通膨 5%',
        tagline: '購買力被慢慢侵蝕',
        description: '通膨從 2.5% 跳到 5%，每年都這樣。退休後要花的錢實質上每年膨脹得更快，年金被吃光。',
        modify: (a) => ({...a, inflationRate: 0.05}),
        initialShock: 0,
    },
    {
        key: 'lowReturn',
        emoji: '🪫',
        label: '報酬率不如預期',
        tagline: '失落的十年',
        description: '股市進入低報酬期：退休前 5%、退休後 3%。歷史上日本、2000s 美股都發生過。',
        modify: (a) => ({...a, preRetirementReturn: 0.05, postRetirementReturn: 0.03}),
        initialShock: 0,
    },
    {
        key: 'longevity',
        emoji: '🧓',
        label: '長壽到 95 歲',
        tagline: '錢得撐更久',
        description: '比預期多活 5 年。聽起來不多但對退休金影響巨大 — 提領年限延長、Monte Carlo 失敗率攀升。',
        modify: (a) => ({...a, lifeExpectancy: 95}),
        initialShock: 0,
    },
]);

export const getStressTest = (key) => STRESS_TESTS.find((s) => s.key === key);
