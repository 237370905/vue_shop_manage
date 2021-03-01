import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 静态全局资源导入
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

// Element 配置
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 配置网络请求
import axios from 'axios'
// 配置服务器基准根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios



Vue.config.productionTip = false

Vue.use(ElementUI)

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')