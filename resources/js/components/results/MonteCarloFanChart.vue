<template>
    <div v-if="percentiles && percentiles.length > 1" class="relative">
        <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none" class="w-full h-44">
            <!-- 10–90 percentile band（最外） -->
            <path :d="bandOuter" fill="#FFD3A1" fill-opacity="0.4" />
            <!-- 25–75 percentile band（中間） -->
            <path :d="bandInner" fill="#FF9A3D" fill-opacity="0.4" />
            <!-- 中位數線 -->
            <path :d="medianLine" fill="none" stroke="#F47C1B" stroke-width="2" stroke-linecap="round" />
            <!-- 0 元基線 -->
            <line :x1="0" :y1="height" :x2="width" :y2="height" stroke="#928570" stroke-width="0.5" opacity="0.3" />
            <!-- 退休年齡標記 -->
            <line
                v-if="retireMark"
                :x1="retireMark"
                :x2="retireMark"
                y1="0"
                :y2="height"
                stroke="#F47C1B"
                stroke-width="1"
                stroke-dasharray="2 2"
                opacity="0.5"
            />
        </svg>
        <!-- 圖例 -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-clay-600 mt-2">
            <span class="flex items-center gap-1.5">
                <span class="inline-block w-3 h-2 rounded-sm" style="background:#FF9A3D;opacity:0.4"></span>
                25–75% 區間
            </span>
            <span class="flex items-center gap-1.5">
                <span class="inline-block w-3 h-2 rounded-sm" style="background:#FFD3A1;opacity:0.5"></span>
                10–90% 區間
            </span>
            <span class="flex items-center gap-1.5">
                <span class="inline-block w-3 h-0.5 bg-sunset-500"></span>
                中位數（最常見的結果）
            </span>
        </div>
        <div class="flex justify-between text-xs text-clay-500 mt-1 font-tabular">
            <span>{{ percentiles[0].age }} 歲</span>
            <span v-if="retireAge" class="text-sunset-600 font-bold">↑ {{ retireAge }} 歲退休</span>
            <span>{{ percentiles[percentiles.length - 1].age }} 歲</span>
        </div>
    </div>
</template>

<script>
import {computed} from 'vue';

export default {
    name: 'MonteCarloFanChart',
    props: {
        percentiles: {type: Array, required: true},
        retireAge: {type: Number, default: null},
    },
    setup(props) {
        const width = 400;
        const height = 140;
        const padding = 6;

        const bounds = computed(() => {
            const ages = props.percentiles.map((p) => p.age);
            const allValues = props.percentiles.flatMap((p) => [p.p10, p.p90]);
            return {
                minAge: Math.min(...ages),
                maxAge: Math.max(...ages),
                maxAssets: Math.max(...allValues, 1),
            };
        });

        const toX = (age) => {
            const {minAge, maxAge} = bounds.value;
            return ((age - minAge) / (maxAge - minAge)) * (width - padding * 2) + padding;
        };
        const toY = (assets) => {
            const {maxAssets} = bounds.value;
            return height - padding - (assets / maxAssets) * (height - padding * 2);
        };

        const buildBand = (lowerKey, upperKey) => {
            const pts = props.percentiles;
            const upper = pts.map((p) => `${toX(p.age).toFixed(1)} ${toY(p[upperKey]).toFixed(1)}`);
            const lower = pts.map((p) => `${toX(p.age).toFixed(1)} ${toY(p[lowerKey]).toFixed(1)}`).reverse();
            return `M ${upper.join(' L ')} L ${lower.join(' L ')} Z`;
        };

        const bandOuter = computed(() => buildBand('p10', 'p90'));
        const bandInner = computed(() => buildBand('p25', 'p75'));
        const medianLine = computed(() => {
            const pts = props.percentiles.map((p) => `${toX(p.age).toFixed(1)} ${toY(p.p50).toFixed(1)}`);
            return `M ${pts.join(' L ')}`;
        });

        const retireMark = computed(() => (props.retireAge ? toX(props.retireAge) : null));

        return {width, height, bandOuter, bandInner, medianLine, retireMark};
    },
};
</script>
