<template>
    <div class="max-w-[1100px] mx-auto px-5 sm:px-7">
        <!-- Hero -->
        <section class="pt-10 sm:pt-16 pb-12 grid md:grid-cols-2 gap-10 items-center">
            <div class="space-y-5 animate-fade-up">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sunset-100 text-sunset-700 text-xs font-medium">
                    <span class="w-1.5 h-1.5 rounded-full bg-sunset-500"></span>
                    台灣本地化 · 純前端 · 無需註冊
                </div>
                <h1 class="font-display text-4xl sm:text-5xl font-bold text-clay-900 leading-tight tracking-tight">
                    算算看，<br />
                    你幾歲可以
                    <span class="text-sunset-500">悠悠哉哉</span>
                    退休？
                </h1>
                <p class="text-base sm:text-lg text-clay-600 leading-relaxed">
                    結合 FIRE 國際標準與台灣勞保勞退算法，<br class="hidden sm:block" />
                    5 分鐘填完，看見 5 種退休情境的全景。
                </p>
                <div class="flex gap-3 pt-2">
                    <a
                        href="#calculator"
                        class="inline-flex items-center gap-2 px-6 py-3 bg-sunset-500 hover:bg-sunset-600 active:bg-sunset-700 text-white font-medium rounded-full shadow-soft hover:shadow-soft-lg transition-all"
                    >
                        ☀️ 開始試算
                    </a>
                </div>
            </div>
            <div class="relative">
                <HeroHammock class="w-full max-w-md mx-auto animate-gentle-float" />
            </div>
        </section>

        <!-- 三大特點卡片（純展示） -->
        <section class="grid sm:grid-cols-3 gap-4 pb-12">
            <div class="bg-white rounded-xl2 p-5 shadow-soft border border-cream-200">
                <PiggyBank class="w-14 h-14 mb-2" />
                <h3 class="font-bold text-clay-900 mb-1">5 種情境並列</h3>
                <p class="text-sm text-clay-600">Lean / Standard / Fat / Barista FIRE + 台灣傳統 65 歲退休一次看。</p>
            </div>
            <div class="bg-white rounded-xl2 p-5 shadow-soft border border-cream-200">
                <GrowingTree class="w-14 h-14 mb-2" />
                <h3 class="font-bold text-clay-900 mb-1">資產成長曲線</h3>
                <p class="text-sm text-clay-600">看見從現在到退休、再到 90 歲的整段現金流變化。</p>
            </div>
            <div class="bg-white rounded-xl2 p-5 shadow-soft border border-cream-200">
                <SunIcon class="w-14 h-14 mb-2 text-sunset-500" />
                <h3 class="font-bold text-clay-900 mb-1">台灣專版算法</h3>
                <p class="text-sm text-clay-600">勞保 1.55% × 年資、勞退新制 6% 提撥、國民年金擇優公式。</p>
            </div>
        </section>

        <!-- 計算表單 -->
        <section id="calculator" class="bg-white rounded-blob shadow-soft-lg border border-cream-200 p-6 sm:p-10 mb-16">
            <header class="mb-8">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-matcha-100 text-matcha-700 text-xs font-medium mb-3">
                    Step by step
                </div>
                <h2 class="font-display text-2xl sm:text-3xl font-bold text-clay-900 mb-2">先告訴我你現在的狀態</h2>
                <p class="text-clay-600">不用註冊，所有資料只存在你的瀏覽器，重新整理也不會消失。</p>
            </header>

            <!-- Step 1 基本 -->
            <div class="space-y-5 mb-10">
                <h3 class="flex items-center gap-2 text-lg font-bold text-clay-800">
                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sunset-500 text-white text-sm font-bold">1</span>
                    基本資料
                </h3>
                <div class="grid sm:grid-cols-2 gap-5">
                    <FormField label="你現在幾歲？" hint="歲">
                        <NumberInput
                            v-model="profile.currentAge"
                            :min="18"
                            :max="70"
                            suffix="歲"
                            @update:model-value="onChange"
                        />
                    </FormField>
                    <FormField label="希望幾歲退休？" hint="歲" help="只是目標，後續會幫你算實際幾歲可以達標">
                        <NumberInput
                            v-model="profile.targetRetireAge"
                            :min="35"
                            :max="75"
                            suffix="歲"
                            @update:model-value="onChange"
                        />
                    </FormField>
                    <FormField label="目前月收入" hint="稅後實領">
                        <NumberInput
                            v-model="profile.monthlyIncome"
                            prefix="NT$"
                            :min="0"
                            :step="1000"
                            format-thousands
                            @update:model-value="onChange"
                        />
                    </FormField>
                    <FormField label="目前月支出" hint="日常+房租房貸+娛樂">
                        <NumberInput
                            v-model="profile.monthlyExpense"
                            prefix="NT$"
                            :min="0"
                            :step="1000"
                            format-thousands
                            @update:model-value="onChange"
                        />
                    </FormField>
                </div>
                <div class="bg-matcha-50 border border-matcha-200 rounded-xl px-4 py-3 text-sm text-matcha-700">
                    👉 你目前的儲蓄率是
                    <span class="font-bold text-matcha-800 font-tabular">{{ savingsRatePercent }}</span>
                    （每月可存 <span class="font-bold font-tabular">{{ monthlySavingsDisplay }}</span>）
                </div>

                <!-- 💑 配偶模式 toggle -->
                <div class="pt-2">
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input
                            v-model="profile.coupleEnabled"
                            type="checkbox"
                            class="w-5 h-5 rounded border-cream-400 text-sunset-500 focus:ring-sunset-400"
                            @change="onChange"
                        />
                        <span class="text-sm text-clay-700">
                            💑 配偶模式 <span class="text-xs text-clay-500 font-normal">— 雙薪 / 雙年金合計，月支出按 household 算（不重複）</span>
                        </span>
                    </label>
                    <div v-if="profile.coupleEnabled" class="grid sm:grid-cols-3 gap-3 pt-3 pl-8 animate-fade-up">
                        <FormField label="配偶現在年齡" hint="可跟主帳不同">
                            <NumberInput v-model="profile.spouseAge" :min="18" :max="70" suffix="歲" @update:model-value="onChange" />
                        </FormField>
                        <FormField label="配偶月收入" hint="稅後實領">
                            <NumberInput v-model="profile.spouseMonthlyIncome" prefix="NT$" :min="0" :step="1000" format-thousands @update:model-value="onChange" />
                        </FormField>
                        <div class="text-xs text-clay-500 self-end pb-2 leading-relaxed">
                            假設兩人同時退休；月支出是 household 共用、不重複計算。
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 2 資產 -->
            <div class="space-y-5 mb-10">
                <h3 class="flex items-center gap-2 text-lg font-bold text-clay-800">
                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sunset-500 text-white text-sm font-bold">2</span>
                    現有資產
                </h3>
                <div class="grid sm:grid-cols-2 gap-5">
                    <FormField
                        label="總資產（含現金）"
                        help="股票、ETF、基金、現金、定存的總和。自住房不計入"
                    >
                        <NumberInput
                            v-model="profile.currentAssets"
                            prefix="NT$"
                            :min="0"
                            :step="10000"
                            format-thousands
                            @update:model-value="onChange"
                        />
                    </FormField>
                    <FormField
                        label="其中緊急預備金"
                        help="保留為現金、不投入股市的部分"
                    >
                        <NumberInput
                            v-model="profile.emergencyFundCurrent"
                            prefix="NT$"
                            :min="0"
                            :step="10000"
                            format-thousands
                            @update:model-value="onChange"
                        />
                    </FormField>
                </div>
                <FormField
                    label="緊急預備金目標"
                    help="一般建議 3–6 個月支出；自由業者或單薪家庭建議 12 個月"
                >
                    <RangeSlider
                        v-model="emergencyFundMonths"
                        :min="0"
                        :max="12"
                        :step="1"
                        :format="(v) => `${v} 個月`"
                    />
                </FormField>
                <div
                    :class="[
                        'rounded-xl px-4 py-3 text-sm border',
                        emergencyStatus.achieved
                            ? 'bg-matcha-50 border-matcha-200 text-matcha-700'
                            : emergencyStatus.level === 'partial'
                                ? 'bg-apricot-50 border-apricot-200 text-apricot-700'
                                : 'bg-cream-100 border-cream-300 text-clay-700',
                    ]"
                >
                    <template v-if="emergencyStatus.achieved">
                        ✅ 緊急預備金已達標！
                        目標 <strong class="font-tabular">{{ formatTwdShort(emergencyStatus.target) }}</strong>，
                        你有 <strong class="font-tabular">{{ formatTwdShort(emergencyStatus.current) }}</strong>。
                        可投資資產 <strong class="font-tabular">{{ formatTwdShort(investableAssets) }}</strong> 進入計算。
                    </template>
                    <template v-else>
                        💡 建議準備 <strong class="font-tabular">{{ formatTwdShort(emergencyStatus.target) }}</strong>，
                        你還差 <strong class="font-tabular">{{ formatTwdShort(emergencyStatus.gap) }}</strong>。
                        可投資資產 <strong class="font-tabular">{{ formatTwdShort(investableAssets) }}</strong> 進入計算（已扣除目前的緊急預備金）。
                    </template>
                </div>
            </div>

            <!-- Step 3 台灣專版（可選） -->
            <div class="space-y-5 mb-10">
                <h3 class="flex items-center gap-2 text-lg font-bold text-clay-800">
                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sunset-500 text-white text-sm font-bold">3</span>
                    勞保勞退（可選）
                </h3>
                <label class="flex items-center gap-3 cursor-pointer">
                    <input
                        v-model="profile.twEnabled"
                        type="checkbox"
                        class="w-5 h-5 rounded border-cream-400 text-sunset-500 focus:ring-sunset-400"
                        @change="onChange"
                    />
                    <span class="text-sm text-clay-700">把勞保 / 勞退 / 國民年金算進去（推薦台灣勞工）</span>
                </label>

                <div v-if="profile.twEnabled" class="grid sm:grid-cols-2 gap-5 pt-2 animate-fade-up">
                    <FormField
                        :label="profile.coupleEnabled ? '你的勞保月投保薪資' : '勞保月投保薪資'"
                        help="勞保局個人專戶可查；上限 NT$ 45,800"
                    >
                        <NumberInput
                            v-model="profile.averageInsuredSalary"
                            prefix="NT$"
                            :min="28590"
                            :max="45800"
                            :step="100"
                            format-thousands
                            @update:model-value="onChange"
                        />
                    </FormField>
                    <FormField
                        :label="profile.coupleEnabled ? '你的勞保年資' : '目前勞保年資'"
                        help="累計參加勞保的年數"
                    >
                        <NumberInput
                            v-model="profile.laborInsuranceYears"
                            suffix="年"
                            :min="0"
                            :max="50"
                            @update:model-value="onChange"
                        />
                    </FormField>
                    <FormField
                        :label="profile.coupleEnabled ? '你的勞退個人專戶餘額' : '勞退個人專戶現有餘額'"
                        help="勞保局網站可查"
                    >
                        <NumberInput
                            v-model="profile.laborPensionBalance"
                            prefix="NT$"
                            :min="0"
                            :step="10000"
                            format-thousands
                            @update:model-value="onChange"
                        />
                    </FormField>
                    <FormField
                        label="勞退自提率"
                        help="雇主固定 6%，你可以再自提 0–6%（享稅優）"
                    >
                        <RangeSlider
                            v-model="laborPensionEmployeeRatePercent"
                            :min="0"
                            :max="6"
                            :step="1"
                            :format="(v) => `${v}%`"
                            @update:model-value="onEmployeeRateChange"
                        />
                    </FormField>
                </div>

                <!-- 配偶 TW pension 欄位 -->
                <div v-if="profile.twEnabled && profile.coupleEnabled" class="pt-3 pl-4 border-l-2 border-sunset-200 animate-fade-up">
                    <div class="text-sm font-medium text-clay-700 mb-3">💑 配偶的勞保勞退</div>
                    <div class="grid sm:grid-cols-2 gap-5">
                        <FormField label="配偶勞保月投保薪資" help="同樣上限 NT$ 45,800">
                            <NumberInput
                                v-model="profile.spouseAverageInsuredSalary"
                                prefix="NT$" :min="28590" :max="45800" :step="100"
                                format-thousands @update:model-value="onChange"
                            />
                        </FormField>
                        <FormField label="配偶勞保年資">
                            <NumberInput
                                v-model="profile.spouseLaborInsuranceYears"
                                suffix="年" :min="0" :max="50"
                                @update:model-value="onChange"
                            />
                        </FormField>
                        <FormField label="配偶勞退專戶餘額">
                            <NumberInput
                                v-model="profile.spouseLaborPensionBalance"
                                prefix="NT$" :min="0" :step="10000"
                                format-thousands @update:model-value="onChange"
                            />
                        </FormField>
                        <FormField label="配偶勞退自提率">
                            <RangeSlider
                                :model-value="Math.round((profile.spouseLaborPensionEmployeeRate || 0) * 100)"
                                :min="0" :max="6" :step="1"
                                :format="(v) => `${v}%`"
                                @update:model-value="updateSpouseEmployeeRate"
                            />
                        </FormField>
                    </div>
                </div>

                <div v-if="profile.twEnabled" class="pt-2 animate-fade-up">
                    <div class="text-sm font-medium text-clay-700 mb-2">
                        勞保保守度 <span class="text-xs text-clay-500 font-normal">— 假設未來勞保改革打折時，你願意按多少規劃？</span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                            v-for="opt in payoutOptions"
                            :key="opt.value"
                            type="button"
                            :class="[
                                'text-left p-3 rounded-xl border-2 transition-all cursor-pointer',
                                profile.laborInsurancePayout === opt.value
                                    ? 'border-sunset-500 bg-sunset-50 shadow-soft'
                                    : 'border-cream-200 bg-white hover:border-sunset-300 hover:bg-sunset-50/40',
                            ]"
                            @click="setPayout(opt.value)"
                        >
                            <div class="font-display font-bold text-base text-clay-900 font-tabular">{{ opt.label }}</div>
                            <div class="text-[0.7rem] text-clay-500 leading-snug mt-0.5">{{ opt.title }}</div>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Step 4 投資策略 -->
            <div class="space-y-4 mb-10">
                <h3 class="flex items-center gap-2 text-lg font-bold text-clay-800">
                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sunset-500 text-white text-sm font-bold">4</span>
                    投資策略
                </h3>
                <p class="text-sm text-clay-600 leading-relaxed">
                    決定你的本金怎麼長大。選了之後會自動套用對應的報酬率與波動率假設。
                </p>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                        v-for="s in strategies"
                        :key="s.key"
                        type="button"
                        :class="[
                            'text-left p-4 rounded-xl2 border-2 transition-all cursor-pointer',
                            profile.investmentStrategyKey === s.key
                                ? 'border-sunset-500 bg-sunset-50 shadow-soft ring-1 ring-sunset-200'
                                : 'border-cream-200 bg-white hover:border-sunset-300 hover:bg-sunset-50/40 hover:-translate-y-0.5',
                        ]"
                        @click="profile.setInvestmentStrategy(s.key)"
                    >
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-2xl">{{ s.emoji }}</span>
                            <div
                                v-if="profile.investmentStrategyKey === s.key"
                                class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full bg-sunset-500 text-white text-[0.6rem] font-bold tracking-wider uppercase"
                            >
                                已選
                            </div>
                        </div>
                        <div class="font-bold text-clay-900">{{ s.label }}</div>
                        <div class="text-xs text-clay-500 font-tabular mb-2">{{ s.subtitle }}</div>
                        <div class="text-[0.7rem] text-clay-500 leading-relaxed">
                            預期報酬 <strong class="font-tabular text-clay-700">{{ (s.preRetirementReturn * 100).toFixed(1) }}%</strong>
                            · 波動 <strong class="font-tabular text-clay-700">{{ (s.portfolioVolatility * 100).toFixed(0) }}%</strong>
                        </div>
                    </button>
                </div>
                <div
                    v-if="profile.investmentStrategyKey === 'custom'"
                    class="bg-cream-100 border border-cream-300 rounded-xl px-4 py-3 text-sm text-clay-700"
                >
                    ⚙️ 你目前用「自訂」設定 — 進階假設裡的報酬率或波動率被手動調整過了。點上面任何一個策略可回到 preset。
                </div>
            </div>

            <!-- 進階生活情境（摺疊） -->
            <details class="border border-cream-300 rounded-xl px-5 py-3 mb-4 group">
                <summary class="cursor-pointer text-sm font-medium text-clay-700 list-none flex items-center justify-between">
                    <span class="flex items-center gap-2">
                        <span class="text-base">🏠</span> 進階生活情境（買房、扶養小孩）
                        <span
                            v-if="lifeScenariosActive"
                            class="text-[0.65rem] px-1.5 py-0.5 rounded-full bg-sunset-100 text-sunset-700 font-bold uppercase tracking-wider"
                        >
                            啟用中
                        </span>
                    </span>
                    <span class="text-clay-400 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div class="pt-5 space-y-6">
                    <!-- 🏠 房 -->
                    <div>
                        <div class="text-sm font-medium text-clay-700 mb-2">🏠 房屋狀況</div>
                        <div class="grid grid-cols-3 gap-2 mb-3">
                            <button
                                v-for="opt in housingOptions"
                                :key="opt.value"
                                type="button"
                                :class="[
                                    'p-3 rounded-xl border-2 text-left transition-all cursor-pointer',
                                    profile.housingStatus === opt.value
                                        ? 'border-sunset-500 bg-sunset-50 shadow-soft'
                                        : 'border-cream-200 bg-white hover:border-sunset-300',
                                ]"
                                @click="setHousing(opt.value)"
                            >
                                <div class="text-lg">{{ opt.emoji }}</div>
                                <div class="font-bold text-xs text-clay-900 mt-0.5">{{ opt.label }}</div>
                                <div class="text-[0.65rem] text-clay-500 mt-0.5">{{ opt.hint }}</div>
                            </button>
                        </div>
                        <div v-if="profile.housingStatus === 'planning'" class="grid sm:grid-cols-2 gap-3">
                            <FormField label="幾年後買" hint="從現在算起">
                                <NumberInput v-model="profile.housingYearsUntilPurchase" suffix="年" :min="0" :max="30" @update:model-value="onChange" />
                            </FormField>
                            <FormField label="頭期款" help="一次性付出，買房當年扣除">
                                <NumberInput v-model="profile.housingDownPayment" prefix="NT$" :min="0" :step="100000" format-thousands @update:model-value="onChange" />
                            </FormField>
                            <FormField label="月貸款" help="買房後每月還款額">
                                <NumberInput v-model="profile.housingMonthlyMortgage" prefix="NT$" :min="0" :step="1000" format-thousands @update:model-value="onChange" />
                            </FormField>
                            <FormField label="貸款年限">
                                <NumberInput v-model="profile.housingMortgageYears" suffix="年" :min="1" :max="40" @update:model-value="onChange" />
                            </FormField>
                        </div>
                    </div>

                    <!-- 👶 小孩 -->
                    <div>
                        <div class="flex items-baseline justify-between mb-2">
                            <div class="text-sm font-medium text-clay-700">👶 計畫扶養小孩</div>
                            <div class="text-sm font-tabular text-sunset-700 font-bold">{{ profile.kidsCount }} 個</div>
                        </div>
                        <input
                            type="range"
                            :value="profile.kidsCount"
                            :min="0"
                            :max="4"
                            :step="1"
                            class="chill-slider w-full mb-3"
                            @input="updateKidsCount(Number($event.target.value))"
                        />
                        <div class="flex justify-between text-[0.65rem] text-clay-400 font-tabular -mt-1 mb-3">
                            <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span>
                        </div>
                        <div v-if="profile.kidsCount > 0" class="grid sm:grid-cols-2 gap-3">
                            <FormField label="每個小孩月支出" help="食衣住行 + 教育 + 育樂">
                                <NumberInput v-model="profile.kidsCostPerMonth" prefix="NT$" :min="0" :step="1000" format-thousands @update:model-value="onChange" />
                            </FormField>
                            <FormField label="扶養幾年" help="0 → N 歲（國際標準 22）">
                                <NumberInput v-model="profile.kidsSupportYears" suffix="年" :min="1" :max="30" @update:model-value="onChange" />
                            </FormField>
                        </div>
                    </div>

                    <!-- 💼 退休後 side income -->
                    <div>
                        <div class="text-sm font-medium text-clay-700 mb-2">
                            💼 退休後 side income <span class="text-xs text-clay-500 font-normal">— 顧問、兼職、版稅、租金…</span>
                        </div>
                        <FormField label="月收入" hint="設 0 = 完全不做">
                            <NumberInput v-model="profile.sideIncomeMonthly" prefix="NT$" :min="0" :step="1000" format-thousands @update:model-value="onChange" />
                        </FormField>
                        <FormField
                            v-if="profile.sideIncomeMonthly > 0"
                            label="做到幾歲"
                            class="mt-3"
                            help="退休後幾歲完全停下來"
                        >
                            <NumberInput v-model="profile.sideIncomeEndAge" suffix="歲" :min="50" :max="90" @update:model-value="onChange" />
                        </FormField>
                    </div>

                    <!-- 🚶 漸進式退休 -->
                    <div>
                        <label class="flex items-center gap-3 cursor-pointer mb-2">
                            <input
                                v-model="profile.gradualEnabled"
                                type="checkbox"
                                class="w-5 h-5 rounded border-cream-400 text-sunset-500 focus:ring-sunset-400"
                                @change="onChange"
                            />
                            <span class="text-sm font-medium text-clay-700">
                                🚶 漸進式退休 <span class="text-xs text-clay-500 font-normal">— 過渡期半薪先做、再正式退</span>
                            </span>
                        </label>
                        <div v-if="profile.gradualEnabled" class="grid sm:grid-cols-2 gap-3 pl-8">
                            <FormField label="從幾歲開始半薪">
                                <NumberInput v-model="profile.gradualStartAge" suffix="歲" :min="40" :max="70" @update:model-value="onChange" />
                            </FormField>
                            <FormField label="工作時間比例">
                                <RangeSlider
                                    :model-value="Math.round(profile.gradualPercentage * 100)"
                                    :min="20"
                                    :max="80"
                                    :step="10"
                                    :format="(v) => `${v}%`"
                                    @update:model-value="updateGradualPercent"
                                />
                            </FormField>
                        </div>
                    </div>

                    <!-- 🩺 退休後健保 -->
                    <div>
                        <label class="flex items-center gap-3 cursor-pointer mb-2">
                            <input
                                v-model="profile.postRetirementNhiEnabled"
                                type="checkbox"
                                class="w-5 h-5 rounded border-cream-400 text-sunset-500 focus:ring-sunset-400"
                                @change="onChange"
                            />
                            <span class="text-sm font-medium text-clay-700">
                                🩺 退休後健保 <span class="text-xs text-clay-500 font-normal">— 無雇主補貼，自負額拉高</span>
                            </span>
                        </label>
                        <FormField
                            v-if="profile.postRetirementNhiEnabled"
                            label="月健保費"
                            help="退休後自負額約 NT$ 6,400+（依眷屬數調整）"
                            class="pl-8"
                        >
                            <NumberInput v-model="profile.postRetirementNhiMonthly" prefix="NT$" :min="0" :step="100" format-thousands @update:model-value="onChange" />
                        </FormField>
                    </div>

                    <!-- 🦽 長照預備金 -->
                    <div>
                        <label class="flex items-center gap-3 cursor-pointer mb-2">
                            <input
                                v-model="profile.longTermCareEnabled"
                                type="checkbox"
                                class="w-5 h-5 rounded border-cream-400 text-sunset-500 focus:ring-sunset-400"
                                @change="onChange"
                            />
                            <span class="text-sm font-medium text-clay-700">
                                🦽 長照預備金 <span class="text-xs text-clay-500 font-normal">— 75+ 後可能需要的照護費</span>
                            </span>
                        </label>
                        <div v-if="profile.longTermCareEnabled" class="grid sm:grid-cols-2 gap-3 pl-8">
                            <FormField label="從幾歲開始" help="保守規劃常用 75 歲">
                                <NumberInput v-model="profile.longTermCareStartAge" suffix="歲" :min="60" :max="90" @update:model-value="onChange" />
                            </FormField>
                            <FormField label="月支出" help="居家照顧 ~3 萬、機構 ~5–8 萬">
                                <NumberInput v-model="profile.longTermCareMonthly" prefix="NT$" :min="0" :step="1000" format-thousands @update:model-value="onChange" />
                            </FormField>
                        </div>
                    </div>
                </div>
            </details>

            <!-- 進階假設（摺疊） -->
            <details class="border border-cream-300 rounded-xl px-5 py-3 mb-10 group">
                <summary class="cursor-pointer text-sm font-medium text-clay-700 list-none flex items-center justify-between">
                    <span class="flex items-center gap-2">
                        <span class="text-base">⚙️</span> 進階假設（通膨、報酬率、預期壽命）
                    </span>
                    <span class="text-clay-400 transition-transform group-open:rotate-180">▾</span>
                </summary>
                <div class="grid sm:grid-cols-2 gap-5 pt-5">
                    <FormField
                        label="年通膨率"
                        :help="`預設 ${(0.025 * 100).toFixed(1)}%，台灣近十年平均約 1.5–2%`"
                    >
                        <RangeSlider
                            v-model="inflationPercent"
                            :min="0"
                            :max="6"
                            :step="0.5"
                            :format="(v) => `${v}%`"
                            @update:model-value="onInflationChange"
                        />
                    </FormField>
                    <FormField
                        label="退休前報酬率"
                        help="股票多會用 7-8%；保守可填 5%"
                    >
                        <RangeSlider
                            v-model="preReturnPercent"
                            :min="2"
                            :max="12"
                            :step="0.5"
                            :format="(v) => `${v}%`"
                            @update:model-value="onPreReturnChange"
                        />
                    </FormField>
                    <FormField
                        label="安全提領率"
                        help="4% rule 是經典標準；早退建議 3.5%"
                    >
                        <RangeSlider
                            v-model="swrPercent"
                            :min="2"
                            :max="6"
                            :step="0.25"
                            :format="(v) => `${v}%`"
                            @update:model-value="onSwrChange"
                        />
                    </FormField>
                    <FormField
                        label="退休後支出比例"
                        help="退休後沒上班沒社交，多數研究顯示降到目前的 70–80%"
                    >
                        <RangeSlider
                            v-model="postRetirementRatioPercent"
                            :min="50"
                            :max="150"
                            :step="5"
                            :format="(v) => `${v}%`"
                            @update:model-value="onPostRetirementRatioChange"
                        />
                    </FormField>
                    <FormField
                        label="預期壽命"
                        help="保守規劃建議拉到 90–95 歲，避免長壽風險"
                    >
                        <NumberInput
                            v-model="lifeExpectancy"
                            suffix="歲"
                            :min="70"
                            :max="100"
                            @update:model-value="onLifeExpectancyChange"
                        />
                    </FormField>
                </div>
            </details>

            <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between pt-2 border-t border-cream-200">
                <button
                    type="button"
                    class="text-sm text-clay-500 hover:text-clay-700 self-start sm:self-auto"
                    @click="resetProfile"
                >
                    ↻ 重設為預設值
                </button>
                <RouterLink
                    :to="{name: 'RESULT_INDEX'}"
                    class="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-sunset-500 hover:bg-sunset-600 active:bg-sunset-700 text-white font-bold rounded-full shadow-soft hover:shadow-soft-lg transition-all"
                >
                    看我的退休全景 →
                </RouterLink>
            </div>
        </section>
    </div>
