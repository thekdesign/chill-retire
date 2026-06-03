<template>
    <div class="max-w-[1100px] mx-auto px-5 sm:px-7 pt-8 pb-16">
        <StressModeBanner />

        <!-- 主結論卡片 -->
        <section
            class="relative rounded-blob shadow-soft-lg overflow-hidden mb-10 animate-fade-up"
            style="background-image: linear-gradient(135deg, #FF9A3D 0%, #F47C1B 50%, #D8682B 100%);"
        >
            <div class="absolute -top-20 -right-12 opacity-30">
                <SunIcon class="w-72 h-72 text-white" />
            </div>
            <div class="relative p-8 sm:p-12 text-white">
                <div class="flex items-center justify-between flex-wrap gap-3 mb-2">
                    <div class="text-sm font-medium opacity-90">
                        標準退休情境 · 維持目前生活水準
                        <span v-if="profile.partners.length > 0" class="ml-1">· 👥 household {{ profile.householdSize }} 人</span>
                    </div>
                    <div
                        v-if="primary.result.achievable && monteCarlo.successRate > 0"
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold"
                    >
                        <span class="text-base leading-none">🎲</span>
                        <span class="font-tabular">{{ Math.round(monteCarlo.successRate * 100) }}%</span>
                        <span class="opacity-90">機率撐到 {{ profile.effectiveAssumptions.lifeExpectancy }} 歲</span>
                    </div>
                </div>
                <h1 class="font-display text-3xl sm:text-5xl font-bold leading-tight mb-4">
                    <template v-if="primary.result.achievable">
                        你
                        <span class="inline-block px-3 py-1 mx-1 bg-white text-sunset-600 rounded-2xl font-tabular">
                            {{ primary.result.retireAge }}
                        </span>
                        歲可以開始悠悠哉哉
                    </template>
                    <template v-else>
                        以目前儲蓄速度
                        <span class="inline-block px-3 py-1 mx-1 bg-white text-sunset-600 rounded-2xl">
                            還差一點
                        </span>
                    </template>
                </h1>
                <p class="text-base sm:text-lg opacity-95 mb-6">
                    <template v-if="primary.result.achievable">
                        距離現在 <strong class="font-tabular">{{ primary.result.yearsToRetire }} 年</strong>，
                        屆時需要累積 <strong class="font-tabular">{{ formatTwdShort(primary.result.target) }}</strong>，
                        相當於每年 <strong class="font-tabular">{{ formatTwdShort(primary.result.annualExpense) }}</strong> 的被動現金流。
                    </template>
                    <template v-else>
                        目前每月可存
                        <strong class="font-tabular">{{ formatTwdShort(profile.monthlySavings) }}</strong>
                        ；想在 {{ profile.targetRetireAge }} 歲達標，每月還需要再多存
                        <strong class="font-tabular">{{ formatTwdShort(primary.result.monthlyGap) }}</strong>。
                    </template>
                </p>
                <div class="grid grid-cols-3 gap-4 sm:gap-6 pt-4 border-t border-white/30">
                    <Stat label="退休金目標" :value="formatTwdShort(primary.result.target)" />
                    <Stat label="月被動現金流" :value="formatTwdShort(primary.result.annualExpense / 12)" />
                    <Stat label="現在儲蓄率" :value="formatPercent(profile.savingsRate, 0)" />
                </div>
            </div>
        </section>

        <!-- What-if 滑桿 -->
        <WhatIfPanel />

        <!-- Monte Carlo -->
        <MonteCarloSection
            v-if="primary.result.achievable"
            :monte-carlo="monteCarlo"
            :retire-age="primary.result.retireAge"
            :life-expectancy="profile.effectiveAssumptions.lifeExpectancy"
        />
        <section v-else class="mb-12 animate-fade-up">
            <header class="mb-5">
                <h2 class="font-display text-2xl font-bold text-clay-900 mb-1">
                    🎲 1000 種市場走勢，你的劇本
                </h2>
                <p class="text-clay-600 text-sm">Monte Carlo 模擬市場波動下的成功機率</p>
            </header>
            <div class="bg-white rounded-blob shadow-soft border border-cream-200 p-6 sm:p-8">
                <div class="flex items-start gap-3">
                    <span class="text-3xl">🚧</span>
                    <div>
                        <div class="font-bold text-clay-900 mb-1">目前沒有可模擬的退休路徑</div>
                        <p class="text-sm text-clay-600 leading-relaxed mb-3">
                            <template v-if="profile.monthlySavings <= 0">
                                你目前月支出
                                <strong class="font-tabular">{{ formatTwd(profile.monthlyExpense) }}</strong>
                                ≥ 月收入
                                <strong class="font-tabular">{{ formatTwd(profile.monthlyIncome) }}</strong>，
                                每月儲蓄為 0 或負值 → 無法累積退休本金。
                            </template>
                            <template v-else>
                                以目前儲蓄速度，在 80 歲前無法達到「年支出 × 25」的退休門檻。
                                資產還沒進入「提領期」的階段，沒有市場波動可模擬。
                            </template>
                        </p>
                        <p class="text-sm text-clay-700">
                            💡 試試：拖上面滑桿提高收入、降低支出，或延後退休年齡 — 一旦有「主推情境」能達標，這裡就會出現 Monte Carlo fan chart。
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 黑天鵝壓力測試 -->
        <StressTestPanel />

        <!-- 另存比較情境 -->
        <SavedScenariosPanel />

        <!-- 姊妹站 cross-link -->
        <SisterSiteCard />

        <!-- 情境比較 -->
        <section class="mb-12">
            <header class="mb-5">
                <h2 class="font-display text-2xl font-bold text-clay-900 mb-1">5 種退休情境並列</h2>
                <p class="text-clay-600 text-sm">同樣的你，選不同路線會差幾年？點卡片看細節</p>
            </header>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ScenarioCard
                    v-for="s in scenarios"
                    :key="s.type.key"
                    :scenario="s.type"
                    :result="s.result"
                    :current-age="profile.currentAge"
                    :target-age="profile.targetRetireAge"
                    :is-primary="s.type.key === 'standard'"
                />
            </div>
        </section>

        <!-- 台灣勞保勞退現金流 -->
        <section v-if="twCashflow" class="mb-12">
            <header class="mb-5">
                <h2 class="font-display text-2xl font-bold text-clay-900 mb-1">
                    🇹🇼 65 歲後，政府給你多少？
                </h2>
                <p class="text-clay-600 text-sm">勞保 + 勞退 + 國民年金（若有）的月退休現金流</p>
            </header>
            <div class="bg-white rounded-blob shadow-soft border border-cream-200 p-6 sm:p-8">
                <div
                    v-if="profile.laborInsurancePayout < 1"
                    class="mb-5 bg-apricot-50 border border-apricot-200 rounded-xl px-4 py-3 text-sm text-apricot-700"
                >
                    <div class="font-medium mb-0.5">
                        ⚠️ 你選的勞保保守度：按法定金額的 <strong class="font-tabular">{{ Math.round(profile.laborInsurancePayout * 100) }}%</strong> 計算
                    </div>
                    <div class="text-xs text-apricot-600">
                        法定全額試算為 <strong class="font-tabular">{{ formatTwd(twCashflow.laborInsuranceFull) }}</strong>／月，
                        折扣後 <strong class="font-tabular">{{ formatTwd(twCashflow.laborInsuranceMonthly) }}</strong>／月
                    </div>
                </div>
                <div class="space-y-4 mb-6">
                    <CashflowRow
                        emoji="🏛️"
                        :label="profile.laborInsurancePayout < 1 ? `勞保老年年金（已打 ${Math.round(profile.laborInsurancePayout * 100)} 折）` : '勞保老年年金'"
                        :hint="`平均投保薪資 ${formatTwd(profile.averageInsuredSalary)} × ${profile.laborInsuranceYears + (65 - profile.currentAge)} 年年資 × 1.55%`"
                        :amount="twCashflow.laborInsuranceMonthly"
                        :total="twCashflow.totalMonthly"
                    />
                    <CashflowRow
                        emoji="💰"
                        label="勞退新制（個人專戶月退）"
                        :hint="`雇主 6%${profile.laborPensionEmployeeRate > 0 ? ` + 自提 ${(profile.laborPensionEmployeeRate * 100).toFixed(0)}%` : ''}，預估總額 ${formatTwdShort(twCashflow.laborPensionTotal)}`"
                        :amount="twCashflow.laborPensionMonthly"
                        :total="twCashflow.totalMonthly"
                    />
                    <CashflowRow
                        v-if="twCashflow.nationalPensionMonthly > 0"
                        emoji="🛡️"
                        label="國民年金"
                        :hint="`年資 ${profile.nationalPensionYears} 年`"
                        :amount="twCashflow.nationalPensionMonthly"
                        :total="twCashflow.totalMonthly"
                    />
                </div>
                <div class="flex items-center justify-between pt-5 border-t-2 border-dashed border-cream-300">
                    <div>
                        <div class="text-xs text-clay-500 mb-0.5">合計月退休現金流</div>
                        <div class="font-display text-3xl font-bold text-clay-900 font-tabular">
                            {{ formatTwd(twCashflow.totalMonthly) }}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-clay-500 mb-0.5">cover 你目前支出</div>
                        <div class="font-display text-3xl font-bold font-tabular" :class="coverRate >= 1 ? 'text-matcha-600' : coverRate >= 0.5 ? 'text-apricot-500' : 'text-clay-500'">
                            {{ Math.round(coverRate * 100) }}%
                        </div>
                    </div>
                </div>
                <div
                    v-if="coverRate < 1"
                    class="mt-5 bg-apricot-50 border border-apricot-200 rounded-xl px-4 py-3 text-sm text-apricot-700 leading-relaxed"
                >
                    👉 政府年金每月差 <strong class="font-tabular">{{ formatTwd(monthlyExpense - twCashflow.totalMonthly) }}</strong> 才能 cover 目前支出，
                    這個缺口就是你需要靠投資被動收入補上的部分。
                </div>
                <div v-else class="mt-5 bg-matcha-50 border border-matcha-200 rounded-xl px-4 py-3 text-sm text-matcha-700">
                    🎉 政府年金已經能 cover 你目前支出！投資組合可以更彈性地規劃。
                </div>
            </div>
        </section>

        <!-- 輸入回顧 -->
        <section class="mb-10">
            <details class="bg-cream-100 border border-cream-200 rounded-xl2 px-6 py-4 group">
                <summary class="cursor-pointer text-sm font-medium text-clay-700 list-none flex items-center justify-between">
                    <span class="flex items-center gap-2"><span>📋</span> 你填的資料回顧</span>
                    <span class="text-clay-400 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <dl class="grid sm:grid-cols-2 gap-x-8 gap-y-2 pt-4 text-sm">
                    <ReviewRow label="現在年齡" :value="`${profile.currentAge} 歲`" />
                    <ReviewRow label="希望退休年齡" :value="`${profile.targetRetireAge} 歲`" />
                    <ReviewRow
                        v-for="(partner, idx) in profile.partners"
                        :key="partner.id"
                        :label="`${partner.name || '伴侶 ' + (idx + 1)} 年齡 / 月收入`"
                        :value="`${partner.age} 歲 / ${formatTwd(partner.monthlyIncome)}`"
                    />
                    <ReviewRow
                        :label="profile.partners.length > 0 ? `household 月收入合計 / 月支出（${profile.householdSize} 人共用）` : '月收入 / 月支出'"
                        :value="`${formatTwd(profile.householdMonthlyIncome)} / ${formatTwd(profile.monthlyExpense)}`"
                    />
                    <ReviewRow label="總資產 / 緊急預備金" :value="`${formatTwd(profile.currentAssets)} / ${formatTwd(profile.emergencyFundCurrent)}`" />
                    <ReviewRow label="可投資資產（已扣全部預留）" :value="formatTwd(profile.investableAssets)" />
                    <ReviewRow
                        v-if="profile.housingStatus !== 'none'"
                        label="房屋狀況"
                        :value="profile.housingStatus === 'planning'
                            ? `計畫買，頭期 ${formatTwd(profile.housingDownPayment)}`
                            : '已買（含在月支出）'"
                    />
                    <ReviewRow
                        v-if="profile.kidsCount > 0"
                        label="扶養小孩"
                        :value="`${profile.kidsCount} 個 × ${formatTwd(profile.kidsCostPerMonth)}/月 × 20 年 = ${formatTwd(profile.kidsLifetimeCost)}`"
                    />
                    <ReviewRow label="投資策略" :value="`${profile.investmentStrategy.emoji} ${profile.investmentStrategy.label}（${profile.investmentStrategy.subtitle || ''}）`" />
                    <ReviewRow label="勞保保守度" :value="profile.twEnabled ? `${Math.round(profile.laborInsurancePayout * 100)}%（法定金額）` : '未啟用'" />
                    <ReviewRow label="通膨假設" :value="formatPercent(profile.assumptions.inflationRate, 1)" />
                    <ReviewRow label="退休前報酬率" :value="formatPercent(profile.assumptions.preRetirementReturn, 1)" />
                    <ReviewRow label="安全提領率" :value="formatPercent(profile.assumptions.safeWithdrawalRate, 2)" />
                    <ReviewRow label="預期壽命" :value="`${profile.assumptions.lifeExpectancy} 歲`" />
                </dl>
            </details>
        </section>

        <!-- 行動 CTA -->
        <div class="flex flex-col items-center gap-6 pt-4">
            <div class="grid sm:grid-cols-2 gap-5 w-full max-w-2xl">
                <ShareButton />
                <ShareLinkButton />
            </div>
            <RouterLink
                :to="{name: 'HOME_INDEX'}"
                class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-cream-100 text-clay-700 font-medium rounded-full border border-cream-300 shadow-soft transition-colors"
            >
                ✏️ 修改完整條件
            </RouterLink>
        </div>
    </div>
