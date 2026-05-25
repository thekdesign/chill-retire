<template>
    <div>
        <div class="flex items-baseline justify-between gap-3 mb-1.5">
            <div class="flex items-center gap-2.5 min-w-0">
                <span class="text-xl">{{ emoji }}</span>
                <div class="min-w-0">
                    <div class="font-medium text-clay-800 truncate">{{ label }}</div>
                    <div class="text-xs text-clay-500 mt-0.5">{{ hint }}</div>
                </div>
            </div>
            <div class="font-display font-bold text-lg text-clay-900 font-tabular whitespace-nowrap">
                {{ formatTwd(amount) }}
            </div>
        </div>
        <div class="h-2 bg-cream-200 rounded-full overflow-hidden">
            <div
                class="h-full rounded-full transition-all"
                :style="{
                    width: `${Math.min(100, (amount / total) * 100)}%`,
                    backgroundImage: 'linear-gradient(90deg, #FF9A3D, #F08440)',
                }"
            />
        </div>
    </div>
</template>

<script>
import {formatTwd} from 'formatters/number/currency';

export default {
    name: 'CashflowRow',
    props: {
        emoji: {type: String, required: true},
        label: {type: String, required: true},
        hint: {type: String, default: ''},
        amount: {type: Number, required: true},
        total: {type: Number, required: true},
    },
    setup() {
        return {formatTwd};
    },
};
</script>
