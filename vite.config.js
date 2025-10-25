import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // If deploying to a subdirectory, set base to match your deployment path
  // For example: base: '/opd-claims/' or base: '/app/'
  // For root deployment, use: base: '/'
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure proper module output
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
