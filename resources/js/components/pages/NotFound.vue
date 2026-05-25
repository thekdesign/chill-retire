<template>
    <div class="max-w-[600px] mx-auto px-5 py-20 text-center">
        <div class="text-7xl mb-4">🌴</div>
        <h1 class="text-2xl font-bold text-clay-900 mb-3">這條路通到沙灘了</h1>
        <p class="text-clay-600 mb-8">找不到你要找的頁面。要不要先去算算自己幾歲可以退休？</p>
        <RouterLink
            :to="{name: 'HOME_INDEX'}"
            class="inline-flex items-center gap-2 px-5 py-3 bg-sunset-500 hover:bg-sunset-600 text-white font-medium rounded-full shadow-soft transition-colors"
        >
            回首頁開始試算
        </RouterLink>
    </div>
</template>

<script>
export default {name: 'NotFound'};
</script>
