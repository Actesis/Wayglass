import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['validation/**/*.test.ts'],
    passWithNoTests: false,
  },
});
