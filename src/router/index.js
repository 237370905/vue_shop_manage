import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/User/Users.vue'

Vue.use(VueRouter)

const routes = [{
    path: '/',
    redirect: '/login'
}, {
    path: '/login',
    name: 'login',
    component: Login
}, {
    path: '/home',
    name: 'home',
    component: Home,
    redirect: '/welcome',
    children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users }
    ]
}]

const router = new VueRouter({
    routes
})

// 全局导航守卫
// 控制需要特殊权限才能访问的路由
router.beforeEach((to, from, next) => {
    let token = window.sessionStorage.getItem("token");
    if (to.path !== "/login" && !token) {
        next("/login")
    } else {
        next();
    }

});

export default router