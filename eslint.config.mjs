import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vueParser from 'vue-eslint-parser';
import babelParser from '@babel/eslint-parser';
import vuePlugin from 'eslint-plugin-vue';
import importPlugin from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const r = (p) => path.resolve(__dirname, p);

const aliases = {
    components: r('resources/js/components'),
    data: r('resources/js/data'),
    enums: r('resources/js/enums'),
    formatters: r('resources/js/formatters'),
    libs: r('resources/js/libs'),
    maps: r('resources/js/maps'),
    router: r('resources/js/router'),
    stores: r('resources/js/stores'),
};

export default [
    {
        files: ['**/*.{js,mjs,vue}'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: babelParser,
                requireConfigFile: false,
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                console: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
            },
        },
        plugins: {
            vue: vuePlugin,
            import: importPlugin,
        },
        settings: {
            'import/resolver': {
                alias: {
                    map: Object.entries(aliases),
                    extensions: ['.js', '.vue', '.json'],
                },
            },
        },
        rules: {
            indent: ['error', 4, {SwitchCase: 1}],
            quotes: ['error', 'single', {avoidEscape: true}],
            'object-curly-spacing': ['error', 'never'],
            'max-len': ['warn', {code: 150}],
            'comma-dangle': ['error', 'always-multiline'],
            'no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
            'vue/html-indent': ['error', 4],
            'vue/multi-word-component-names': 'off',
            'vue/attribute-hyphenation': ['error', 'always'],
            'vue/v-on-event-hyphenation': ['error', 'always'],
            'vue/max-attributes-per-line': ['error', {singleline: 3, multiline: 1}],
        },
    },
];
