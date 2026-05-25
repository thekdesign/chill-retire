<template>
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- 撲滿身體 -->
        <ellipse cx="40" cy="48" rx="28" ry="20" fill="#FBA163" />
        <!-- 撲滿肚子高光 -->
        <ellipse cx="34" cy="42" rx="14" ry="6" fill="#FFD3A1" opacity="0.7" />
        <!-- 投幣口 -->
        <rect x="35" y="32" width="10" height="3" rx="1.5" fill="#42391E" />
        <!-- 眼睛 -->
        <circle cx="54" cy="44" r="2" fill="#42391E" />
        <!-- 鼻孔 -->
        <ellipse cx="63" cy="48" rx="4" ry="3.5" fill="#F47C1B" />
        <circle cx="62" cy="48" r="0.8" fill="#42391E" />
        <circle cx="64" cy="48" r="0.8" fill="#42391E" />
        <!-- 耳朵 -->
        <path d="M 50 32 L 53 28 L 56 32 Z" fill="#F47C1B" />
        <!-- 腳 -->
        <rect x="22" y="65" width="6" height="6" rx="1.5" fill="#F47C1B" />
        <rect x="52" y="65" width="6" height="6" rx="1.5" fill="#F47C1B" />
        <!-- 尾巴 -->
        <path d="M 12 48 Q 6 46 8 52 Q 10 56 14 53" stroke="#F47C1B" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <!-- 投入的硬幣 -->
        <circle cx="40" cy="20" r="5" fill="#E8B838" stroke="#AB4A08" stroke-width="1.2" />
        <text x="40" y="23.5" text-anchor="middle" font-size="6" font-weight="700" fill="#7A3306">$</text>
    </svg>
</template>

<script>
export default {name: 'PiggyBank'};
</script>
