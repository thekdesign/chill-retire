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
    },
    setup(props) {
        // 找出 accumulation / withdrawal 邊界
        const retireAge = computed(() => {
            const lastAccum = [...props.points].reverse().find((p) => p.phase === 'accumulation');
            return lastAccum?.age || null;
        });

        const chartData = computed(() => {
            const labels = props.points.map((p) => p.age);
            // 累積期 dataset：有值；提領期 dataset：null（讓 Chart.js 自然斷開）
            const accumData = props.points.map((p) => (p.phase !== 'withdrawal' ? p.assets : null));
            const withdrawData = props.points.map((p) => (p.phase === 'withdrawal' ? p.assets : null));

            // 為了讓 withdraw 段接續 accum 的最後一點，補一筆連接
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
                        borderColor: CHART_COLORS.sunsetSolid,
                        backgroundColor: CHART_COLORS.sunsetLight,
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
