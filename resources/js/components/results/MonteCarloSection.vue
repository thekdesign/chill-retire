<template>
    <section v-if="monteCarlo.successRate >= 0" class="mb-12 animate-fade-up">
        <header class="mb-5 flex items-baseline justify-between flex-wrap gap-3">
            <div>
                <h2 class="font-display text-2xl font-bold text-clay-900 mb-1">
                    🎲 1000 種市場走勢，你的劇本
                </h2>
                <p class="text-clay-600 text-sm">市場不是固定 7% 報酬，這是模擬 1000 種隨機路徑後的成功機率</p>
            </div>
        </header>

        <div class="bg-white rounded-blob shadow-soft border border-cream-200 p-6 sm:p-8">
            <!-- 成功率主視覺 -->
            <div class="flex flex-col md:flex-row items-start md:items-center gap-6 mb-7 pb-6 border-b border-cream-200">
                <div class="flex items-center gap-5">
                    <div class="relative w-24 h-24">
                        <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r="44" fill="none" stroke="#EAE4D8" stroke-width="9" />
                            <circle
                                cx="50"
                                cy="50"
                                r="44"
                                fill="none"
                                :stroke="ringColor"
                                stroke-width="9"
                                stroke-linecap="round"
                                :stroke-dasharray="circumference"
                                :stroke-dashoffset="dashOffset"
                                style="transition: stroke-dashoffset 600ms ease, stroke 200ms ease"
                            />
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="font-display font-bold text-xl sm:text-2xl font-tabular" :class="textColorClass">
                                {{ Math.round(monteCarlo.successRate * 100) }}%
                            </span>
                        </div>
                    </div>
                    <div>
                        <div class="text-xs text-clay-500 mb-1 font-medium">成功撐到 {{ lifeExpectancy }} 歲的機率</div>
                        <div class="font-display text-lg font-bold text-clay-900 leading-snug">
                            {{ verdictTitle }}
                        </div>
                        <div class="text-sm text-clay-600 mt-0.5">
                            {{ verdictBody }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Fan chart -->
            <div class="mb-2">
                <div class="text-xs font-medium text-clay-600 mb-2">資產走勢分布（橘色實線是最常見的結果）</div>
                <MonteCarloFanChart :percentiles="monteCarlo.percentiles" :retire-age="retireAge" />
            </div>

            <!-- 補充說明 -->
            <details class="mt-5 group">
                <summary class="text-xs text-clay-500 cursor-pointer list-none flex items-center gap-1.5 hover:text-clay-700">
                    <span class="transition-transform group-open:rotate-90">▸</span>
                    這個機率怎麼算的？
                </summary>
                <div class="mt-2 text-xs text-clay-500 leading-relaxed space-y-1.5 pl-4">
                    <p>
                        固定 7% 報酬率只是平均，實際每年波動很大（歷史標準差約 12%）。
                        我們隨機抽 1000 次 60 年的市場路徑，看有多少次你的錢撐到 {{ lifeExpectancy }} 歲沒見底。
                    </p>
                    <p>
                        橘色實線是中位數路徑（最常見結果），深橘色帶是 25–75% 區間（一半機會落在這裡），
                        淺橘色帶是 10–90% 區間（極端好/壞情境）。
                    </p>
                </div>
            </details>
        </div>
    </section>
</template>

<script>
import {computed} from 'vue';
import MonteCarloFanChart from 'components/results/MonteCarloFanChart.vue';

export default {
    name: 'MonteCarloSection',
    components: {MonteCarloFanChart},
    props: {
        monteCarlo: {type: Object, required: true},
        retireAge: {type: Number, default: null},
        lifeExpectancy: {type: Number, default: 90},
    },
    setup(props) {
        const circumference = 2 * Math.PI * 44;
        const dashOffset = computed(() => circumference * (1 - props.monteCarlo.successRate));

        const ringColor = computed(() => {
            const r = props.monteCarlo.successRate;
            if (r >= 0.85) return '#5E7F3F'; // matcha-500
            if (r >= 0.65) return '#F47C1B'; // sunset-500
            return '#D8682B'; // apricot-500
        });

        const textColorClass = computed(() => {
            const r = props.monteCarlo.successRate;
            if (r >= 0.85) return 'text-matcha-600';
            if (r >= 0.65) return 'text-sunset-600';
            return 'text-apricot-600';
        });

        const verdictTitle = computed(() => {
            const r = props.monteCarlo.successRate;
            if (r >= 0.95) return '穩到不行 ✨';
            if (r >= 0.85) return '相當安全 ☀️';
            if (r >= 0.7) return '還算 OK，但可以更穩';
            if (r >= 0.5) return '一半一半，建議加強';
            return '有點冒險';
        });

        const verdictBody = computed(() => {
            const r = props.monteCarlo.successRate;
            const failedAge = props.monteCarlo.failedAgeMedian;
            if (r >= 0.85) return '即使遇到市場波動，你的錢撐到老的機率很高。';
            if (r >= 0.65) return '大多數情境 OK，但壞情境可能會出狀況。';
            if (failedAge) return `若市場走差，中位數會在 ${failedAge} 歲左右用完。建議再多存點或延後退休。`;
            return '建議調整：再多存點、延後幾年退休、或降低退休後支出。';
        });

        return {circumference, dashOffset, ringColor, textColorClass, verdictTitle, verdictBody};
    },
};
</script>
