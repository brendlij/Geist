import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useTheme } from './theme/useTheme'
import './style.css'

const app = createApp(App)

useTheme()

app.use(createPinia())
app.use(router)

app.mount('#app')
