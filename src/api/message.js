import request from '@/utils/request'

// 群发消息
export function sendGroupMessage(message) {
    return request({
        url: '/api/message/sendMessageToAll',
        method: 'post',
        data: message
    })
}

// 发送单人消息
export function sendPrivateMessage(message) {
    return request({
        url: '/api/message/sendMessage',
        method: 'post',
        data: message
    })
}

// 获取群聊消息
export function getGroupMessage() {
    return request({
        url: '/api/message/getMessageToAll',
        method: 'get'
    })
}

// 获取单人消息
export function getPrivateMessage(sendId, toId) {
    return request({
        url: '/api/message/getMessage',
        method: 'get',
        params: {
            sendId,
            toId
        }
    })
}