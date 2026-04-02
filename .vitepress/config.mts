import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitepress'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { stripGenerator } from './plugins/strip-generator'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: 'docs',

  title: 'Crypto Challenge',
  description: '關於密碼學的程式設計挑戰',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    [
      'meta',
      {
        'http-equiv': 'Content-Security-Policy',
        content:
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; connect-src 'self'; img-src 'self' data:; font-src 'self';",
      },
    ],
  ],
  themeConfig: {
    logo: '/favicon.svg',
    nav: [],
    sidebar: [],
    socialLinks: [{ icon: 'github', link: 'https://github.com/CXPhoenix/crypto-challenge' }],
  },
  vite: {
    plugins: [vueJsx(), vueDevTools(), tailwindcss(), wasm(), topLevelAwait(), stripGenerator()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./.vitepress/theme', import.meta.url)),
      },
    },
    server: {
      headers: {
        // Required for SharedArrayBuffer used by Pyodide
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
  },
})
