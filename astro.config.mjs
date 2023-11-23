import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import sitemap from '@astrojs/sitemap'
import cesium from 'vite-plugin-cesium'

import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
  site: 'https://humo-tech.github.io/',
  base: '/30DayMapChallenge2023',
  server: {
    host: '0.0.0.0',
  },
  integrations: [vue(), sitemap(), mdx()],
  vite: {
    plugins: [cesium({})],
  },
})
