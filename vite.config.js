import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/Transit-Designer/' : '/',
  build: {
    outDir: 'docs'
  },
  server: {
    fs: {
      strict: false
    }
  }
}))
