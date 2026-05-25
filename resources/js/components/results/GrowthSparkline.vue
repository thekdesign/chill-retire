<template>
    <div v-if="points.length > 1" class="relative">
        <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none" class="w-full h-20">
            <!-- 累積期面積 -->
            <path :d="accumulationArea" fill="#FFD3A1" fill-opacity="0.5" />
            <!-- 提領期面積 -->
            <path v-if="withdrawalArea" :d="withdrawalArea" fill="#EAE4D8" fill-opacity="0.5" />
            <!-- 累積期線 -->
            <path :d="accumulationLine" fill="none" stroke="#F47C1B" stroke-width="2" stroke-linecap="round" />
            <!-- 提領期線（虛線） -->
            <path
                v-if="withdrawalLine"
                :d="withdrawalLine"
                fill="none"
                stroke="#928570"
                stroke-width="2"
                stroke-dasharray="3 3"
                stroke-linecap="round"
            />
            <!-- 退休年齡標記 -->
            <line
                v-if="retireMark"
                :x1="retireMark.x"
                :x2="retireMark.x"
                y1="0"
                :y2="height"
                stroke="#F47C1B"
                stroke-width="1"
                stroke-dasharray="2 2"
                opacity="0.5"
            />
            <circle
                v-if="retireMark"
                :cx="retireMark.x"
                :cy="retireMark.y"
                r="3"
                fill="#F47C1B"
            />
        </svg>
        <div class="flex justify-between text-[0.65rem] text-clay-500 mt-1 font-tabular">
            <span>{{ points[0].age }} 歲</span>
            <span v-if="retirePoint" class="text-sunset-600 font-bold">↑ {{ retirePoint.age }} 歲退休</span>
            <span>{{ points[points.length - 1].age }} 歲</span>
        </div>
    </div>
</template>

<script>
import {computed} from 'vue';

export default {
    name: 'GrowthSparkline',
    props: {
        points: {type: Array, required: true},
    },
    setup(props) {
        const width = 200;
        const height = 60;
        const padding = 4;

        const bounds = computed(() => {
            const ages = props.points.map((p) => p.age);
            const assets = props.points.map((p) => p.assets);
            return {
                minAge: Math.min(...ages),
                maxAge: Math.max(...ages),
                minAssets: 0,
                maxAssets: Math.max(...assets, 1),
            };
        });

        const toXY = (p) => {
            const {minAge, maxAge, maxAssets} = bounds.value;
            const x = ((p.age - minAge) / (maxAge - minAge)) * (width - padding * 2) + padding;
            const y = height - padding - (p.assets / maxAssets) * (height - padding * 2);
            return {x, y};
        };

        const accumulationPoints = computed(() => props.points.filter((p) => p.phase === 'accumulation'));
        const withdrawalPoints = computed(() => props.points.filter((p) => p.phase === 'withdrawal'));

        const buildLine = (pts) => {
            if (pts.length < 2) return '';
            const coords = pts.map(toXY);
            return coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
        };

        const buildArea = (pts) => {
            if (pts.length < 2) return '';
            const coords = pts.map(toXY);
            const top = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
            const first = coords[0];
            const last = coords[coords.length - 1];
            return `${top} L ${last.x.toFixed(1)} ${(height - padding).toFixed(1)} L ${first.x.toFixed(1)} ${(height - padding).toFixed(1)} Z`;
        };

        const accumulationLine = computed(() => buildLine(accumulationPoints.value));
        const accumulationArea = computed(() => buildArea(accumulationPoints.value));
        const withdrawalLine = computed(() => (withdrawalPoints.value.length > 0
            // 提領期接續累積期最後一點
            ? buildLine([accumulationPoints.value[accumulationPoints.value.length - 1], ...withdrawalPoints.value])
            : ''));
        const withdrawalArea = computed(() => (withdrawalPoints.value.length > 0
            ? buildArea([accumulationPoints.value[accumulationPoints.value.length - 1], ...withdrawalPoints.value])
            : ''));

        const retirePoint = computed(() => {
            const acc = accumulationPoints.value;
            return acc.length > 0 ? acc[acc.length - 1] : null;
        });
        const retireMark = computed(() => (retirePoint.value ? toXY(retirePoint.value) : null));

        return {width, height, accumulationLine, accumulationArea, withdrawalLine, withdrawalArea, retireMark, retirePoint};
    },
};
</script>
