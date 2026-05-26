/**
 * FIRE（Financial Independence, Retire Early）四大變體 + 台灣傳統 65 歲退休。
 * 用於結果頁的情境並列比較。
 *
 * expenseMultiplier：相對於使用者目前年支出的倍率
 *   - Lean: 0.7（極簡生活）
 *   - Standard: 1.0（同水準）
 *   - Fat: 1.5（更好的生活）
 *   - Coast / Barista: 不額外調整
 *
 * portfolioCoverage：投資組合需要 cover 年支出的比例（剩下靠兼職/勞保補）
 *   - 1.0 = 全額自給
 *   - 0.7 = Barista 半退休，30% 靠兼職
 */
export const FIRE_TYPES = Object.freeze([
    {
        key: 'lean',
        label: 'Lean FIRE',
        labelZh: '極簡退休',
        emoji: '🌱',
        tagline: '砍開支、快達標',
        description: '降低生活水準、加速儲蓄。適合本來就不愛物質、想盡快擺脫上班的人。',
        expenseMultiplier: 0.7,
        portfolioCoverage: 1.0,
        color: 'matcha',
        chartColor: '#5E7F3F',       // matcha-500（綠）
    },
    {
        key: 'standard',
        label: 'Standard FIRE',
        labelZh: '標準退休',
        emoji: '☀️',
        tagline: '維持現在的生活',
        description: '退休後過跟現在差不多的日子，不刻意省、也不奢侈。最多人走的路線。',
        expenseMultiplier: 1.0,
        portfolioCoverage: 1.0,
        color: 'sunset',
        chartColor: '#F47C1B',       // sunset-500（橘）
    },
    {
        key: 'fat',
        label: 'Fat FIRE',
        labelZh: '富足退休',
        emoji: '🌴',
        tagline: '退休後過得更好',
        description: '退休後想旅遊、追求嗜好、生活水準上一階。需要更大的本金。',
        expenseMultiplier: 1.5,
        portfolioCoverage: 1.0,
        color: 'apricot',
        chartColor: '#D8682B',       // apricot-500（深橘）
    },
    {
        key: 'barista',
        label: 'Barista FIRE',
        labelZh: '半退休',
        emoji: '☕',
        tagline: '兼職 + 投資並行',
        description: '投資 cover 七成支出，剩下靠喜歡的兼職補。彈性最大、心理壓力小。',
        expenseMultiplier: 1.0,
        portfolioCoverage: 0.7,
        color: 'clay',
        chartColor: '#6E6452',       // clay-500（暖灰）
    },
    {
        key: 'tw65',
        label: '台灣傳統退休',
        labelZh: '65 歲退休',
        emoji: '🇹🇼',
        tagline: '勞保 + 勞退兜底',
        description: '不額外存退休金、65 歲後靠勞保年金 + 勞退個人專戶 + 國民年金生活。',
        expenseMultiplier: 1.0,
        portfolioCoverage: 0,
        color: 'cream',
        chartColor: '#8F7D4B',       // cream-600（金棕）
        fixedRetireAge: 65,
    },
]);

export const getFireType = (key) => FIRE_TYPES.find((t) => t.key === key);
