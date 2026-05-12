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
        target: 'https://gigu-access-profile-service-oawg43e6ea-uc.a.run.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/access/, '/api/v1/access')
      },
      '/api/profile': {
        target: 'https://gigu-access-profile-service-oawg43e6ea-uc.a.run.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/profile/, '/api/v1/profile')
      },
      '/api/marketplace': {
        target: 'https://gigu-gig-marketplace-service-oawg43e6ea-uc.a.run.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/marketplace/, '/api/v1/marketplace')
      },
      '/api/engagement': {
        target: 'https://gigu-pulls-service-149855215912.us-central1.run.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/engagement/, '/api/v1/engagement')
      },
      '/api/chat': {
        target: 'https://gigu-chat-notification-service-oawg43e6ea-uc.a.run.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/api/v1/chat')
      },
      '/api/notifications': {
        target: 'https://gigu-chat-notification-service-oawg43e6ea-uc.a.run.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/notifications/, '/api/v1/notifications')
      }
    }
  }
})
