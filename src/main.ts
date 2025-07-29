import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 样式
import './assets/style.css'
import 'vant/lib/index.css'
import 'vant/es/toast/style'

// Vant组件
import { NavBar, Tabs, Tab, Tag, Empty, Lazyload } from 'vant'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Vant内置Lazyload
app.use(Lazyload, {
  lazyComponent: true,
  loading: '/assets/lanjiazai1.webp',
  error: '/assets/lanjiazai1.webp'
})

// 注册Vant组件
app.use(NavBar)
app.use(Tabs)
app.use(Tab)
app.use(Tag)
app.use(Empty)

app.mount('#app')