</template>

<script>
import {computed} from 'vue';
import {useProfileStore} from 'stores/profile/profile';
import {formatTwd, formatTwdShort, formatPercent} from 'formatters/number/currency';
import SunIcon from 'components/illustrations/SunIcon.vue';
import ScenarioCard from 'components/results/ScenarioCard.vue';
import Stat from 'components/results/Stat.vue';
import CashflowRow from 'components/results/CashflowRow.vue';
import ReviewRow from 'components/results/ReviewRow.vue';
import WhatIfPanel from 'components/results/WhatIfPanel.vue';
import MonteCarloSection from 'components/results/MonteCarloSection.vue';
import StressTestPanel from 'components/results/StressTestPanel.vue';
import StressModeBanner from 'components/results/StressModeBanner.vue';
import ShareButton from 'components/results/ShareButton.vue';
import ShareLinkButton from 'components/results/ShareLinkButton.vue';
import SavedScenariosPanel from 'components/results/SavedScenariosPanel.vue';
import SisterSiteCard from 'components/results/SisterSiteCard.vue';

export default {
    name: 'ResultIndex',
    components: {
        SunIcon, ScenarioCard, Stat, CashflowRow, ReviewRow,
        WhatIfPanel, MonteCarloSection, StressTestPanel, StressModeBanner,
        ShareButton, ShareLinkButton, SavedScenariosPanel, SisterSiteCard,
    },
    setup() {
        const profile = useProfileStore();

        const scenarios = computed(() => profile.scenarios);
        const primary = computed(() => profile.primaryScenario || profile.scenarios[1]);
        const monteCarlo = computed(() => profile.monteCarlo);
        const twCashflow = computed(() => profile.twCashflow);
        const monthlyExpense = computed(() => profile.monthlyExpense);
        const coverRate = computed(() => {
            if (!twCashflow.value || !profile.monthlyExpense) return 0;
            return twCashflow.value.totalMonthly / profile.monthlyExpense;
        });

        return {
            profile, scenarios, primary, monteCarlo, twCashflow, monthlyExpense, coverRate,
            formatTwd, formatTwdShort, formatPercent,
        };
    },
};
</script>
