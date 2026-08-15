import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['measurement/**/*.test.ts'],
    passWithNoTests: false,
  },
});
