import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        // Aggressive caching for static assets
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name].[hash:8].css'
          }
          if (assetInfo.name?.endsWith('.js')) {
            return 'assets/[name].[hash:8].js'
          }
          return 'assets/[name].[hash:8][extname]'
        },
      },
    },
  },
  server: {
    // Enable aggressive caching in development
    headers: {
      'Cache-Control': 'max-age=31536000, immutable',
    },
  },
})
