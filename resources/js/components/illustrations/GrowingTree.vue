<template>
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- 土壤 -->
        <ellipse cx="40" cy="70" rx="26" ry="5" fill="#8F7D4B" opacity="0.5" />
        <!-- 樹幹 -->
        <path d="M 40 70 Q 38 50 40 30" stroke="#7D3713" stroke-width="5" stroke-linecap="round" fill="none" />
        <!-- 樹冠 -->
        <circle cx="40" cy="25" r="18" fill="#779C53" />
        <circle cx="30" cy="30" r="11" fill="#95B873" />
        <circle cx="50" cy="32" r="11" fill="#5E7F3F" />
        <circle cx="40" cy="18" r="10" fill="#BAD2A2" />
        <!-- 果實 -->
        <circle cx="32" cy="28" r="2.2" fill="#D8682B" />
        <circle cx="48" cy="22" r="2.2" fill="#D8682B" />
        <circle cx="40" cy="35" r="2.2" fill="#D8682B" />
    </svg>
</template>

<script>
export default {name: 'GrowingTree'};
</script>
