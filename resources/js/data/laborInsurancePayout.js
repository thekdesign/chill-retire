/**
 * 勞保給付折扣情境。
 *
 * 背景：勞保基金預計 2028 年若不改革將破產。實務上幾乎不可能完全停發，
 * 但「打折給付」或「延後給付」是改革常見路線（韓國/日本都這樣做過）。
 * 讓使用者可以選保守度做規劃。
 */

export const LABOR_INSURANCE_PAYOUT_OPTIONS = Object.freeze([
    {
        value: 1.0,
        label: '100%',
        title: '依現行法規拿足',
        description: '樂觀情境：政府改革延續制度，給付不縮水。',
    },
    {
        value: 0.8,
        label: '80%',
        title: '打 8 折給付',
        description: '中庸情境：類似日韓年金改革的折扣幅度。',
    },
    {
        value: 0.5,
        label: '50%',
        title: '打對折',
        description: '悲觀情境：嚴重縮水，需自備更多。',
    },
    {
        value: 0,
        label: '0%',
        title: '完全拿不到',
        description: '極端保守：當勞保不存在規劃。心理上最穩。',
    },
]);

export const getPayoutOption = (value) => LABOR_INSURANCE_PAYOUT_OPTIONS.find((o) => o.value === value);
