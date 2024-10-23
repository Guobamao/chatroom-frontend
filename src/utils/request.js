import axios from 'axios'
import { ElMessage } from 'element-plus'
import { userStore } from '@/store';
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

// 创建axios实例，并设置基本配置
const service = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API,
    withCredentials: true,
    timeout: 10000
});

// 请求拦截器
service.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        console.log(error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    response => {
        const { code, message, data } = response.data;
        if (code === 200) {
            return data;
        } else if (code === 401) {
            ElMessage.warning("登录过期，请重新登录");
            userStore().logOut().then(() => {
                setTimeout(() => {
                    location.href = '/'
                }, 1000)
            })
            return Promise.reject('登录过期，请重新登录');
        } else {
            ElMessage.warning(message || '请求失败');
            return Promise.reject(new Error(message || 'Error'));
        }
    },
    error => {
        console.log('响应失败', error);
        ElMessage.error("发生了一些错误，请联系管理员");
        return Promise.reject(error);
    }
);

export default service