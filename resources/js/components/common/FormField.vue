<template>
    <label class="block">
        <div class="flex items-baseline justify-between mb-1.5">
            <span class="text-sm font-medium text-clay-700">{{ label }}</span>
            <span v-if="hint" class="text-xs text-clay-500">{{ hint }}</span>
        </div>
        <slot />
        <div v-if="help" class="mt-1.5 text-xs text-clay-500 leading-relaxed">
            {{ help }}
        </div>
    </label>
</template>

<script>
export default {
    name: 'FormField',
    props: {
        label: {type: String, required: true},
        hint: {type: String, default: ''},
        help: {type: String, default: ''},
    },
};
</script>
