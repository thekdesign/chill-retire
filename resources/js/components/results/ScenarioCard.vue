<template>
    <div
        :class="[
            'relative bg-white rounded-xl2 p-5 border cursor-pointer transition-all',
            isPrimary ? 'border-sunset-300 shadow-soft ring-1 ring-sunset-200' : 'border-cream-200 shadow-soft',
            'hover:-translate-y-0.5 hover:shadow-soft-lg',
        ]"
        role="button"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
    >
        <div v-if="isPrimary" class="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-sunset-500 text-white text-[0.65rem] font-bold tracking-wider uppercase">
            主推
        </div>

        <header class="flex items-baseline gap-2 mb-1">
            <span class="text-2xl">{{ scenario.emoji }}</span>
            <h3 class="font-bold text-clay-900">{{ scenario.labelZh }}</h3>
        </header>
        <p class="text-xs text-clay-500 mb-4">{{ scenario.tagline }}</p>

        <div class="space-y-2.5 mb-4">
            <div class="flex items-center justify-between text-sm">
                <span class="text-clay-500">達標年齡</span>
                <span v-if="result.achievable" class="font-display font-bold text-lg font-tabular text-sunset-600">
                    {{ result.retireAge }} 歲
                </span>
                <span v-else class="text-sm text-clay-500">80 歲前難達標</span>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-clay-500">距現在</span>
                <span class="font-tabular text-clay-700">
                    {{ result.achievable ? `${result.yearsToRetire} 年` : '—' }}
                </span>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-clay-500">所需金額</span>
                <span class="font-tabular text-clay-700">{{ formatTwdShort(result.target) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
                <span class="text-clay-500">月被動現金流</span>
                <span class="font-tabular text-clay-700">{{ formatTwdShort(result.annualExpense / 12) }}</span>
            </div>
        </div>

        <Transition name="expand">
            <div v-if="expanded" class="border-t border-cream-200 pt-4 space-y-4">
                <!-- 資產成長 sparkline -->
                <div v-if="result.growthCurve && result.growthCurve.length > 1">
                    <div class="text-xs font-medium text-clay-600 mb-1">資產成長軌跡</div>
                    <GrowthSparkline :points="result.growthCurve" />
                    <div class="flex justify-between text-[0.65rem] text-clay-400 mt-1.5">
                        <span><span class="inline-block w-2 h-2 bg-sunset-400 rounded-sm align-middle mr-1"></span>累積期</span>
                        <span><span class="inline-block w-2 h-2 border border-clay-400 border-dashed rounded-sm align-middle mr-1"></span>提領期</span>
                    </div>
                </div>

                <!-- 細節數字 -->
                <dl class="grid grid-cols-2 gap-2 text-xs">
                    <div class="bg-cream-50 rounded-lg px-3 py-2">
                        <dt class="text-clay-500 mb-0.5">退休後月支出</dt>
                        <dd class="font-tabular text-clay-800 font-medium">{{ formatTwd(result.annualExpense / 12) }}</dd>
                    </div>
                    <div class="bg-cream-50 rounded-lg px-3 py-2">
                        <dt class="text-clay-500 mb-0.5">目前每月可存</dt>
                        <dd class="font-tabular text-clay-800 font-medium">{{ formatTwd(result.monthlyContribution) }}</dd>
                    </div>
                </dl>

                <!-- 達標/缺口提示 -->
                <div
                    v-if="!result.achievable"
                    class="bg-apricot-50 border border-apricot-200 rounded-lg px-3 py-2.5 text-xs text-apricot-700 leading-relaxed"
                >
                    😅 想在 {{ targetAge }} 歲達標，每月還需要再多存
                    <strong class="font-tabular">{{ formatTwd(result.monthlyGap) }}</strong>
                </div>
                <div
                    v-else-if="result.retireAge <= targetAge"
                    class="bg-matcha-50 border border-matcha-200 rounded-lg px-3 py-2.5 text-xs text-matcha-700 leading-relaxed"
                >
                    🎉 比你原本希望的 {{ targetAge }} 歲還早 {{ targetAge - result.retireAge }} 年達標！
                </div>

                <p class="text-xs text-clay-500 leading-relaxed">
                    {{ scenario.description }}
                </p>
            </div>
        </Transition>

        <!-- 收合時：description + 展開提示 -->
        <div v-if="!expanded">
            <p class="text-xs text-clay-500 leading-relaxed border-t border-cream-200 pt-3">
                {{ scenario.description }}
            </p>
            <div class="text-[0.65rem] text-clay-400 text-center mt-3 font-medium">
                點一下看成長曲線與細節 ↓
            </div>
        </div>
    </div>
</template>

<script>
import {ref} from 'vue';
import {formatTwd, formatTwdShort} from 'formatters/number/currency';
import GrowthSparkline from 'components/results/GrowthSparkline.vue';

export default {
    name: 'ScenarioCard',
    components: {GrowthSparkline},
    props: {
        scenario: {type: Object, required: true},
        result: {type: Object, required: true},
        currentAge: {type: Number, required: true},
        targetAge: {type: Number, default: 55},
        isPrimary: {type: Boolean, default: false},
    },
    setup(props) {
        const expanded = ref(props.isPrimary);
        return {expanded, formatTwd, formatTwdShort};
    },
};
</script>

<style>
.expand-enter-active,
.expand-leave-active {
    transition: all 280ms ease;
    overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-4px);
}
.expand-enter-to,
.expand-leave-from {
    opacity: 1;
    max-height: 600px;
    transform: translateY(0);
}
</style>
