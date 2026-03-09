// https://vitepress.dev/guide/custom-theme
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { createPinia } from 'pinia'
import Layout from './Layout.vue'
import ChallengeListView from './views/ChallengeListView.vue'
import ChallengeView from './views/ChallengeView.vue'
import './tailwind.css'

export default {
  extends: DefaultTheme,
  Layout,
  async enhanceApp({ app, router, siteData }) {
    app.use(createPinia())
    app.component('ChallengeListView', ChallengeListView)
    app.component('ChallengeView', ChallengeView)
  }
} satisfies Theme
