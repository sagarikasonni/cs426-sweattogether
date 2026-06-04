import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // ProfileUtils tests don't need a DOM; node is faster and dependency-free.
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      // Report coverage for the source we actually unit-test.
      include: ['src/utils/**/*.ts'],
    },
  },
});
