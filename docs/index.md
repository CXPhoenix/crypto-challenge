---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Crypto Challenge"
  text: "密碼學的挑戰"
  tagline: 用程式碼征服密碼學的世界
  image: 
    light: /assets/LOGO-light.svg
    dark: /assets/LOGO-dark.svg
    alt: LOGO

---

<script setup lang="ts">
    import { data as challenges } from './shared/challenge.data.ts';
</script>

<ChallengeListView :challenges="challenges" />