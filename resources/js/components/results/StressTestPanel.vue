<template>
    <section class="mb-12 animate-fade-up">
        <header class="mb-5">
            <h2 class="font-display text-2xl font-bold text-clay-900 mb-1">
                🌪️ 黑天鵝壓力測試
            </h2>
            <p class="text-clay-600 text-sm">點按鈕看你的退休計畫遇到極端情況會怎樣 — 所有數字會即時切換</p>
        </header>

        <div class="bg-white rounded-blob shadow-soft border border-cream-200 p-5 sm:p-6">
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                    v-for="test in stressTests"
                    :key="test.key"
                    type="button"
                    :class="[
                        'text-left p-4 rounded-xl2 border-2 transition-all cursor-pointer',
                        profile.stressMode === test.key
                            ? 'border-apricot-500 bg-apricot-50 shadow-soft ring-1 ring-apricot-300'
                            : 'border-cream-200 bg-white hover:border-apricot-300 hover:bg-apricot-50/30 hover:-translate-y-0.5',
                    ]"
                    @click="profile.setStressMode(test.key)"
                >
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-2xl">{{ test.emoji }}</span>
                        <div
                            v-if="profile.stressMode === test.key"
                            class="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-apricot-500 text-white text-[0.6rem] font-bold tracking-wider uppercase"
                        >
                            執行中
                        </div>
                    </div>
                    <div class="font-bold text-sm text-clay-900 mb-0.5">{{ test.label }}</div>
                    <div class="text-xs text-clay-500 mb-2">{{ test.tagline }}</div>
                    <div class="text-[0.7rem] text-clay-500 leading-relaxed">
                        {{ test.description }}
                    </div>
                </button>
            </div>

            <div v-if="profile.stressMode" class="mt-5 pt-5 border-t border-cream-200">
                <button
                    type="button"
                    class="text-sm text-clay-600 hover:text-sunset-600 font-medium transition-colors"
                    @click="profile.clearStressMode()"
                >
                    ↻ 結束壓力測試、回到基準情境
                </button>
            </div>
        </div>
    </section>
</template>

<script>
import {useProfileStore} from 'stores/profile/profile';
import {STRESS_TESTS} from 'data/stressTests';

export default {
    name: 'StressTestPanel',
    setup() {
        const profile = useProfileStore();
        return {profile, stressTests: STRESS_TESTS};
    },
};
</script>
