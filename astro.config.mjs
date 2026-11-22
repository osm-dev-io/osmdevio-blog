// @ts-check

import { satteri } from '@astrojs/markdown-satteri';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://osmdev.io',
	integrations: [mdx(), sitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
	markdown: {
		processor: satteri({ features: { smartPunctuation: false } }),
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: false,
		},
	},
});
