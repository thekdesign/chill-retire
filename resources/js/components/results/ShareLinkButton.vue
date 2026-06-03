<template>
    <div class="flex flex-col items-center gap-1.5">
        <button
            type="button"
            :class="[
                'inline-flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-full transition-all border-2 cursor-pointer',
                copied
                    ? 'bg-matcha-50 border-matcha-400 text-matcha-700'
                    : 'bg-white hover:bg-sunset-50 border-sunset-300 hover:border-sunset-500 text-sunset-700 shadow-soft hover:shadow-soft-lg',
            ]"
            @click="copyLink"
        >
            <span v-if="copied">✓ 已複製連結</span>
            <span v-else>🔗 複製可分享連結</span>
        </button>
        <p class="text-xs text-clay-500">朋友點連結看到一模一樣的試算，還可以接續調整</p>
    </div>
</template>

<script>
import {ref} from 'vue';
import {useProfileStore} from 'stores/profile/profile';
import {encodeProfileToUrl} from 'libs/urlState';

export default {
    name: 'ShareLinkButton',
    setup() {
        const profile = useProfileStore();
        const copied = ref(false);

        const copyLink = async () => {
            const url = encodeProfileToUrl(profile);
            try {
                await navigator.clipboard.writeText(url);
                copied.value = true;
                setTimeout(() => { copied.value = false; }, 2000);
            } catch (e) {
                // fallback：選取後使用者自己複製
                const ta = document.createElement('textarea');
                ta.value = url;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                copied.value = true;
                setTimeout(() => { copied.value = false; }, 2000);
            }
        };

        return {copied, copyLink};
    },
};
</script>
