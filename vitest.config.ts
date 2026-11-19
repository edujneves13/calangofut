import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Testes de banco rodam à parte: npm run test:integration
    exclude: ['tests/data/**', 'node_modules/**'],
  },
})
