import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Category from '../components/goods/Category.vue'
import Params from '../components/goods/Params.vue'
import GoodsList from '../components/goods/GoodsList.vue'
import AddGoods from '../components/goods/AddGoods.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'

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
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Category },
        { path: '/params', component: Params },
        { path: '/goods', component: GoodsList },
        { path: "/goods/add", component: AddGoods },
        { path: "/orders", component: Order },
        { path: "/reports", component: Report }
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
        if (to.path == "/welcome") {
            window.sessionStorage.removeItem("activePath");
        }
        next();
    }

});

export default router