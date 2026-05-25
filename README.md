# Chill Retire ☀️

台灣本地化退休計算器。溫暖風視覺、多情境試算（Lean / Coast / Barista / Fat FIRE + 台灣勞保勞退），Monte Carlo 成功機率、What-if 即時滑桿、退休後現金流瀑布圖。純前端、無後端、純靜態部署。

## 技術棧

- Vue 3 + Vue Router 4 + Pinia 3
- Vite 6 + vite-ssg（首頁靜態化）
- Tailwind 3（自訂暖色 design tokens）
- Chart.js + vue-chartjs（曲線/瀑布/堆疊圖）
- Node 22+

## 開發

```bash
npm install
npm run serve         # 本地 dev server，port 8081
npm run development   # 開發版 build（含 sourcemap）
npm run production    # 生產版 build（vite-ssg 預渲染）
npm run lint
```

## 目錄

```
resources/js/
├── components/
│   ├── app/            殼層（AppContainer / Header / Footer）
│   ├── pages/          頁面入口（home / result）
│   ├── inputs/         3-step 輸入表單
│   ├── results/        結果卡片、圖表、情境比較
│   ├── illustrations/  SVG 小插畫
│   └── common/         可重用 UI 元件
├── data/               常數：通膨/報酬率假設、勞保費率、FIRE 類型定義
├── libs/               計算核心：fireCalculator / twPensionCalc
├── stores/             Pinia store + localStorage 持久化
├── router/             路由
└── formatters/         貨幣、百分比、年數
```

## 部署

Vercel 純靜態：connect repo 即可，已配置 `vercel.json`。
