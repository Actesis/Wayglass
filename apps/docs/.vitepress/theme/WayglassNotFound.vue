<template>
  <main class="wg-not-found" aria-labelledby="wg-not-found-title">
    <p class="wg-not-found__code" aria-hidden="true">404</p>
    <h1 id="wg-not-found-title">Page not found</h1>
    <p class="wg-not-found__message">
      Wayglass could not find that documentation or component-inspection route.
    </p>
    <nav class="wg-not-found__destinations" aria-label="Not found destinations">
      <a class="wg-not-found__link" href="/">Documentation home</a>
      <a class="wg-not-found__link" href="/storybook/" target="_self">Storybook</a>
    </nav>
  </main>
</template>

<style scoped>
.wg-not-found {
  max-inline-size: 40rem;
  margin-inline: auto;
  padding-block: 5rem 8rem;
  padding-inline: 1.5rem;
  text-align: center;
}

.wg-not-found__code {
  margin: 0;
  color: var(--vp-c-brand-1);
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
}

.wg-not-found h1 {
  margin-block: 1rem 0;
  font-size: 1.5rem;
  line-height: 1.3;
}

.wg-not-found__message {
  max-inline-size: 32rem;
  margin-block: 1rem 0;
  margin-inline: auto;
  color: var(--vp-c-text-2);
}

.wg-not-found__destinations {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-block-start: 1.5rem;
}

.wg-not-found__link {
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 999px;
  padding-block: 0.4rem;
  padding-inline: 1rem;
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.wg-not-found__link:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-2);
}

.wg-not-found__link:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

@media (forced-colors: active) {
  .wg-not-found__link {
    border-color: ButtonText;
    color: LinkText;
  }
}
</style>
