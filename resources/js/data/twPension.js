/**
 * 台灣退休金制度常數（2026 版）。
 *
 * 來源：
 *   - 勞動部勞工保險局 https://www.bli.gov.tw/0109187.html
 *   - 勞動部 2026 新制差異 https://www.cw.com.tw/article/5140309
 *   - 永豐銀行 勞保老年給付 https://bank.sinopac.com/sinopacBT/webevents/RetireChannel/article/retirement-age.html
 */

/** 勞保老年年金法定請領年齡（民國 51 年以後出生 = 西元 1962+） */
export const LABOR_INSURANCE_LEGAL_AGE = 65;

/** 勞保老年年金率（擇優公式 B：平均投保薪資 × 年資 × 1.55%） */
export const LABOR_INSURANCE_RATE = 0.0155;

/** 提早請領每年減給率（最早 60 歲，每年 -4%，上限 -20%） */
export const LABOR_INSURANCE_EARLY_REDUCTION_PER_YEAR = 0.04;
export const LABOR_INSURANCE_EARLY_MAX_YEARS = 5;

/** 延後請領每年增給率（最晚 70 歲，每年 +4%，上限 +20%） */
export const LABOR_INSURANCE_DEFER_BONUS_PER_YEAR = 0.04;
export const LABOR_INSURANCE_DEFER_MAX_YEARS = 5;

/**
 * 勞退新制：雇主強制提繳 6% 以上，員工自願提繳 0–6%。
 * 個人專戶投資收益保證不低於銀行 2 年期定存利率（這裡用 2.0% 估）。
 */
export const LABOR_PENSION_EMPLOYER_RATE_MIN = 0.06;
export const LABOR_PENSION_EMPLOYEE_RATE_MAX = 0.06;
export const LABOR_PENSION_GUARANTEED_RATE = 0.02;
/** 勞退個人專戶長期投資的實際估值（介於保證 2% 與股市 7% 之間） */
export const LABOR_PENSION_EXPECTED_RATE = 0.035;

/**
 * 月退年金平均餘命（用於月退金估算）— 勞退個人專戶總額 / 餘命月數 = 月領金額。
 * 65 歲申請月退時，主管機關公告平均餘命約 24 年（288 個月）。
 */
export const LABOR_PENSION_ANNUITY_MONTHS_AT_65 = 288;

/**
 * 國民年金（未加入勞保期間納保）。
 * 公式 A：月投保金額 × 年資 × 0.65% + 加計金額（2025: $4,049）
 * 公式 B：月投保金額 × 年資 × 1.3%（擇優）
 */
export const NATIONAL_PENSION_INSURED_SALARY = 19761;   // 2026 月投保金額（與基本工資連動，估值）
export const NATIONAL_PENSION_RATE_B = 0.013;           // 公式 B 率
export const NATIONAL_PENSION_RATE_A = 0.0065;          // 公式 A 率
export const NATIONAL_PENSION_FIXED_BONUS = 4049;       // 公式 A 加計金額

/** 勞保投保薪資上限（2026） */
export const LABOR_INSURED_SALARY_CAP = 45800;

/** 勞保投保薪資下限（基本工資，估 2026） */
export const LABOR_INSURED_SALARY_FLOOR = 28590;
