import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 导入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(ElementPlus)  // 使用 Element Plus
app.mount('#app')
