/**
 * 台幣金額格式化。
 *
 * formatTwd(1234567)              → 'NT$ 1,234,567'
 * formatTwdShort(12340000)        → 'NT$ 1,234 萬'
 * formatTwdShort(120000000)       → 'NT$ 1.20 億'
 */

export const formatTwd = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    if (!Number.isFinite(value)) return '∞';
    return `NT$ ${Math.round(value).toLocaleString('en-US')}`;
};

export const formatTwdShort = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    if (!Number.isFinite(value)) return '∞';
    const abs = Math.abs(value);
    if (abs >= 100_000_000) {
        return `NT$ ${(value / 100_000_000).toFixed(2)} 億`;
    }
    if (abs >= 10_000) {
        return `NT$ ${Math.round(value / 10_000).toLocaleString('en-US')} 萬`;
    }
    return `NT$ ${Math.round(value).toLocaleString('en-US')}`;
};

export const formatPercent = (value, digits = 1) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return `${(value * 100).toFixed(digits)}%`;
};

export const formatYears = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    if (value <= 0) return '已達標';
    return `${value} 年`;
};

export const formatAge = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return `${value} 歲`;
};
