import {ViteSSG} from 'vite-ssg';
import {createPinia} from 'pinia';
import {useHead} from '@unhead/vue';
import App from 'components/App.vue';
import {routes} from 'router/routes';
import 'sass/base/_bootstrap.scss';

export const createApp = ViteSSG(
    App,
    {
        routes,
        scrollBehavior(to, _from, savedPosition) {
            if (savedPosition) return savedPosition;
            if (to.hash) return {el: to.hash, behavior: 'smooth', top: 80};
            return {top: 0};
        },
    },
    async ({app, isClient}) => {
        const pinia = createPinia();
        app.use(pinia);

        app.runWithContext(() => {
            useHead({htmlAttrs: {lang: 'zh-Hant'}});
        });

        // Vercel Analytics + Speed Insights — 只在瀏覽器 client 跑，
        // dynamic import 避免 SSR prerender 階段拉不必要的程式碼
        if (isClient) {
            const [analytics, speed] = await Promise.all([
                import('@vercel/analytics'),
                import('@vercel/speed-insights'),
            ]);
            analytics.inject();
            speed.injectSpeedInsights();
        }
    },
);
