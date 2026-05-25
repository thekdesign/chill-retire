import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const r = (p) => path.resolve(__dirname, p);

export default defineConfig({
    root: 'resources/js',
    plugins: [vue()],
    resolve: {
        extensions: ['.js', '.json', '.css', '.scss', '.vue'],
        alias: {
            components: r('resources/js/components'),
            data: r('resources/js/data'),
            enums: r('resources/js/enums'),
            formatters: r('resources/js/formatters'),
            libs: r('resources/js/libs'),
            maps: r('resources/js/maps'),
            router: r('resources/js/router'),
            sass: r('resources/sass'),
            stores: r('resources/js/stores'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
                silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import'],
            },
        },
    },
});
