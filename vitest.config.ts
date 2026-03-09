import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './.vitepress/config.mjs'

export default mergeConfig(
  viteConfig.vite || {},
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      server: {
        deps: {
          // CodeMirror 6 uses ESM-only packages; inline them so Vitest can process them
          inline: [/^@codemirror\//, /^codemirror$/],
        },
      },
    },
  }),
)
