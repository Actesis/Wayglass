<script setup lang="ts">
import DefaultTheme from 'vitepress/theme-without-fonts';

import WayglassNotFound from './WayglassNotFound.vue';

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #not-found>
      <WayglassNotFound />
    </template>
  </Layout>
</template>
