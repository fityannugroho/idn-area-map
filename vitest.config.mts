import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
