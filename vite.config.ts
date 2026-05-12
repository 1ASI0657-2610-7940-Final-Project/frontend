import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@app': path.resolve(__dirname, 'src/app'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@access': path.resolve(__dirname, 'src/bounded-contexts/access-profile'),
      '@marketplace': path.resolve(__dirname, 'src/bounded-contexts/gig-marketplace'),
      '@pulls': path.resolve(__dirname, 'src/bounded-contexts/pulls'),
      '@chat': path.resolve(__dirname, 'src/bounded-contexts/chat-notification')
    }
  },
  server: {
    proxy: {
      '/api/access': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/access/, '/api/v1/access')
      },
      '/api/profile': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/profile/, '/api/v1/profile')
      },
      '/api/marketplace': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/marketplace/, '/api/v1/marketplace')
      },
      '/api/engagement': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/engagement/, '/api/v1/engagement')
      },
      '/api/chat': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/api/v1/chat')
      },
      '/api/notifications': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/notifications/, '/api/v1/notifications')
      }
    }
  }
})
