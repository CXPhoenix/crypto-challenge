import { postcssIsolateStyles } from 'vitepress'

export default {
  plugins: [
    postcssIsolateStyles({ ignoreFiles: [/tailwind\.css/] })
  ]
}