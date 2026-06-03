/**
 * 另存情境 store — 讓使用者比較「方案 A vs 方案 B」。
 *
 * 每個 saved scenario 存：
 *   - id（時間戳）
 *   - name（使用者命名）
 *   - snapshot（當下 profile 的快照）
 *   - summary（即時計算結果摘要，給列表顯示用，不重算）
 *   - createdAt
 *
 * 持久化到 localStorage（跟 profile 分開 key）。
 */
import {defineStore} from 'pinia';

const STORAGE_KEY = 'chill-retire:saved-scenarios:v1';
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const loadFromStorage = () => {
    if (!isBrowser) return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
};

const persist = (list) => {
    if (!isBrowser) return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
        // ignore
    }
};

export const useSavedScenariosStore = defineStore('savedScenarios', {
    state: () => ({
        list: loadFromStorage(),
    }),
    actions: {
        save(name, profileSnapshot, summary) {
            // 不存實際年金資料等可推算欄位，只存「使用者輸入」
            const snapshot = {...profileSnapshot};
            delete snapshot.stressMode;       // 暫態不存

            const entry = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: name || `方案 ${this.list.length + 1}`,
                snapshot,
                summary,
                createdAt: new Date().toISOString(),
            };
            this.list = [entry, ...this.list];
            persist(this.list);
            return entry.id;
        },
        remove(id) {
            this.list = this.list.filter((s) => s.id !== id);
            persist(this.list);
        },
        rename(id, name) {
            const entry = this.list.find((s) => s.id === id);
            if (entry) {
                entry.name = name;
                persist(this.list);
            }
        },
        getById(id) {
            return this.list.find((s) => s.id === id);
        },
    },
});
