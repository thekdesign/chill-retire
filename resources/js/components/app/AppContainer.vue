<template>
    <div class="flex flex-col min-h-screen">
        <header class="sticky top-0 z-40 backdrop-blur-md bg-cream-50/85 border-b border-cream-200">
            <div class="max-w-[1100px] mx-auto px-5 sm:px-7 py-3.5 flex items-center justify-between">
                <RouterLink :to="{name: 'HOME_INDEX'}" class="flex items-center gap-2.5 group">
                    <SunIcon class="w-8 h-8 text-sunset-500 transition-transform group-hover:rotate-45" />
                    <div class="flex flex-col leading-tight">
                        <span class="font-display font-bold text-lg text-clay-900 tracking-wide">Chill Retire</span>
                        <span class="font-mono text-[0.6rem] tracking-[0.18em] text-clay-500 uppercase">CHILL · RETIRE · TW</span>
                    </div>
                </RouterLink>

                <nav class="flex items-center gap-1 sm:gap-2">
                    <RouterLink
                        :to="{name: 'HOME_INDEX'}"
                        class="px-3 py-1.5 rounded-full text-sm text-clay-600 hover:text-sunset-700 hover:bg-sunset-50 transition-colors"
                    >
                        重新計算
                    </RouterLink>
                    <RouterLink
                        :to="{name: 'RESULT_INDEX'}"
                        class="px-3 py-1.5 rounded-full text-sm text-clay-600 hover:text-sunset-700 hover:bg-sunset-50 transition-colors"
                    >
                        結果
                    </RouterLink>
                </nav>
            </div>
        </header>

        <main class="flex-1 w-full">
            <RouterView v-slot="{Component}">
                <Transition name="route-fade" mode="out-in">
                    <component :is="Component" />
                </Transition>
            </RouterView>
        </main>

        <footer class="text-center px-5 py-8 text-xs text-clay-500 space-y-1.5 border-t border-cream-200 mt-12">
            <div>內容為一般性退休規劃工具，僅供參考，實際金額請洽勞保局與專業理財顧問。</div>
            <div class="flex justify-center items-center gap-2 pt-1">
                <span class="font-mono text-[0.6rem] tracking-[0.18em] text-clay-400 uppercase">CHILL · RETIRE</span>
                <span class="text-clay-400">·</span>
                <span>Made with ☀️ in Taiwan</span>
            </div>
        </footer>
    </div>
</template>

<script>
import SunIcon from 'components/illustrations/SunIcon.vue';

export default {
    name: 'AppContainer',
    components: {SunIcon},
};
</script>

<style>
.route-fade-enter-active,
.route-fade-leave-active {
    transition: opacity 240ms ease, transform 240ms ease;
}
.route-fade-enter-from {
    opacity: 0;
    transform: translateY(8px);
}
.route-fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
