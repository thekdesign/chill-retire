export default {
    content: ['./resources/**/*.{vue,html}'],

    theme: {
        extend: {
            colors: {
                // 暖橘陽光：CTA、強調、達標慶祝
                sunset: {
                    50: '#FFF7EE', 100: '#FFEBD2', 200: '#FFD3A1', 300: '#FFB76C',
                    400: '#FF9A3D', 500: '#F47C1B', 600: '#D9620E', 700: '#AB4A08',
                    800: '#7A3306', 900: '#4A1E03',
                },
                // 米白紙：主背景，比純白溫暖
                cream: {
                    50: '#FFFCF6', 100: '#FBF6EA', 200: '#F4ECD5', 300: '#E9DDB8',
                    400: '#D6C492', 500: '#B8A26B', 600: '#8F7D4B', 700: '#665930',
                    800: '#42391E', 900: '#241F11',
                },
                // 抹茶綠：達標、安心、正向（避免股市紅綠的條件反射）
                matcha: {
                    50: '#F2F7EE', 100: '#DDE9D2', 200: '#BAD2A2', 300: '#95B873',
                    400: '#779C53', 500: '#5E7F3F', 600: '#48652F', 700: '#344C22',
                    800: '#223317', 900: '#121C0C',
                },
                // 杏色：副強調、tooltip 提示、半達標
                apricot: {
                    50: '#FFF4EB', 100: '#FFE2C9', 200: '#FFC396', 300: '#FBA163',
                    400: '#F08440', 500: '#D8682B', 600: '#AC4F1F', 700: '#7D3713',
                    800: '#4F2208', 900: '#2B1303',
                },
                // 暖灰：副文字、邊框、未達標（不刺眼）
                clay: {
                    50: '#F7F4EF', 100: '#EAE4D8', 200: '#D4CBB8', 300: '#B7AB92',
                    400: '#928570', 500: '#6E6452', 600: '#544B3C', 700: '#3B3328',
                    800: '#241F18', 900: '#13100C',
                },
            },
            fontFamily: {
                sans: ['"Noto Sans TC"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
                display: ['"Noto Sans TC"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
            },
            boxShadow: {
                soft: '0 4px 24px rgba(122, 51, 6, 0.08)',
                'soft-lg': '0 12px 36px rgba(122, 51, 6, 0.12)',
                ring: '0 0 0 4px rgba(244, 124, 27, 0.18)',
            },
            borderRadius: {
                xl2: '20px',
                blob: '32px',
            },
            keyframes: {
                'gentle-float': {
                    '0%, 100%': {transform: 'translateY(0)'},
                    '50%': {transform: 'translateY(-6px)'},
                },
                'fade-up': {
                    '0%': {opacity: '0', transform: 'translateY(8px)'},
                    '100%': {opacity: '1', transform: 'translateY(0)'},
                },
            },
            animation: {
                'gentle-float': 'gentle-float 6s ease-in-out infinite',
                'fade-up': 'fade-up 400ms ease-out both',
            },
        },
    },

    corePlugins: {
        preflight: false,
    },
};
