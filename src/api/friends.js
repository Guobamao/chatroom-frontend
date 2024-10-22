import request from '@/utils/request'

// 获取好友列表
export function listFriends(id) {
    return request({
        url: '/api/user/friends',
        method: 'get',
        params: {
            id
        }
    })
}