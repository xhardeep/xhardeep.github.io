import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import svelte from '@astrojs/svelte';
import { remarkEmbed } from './src/plugins/remark-embed.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://xhardeep.github.io',
  base: '/',
  output: 'static',
  devToolbar: {
    enabled: false,
  },
  integrations: [mdx(), sitemap(), svelte()],
  markdown: {
    remarkPlugins: [remarkEmbed],
  },
});
