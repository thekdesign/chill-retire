/**
 * Chart.js 全域註冊。
 *
 * Chart.js 4 用 tree-shakeable controllers/scales，要先 register 才能用。
 * 這裡只 register 我們實際用到的元件，bundle size 比 import 全包輕。
 *
 * SSR 注意：Chart.js 本身可在 Node 載入（不會立刻摸 DOM），
 * 實際 canvas 渲染由 vue-chartjs 的 mounted() hook 負責，
 * 所以可在 vite-ssg prerender 環境 import 此檔，client hydration 時 chart 才 init。
 */

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
} from 'chart.js';

let registered = false;

export const setupChartJs = () => {
    if (registered) return;
    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Tooltip,
        Filler,
    );

    // 全站預設樣式
    ChartJS.defaults.font.family = '"Noto Sans TC", system-ui, -apple-system, sans-serif';
    ChartJS.defaults.color = '#6E6452';      // clay-500
    ChartJS.defaults.borderColor = '#EAE4D8'; // cream-200

    registered = true;
};

// 共用色票（跟 design tokens 對齊）
export const CHART_COLORS = Object.freeze({
    sunsetSolid: '#F47C1B',
    sunsetLight: 'rgba(244, 124, 27, 0.18)',
    apricotBand: 'rgba(255, 195, 150, 0.35)',
    apricotBandDeep: 'rgba(255, 154, 61, 0.45)',
    clayDashed: '#928570',
    matchaSolid: '#5E7F3F',
    creamBg: '#FBF6EA',
    clayText: '#42391E',
});
