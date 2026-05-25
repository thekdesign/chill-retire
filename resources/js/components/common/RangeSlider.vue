<template>
    <div class="flex items-center gap-3">
        <input
            type="range"
            :value="modelValue"
            :min="min"
            :max="max"
            :step="step"
            class="flex-1 chill-slider"
            @input="$emit('update:modelValue', Number($event.target.value))"
        />
        <span class="font-tabular text-sm text-clay-700 min-w-[3.5rem] text-right">
            {{ display }}
        </span>
    </div>
</template>

<script>
import {computed} from 'vue';

export default {
    name: 'RangeSlider',
    props: {
        modelValue: {type: Number, required: true},
        min: {type: Number, default: 0},
        max: {type: Number, default: 100},
        step: {type: Number, default: 1},
        format: {type: Function, default: null},
    },
    emits: ['update:modelValue'],
    setup(props) {
        const display = computed(() => (props.format ? props.format(props.modelValue) : props.modelValue));
        return {display};
    },
};
</script>

<style>
.chill-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    background: linear-gradient(90deg, theme('colors.sunset.300'), theme('colors.apricot.300'));
    border-radius: 999px;
    outline: none;
}
.chill-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    background: theme('colors.white');
    border: 3px solid theme('colors.sunset.500');
    border-radius: 999px;
    cursor: grab;
    box-shadow: 0 2px 8px rgba(122, 51, 6, 0.18);
    transition: transform 120ms ease;
}
.chill-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
}
.chill-slider::-moz-range-thumb {
    width: 22px;
    height: 22px;
    background: theme('colors.white');
    border: 3px solid theme('colors.sunset.500');
    border-radius: 999px;
    cursor: grab;
    box-shadow: 0 2px 8px rgba(122, 51, 6, 0.18);
}
</style>
