<template>
    <div class="max-w-[800px] mx-auto px-5 sm:px-7 pt-10 pb-16">
        <header class="mb-10 text-center">
            <div class="text-4xl mb-3">📚</div>
            <h1 class="font-display text-3xl sm:text-4xl font-bold text-clay-900 mb-3">名詞解釋</h1>
            <p class="text-clay-600 leading-relaxed">
                Chill Retire 用到的退休規劃概念。看完之後，數字會變得有意義。
            </p>
        </header>

        <nav class="bg-cream-100 border border-cream-200 rounded-xl2 px-5 py-4 mb-10">
            <div class="text-xs font-medium text-clay-500 uppercase tracking-wider mb-2">快速導覽</div>
            <ul class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-sm">
                <li v-for="t in toc" :key="t.id">
                    <a :href="`#${t.id}`" class="text-sunset-700 hover:text-sunset-800 hover:underline">
                        {{ t.icon }} {{ t.label }}
                    </a>
                </li>
            </ul>
        </nav>

        <article class="space-y-12">
            <section id="fire">
                <h2 class="font-display text-2xl font-bold text-clay-900 mb-3 flex items-center gap-2">
                    🔥 FIRE — Financial Independence, Retire Early
                </h2>
                <p class="text-clay-700 leading-relaxed mb-4">
                    財務獨立、提早退休運動。核心想法：如果你的投資組合每年產生的被動收入 ≥ 年支出，
                    你就「財務自由」了，可以選擇是否繼續工作。
                </p>
                <div class="grid sm:grid-cols-2 gap-3">
                    <div class="bg-white border border-cream-200 rounded-xl p-4">
                        <div class="font-bold text-clay-900 mb-1">🌱 Lean FIRE</div>
                        <p class="text-sm text-clay-600">降低生活水準快速達標。月支出 NT$ 30k 就足夠 → FIRE 數字較小</p>
                    </div>
                    <div class="bg-white border border-cream-200 rounded-xl p-4">
                        <div class="font-bold text-clay-900 mb-1">☀️ Standard FIRE</div>
                        <p class="text-sm text-clay-600">維持現在生活水準退休。最多人走的路線</p>
                    </div>
                    <div class="bg-white border border-cream-200 rounded-xl p-4">
                        <div class="font-bold text-clay-900 mb-1">🌴 Fat FIRE</div>
                        <p class="text-sm text-clay-600">想退休後過得更好（旅遊、嗜好）。需要更大本金</p>
                    </div>
                    <div class="bg-white border border-cream-200 rounded-xl p-4">
                        <div class="font-bold text-clay-900 mb-1">☕ Barista FIRE</div>
                        <p class="text-sm text-clay-600">投資 cover 70% 支出 + 兼職補 30%。彈性最大</p>
                    </div>
                </div>
            </section>

            <section id="4percent">
                <h2 class="font-display text-2xl font-bold text-clay-900 mb-3 flex items-center gap-2">
                    💸 4% 規則 / 25 倍法則
                </h2>
                <p class="text-clay-700 leading-relaxed mb-3">
                    1998 年 Trinity Study 提出：歷史數據顯示如果你每年從投資組合提領 4%，
                    撐 30 年的成功率 &gt; 95%。反過來算：
                </p>
                <div class="bg-sunset-50 border border-sunset-200 rounded-xl p-5 mb-3">
                    <div class="font-mono text-center text-sunset-800">
                        退休金目標 = 年支出 × 25
                    </div>
                </div>
                <p class="text-sm text-clay-600 leading-relaxed">
                    例如年支出 NT$ 40 萬 → 退休金目標 NT$ 1,000 萬。<br />
                    <strong>2026 年的爭議：</strong>美股估值偏高（CAPE &gt; 30），
                    許多人建議下修到 3.3–3.5%（FIRE 早退、超過 30 年週期者尤其）。
                </p>
            </section>

            <section id="montecarlo">
                <h2 class="font-display text-2xl font-bold text-clay-900 mb-3 flex items-center gap-2">
                    🎲 Monte Carlo 模擬
                </h2>
                <p class="text-clay-700 leading-relaxed mb-3">
                    「固定 7% 報酬」只是平均。實際每年市場波動很大 — 可能 +30% 也可能 -40%。
                    Monte Carlo 模擬隨機抽 1000 次完整路徑，看你的錢有多少 % 撐到目標年齡。
                </p>
                <p class="text-sm text-clay-600 leading-relaxed">
                    這比單一情境準確得多，因為退休最大的風險不是「平均報酬不夠」，
                    而是「序列風險」 — 開局幾年遇到熊市會 disproportionate 拖垮整個計畫。
                </p>
            </section>

            <section id="sequence-risk">
                <h2 class="font-display text-2xl font-bold text-clay-900 mb-3 flex items-center gap-2">
                    ⚠️ 序列風險（Sequence Risk）
                </h2>
                <p class="text-clay-700 leading-relaxed">
                    退休後同樣的平均報酬率，<strong>順序不同結果差很多</strong>。
                    如果退休第一年遇到 -40% 股災，你被迫從萎縮的本金提領，後續難復原。
                    這就是為什麼 Chill Retire 的「黑天鵝壓力測試」單獨模擬「退休首年股災」這個情境。
                </p>
            </section>

            <section id="tw-pension">
                <h2 class="font-display text-2xl font-bold text-clay-900 mb-3 flex items-center gap-2">
                    🇹🇼 勞保 vs 勞退（很多人搞混）
                </h2>
                <div class="grid sm:grid-cols-2 gap-3">
                    <div class="bg-white border border-cream-200 rounded-xl p-4">
                        <div class="font-bold text-clay-900 mb-1">🏛️ 勞保老年年金</div>
                        <p class="text-sm text-clay-600 mb-2">由政府勞保基金統一支付。算法：</p>
                        <div class="text-xs font-mono bg-cream-100 rounded px-2 py-1 text-clay-700">
                            平均投保薪資 × 年資 × 1.55%
                        </div>
                        <p class="text-xs text-clay-500 mt-2">
                            ⚠️ 預計 2028 年若不改革將破產 — Chill Retire 提供「保守度」選項
                        </p>
                    </div>
                    <div class="bg-white border border-cream-200 rounded-xl p-4">
                        <div class="font-bold text-clay-900 mb-1">💰 勞退新制</div>
                        <p class="text-sm text-clay-600 mb-2">雇主強制提繳 ≥6% 進<strong>個人專戶</strong>。</p>
                        <p class="text-xs text-clay-500">
                            你的錢、你的帳戶，<strong>不會破產</strong>。可額外自提 0–6% 享稅優。
                            65 歲後一次領或月領。
                        </p>
                    </div>
                </div>
                <p class="text-sm text-clay-600 mt-3 leading-relaxed">
                    👉 簡單記：<strong>勞保</strong>是政府年金（共產池），<strong>勞退</strong>是你個人帳戶（私有財）。
                </p>
            </section>

            <section id="strategies">
                <h2 class="font-display text-2xl font-bold text-clay-900 mb-3 flex items-center gap-2">
                    📊 投資策略 — 為什麼預期報酬不同
                </h2>
                <p class="text-clay-700 leading-relaxed mb-3">
                    股票長期報酬高但波動大；債券穩定但報酬低。配置比例決定你的「風險回報曲線」。
                </p>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="text-clay-500 text-xs">
                            <tr class="border-b border-cream-200">
                                <th class="text-left py-2 pr-3">策略</th>
                                <th class="text-right py-2 px-2">年化報酬</th>
                                <th class="text-right py-2 pl-2">波動率</th>
                            </tr>
                        </thead>
                        <tbody class="text-clay-700 font-tabular">
                            <tr class="border-b border-cream-200"><td class="py-2 pr-3">🚀 積極（股 80%）</td><td class="text-right">8%</td><td class="text-right">18%</td></tr>
                            <tr class="border-b border-cream-200"><td class="py-2 pr-3">⚖️ 平衡（股債 60/40）</td><td class="text-right">7%</td><td class="text-right">12%</td></tr>
                            <tr class="border-b border-cream-200"><td class="py-2 pr-3">🛡️ 保守（股債 30/70）</td><td class="text-right">5%</td><td class="text-right">8%</td></tr>
                            <tr><td class="py-2 pr-3">🏦 純現金</td><td class="text-right">1.5%</td><td class="text-right">1%</td></tr>
                        </tbody>
                    </table>
                </div>
                <p class="text-sm text-clay-600 mt-3 leading-relaxed">
                    ⚠️ 純現金看起來「沒風險」，但被通膨 2.5% 吃掉購買力。<strong>實質報酬負值</strong>。
                </p>
            </section>

            <section id="real-return">
                <h2 class="font-display text-2xl font-bold text-clay-900 mb-3 flex items-center gap-2">
                    📉 實質報酬率 vs 名目報酬率
                </h2>
                <p class="text-clay-700 leading-relaxed mb-3">
                    報酬率 7% 看起來不錯，但通膨吃掉 2.5% 後，<strong>實質購買力只增加 ~4.4%</strong>。
                    退休規劃必須用實質報酬，才不會嚴重低估需要的本金。
                </p>
                <div class="bg-cream-100 border border-cream-300 rounded-xl p-4 font-mono text-sm text-clay-800">
                    實質報酬 = (1 + 名目) / (1 + 通膨) − 1<br />
                    例：(1.07) / (1.025) − 1 ≈ 4.4%
                </div>
            </section>

            <section id="emergency">
                <h2 class="font-display text-2xl font-bold text-clay-900 mb-3 flex items-center gap-2">
                    🛟 緊急預備金
                </h2>
                <p class="text-clay-700 leading-relaxed">
                    放在<strong>現金或定存</strong>、隨時可取的金額，建議 3–6 個月支出（自由業或單薪建議 12 個月）。
                    用途：失業、醫療、急用，<strong>不參與投資、不計入退休本金</strong>。
                    Chill Retire 會從可投資資產扣除這部分，避免重複計算。
                </p>
            </section>

            <section id="footer-cta" class="text-center pt-6 border-t border-cream-200">
                <p class="text-clay-600 mb-4">看完了？來試算你的退休全景</p>
                <RouterLink
                    :to="{name: 'HOME_INDEX'}"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-sunset-500 hover:bg-sunset-600 text-white font-bold rounded-full shadow-soft transition-colors"
                >
                    ☀️ 開始試算
                </RouterLink>
            </section>
        </article>
    </div>
</template>

<script>
export default {
    name: 'GlossaryIndex',
    setup() {
        const toc = [
            {id: 'fire', icon: '🔥', label: 'FIRE 變體'},
            {id: '4percent', icon: '💸', label: '4% 規則'},
            {id: 'montecarlo', icon: '🎲', label: 'Monte Carlo'},
            {id: 'sequence-risk', icon: '⚠️', label: '序列風險'},
            {id: 'tw-pension', icon: '🇹🇼', label: '勞保 vs 勞退'},
            {id: 'strategies', icon: '📊', label: '投資策略'},
            {id: 'real-return', icon: '📉', label: '實質報酬率'},
            {id: 'emergency', icon: '🛟', label: '緊急預備金'},
        ];
        return {toc};
    },
};
</script>
