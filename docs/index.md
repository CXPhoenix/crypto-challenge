---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Crypto Challenge"
  text: "關於密碼學的程式設計挑戰"
  tagline: My great project tagline

---

<script setup lang="ts">
    import { data as challenges } from './shared/challenge.data.ts';
</script>

<ChallengeListView :challenges="challenges" />