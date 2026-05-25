<template>
    <Transition name="banner-slide">
        <div
            v-if="stressTest"
            class="sticky top-[60px] z-30 mb-5 -mx-5 sm:-mx-7 px-5 sm:px-7 py-2.5"
            style="background-image: linear-gradient(90deg, #FFC396, #F08440);"
        >
            <div class="max-w-[1100px] mx-auto flex items-center justify-between gap-3 text-white">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="text-lg sm:text-xl flex-shrink-0">{{ stressTest.emoji }}</span>
                    <div class="min-w-0">
                        <div class="text-[0.65rem] uppercase tracking-widest opacity-90 font-bold">
                            壓力測試中
                        </div>
                        <div class="text-sm font-bold truncate">
                            {{ stressTest.label }}
                            <span class="font-normal opacity-90 hidden sm:inline">— {{ stressTest.tagline }}</span>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    class="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/25 hover:bg-white/40 text-xs font-bold transition-colors"
                    @click="profile.clearStressMode()"
                >
                    ✕ 結束
                </button>
            </div>
        </div>
    </Transition>
</template>

<script>
import {computed} from 'vue';
import {useProfileStore} from 'stores/profile/profile';

export default {
    name: 'StressModeBanner',
    setup() {
        const profile = useProfileStore();
        const stressTest = computed(() => profile.stressTest);
        return {profile, stressTest};
    },
};
</script>

<style>
.banner-slide-enter-active,
.banner-slide-leave-active {
    transition: all 240ms cubic-bezier(0.32, 0.72, 0.24, 1);
    overflow: hidden;
}
.banner-slide-enter-from,
.banner-slide-leave-to {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
}
.banner-slide-enter-to,
.banner-slide-leave-from {
    opacity: 1;
    max-height: 80px;
}
</style>
