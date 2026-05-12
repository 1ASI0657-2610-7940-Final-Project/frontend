import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './app/router'
import { useAuthStore } from './app/stores/authStore'
import './shared/styles/tokens.css'
import './shared/styles/base.css'
import './shared/styles/utilities.css'

const bootstrap = async () => {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  const auth = useAuthStore(pinia)
  auth.hydrateSession()
  if (auth.token) {
    try {
      await auth.loadMe()
    } catch {
      auth.clearSession()
    }
  }

  app.use(router)
  app.mount('#app')
}

void bootstrap()
