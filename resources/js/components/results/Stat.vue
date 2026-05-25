<template>
    <div>
        <div class="text-xs sm:text-sm opacity-85 mb-1">{{ label }}</div>
        <div class="font-display font-bold text-xl sm:text-2xl font-tabular">{{ value }}</div>
    </div>
</template>

<script>
export default {
    name: 'Stat',
    props: {
        label: {type: String, required: true},
        value: {type: [String, Number], required: true},
    },
};
</script>
