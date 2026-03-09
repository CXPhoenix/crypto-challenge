<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import ChallengeView from './views/ChallengeView.vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
</script>

<template>
  <ChallengeView v-if="frontmatter.layout === 'challenge'" />
  <Layout v-else />
</template>

<style>
/* Global overrides or utility classes if needed */
</style>
