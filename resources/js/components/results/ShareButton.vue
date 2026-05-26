<template>
    <div class="flex flex-col items-center gap-2">
        <ShareCard ref="shareCardRef" />
        <button
            type="button"
            :disabled="busy"
            :class="[
                'inline-flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-full shadow-soft transition-all',
                busy
                    ? 'bg-clay-300 text-white cursor-wait'
                    : 'bg-sunset-500 hover:bg-sunset-600 hover:shadow-soft-lg text-white cursor-pointer',
            ]"
            @click="downloadCard"
        >
            <span v-if="busy">⏳ 產圖中…</span>
            <span v-else>📸 下載我的退休分享卡</span>
        </button>
        <p v-if="error" class="text-xs text-apricot-600">{{ error }}</p>
        <p v-else class="text-xs text-clay-500">產 800×800 圖片，可直接 po IG / 限動 / 群組</p>
    </div>
</template>

<script>
import {ref} from 'vue';
import ShareCard from 'components/results/ShareCard.vue';

export default {
    name: 'ShareButton',
    components: {ShareCard},
    setup() {
        const shareCardRef = ref(null);
        const busy = ref(false);
        const error = ref('');

        const downloadCard = async () => {
            if (busy.value) return;
            error.value = '';
            busy.value = true;
            try {
                const html2canvas = (await import('html2canvas-pro')).default;
                const el = shareCardRef.value?.cardEl;
                if (!el) throw new Error('找不到分享卡元素');

                const canvas = await html2canvas(el, {
                    // 給 solid fallback，避免 gradient 偶爾渲染失敗時拍出全透明
                    backgroundColor: '#F47C1B',
                    scale: 2,
                    logging: false,
                    useCORS: true,
                });

                const ts = new Date().toISOString().slice(0, 10);
                const link = document.createElement('a');
                link.download = `chill-retire-${ts}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (e) {
                console.error('[ShareButton] capture failed:', e);
                error.value = '產圖失敗，請重試或檢查瀏覽器主控台';
            } finally {
                busy.value = false;
            }
        };

        return {shareCardRef, busy, error, downloadCard};
    },
};
</script>
