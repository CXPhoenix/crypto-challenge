<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed } from 'vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()

</script>

<template>
  <Layout>
  </Layout>
</template>

<style>
/* Global overrides or utility classes if needed */
</style>