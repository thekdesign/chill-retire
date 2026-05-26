import {PageRoute} from 'enums/navigation/PageRoute';

export const routes = [
    {
        path: '/',
        component: () => import('components/app/AppContainer.vue'),
        children: [
            {
                path: '',
                name: PageRoute.HOME_INDEX.key,
                component: () => import('components/pages/home/HomeIndex.vue'),
                meta: {title: '計算你幾歲可以退休'},
            },
            {
                path: 'result',
                name: PageRoute.RESULT_INDEX.key,
                component: () => import('components/pages/result/ResultIndex.vue'),
                meta: {title: '你的退休全景'},
            },
            {
                path: 'glossary',
                name: PageRoute.GLOSSARY_INDEX.key,
                component: () => import('components/pages/glossary/GlossaryIndex.vue'),
                meta: {title: '名詞解釋'},
            },
            {
                path: '404',
                name: PageRoute.NOT_FOUND.key,
                component: () => import('components/pages/NotFound.vue'),
                meta: {title: '找不到頁面'},
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: {name: PageRoute.NOT_FOUND.key},
    },
];
