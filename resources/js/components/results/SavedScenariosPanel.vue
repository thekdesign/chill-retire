<template>
    <section class="mb-12 animate-fade-up">
        <header class="mb-5 flex items-baseline justify-between flex-wrap gap-3">
            <div>
                <h2 class="font-display text-2xl font-bold text-clay-900 mb-1">
                    💾 另存方案，比較不同決策
                </h2>
                <p class="text-clay-600 text-sm">「我有買房 vs 沒買房」「我有小孩 vs 沒小孩」存下來並列看</p>
            </div>
            <button
                type="button"
                class="inline-flex items-center gap-2 px-4 py-2 bg-sunset-500 hover:bg-sunset-600 text-white font-bold rounded-full shadow-soft transition-colors text-sm cursor-pointer"
                @click="saveCurrent"
            >
                💾 另存當前情境
            </button>
        </header>

        <div v-if="saved.list.length === 0" class="bg-cream-100 border border-cream-200 rounded-blob px-5 py-6 text-center text-sm text-clay-500">
            還沒有儲存的方案。改一下表單條件、再回來這裡按「💾 另存當前情境」，就能比較了。
        </div>

        <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
                v-for="entry in saved.list"
                :key="entry.id"
                class="bg-white rounded-xl2 border border-cream-200 shadow-soft p-4 flex flex-col gap-2"
            >
                <header class="flex items-start justify-between gap-2">
                    <input
                        :value="entry.name"
                        class="font-bold text-clay-900 bg-transparent border-0 focus:outline-none focus:bg-cream-50 rounded px-1 -mx-1 w-full"
                        @blur="rename(entry.id, $event.target.value)"
                        @keydown.enter="$event.target.blur()"
                    />
                    <button
                        type="button"
                        class="text-clay-400 hover:text-apricot-600 text-sm transition-colors flex-shrink-0 cursor-pointer"
                        title="刪除"
                        @click="remove(entry.id)"
                    >
                        ✕
                    </button>
                </header>
                <div class="text-[0.65rem] text-clay-400 font-tabular">
                    {{ formatDate(entry.createdAt) }}
                </div>
                <dl class="space-y-1 text-sm pt-1 border-t border-cream-200">
                    <div class="flex items-center justify-between">
                        <dt class="text-clay-500">退休年齡</dt>
                        <dd class="font-bold font-tabular" :class="entry.summary.achievable ? 'text-sunset-600' : 'text-clay-400'">
                            {{ entry.summary.achievable ? `${entry.summary.retireAge} 歲` : '難達標' }}
                        </dd>
                    </div>
                    <div class="flex items-center justify-between">
                        <dt class="text-clay-500">退休金目標</dt>
                        <dd class="font-tabular text-clay-700">{{ formatTwdShort(entry.summary.target) }}</dd>
                    </div>
                    <div class="flex items-center justify-between">
                        <dt class="text-clay-500">月被動現金流</dt>
                        <dd class="font-tabular text-clay-700">{{ formatTwdShort(entry.summary.monthlyCashflow) }}</dd>
                    </div>
                    <div class="flex items-center justify-between">
                        <dt class="text-clay-500">市場存活機率</dt>
                        <dd class="font-tabular text-clay-700">{{ Math.round(entry.summary.successRate * 100) }}%</dd>
                    </div>
                </dl>
                <button
                    type="button"
                    class="mt-2 text-xs text-sunset-700 hover:text-sunset-800 font-medium cursor-pointer text-left"
                    @click="loadEntry(entry)"
                >
                    ↩ 載入這個方案到表單
                </button>
            </div>
        </div>
    </section>
</template>

<script>
import {computed} from 'vue';
import {useProfileStore} from 'stores/profile/profile';
import {useSavedScenariosStore} from 'stores/savedScenarios/savedScenarios';
import {formatTwdShort} from 'formatters/number/currency';

export default {
    name: 'SavedScenariosPanel',
    setup() {
        const profile = useProfileStore();
        const saved = useSavedScenariosStore();

        const currentSummary = computed(() => {
            const primary = profile.primaryScenario;
            const mc = profile.monteCarlo;
            return {
                achievable: primary?.result?.achievable || false,
                retireAge: primary?.result?.retireAge,
                target: primary?.result?.target || 0,
                monthlyCashflow: (primary?.result?.annualExpense || 0) / 12,
                successRate: mc?.successRate || 0,
            };
        });

        const saveCurrent = () => {
            const name = window.prompt('幫這個方案命名（例：有買房有小孩）', `方案 ${saved.list.length + 1}`);
            if (name === null) return;   // 使用者取消
            saved.save(name.trim() || `方案 ${saved.list.length + 1}`, profile.$state, currentSummary.value);
        };

        const remove = (id) => {
            if (window.confirm('確定刪除這個方案？')) {
                saved.remove(id);
            }
        };

        const rename = (id, name) => {
            if (name && name.trim()) saved.rename(id, name.trim());
        };

        const loadEntry = (entry) => {
            if (window.confirm(`載入「${entry.name}」會覆蓋你目前的表單資料，繼續嗎？`)) {
                profile.applyFromUrl(entry.snapshot);   // 重用 applyFromUrl 的邏輯
            }
        };

        const formatDate = (iso) => {
            const d = new Date(iso);
            return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        };

        return {saved, saveCurrent, remove, rename, loadEntry, formatDate, formatTwdShort};
    },
};
</script>
