import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

// Naive UI 官方推荐默认英文字体与代码字体
import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
