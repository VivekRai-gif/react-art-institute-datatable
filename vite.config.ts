import { defineConfig } from 'vite'

// Vite config using dynamic import for ESM-only plugins
export default defineConfig(async () => {
  const react = (await import('@vitejs/plugin-react')).default
  return {
    plugins: [react()],
  }
})
