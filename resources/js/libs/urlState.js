/**
 * URL state share — 把 profile 序列化到 URL hash，朋友打開連結看到相同試算。
 *
 * 為什麼用 hash 而不是 query param：
 *   - hash 不會送到 server，純客戶端，符合純前端網站定位
 *   - 不會影響 vite-ssg prerender 的 URL 對齊
 *   - 不影響 SEO（搜尋引擎不抓 hash）
 *
 * 編碼：JSON → encodeURIComponent。簡單可讀（debug 友善），體積也夠小。
 * 不用 base64/lz-string 因為：
 *   - profile 不大（< 2KB）
 *   - 純前端可直接看 URL 內容方便 debug
 *   - 不要 fancy 編碼讓 dep 變肥
 */

const HASH_KEY = 's';   // URL hash 例：#s=%7B%22currentAge%22%3A32%7D

const isBrowser = typeof window !== 'undefined';

/**
 * 取出要序列化的 profile 欄位（不含 stressMode 等暫態）。
 */
const pickShareableFields = (profile) => ({
    currentAge: profile.currentAge,
    monthlyIncome: profile.monthlyIncome,
    monthlyExpense: profile.monthlyExpense,
    targetRetireAge: profile.targetRetireAge,
    currentAssets: profile.currentAssets,
    emergencyFundCurrent: profile.emergencyFundCurrent,
    twEnabled: profile.twEnabled,
    averageInsuredSalary: profile.averageInsuredSalary,
    laborInsuranceYears: profile.laborInsuranceYears,
    laborPensionBalance: profile.laborPensionBalance,
    laborPensionEmployeeRate: profile.laborPensionEmployeeRate,
    nationalPensionYears: profile.nationalPensionYears,
    laborInsurancePayout: profile.laborInsurancePayout,
    coupleEnabled: profile.coupleEnabled,
    spouseAge: profile.spouseAge,
    spouseMonthlyIncome: profile.spouseMonthlyIncome,
    spouseAverageInsuredSalary: profile.spouseAverageInsuredSalary,
    spouseLaborInsuranceYears: profile.spouseLaborInsuranceYears,
    spouseLaborPensionBalance: profile.spouseLaborPensionBalance,
    spouseLaborPensionEmployeeRate: profile.spouseLaborPensionEmployeeRate,
    spouseNationalPensionYears: profile.spouseNationalPensionYears,
    housingStatus: profile.housingStatus,
    housingDownPayment: profile.housingDownPayment,
    housingYearsUntilPurchase: profile.housingYearsUntilPurchase,
    housingMonthlyMortgage: profile.housingMonthlyMortgage,
    housingMortgageYears: profile.housingMortgageYears,
    kidsCount: profile.kidsCount,
    kidsCostPerMonth: profile.kidsCostPerMonth,
    kidsSupportYears: profile.kidsSupportYears,
    sideIncomeMonthly: profile.sideIncomeMonthly,
    sideIncomeStartAge: profile.sideIncomeStartAge,
    sideIncomeEndAge: profile.sideIncomeEndAge,
    gradualEnabled: profile.gradualEnabled,
    gradualStartAge: profile.gradualStartAge,
    gradualPercentage: profile.gradualPercentage,
    postRetirementNhiEnabled: profile.postRetirementNhiEnabled,
    postRetirementNhiMonthly: profile.postRetirementNhiMonthly,
    longTermCareEnabled: profile.longTermCareEnabled,
    longTermCareStartAge: profile.longTermCareStartAge,
    longTermCareMonthly: profile.longTermCareMonthly,
    assumptions: profile.assumptions,
});

/**
 * 把 profile 序列化進 URL hash。
 * 回傳完整可分享的 URL。
 */
export const encodeProfileToUrl = (profile) => {
    if (!isBrowser) return '';
    const data = pickShareableFields(profile);
    const json = JSON.stringify(data);
    const encoded = encodeURIComponent(json);
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return `${baseUrl}#${HASH_KEY}=${encoded}`;
};

/**
 * 從目前 URL 解碼。回傳 profile 物件或 null。
 */
export const decodeProfileFromUrl = () => {
    if (!isBrowser) return null;
    const hash = window.location.hash;
    if (!hash) return null;
    const match = hash.match(new RegExp(`${HASH_KEY}=([^&]+)`));
    if (!match) return null;
    try {
        const json = decodeURIComponent(match[1]);
        return JSON.parse(json);
    } catch (e) {
        console.warn('[urlState] decode failed:', e);
        return null;
    }
};

/**
 * 清掉 URL hash（套用後叫一次，避免重新整理又被覆蓋）
 */
export const clearUrlHash = () => {
    if (!isBrowser) return;
    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
};
