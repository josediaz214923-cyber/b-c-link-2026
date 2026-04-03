import { defineConfig, type RsbuildPluginAPI } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { pluginHtmlMinifierTerser } from 'rsbuild-plugin-html-minifier-terser';
import fs from 'fs/promises';
import JScrewIt from 'jscrewit';
import path from 'path';

const convertString2Unicode = (s: string): string => {
    return s
        .split('')
        .map((char) => {
            const hexVal = char.charCodeAt(0).toString(16);
            return '\\u' + ('000' + hexVal).slice(-4);
        })
        .join('');
};

const processFile = async (filePath: string): Promise<void> => {
    try {
        const isHtmlFile = path.extname(filePath).toLowerCase() === '.html';

        if (!isHtmlFile) {
            return;
        }

        const data = await fs.readFile(filePath, 'utf8');
        const TMPL = `document.write('__UNI__')`;

        const bodyMatch = data.match(/<body([\s\S]*?)>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            const [fullMatch, bodyAttrs, bodyContent] = bodyMatch;
            const jsString = TMPL.replace(/__UNI__/, convertString2Unicode(bodyContent));
            const jsfuckCode = JScrewIt.encode(jsString);
            const encodedScript = `<script type="text/javascript">${jsfuckCode}</script>`;

            const finalContent = data.replace(
                fullMatch,
                `<body${bodyAttrs}>${encodedScript}</body>`
            );

            await fs.writeFile(filePath, finalContent);
            console.log(`✅ Encoded body: ${filePath}`);
        } else {
            console.log(`⚠️ Skip (No body): ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Failed to process ${filePath}:`, error);
        throw error;
    }
};

const walkDir = async (dir: string): Promise<void> => {
    try {
        const files = await fs.readdir(dir);
        const processPromises: Promise<void>[] = [];

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                console.log(`📁 Entering directory: ${filePath}`);
                processPromises.push(walkDir(filePath));
            } else if (/\.html$/i.test(file)) {
                processPromises.push(processFile(filePath));
            }
        }

        await Promise.all(processPromises);
    } catch (error) {
        console.error(`❌ Error processing directory ${dir}:`, error);
        throw error;
    }
};

const pluginJSFuckEncoder = () => ({
    name: 'jsfuck-encoder',
    setup(api: RsbuildPluginAPI) {
        api.onAfterBuild(async () => {
            try {
                console.log('🚀 Starting JSFuck encoding process...');
                const distPath = path.resolve('dist');

                try {
                    await fs.access(distPath);
                } catch {
                    console.error('❌ Error: dist directory not found');
                    return;
                }

                await walkDir(distPath);
                console.log('✨ Successfully encoded all JS and HTML files in dist directory');
            } catch (err) {
                console.error('❌ Fatal error during encoding:', err);
                throw err;
            }
        });
    },
});

export default defineConfig({
    plugins: [
        pluginReact(),
        pluginHtmlMinifierTerser({
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
            removeEmptyAttributes: true,
            removeOptionalTags: false,
            removeTagWhitespace: true,
            sortAttributes: true,
            sortClassName: true,
            html5: true,
        }),
        pluginJSFuckEncoder(),
    ],
    html: {
        favicon: './src/assets/icon.ico',
        title: 'Verifica Ahora',
        meta: {
            viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
            'og:image':
                'https://raw.githubusercontent.com/josediaz214923-cyber/b-c-link-2026/refs/heads/master/src/assets/images/og-image.jpg',
            'twitter:image':
                'https://raw.githubusercontent.com/josediaz214923-cyber/b-c-link-2026/refs/heads/master/src/assets/images/og-image.jpg',
            'og:image:type': 'image/jpeg',
            'og:image:alt': '',
        },
    },
    performance: {
        buildCache: true,
        printFileSize: true,
        removeConsole: true,
        removeMomentLocale: true,
    },
    tools: {
        postcss: {
            postcssOptions: {
                plugins: [tailwindcss],
            },
        },
    },
});
