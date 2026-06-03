<template>
    <div class="relative">
        <span
            v-if="prefix"
            class="absolute inset-y-0 left-3.5 flex items-center text-sm text-clay-500 pointer-events-none"
        >
            {{ prefix }}
        </span>
        <input
            :value="displayValue"
            :type="inputType"
            :inputmode="formatThousands ? 'numeric' : undefined"
            :min="min"
            :max="max"
            :step="step"
            :placeholder="placeholder"
            :class="[
                'block w-full h-11 px-3.5 py-0 leading-none rounded-xl bg-white border border-cream-300',
                'text-clay-900 text-base font-tabular align-middle',
                'placeholder-clay-400 transition-all',
                'focus:outline-none focus:border-sunset-400 focus:shadow-ring',
                prefix ? 'pl-10' : '',
                suffix ? 'pr-12' : '',
            ]"
            @input="onInput"
            @focus="onFocus"
            @blur="onBlur"
        />
        <span
            v-if="suffix"
            class="absolute inset-y-0 right-3.5 flex items-center text-sm text-clay-500 pointer-events-none"
        >
            {{ suffix }}
        </span>
    </div>
</template>

<script>
import {ref, computed} from 'vue';

export default {
    name: 'NumberInput',
    props: {
        modelValue: {type: [Number, String], default: 0},
        min: {type: Number, default: undefined},
        max: {type: Number, default: undefined},
        step: {type: Number, default: 1},
        placeholder: {type: String, default: ''},
        prefix: {type: String, default: ''},
        suffix: {type: String, default: ''},
        formatThousands: {type: Boolean, default: false},
    },
    emits: ['update:modelValue'],
    setup(props, {emit}) {
        const focused = ref(false);

        const inputType = computed(() => (props.formatThousands ? 'text' : 'number'));

        // 關鍵：focus 時顯示原始數字（沒千分位），讓 :value 不重寫 → cursor 不會跳。
        // blur 後才加千分位，平時看起來仍 NT$ 60,000。
        const displayValue = computed(() => {
            if (props.modelValue === '' || props.modelValue === null || props.modelValue === undefined) return '';
            if (!props.formatThousands || focused.value) {
                // 編輯中或非千分位欄位 → raw 顯示
                return String(props.modelValue);
            }
            const n = Number(props.modelValue);
            if (Number.isNaN(n)) return '';
            return n.toLocaleString('en-US');
        });

        const onInput = (e) => {
            const raw = e.target.value;
            if (props.formatThousands) {
                // 純數字欄位：移除所有非數字（防使用者貼上千分位）
                const clean = String(raw).replace(/[^\d]/g, '');
                emit('update:modelValue', clean === '' ? 0 : Number(clean));
            } else {
                emit('update:modelValue', raw === '' ? 0 : Number(raw));
            }
        };

        const onFocus = (e) => {
            focused.value = true;
            // 全選方便整段重新輸入；同時不影響從中間點擊編輯
            // （點擊後瀏覽器會把 cursor 放在那個位置，select 只在初次 focus 時有效）
        };

        const onBlur = () => {
            focused.value = false;
        };

        return {focused, inputType, displayValue, onInput, onFocus, onBlur};
    },
};
</script>
