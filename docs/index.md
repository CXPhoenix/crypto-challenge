---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Crypto Challenge"
  text: "關於密碼學的程式設計挑戰"
  tagline: My great project tagline

features:
  - title: Feature A
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - title: Feature B
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - title: Feature C
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
---

<script setup lang="ts">
    import { data as challenges } from './shared/challenge.data.ts';
</script>

<ChallengeListView :challenges="challenges" />