<template>
    <section class="mb-10 animate-fade-up">
        <div class="bg-cream-100 rounded-blob border border-cream-300 p-5 sm:p-6">
            <header class="flex items-baseline justify-between mb-4 flex-wrap gap-2">
                <h2 class="font-display text-lg font-bold text-clay-900">
                    🎚️ 拖一下，看結果即時變化
                </h2>
                <button
                    type="button"
                    class="text-xs text-clay-500 hover:text-sunset-600 font-medium"
                    @click="resetSliders"
                >
                    ↻ 還原
                </button>
            </header>

            <div class="grid sm:grid-cols-3 gap-x-6 gap-y-4">
                <div>
                    <div class="flex items-baseline justify-between mb-1.5">
                        <label class="text-xs font-medium text-clay-700">月收入</label>
                        <span class="text-sm font-tabular text-sunset-700 font-bold">
                            {{ formatTwdShort(profile.monthlyIncome) }}
                        </span>
                    </div>
                    <input
                        type="range"
                        :value="profile.monthlyIncome"
                        :min="20000"
                        :max="300000"
                        :step="1000"
                        class="chill-slider w-full"
                        @input="updateField('monthlyIncome', Number($event.target.value))"
                    />
                    <div class="flex justify-between text-[0.65rem] text-clay-400 font-tabular mt-1">
                        <span>2 萬</span><span>30 萬</span>
                    </div>
                </div>

                <div>
                    <div class="flex items-baseline justify-between mb-1.5">
                        <label class="text-xs font-medium text-clay-700">月支出</label>
                        <span class="text-sm font-tabular text-sunset-700 font-bold">
                            {{ formatTwdShort(profile.monthlyExpense) }}
                        </span>
                    </div>
                    <input
                        type="range"
                        :value="profile.monthlyExpense"
                        :min="10000"
                        :max="200000"
                        :step="1000"
                        class="chill-slider w-full"
                        @input="updateField('monthlyExpense', Number($event.target.value))"
                    />
                    <div class="flex justify-between text-[0.65rem] text-clay-400 font-tabular mt-1">
                        <span>1 萬</span><span>20 萬</span>
                    </div>
                </div>

                <div>
                    <div class="flex items-baseline justify-between mb-1.5">
                        <label class="text-xs font-medium text-clay-700">希望退休年齡</label>
                        <span class="text-sm font-tabular text-sunset-700 font-bold">
                            {{ profile.targetRetireAge }} 歲
                        </span>
                    </div>
                    <input
                        type="range"
                        :value="profile.targetRetireAge"
                        :min="35"
                        :max="75"
                        :step="1"
                        class="chill-slider w-full"
                        @input="updateField('targetRetireAge', Number($event.target.value))"
                    />
                    <div class="flex justify-between text-[0.65rem] text-clay-400 font-tabular mt-1">
                        <span>35 歲</span><span>75 歲</span>
                    </div>
                </div>
            </div>

            <div class="mt-4 pt-4 border-t border-cream-300 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-clay-600">
                <span>儲蓄率
                    <strong class="font-tabular text-clay-900">{{ formatPercent(profile.savingsRate, 0) }}</strong>
                </span>
                <span>·</span>
                <span>每月可存
                    <strong class="font-tabular text-clay-900">{{ formatTwdShort(profile.monthlySavings) }}</strong>
                </span>
            </div>
        </div>
    </section>
</template>

<script>
import {useProfileStore} from 'stores/profile/profile';
import {formatTwdShort, formatPercent} from 'formatters/number/currency';

const INITIAL_KEY = 'chill-retire:whatif-baseline';

export default {
    name: 'WhatIfPanel',
    setup() {
        const profile = useProfileStore();

        // 第一次進入此面板時，記錄當下的 baseline 以便還原
        if (typeof window !== 'undefined' && !window.sessionStorage.getItem(INITIAL_KEY)) {
            window.sessionStorage.setItem(INITIAL_KEY, JSON.stringify({
                monthlyIncome: profile.monthlyIncome,
                monthlyExpense: profile.monthlyExpense,
                targetRetireAge: profile.targetRetireAge,
            }));
        }

        const updateField = (key, value) => {
            profile[key] = value;
            profile.persist();
        };

        const resetSliders = () => {
            if (typeof window === 'undefined') return;
            const raw = window.sessionStorage.getItem(INITIAL_KEY);
            if (!raw) return;
            const baseline = JSON.parse(raw);
            Object.assign(profile, baseline);
            profile.persist();
        };

        return {profile, updateField, resetSliders, formatTwdShort, formatPercent};
    },
};
</script>
