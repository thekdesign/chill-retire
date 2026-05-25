<template>
    <svg viewBox="0 0 480 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- 背景圓（夕陽暈） -->
        <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#FFD3A1" stop-opacity="0.8" />
                <stop offset="60%" stop-color="#FFEBD2" stop-opacity="0.4" />
                <stop offset="100%" stop-color="#FFEBD2" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#DDE9D2" />
                <stop offset="100%" stop-color="#BAD2A2" />
            </linearGradient>
        </defs>

        <!-- 夕陽光暈 -->
        <circle cx="240" cy="170" r="170" fill="url(#sunGlow)" />

        <!-- 太陽 -->
        <circle cx="370" cy="100" r="34" fill="#F47C1B" opacity="0.95" />
        <circle cx="370" cy="100" r="34" fill="none" stroke="#F47C1B" stroke-width="1.5" stroke-dasharray="3 4" opacity="0.5" />

        <!-- 地面 -->
        <ellipse cx="240" cy="290" rx="220" ry="36" fill="url(#groundGrad)" />

        <!-- 左樹幹 -->
        <path d="M 110 290 Q 105 220 112 150 Q 116 110 124 80" stroke="#7D3713" stroke-width="9" stroke-linecap="round" fill="none" />
        <!-- 左樹葉 -->
        <ellipse cx="115" cy="78" rx="42" ry="14" fill="#779C53" transform="rotate(-15 115 78)" />
        <ellipse cx="138" cy="70" rx="38" ry="12" fill="#5E7F3F" transform="rotate(10 138 70)" />
        <ellipse cx="100" cy="92" rx="38" ry="11" fill="#95B873" transform="rotate(-30 100 92)" />

        <!-- 右樹幹 -->
        <path d="M 370 290 Q 376 220 370 150 Q 366 110 358 80" stroke="#7D3713" stroke-width="9" stroke-linecap="round" fill="none" />
        <!-- 右樹葉 -->
        <ellipse cx="365" cy="78" rx="42" ry="14" fill="#779C53" transform="rotate(15 365 78)" />
        <ellipse cx="342" cy="70" rx="38" ry="12" fill="#5E7F3F" transform="rotate(-10 342 70)" />
        <ellipse cx="380" cy="92" rx="38" ry="11" fill="#95B873" transform="rotate(30 380 92)" />

        <!-- 吊床繩（上吊線） -->
        <path d="M 128 130 Q 145 155 165 175" stroke="#7D3713" stroke-width="2" fill="none" stroke-linecap="round" />
        <path d="M 352 130 Q 335 155 315 175" stroke="#7D3713" stroke-width="2" fill="none" stroke-linecap="round" />

        <!-- 吊床 -->
        <path
            d="M 165 175 Q 240 240 315 175 Q 305 200 285 215 Q 240 235 195 215 Q 175 200 165 175 Z"
            fill="#F47C1B"
        />
        <path
            d="M 165 175 Q 240 240 315 175"
            stroke="#7A3306"
            stroke-width="2"
            fill="none"
        />
        <!-- 吊床條紋 -->
        <path d="M 195 205 Q 240 222 285 205" stroke="#FFD3A1" stroke-width="2" fill="none" />
        <path d="M 205 215 Q 240 230 275 215" stroke="#FFD3A1" stroke-width="2" fill="none" />

        <!-- 人物剪影（在吊床上躺平） -->
        <!-- 頭 -->
        <circle cx="200" cy="195" r="14" fill="#42391E" />
        <!-- 身體（躺臥曲線） -->
        <path d="M 213 195 Q 250 188 290 200" stroke="#42391E" stroke-width="22" stroke-linecap="round" fill="none" />
        <!-- 腳 -->
        <path d="M 290 200 L 305 198" stroke="#42391E" stroke-width="9" stroke-linecap="round" />

        <!-- 飲料杯（手邊） -->
        <rect x="215" y="180" width="10" height="14" rx="2" fill="#FBA163" />
        <path d="M 215 184 L 225 184" stroke="#F47C1B" stroke-width="1.5" />
        <!-- 吸管 -->
        <path d="M 222 180 L 224 172" stroke="#779C53" stroke-width="2" stroke-linecap="round" />

        <!-- 小雲 -->
        <ellipse cx="80" cy="55" rx="22" ry="8" fill="#FBF6EA" opacity="0.95" />
        <ellipse cx="92" cy="50" rx="14" ry="6" fill="#FBF6EA" opacity="0.95" />

        <!-- 小鳥 -->
        <path d="M 280 65 Q 285 60 290 65 M 290 65 Q 295 60 300 65" stroke="#42391E" stroke-width="1.8" fill="none" stroke-linecap="round" />
    </svg>
</template>

<script>
export default {name: 'HeroHammock'};
</script>
