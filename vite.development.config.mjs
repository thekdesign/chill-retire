import {mergeConfig} from 'vite';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import common from './vite.common.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const r = (p) => path.resolve(__dirname, p);

export default mergeConfig(common, {
    mode: 'development',
    base: '/',
    publicDir: r('resources/template'),
    build: {
        outDir: r('public'),
        emptyOutDir: false,
        manifest: true,
        sourcemap: true,
        rollupOptions: {
            output: {
                chunkFileNames: 'assets/js/[name].[hash]-chunk.js',
                entryFileNames: 'assets/js/[name].[hash].js',
                assetFileNames: 'assets/[ext]/[name].[hash][extname]',
            },
        },
    },
});
