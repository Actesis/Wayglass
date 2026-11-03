<script setup lang="ts">
import { onMounted, onUpdated } from 'vue';
import DefaultTheme from 'vitepress/theme-without-fonts';

import WayglassNotFound from './WayglassNotFound.vue';

const { Layout } = DefaultTheme;

function normalizeCollapsibleSidebarSemantics(): void {
  if (typeof document === 'undefined') return;

  for (const caret of document.querySelectorAll<HTMLElement>(
    '.VPSidebarItem.collapsible > .item > .caret[role="button"]',
  )) {
    // VitePress 1.6.4 makes both the item and its decorative caret focusable buttons.
    // The item owns the toggle behavior; keeping only it interactive avoids nested controls.
    caret.removeAttribute('role');
    caret.removeAttribute('tabindex');
    caret.removeAttribute('aria-label');
  }
}

onMounted(normalizeCollapsibleSidebarSemantics);
onUpdated(normalizeCollapsibleSidebarSemantics);
</script>

<template>
  <Layout>
    <template #not-found>
      <WayglassNotFound />
    </template>
  </Layout>
</template>
