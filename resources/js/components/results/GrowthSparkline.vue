<template>
    <div v-if="points.length > 1" class="relative">
        <div class="h-24 sm:h-28">
            <Line :data="chartData" :options="chartOptions" />
        </div>
        <div class="flex justify-between text-[0.65rem] text-clay-500 mt-1 font-tabular">
            <span>{{ points[0].age }} 歲</span>
            <span v-if="retireAge" class="text-sunset-600 font-bold">↑ {{ retireAge }} 歲退休</span>
            <span>{{ points[points.length - 1].age }} 歲</span>
        </div>
    </div>
</template>

<script>
import {computed} from 'vue';
import {Line} from 'vue-chartjs';
import {setupChartJs, CHART_COLORS} from 'libs/chartSetup';
import {formatTwdShort} from 'formatters/number/currency';

setupChartJs();

export default {
    name: 'GrowthSparkline',
    components: {Line},
    props: {
        points: {type: Array, required: true},
        color: {type: String, default: CHART_COLORS.sunsetSolid},
    },
    setup(props) {
        // 找出 accumulation / withdrawal 邊界
        const retireAge = computed(() => {
            const lastAccum = [...props.points].reverse().find((p) => p.phase === 'accumulation');
            return lastAccum?.age || null;
        });

        // 把 hex color 轉成 18% 透明的 rgba 給填色用
        const colorWithAlpha = computed(() => {
            const c = props.color;
            // 簡單 hex → rgba：假設 6-digit hex
            if (c.startsWith('#') && c.length === 7) {
                const r = parseInt(c.slice(1, 3), 16);
                const g = parseInt(c.slice(3, 5), 16);
                const b = parseInt(c.slice(5, 7), 16);
                return `rgba(${r},${g},${b},0.15)`;
            }
            return c;
        });

        const chartData = computed(() => {
            const labels = props.points.map((p) => p.age);
            const accumData = props.points.map((p) => (p.phase !== 'withdrawal' ? p.assets : null));
            const withdrawData = props.points.map((p) => (p.phase === 'withdrawal' ? p.assets : null));

            const accumLastIdx = props.points.findIndex((p) => p.phase === 'withdrawal');
            if (accumLastIdx > 0) {
                withdrawData[accumLastIdx - 1] = props.points[accumLastIdx - 1].assets;
            }

            return {
                labels,
                datasets: [
                    {
                        label: '累積期',
                        data: accumData,
                        borderColor: props.color,
                        backgroundColor: colorWithAlpha.value,
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        tension: 0.25,
                        fill: 'origin',
                        spanGaps: false,
                    },
                    {
                        label: '提領期',
                        data: withdrawData,
                        borderColor: CHART_COLORS.clayDashed,
                        backgroundColor: 'rgba(146, 133, 112, 0.12)',
                        borderWidth: 2,
                        borderDash: [4, 4],
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        tension: 0.25,
                        fill: 'origin',
                        spanGaps: false,
                    },
                ],
            };
        });

        const chartOptions = computed(() => ({
            responsive: true,
            maintainAspectRatio: false,
            interaction: {mode: 'index', intersect: false},
            plugins: {
                legend: {display: false},
                tooltip: {
                    backgroundColor: CHART_COLORS.clayText,
                    titleFont: {size: 11, weight: 'normal'},
                    bodyFont: {size: 12, weight: 'bold'},
                    padding: 8,
                    cornerRadius: 6,
                    displayColors: false,
                    callbacks: {
                        title: (items) => `${items[0].label} 歲`,
                        label: (item) => formatTwdShort(item.parsed.y),
                    },
                },
            },
            scales: {
                x: {display: false},
                y: {display: false, beginAtZero: true},
            },
        }));

        return {chartData, chartOptions, retireAge};
    },
};
</script>
