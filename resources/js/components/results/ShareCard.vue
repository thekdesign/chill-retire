<template>
    <!-- 隱藏在畫面外、專供 html2canvas 截圖用 — 比直接拍主結論卡更乾淨 -->
    <div ref="cardEl" class="share-card font-sans" aria-hidden="true">
        <div class="share-card__inner">
            <div class="share-card__header">
                <div class="share-card__brand">
                    <svg viewBox="0 0 40 40" class="share-card__brand-icon" aria-hidden="true">
                        <circle cx="20" cy="20" r="8" fill="#FFFFFF" />
                        <g stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round">
                            <line x1="20" y1="4" x2="20" y2="9" />
                            <line x1="20" y1="31" x2="20" y2="36" />
                            <line x1="4" y1="20" x2="9" y2="20" />
                            <line x1="31" y1="20" x2="36" y2="20" />
                            <line x1="8" y1="8" x2="11" y2="11" />
                            <line x1="29" y1="29" x2="32" y2="32" />
                            <line x1="8" y1="32" x2="11" y2="29" />
                            <line x1="29" y1="11" x2="32" y2="8" />
                        </g>
                    </svg>
                    <span>Chill Retire</span>
                </div>
                <div v-if="stressTest" class="share-card__stress">
                    {{ stressTest.emoji }} 壓力測試：{{ stressTest.label }}
                </div>
            </div>

            <div class="share-card__body">
                <template v-if="achievable">
                    <div class="share-card__label">我可以在</div>
                    <div class="share-card__age">{{ retireAge }} 歲</div>
                    <div class="share-card__label">開始悠悠哉哉退休</div>
                </template>
                <template v-else>
                    <div class="share-card__age">差一點點</div>
                    <div class="share-card__label">繼續存就快達標了</div>
                </template>
            </div>

            <div class="share-card__stats">
                <div class="share-card__stat">
                    <div class="share-card__stat-label">退休金目標</div>
                    <div class="share-card__stat-value">{{ formatTwdShort(target) }}</div>
                </div>
                <div class="share-card__stat">
                    <div class="share-card__stat-label">月被動現金流</div>
                    <div class="share-card__stat-value">{{ formatTwdShort(monthlyCashflow) }}</div>
                </div>
                <div class="share-card__stat">
                    <div class="share-card__stat-label">市場存活機率</div>
                    <div class="share-card__stat-value">{{ Math.round(successRate * 100) }}%</div>
                </div>
            </div>

            <div class="share-card__footer">
                <span>chill-retire · 試算你的退休全景</span>
                <span class="share-card__url">chill-retire.vercel.app</span>
            </div>
        </div>
    </div>
</template>

<script>
import {ref, computed} from 'vue';
import {useProfileStore} from 'stores/profile/profile';
import {formatTwdShort} from 'formatters/number/currency';

export default {
    name: 'ShareCard',
    setup(_, {expose}) {
        const profile = useProfileStore();
        const cardEl = ref(null);

        const primary = computed(() => profile.primaryScenario);
        const achievable = computed(() => primary.value?.result?.achievable);
        const retireAge = computed(() => primary.value?.result?.retireAge ?? 0);
        const target = computed(() => primary.value?.result?.target ?? 0);
        const monthlyCashflow = computed(() => (primary.value?.result?.annualExpense ?? 0) / 12);
        const successRate = computed(() => profile.monteCarlo?.successRate ?? 0);
        const stressTest = computed(() => profile.stressTest);

        expose({cardEl});

        return {cardEl, achievable, retireAge, target, monthlyCashflow, successRate, stressTest, formatTwdShort};
    },
};
</script>

<style>
.share-card {
    /* 放畫面外，但 html2canvas 仍可正確繪製 */
    position: fixed;
    left: -10000px;
    top: 0;
    width: 800px;
    height: 800px;
    pointer-events: none;
    z-index: -1;
    color: #FFFFFF;
    /* html2canvas-pro 對 gradient 偶有渲染失敗，雙保險：solid + gradient */
    background-color: #F47C1B;
    background-image: linear-gradient(135deg, #FFB76C 0%, #F47C1B 45%, #D8682B 100%);
    border-radius: 32px;
    overflow: hidden;
    font-family: 'Noto Sans TC', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.share-card__inner {
    padding: 64px 56px;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
}

.share-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
}
.share-card__brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
    font-size: 24px;
    letter-spacing: 1px;
}
.share-card__brand-icon {
    width: 36px;
    height: 36px;
}
.share-card__stress {
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.22);
    border-radius: 999px;
    font-size: 14px;
    font-weight: 700;
}

.share-card__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
}
.share-card__label {
    font-size: 20px;
    opacity: 0.92;
    margin-bottom: 6px;
}
.share-card__age {
    font-size: 140px;
    font-weight: 900;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    margin: 4px 0 12px;
    letter-spacing: -2px;
}

.share-card__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    padding: 24px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.35);
    border-bottom: 1px solid rgba(255, 255, 255, 0.35);
    margin-top: 24px;
}
.share-card__stat-label {
    font-size: 14px;
    opacity: 0.85;
    margin-bottom: 4px;
}
.share-card__stat-value {
    font-size: 28px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
}

.share-card__footer {
    margin-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 14px;
    opacity: 0.85;
}
.share-card__url {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    letter-spacing: 1px;
}
</style>
