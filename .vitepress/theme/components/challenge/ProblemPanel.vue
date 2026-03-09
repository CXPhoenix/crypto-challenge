<script setup lang="ts">
import { Content } from 'vitepress'
</script>

<template>
  <div class="h-full overflow-auto p-6">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="prose prose-invert prose-sm max-w-none">
      <Content />
    </div>
  </div>
</template>
