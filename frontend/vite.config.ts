import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // Vendors pesados en su propio chunk
          if (id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'vendor-react'
          }
          if (id.includes('@tanstack/react-query')) {
            return 'vendor-query'
          }
          if (
            id.includes('react-hook-form') ||
            id.includes('zod') ||
            id.includes('@hookform/resolvers')
          ) {
            return 'vendor-form'
          }
          if (id.includes('@react-pdf/renderer')) {
            return 'vendor-pdf'
          }
          if (id.includes('@radix-ui/')) {
            return 'vendor-ui'
          }
          // react core junto con vendor-react
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
            return 'vendor-react'
          }
        },
      },
    },
    // Advertir si algún chunk supera 500KB
    chunkSizeWarningLimit: 500,
  },
})
