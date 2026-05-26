<template>
    <div v-if="percentiles && percentiles.length > 1" class="relative">
        <div class="h-48 sm:h-56">
            <Line :data="chartData" :options="chartOptions" />
        </div>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-clay-600 mt-3">
            <span class="flex items-center gap-1.5">
                <span class="inline-block w-3 h-2 rounded-sm" :style="{background: COLORS.apricotBandDeep}"></span>
                25–75% 區間
            </span>
            <span class="flex items-center gap-1.5">
                <span class="inline-block w-3 h-2 rounded-sm" :style="{background: COLORS.apricotBand}"></span>
                10–90% 區間
            </span>
            <span class="flex items-center gap-1.5">
                <span class="inline-block w-3 h-0.5" :style="{background: COLORS.sunsetSolid}"></span>
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
import {Line} from 'vue-chartjs';
import {setupChartJs, CHART_COLORS} from 'libs/chartSetup';
import {formatTwdShort} from 'formatters/number/currency';

setupChartJs();

export default {
    name: 'MonteCarloFanChart',
    components: {Line},
    props: {
        percentiles: {type: Array, required: true},
        retireAge: {type: Number, default: null},
    },
    setup(props) {
        const chartData = computed(() => {
            const labels = props.percentiles.map((p) => p.age);
            return {
                labels,
                datasets: [
                    // 順序對「fill: '-1'」很重要：每一條 fill 到「上一個 dataset」
                    {
                        label: 'p10',
                        data: props.percentiles.map((p) => p.p10),
                        borderColor: 'transparent',
                        pointRadius: 0,
                        fill: false,
                    },
                    {
                        label: 'p25',
                        data: props.percentiles.map((p) => p.p25),
                        borderColor: 'transparent',
                        backgroundColor: CHART_COLORS.apricotBand,
                        pointRadius: 0,
                        fill: '-1',     // fill p10 → p25 = 淺色帶
                    },
                    {
                        label: '中位數',
                        data: props.percentiles.map((p) => p.p50),
                        borderColor: CHART_COLORS.sunsetSolid,
                        backgroundColor: CHART_COLORS.apricotBandDeep,
                        borderWidth: 2.5,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        tension: 0.2,
                        fill: '-1',     // fill p25 → p50 = 深色帶
                    },
                    {
                        label: 'p75',
                        data: props.percentiles.map((p) => p.p75),
                        borderColor: 'transparent',
                        backgroundColor: CHART_COLORS.apricotBandDeep,
                        pointRadius: 0,
                        fill: '-1',     // fill p50 → p75 = 深色帶
                    },
                    {
                        label: 'p90',
                        data: props.percentiles.map((p) => p.p90),
                        borderColor: 'transparent',
                        backgroundColor: CHART_COLORS.apricotBand,
                        pointRadius: 0,
                        fill: '-1',     // fill p75 → p90 = 淺色帶
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
                    bodyFont: {size: 12},
                    padding: 10,
                    cornerRadius: 6,
                    filter: (item) => item.dataset.label !== 'p10' && item.dataset.label !== 'p25'
                        && item.dataset.label !== 'p75' && item.dataset.label !== 'p90',
                    callbacks: {
                        title: (items) => `${items[0].label} 歲`,
                        label: (item) => {
                            // 顯示同一年的整組數據
                            const idx = item.dataIndex;
                            const p = props.percentiles[idx];
                            return [
                                `中位數 ${formatTwdShort(p.p50)}`,
                                `好情境（90%）${formatTwdShort(p.p90)}`,
                                `壞情境（10%）${formatTwdShort(p.p10)}`,
                            ];
                        },
                    },
                },
            },
            scales: {
                x: {
                    display: false,
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (v) => formatTwdShort(v),
                        font: {size: 10},
                        maxTicksLimit: 4,
                    },
                    grid: {color: 'rgba(146, 133, 112, 0.1)'},
                },
            },
        }));

        return {chartData, chartOptions, COLORS: CHART_COLORS};
    },
};
</script>
