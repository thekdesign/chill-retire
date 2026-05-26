/**
 * 投資策略 preset：一鍵切換報酬率與波動率組合。
 *
 * 報酬率與波動率採用通用歷史值：
 *   - 美股長期年化約 10%（名目）/ 7%（實質），波動率 ~18%
 *   - 60/40 portfolio 約 7%（名目）/ 4.5%（實質），波動率 ~12%
 *   - 30/70 conservative 約 5% / 2.5%，波動率 ~8%
 *   - 純定存約 1.5%，幾乎無波動，但被通膨 2.5% 吃掉 → 實質負報酬
 *
 * 我們存的是「名目報酬率」，計算實質時會扣通膨。
 */

export const INVESTMENT_STRATEGIES = Object.freeze([
    {
        key: 'aggressive',
        emoji: '🚀',
        label: '積極',
        subtitle: '股 80% / 債 20%',
        description: '長期成長為目標，年輕人常見配置。短期波動大、長期報酬高。',
        preRetirementReturn: 0.08,
        postRetirementReturn: 0.06,
        portfolioVolatility: 0.18,
    },
    {
        key: 'balanced',
        emoji: '⚖️',
        label: '平衡',
        subtitle: '股 60% / 債 40%',
        description: '經典退休配置。平衡風險與報酬，最多 robo-advisor 預設用這組。',
        preRetirementReturn: 0.07,
        postRetirementReturn: 0.05,
        portfolioVolatility: 0.12,
    },
    {
        key: 'conservative',
        emoji: '🛡️',
        label: '保守',
        subtitle: '股 30% / 債 70%',
        description: '已退休或接近退休常用。穩定但長期報酬有限，要存更多本金。',
        preRetirementReturn: 0.05,
        postRetirementReturn: 0.04,
        portfolioVolatility: 0.08,
    },
    {
        key: 'cash',
        emoji: '🏦',
        label: '純現金',
        subtitle: '只放定存',
        description: '完全不投資。⚠️ 通膨 2.5% > 定存 1.5%，購買力每年縮水。最不建議。',
        preRetirementReturn: 0.015,
        postRetirementReturn: 0.015,
        portfolioVolatility: 0.01,
    },
]);

/** 自訂模式 — 不在 INVESTMENT_STRATEGIES 內，用 key 'custom' 標記 */
export const CUSTOM_STRATEGY = Object.freeze({
    key: 'custom',
    emoji: '⚙️',
    label: '自訂',
    subtitle: '進階假設微調中',
    description: '你在進階假設裡手動調過報酬率或波動率，已偏離預設組合。',
});

export const getStrategy = (key) => {
    if (key === 'custom') return CUSTOM_STRATEGY;
    return INVESTMENT_STRATEGIES.find((s) => s.key === key);
};

/**
 * 比對目前 assumptions 是否符合某個 preset；不符合則回 'custom'。
 * 用浮點容忍 0.001 避免顯示精度問題。
 */
export const detectStrategy = (assumptions) => {
    const approx = (a, b) => Math.abs(a - b) < 0.001;
    const match = INVESTMENT_STRATEGIES.find((s) => (
        approx(s.preRetirementReturn, assumptions.preRetirementReturn)
        && approx(s.postRetirementReturn, assumptions.postRetirementReturn)
        && approx(s.portfolioVolatility, assumptions.portfolioVolatility)
    ));
    return match ? match.key : 'custom';
};
