import request from '@/utils/request'

// 登录接口
export function login(username, password, remember) {
    return request({
        url: '/api/auth/login',
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
            username,
            password
        }
    })
}

// 退出登录借口
export function logout() {
    return request({
        url: '/api/auth/logout',
        method: 'get',
    })
}

// 注册接口
export function register(data) {
    return request({
        url: '/api/auth/register',
        method: 'post',
        data: data
    })
}