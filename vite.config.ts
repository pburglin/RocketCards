import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'RocketCards - Browser-Based Card Game Platform',
        short_name: 'RocketCards',
        description: 'Play themed card games against AI or human opponents with dynamic AI-powered gameplay',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webp,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/image\.pollinations\.ai\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pollinations-images-cache',
              expiration: {
                maxEntries: 500, // Increased from 200 to 500
                maxAgeSeconds: 60 * 60 * 24 * 60 // Increased from 30 to 60 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              backgroundSync: {
                name: 'pollinations-image-queue',
                options: {
                  maxRetentionTime: 60 * 24 // Retry for up to 24 hours
                }
              }
            }
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/images/cards/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'local-card-images-cache',
              expiration: {
                maxEntries: 1000, // Increased from 500 to 1000
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              backgroundSync: {
                name: 'local-card-images-queue',
                options: {
                  maxRetentionTime: 60 * 24 // Retry for up to 24 hours
                }
              }
            }
          }
        ]
      }
    })
  ],
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