</template>

<script>
import {computed} from 'vue';
import {useProfileStore} from 'stores/profile/profile';
import {formatTwdShort, formatPercent} from 'formatters/number/currency';
import HeroHammock from 'components/illustrations/HeroHammock.vue';
import PiggyBank from 'components/illustrations/PiggyBank.vue';
import GrowingTree from 'components/illustrations/GrowingTree.vue';
import SunIcon from 'components/illustrations/SunIcon.vue';
import FormField from 'components/common/FormField.vue';
import NumberInput from 'components/common/NumberInput.vue';
import RangeSlider from 'components/common/RangeSlider.vue';
import {LABOR_INSURANCE_PAYOUT_OPTIONS} from 'data/laborInsurancePayout';
import {INVESTMENT_STRATEGIES} from 'data/investmentStrategies';
import {formatTwd} from 'formatters/number/currency';

const HOUSING_OPTIONS = [
    {value: 'none', emoji: '🚫', label: '不打算買', hint: '長租或已有住處'},
    {value: 'planning', emoji: '🏗️', label: '計畫買', hint: '5–10 年內'},
    {value: 'owned', emoji: '🏠', label: '已買', hint: '貸款已含在月支出'},
];

export default {
    name: 'HomeIndex',
    components: {HeroHammock, PiggyBank, GrowingTree, SunIcon, FormField, NumberInput, RangeSlider},
    setup() {
        const profile = useProfileStore();

        const savingsRatePercent = computed(() => formatPercent(profile.savingsRate, 0));
        const monthlySavingsDisplay = computed(() => formatTwdShort(profile.monthlySavings));
        const emergencyStatus = computed(() => profile.emergencyFundStatus);
        const investableAssets = computed(() => profile.investableAssets);

        const emergencyFundMonths = computed({
            get: () => profile.assumptions.emergencyFundMonths,
            set: (v) => profile.updateAssumption('emergencyFundMonths', v),
        });

        const setPayout = (value) => {
            profile.laborInsurancePayout = value;
            profile.persist();
        };

        const setHousing = (value) => {
            profile.housingStatus = value;
            profile.persist();
        };

        const updateKidsCount = (n) => {
            profile.kidsCount = n;
            profile.persist();
        };

        const updateGradualPercent = (v) => {
            profile.gradualPercentage = v / 100;
            profile.persist();
        };

        const updateSpouseEmployeeRate = (v) => {
            profile.spouseLaborPensionEmployeeRate = v / 100;
            profile.persist();
        };

        const lifeScenariosActive = computed(() => (
            profile.housingStatus !== 'none'
            || profile.kidsCount > 0
            || profile.sideIncomeMonthly > 0
            || profile.gradualEnabled
            || profile.longTermCareEnabled
        ));

        const laborPensionEmployeeRatePercent = computed({
            get: () => Math.round((profile.laborPensionEmployeeRate || 0) * 100),
            set: (v) => { profile.laborPensionEmployeeRate = v / 100; profile.persist(); },
        });

        const inflationPercent = computed({
            get: () => Number((profile.assumptions.inflationRate * 100).toFixed(1)),
            set: (v) => profile.updateAssumption('inflationRate', v / 100),
        });
        const preReturnPercent = computed({
            get: () => Number((profile.assumptions.preRetirementReturn * 100).toFixed(1)),
            set: (v) => profile.updateAssumption('preRetirementReturn', v / 100),
        });
        const swrPercent = computed({
            get: () => Number((profile.assumptions.safeWithdrawalRate * 100).toFixed(2)),
            set: (v) => profile.updateAssumption('safeWithdrawalRate', v / 100),
        });
        const lifeExpectancy = computed({
            get: () => profile.assumptions.lifeExpectancy,
            set: (v) => profile.updateAssumption('lifeExpectancy', v),
        });
        const postRetirementRatioPercent = computed({
            get: () => Math.round(profile.assumptions.postRetirementExpenseRatio * 100),
            set: (v) => profile.updateAssumption('postRetirementExpenseRatio', v / 100),
        });

        const onChange = () => profile.persist();
        const onEmployeeRateChange = (v) => { profile.laborPensionEmployeeRate = v / 100; profile.persist(); };
        const onInflationChange = (v) => profile.updateAssumption('inflationRate', v / 100);
        const onPreReturnChange = (v) => profile.updateAssumption('preRetirementReturn', v / 100);
        const onSwrChange = (v) => profile.updateAssumption('safeWithdrawalRate', v / 100);
        const onLifeExpectancyChange = (v) => profile.updateAssumption('lifeExpectancy', v);
        const onPostRetirementRatioChange = (v) => profile.updateAssumption('postRetirementExpenseRatio', v / 100);
        const resetProfile = () => {
            if (window.confirm('確定要重設所有欄位嗎？')) profile.reset();
        };

        return {
            profile,
            payoutOptions: LABOR_INSURANCE_PAYOUT_OPTIONS,
            strategies: INVESTMENT_STRATEGIES,
            housingOptions: HOUSING_OPTIONS,
            setHousing,
            updateKidsCount,
            updateGradualPercent,
            updateSpouseEmployeeRate,
            lifeScenariosActive,
            formatTwd,
            emergencyStatus,
            investableAssets,
            emergencyFundMonths,
            setPayout,
            formatTwdShort,
            savingsRatePercent,
            monthlySavingsDisplay,
            laborPensionEmployeeRatePercent,
            inflationPercent,
            preReturnPercent,
            swrPercent,
            lifeExpectancy,
            postRetirementRatioPercent,
            onChange,
            onEmployeeRateChange,
            onInflationChange,
            onPreReturnChange,
            onSwrChange,
            onLifeExpectancyChange,
            onPostRetirementRatioChange,
            resetProfile,
        };
    },
};
</script>
