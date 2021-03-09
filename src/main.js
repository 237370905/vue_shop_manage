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
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})
Vue.prototype.$http = axios

// 定义全局过滤器
Vue.filter("dateFormater", function(originVal) {
    let date = new Date(originVal);
    let y = date.getFullYear();
    let m = (date.getMonth() + 1 + "").padStart(2, '0');
    let d = (date.getDate() + "").padStart(2, '0');
    let hh = (date.getHours() + "").padStart(2, '0');
    let mm = (date.getMinutes() + "").padStart(2, '0');
    let ss = (date.getSeconds() + "").padStart(2, '0');

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
})


Vue.config.productionTip = false

Vue.use(ElementUI)

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')