/**
 * 台灣勞保 / 勞退 / 國民年金計算。
 *
 * 重要：所有公式參考勞動部公告，但實際領取金額會因投保歷史、平均薪資計算方式而有差異。
 * 本工具僅供規劃參考，正式試算請以勞保局官方為準。
 */

import {
    LABOR_INSURANCE_LEGAL_AGE,
    LABOR_INSURANCE_RATE,
    LABOR_INSURANCE_EARLY_REDUCTION_PER_YEAR,
    LABOR_INSURANCE_EARLY_MAX_YEARS,
    LABOR_INSURANCE_DEFER_BONUS_PER_YEAR,
    LABOR_INSURANCE_DEFER_MAX_YEARS,
    LABOR_PENSION_EMPLOYER_RATE_MIN,
    LABOR_PENSION_EXPECTED_RATE,
    LABOR_PENSION_ANNUITY_MONTHS_AT_65,
    NATIONAL_PENSION_INSURED_SALARY,
    NATIONAL_PENSION_RATE_B,
    NATIONAL_PENSION_RATE_A,
    NATIONAL_PENSION_FIXED_BONUS,
    LABOR_INSURED_SALARY_CAP,
} from 'data/twPension';

/**
 * 勞保老年年金月領金額（公式 B = 平均投保薪資 × 年資 × 1.55%）
 */
export const calculateLaborInsurance = ({
    averageInsuredSalary,
    yearsOfService,
    claimAge = LABOR_INSURANCE_LEGAL_AGE,
}) => {
    const cappedSalary = Math.min(averageInsuredSalary, LABOR_INSURED_SALARY_CAP);
    const base = cappedSalary * yearsOfService * LABOR_INSURANCE_RATE;

    // 提早/延後調整
    let adjustment = 1;
    if (claimAge < LABOR_INSURANCE_LEGAL_AGE) {
        const yearsEarly = Math.min(LABOR_INSURANCE_LEGAL_AGE - claimAge, LABOR_INSURANCE_EARLY_MAX_YEARS);
        adjustment = 1 - yearsEarly * LABOR_INSURANCE_EARLY_REDUCTION_PER_YEAR;
    } else if (claimAge > LABOR_INSURANCE_LEGAL_AGE) {
        const yearsDefer = Math.min(claimAge - LABOR_INSURANCE_LEGAL_AGE, LABOR_INSURANCE_DEFER_MAX_YEARS);
        adjustment = 1 + yearsDefer * LABOR_INSURANCE_DEFER_BONUS_PER_YEAR;
    }

    return Math.round(base * adjustment);
};

/**
 * 勞退新制個人專戶累積金額（雇主 6% + 自提）
 * @param {object} params
 * @param {number} params.monthlySalary 月薪（會被勞退提繳工資分級表四捨五入，此處簡化）
 * @param {number} params.employeeRate 自提率 0–0.06
 * @param {number} params.yearsRemaining 距離請領還有幾年
 * @param {number} params.currentBalance 現有專戶餘額（從勞保局個人專戶查的）
 * @param {number} params.expectedRate 預期年化收益（預設 LABOR_PENSION_EXPECTED_RATE）
 */
export const calculateLaborPension = ({
    monthlySalary,
    employeeRate = 0,
    yearsRemaining,
    currentBalance = 0,
    expectedRate = LABOR_PENSION_EXPECTED_RATE,
}) => {
    const totalRate = LABOR_PENSION_EMPLOYER_RATE_MIN + employeeRate;
    const annualContribution = monthlySalary * 12 * totalRate;

    let balance = currentBalance;
    for (let i = 0; i < yearsRemaining; i += 1) {
        balance = balance * (1 + expectedRate) + annualContribution;
    }

    // 換算月領（領 24 年 = 288 個月）
    const monthlyAnnuity = balance / LABOR_PENSION_ANNUITY_MONTHS_AT_65;

    return {
        totalBalance: Math.round(balance),
        monthlyAnnuity: Math.round(monthlyAnnuity),
    };
};

/**
 * 國民年金月領金額（A、B 公式擇優）
 * 多數人公式 B 較優，但年資短者公式 A 因有加計金額會勝出。
 */
export const calculateNationalPension = ({
    yearsOfService,
    insuredSalary = NATIONAL_PENSION_INSURED_SALARY,
}) => {
    const formulaB = insuredSalary * yearsOfService * NATIONAL_PENSION_RATE_B;
    const formulaA = insuredSalary * yearsOfService * NATIONAL_PENSION_RATE_A + NATIONAL_PENSION_FIXED_BONUS;
    return Math.round(Math.max(formulaA, formulaB));
};

/**
 * 整合三項：給定使用者台灣專版輸入，回傳月退休現金流明細
 */
export const calculateTwRetirementCashflow = ({
    currentAge,
    claimAge,
    monthlySalary,
    laborInsuranceYears,
    laborPensionYears,
    laborPensionBalance,
    laborPensionEmployeeRate,
    nationalPensionYears,
}) => {
    const yearsToClaim = Math.max(0, claimAge - currentAge);

    const laborInsuranceMonthly = calculateLaborInsurance({
        averageInsuredSalary: Math.min(monthlySalary, LABOR_INSURED_SALARY_CAP),
        yearsOfService: laborInsuranceYears + yearsToClaim,
        claimAge,
    });

    const {monthlyAnnuity: laborPensionMonthly, totalBalance: laborPensionTotal} = calculateLaborPension({
        monthlySalary,
        employeeRate: laborPensionEmployeeRate,
        yearsRemaining: yearsToClaim,
        currentBalance: laborPensionBalance,
    });

    const nationalPensionMonthly = nationalPensionYears > 0
        ? calculateNationalPension({yearsOfService: nationalPensionYears})
        : 0;

    return {
        laborInsuranceMonthly,
        laborPensionMonthly,
        laborPensionTotal,
        nationalPensionMonthly,
        totalMonthly: laborInsuranceMonthly + laborPensionMonthly + nationalPensionMonthly,
    };
};
