/**
 * SVG → PNG 圖片產生器
 *
 * 從 resources/template/ 內的 master SVG 渲染出各種尺寸的 PNG：
 *   - favicon.svg → favicon-16.png, favicon-32.png, apple-touch-icon.png (180),
 *                   icon-192.png, icon-512.png
 *   - og-image.svg → og-image.png (1200×630)
 *
 * 用法：npm run images
 * 何時跑：改動 favicon.svg / og-image.svg 後手動執行一次，把產物 commit 進 repo。
 */

import sharp from 'sharp';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.resolve(__dirname, '..', 'resources', 'template');

const TASKS = [
    // favicon 系列
    {source: 'favicon.svg', out: 'favicon-16.png', size: 16},
    {source: 'favicon.svg', out: 'favicon-32.png', size: 32},
    {source: 'favicon.svg', out: 'apple-touch-icon.png', size: 180},
    {source: 'favicon.svg', out: 'icon-192.png', size: 192},
    {source: 'favicon.svg', out: 'icon-512.png', size: 512},
    // OG image
    {source: 'og-image.svg', out: 'og-image.png', width: 1200, height: 630},
];

const log = (...args) => console.log('[images]', ...args);

(async () => {
    log('source dir:', templateDir);

    for (const task of TASKS) {
        const inputPath = path.join(templateDir, task.source);
        const outputPath = path.join(templateDir, task.out);

        try {
            const svgBuffer = await fs.readFile(inputPath);
            const pipeline = sharp(svgBuffer, {
                // 高 DPI 渲染，避免 SVG 元素邊緣鋸齒
                density: 300,
            });

            if (task.size) {
                await pipeline
                    .resize(task.size, task.size, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
                    .png({compressionLevel: 9})
                    .toFile(outputPath);
            } else {
                await pipeline
                    .resize(task.width, task.height, {fit: 'cover'})
                    .png({compressionLevel: 9})
                    .toFile(outputPath);
            }

            const stat = await fs.stat(outputPath);
            log(`✓ ${task.out.padEnd(24)} (${(stat.size / 1024).toFixed(1)} KB)`);
        } catch (e) {
            console.error(`[images] ✗ ${task.out}:`, e.message);
            process.exitCode = 1;
        }
    }

    log('done');
})();
