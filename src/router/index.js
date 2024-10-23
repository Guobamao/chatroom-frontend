import { createRouter, createWebHistory } from 'vue-router'
import { userStore } from "@/store";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'welcome',
            component: () => import('@/views/WelcomeView.vue'),
            children: [
                {
                    path: '',
                    name: 'welcome-login',
                    component: () => import('@/views/welcome/LoginPage.vue')
                },{
                    path: 'register',
                    name: 'welcome-register',
                    component: () => import('@/views/welcome/RegisterPage.vue')
                },
            ]
        } , {
            path: '/index',
            name: 'index',
            component: () => import('@/views/IndexView.vue')    
        }
    ]
})

router.beforeEach((to,from,next) =>{
    // 获取store中的用户信息
    const store = userStore()

    // 判断是否登录，登录为false，未登录为true
    const isAuthorized = store.id ? true : false
    
    if(to.name.startsWith('welcome-') && isAuthorized){
        next('/index')
    }else if(to.fullPath.startsWith('/index') && !isAuthorized){
        next('/')
    }else {
        next()
    }
})
export default router