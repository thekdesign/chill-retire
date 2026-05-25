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
    async ({app}) => {
        const pinia = createPinia();
        app.use(pinia);

        app.runWithContext(() => {
            useHead({htmlAttrs: {lang: 'zh-Hant'}});
        });
    },
);
