import { postcssIsolateStyles } from 'vitepress'
import type { Plugin } from 'postcss'

export default {
  plugins: [
    postcssIsolateStyles({ ignoreFiles: [/tailwind\.css/] }) as Plugin
  ]
}