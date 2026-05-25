<template>
    <div class="flex items-center justify-between border-b border-cream-200 py-1.5">
        <dt class="text-clay-500">{{ label }}</dt>
        <dd class="text-clay-800 font-tabular">{{ value }}</dd>
    </div>
</template>

<script>
export default {
    name: 'ReviewRow',
    props: {
        label: {type: String, required: true},
        value: {type: [String, Number], required: true},
    },
};
</script>
