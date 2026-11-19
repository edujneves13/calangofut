import { defineConfig } from 'vitest/config'

// Testes que falam com o Supabase local (precisa de `npm run db:start`).
export default defineConfig({
  test: {
    include: ['tests/data/**/*.test.ts'],
    fileParallelism: false,
  },
})
