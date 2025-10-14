import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/Train-Announcement-Creator/' : '/',
  build: {
    outDir: 'docs'
  },
  server: {
    fs: {
      strict: false
    }
  }
}))
