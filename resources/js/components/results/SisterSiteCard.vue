<template>
    <section class="mb-12 animate-fade-up">
        <a
            href="https://class-ladder-ten.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            class="block group"
        >
            <div
                class="relative rounded-blob overflow-hidden shadow-soft hover:shadow-soft-lg transition-all"
                style="background-image: linear-gradient(135deg, #1E3A5F 0%, #2D5078 50%, #3D6699 100%);"
            >
                <!-- 裝飾性背景階梯 -->
                <svg
                    class="absolute right-4 bottom-0 opacity-15 pointer-events-none"
                    width="200" height="120" viewBox="0 0 200 120"
                    aria-hidden="true"
                >
                    <rect x="0" y="100" width="40" height="20" fill="#FFFFFF" />
                    <rect x="40" y="80" width="40" height="40" fill="#FFFFFF" />
                    <rect x="80" y="60" width="40" height="60" fill="#FFFFFF" />
                    <rect x="120" y="40" width="40" height="80" fill="#FFFFFF" />
                    <rect x="160" y="20" width="40" height="100" fill="#FFFFFF" />
                </svg>

                <div class="relative p-6 sm:p-7 text-white">
                    <div class="text-[0.65rem] font-mono tracking-widest uppercase opacity-75 mb-1">
                        § Sister Site · 順便看看
                    </div>
                    <h3 class="font-display font-bold text-xl sm:text-2xl mb-2 flex items-center gap-2">
                        🪜 你目前在台灣的階層位置？
                        <span class="text-base opacity-80 group-hover:translate-x-1 transition-transform">→</span>
                    </h3>
                    <p class="text-sm opacity-90 leading-relaxed mb-4 max-w-xl">
                        知道未來退休數字，也該知道現在站在哪。class-ladder 用主計總處 / 內政部 / 財政部真實數據，
                        7 題測出你在台灣的階層定位。
                    </p>
                    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-bold group-hover:bg-white/30 transition-colors">
                        去 class-ladder 看看
                        <span class="text-xs opacity-75">↗</span>
                    </div>
                </div>
            </div>
        </a>
    </section>
</template>

<script>
export default {
    name: 'SisterSiteCard',
};
</script>
