<template>
  <div class="container">
    <el-container class="full-height">
      <el-aside class="aside">
        <!-- 添加标题提示：聊天列表 -->
        <h3 class="aside-title">聊天列表</h3>
        <el-menu class="aside-menu">
          <el-menu-item v-for="item in friendsList" :key="item.id" :index="item.id.toString()"
            @click="handleMenuClick(item, null)">
            <template #title>
              <el-avatar :src="item.avatar" />
              <div class="menu-title">
                <span>{{ item.username }}:</span>
                <span class="message-preview">{{ item.message }}</span>
              </div>
            </template>
          </el-menu-item>
        </el-menu>
        <el-button type="primary" @click="handleLogout" size="large">退出</el-button>
      </el-aside>
      <el-main class="main-content">
        <h3 class="chat-title">
          <span>{{ getUserName(null, sendUser.toId) }}</span>
        </h3>
        <div class="messages-container">
          <el-scrollbar ref="scrollbarRef">
            <div v-for="msg in messagesOption" :key="msg.id" :class="msg.sendId === userId ? 'message-item-self' : 'message-item'">
              <div class="message-header" v-if="msg.sendId !== userId">
                <el-avatar :src="msg.sendId === store.id ? store.avatar : findAvatar(msg.sendId)" />
                <span class="message-sender">{{ getUserName(msg.sendId, msg.toId) }}</span>
              </div>
              <div class="message-box" v-if="msg.sendId !== userId">
                <span>{{ msg.message }}</span>
              </div>
              <div class="message-header-self" v-if="msg.sendId === userId">
                <el-avatar :src="msg.sendId === store.id ? store.avatar : findAvatar(msg.sendId)" />
              </div>
              <div class="message-box-self" v-if="msg.sendId === userId">
                <span>{{ msg.message }}</span>
              </div>
            </div>
          </el-scrollbar>
        </div>
        <div class="message-input-container" v-if="sendUser.toId || sendUser.toId === 0">
          <el-input v-model="input" placeholder="按Enter发送，按Ctrl+Enter换行" type="textarea" :rows="5"
            @keyup="handleKeyUp" />
          <el-popover placement="top" :visible="visible" content="不能发送空白消息">
            <template #reference>
              <el-button type="success" class="send-button" @click="messageSender()">发送</el-button>
            </template>
          </el-popover>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { reactive, ref, nextTick } from "vue";
import { logout } from '@/api/auth'
import { listFriends } from '@/api/friends';
import { sendGroupMessage, sendPrivateMessage, getGroupMessage, getPrivateMessage } from '@/api/message';
import { userStore } from "@/store";
import { ElNotification } from "element-plus";
import router from '@/router';

const store = userStore();

// 当前用户ID
const userId = store.id;

// 当前聊天对象
const sendUser = reactive({});

// 输入框内容
const input = ref('');

// 消息
const message = reactive({
  sendId: store.id, // 发送者
  toId: sendUser.toId, // 0为群发消息
  message: ''
});

let socket;



// 打开 WebSocket 连接
function openSocket() {
  // 当前登录用户ID
  const socketUrl = import.meta.env.VITE_APP_WEB_SOCKET_URL + `/${userId}`;

  if (socket) {
    socket.close();
    socket = null;
  }

  // 建立新的 WebSocket 连接
  socket = new WebSocket(socketUrl);

  // 打开 WebSocket 连接
  socket.onopen = () => {
    console.log("websocket已打开");
  };

  // 事件：从服务器接收到消息时
  socket.onmessage = (msg) => {
    // 分割数据，[发送者、接收者、消息内容]
    const [sendId, toId, msgContent] = msg.data.split(',');

    // 转换聊天数据
    const receivedMessage = {
      sendId: parseInt(sendId),
      toId: parseInt(toId),
      message: msgContent,
    };

    // 处理接收到的消息，更新消息列表
    if (sendUser.toId === receivedMessage.sendId || (sendUser.toId === 0 && receivedMessage.toId === 0)) {
      console.log(receivedMessage);
      messagesOption.value.push(receivedMessage);
    }

    friendsList.value.forEach(friend => {
      if (friend.id === receivedMessage.sendId) {
        friend.message = receivedMessage.message
      }
    })

    // 新消息提示
    if (receivedMessage.sendId !== userId) {
      ElNotification.success({
        title: '新消息',
        message: receivedMessage.message
      });
    }
  };

  // 关闭事件
  socket.onclose = () => {
    console.log("websocket已关闭");
  };

  // 发生错误时，会触发 onerror 事件
  socket.onerror = () => {
    console.log("websocket发生了错误");
  };
}

// 加载聊天记录
const messagesOption = ref([]);
function loadMessage(toId) {
  return new Promise((resolve) => {
    if (toId === 0) {
      getGroupMessage().then(data => {
        messagesOption.value = data
        resolve(data)
      })
    } else {
      getPrivateMessage(userId, toId).then(data => {
        messagesOption.value = data
        resolve(data)
      })
    }
  })
}

// 键盘监听
function handleKeyUp(event) {
  if (event.key === 'Enter') {
    if (event.ctrlKey) {
      input.value += '\n';
    } else {
      messageSender();
    }
  }
}

// 发送消息处理函数
const visible = ref(false);
function messageSender() {
  // 判断是否发送空白消息
  if (!input.value.trim()) {
    visible.value = true;
    setTimeout(() => {
      visible.value = false;
    }, 1000)
    return;
  }
  sendMessage(); // 发送消息
  input.value = '';
}

function sendMessage() {
  message.toId = sendUser.toId;
  message.message = input.value;
  if (message.toId === 0) {
    sendGroupMessage(message).then(() => {
      scrollToBottom()
    })
  } else {
    sendPrivateMessage(message).then(() => {
      messagesOption.value.push({ ...message });
      scrollToBottom()
    })
  }
  friendsList.value.forEach(friend => {
    if (friend.id === message.toId) {
      friend.message = message.message
    }
  })
}

const scrollbarRef = ref(null);
function scrollToBottom() {
  nextTick(() => {
    const scrollbar = ref(scrollbarRef.value.wrapRef);
    if (scrollbar) {
      scrollbar.value.scrollTop = scrollbar.value.scrollHeight;
    }
  })
}
// 处理菜单点击事件
function handleMenuClick(item) {
  if (item) {
    sendUser.toId = item.id;
    sendUser.name = item.username;
    sendUser.avatar = item.avatar;
  } else {
    sendUser.toId = 0; // 群聊
  }
  loadMessage(sendUser.toId).then(() => {
    scrollToBottom()
  })
}

// 获取好友列表
const friendsList = ref([]);
function getFriendsList() {
  const userId = store.id
  listFriends(userId).then(data => {
    friendsList.value = data;
  })
}

// 查找好友名字
function getUserName(sendId, toId) {
  if (!friendsList.value) return null;
  if (!sendId && toId === 0) {
    return '群聊'
  } else if (sendId === userId) {
    return store.username
  } else {
    const friend = friendsList.value.find(friend => friend.id === (sendId || toId))
    return friend ? friend.username : ''
  }
}

// 查找好友头像
function findAvatar(id) {
  const friend = friendsList.value.find(friend => friend.id === id);
  return friend ? friend.avatar : null;
}

// 退出登录
function handleLogout() {
  logout();
  store.id = 0;
  store.username = '';
  store.role = '';
  store.avatar = '';
  store.registerTime = '';
  router.push('/');

  if (socket) {
    socket.close();
    socket = null;
  }
}
// 初始化
openSocket();
// 获取好友列表
getFriendsList();
</script>

<style scoped>
.container {
  height: 100vh;
  width: 100vw;
}

.full-height {
  height: 100%;
}

.aside {
  width: 300px;
  text-align: center;
  background-image: linear-gradient(to bottom, #DFFFF2, #ffffff);
}

.aside-title {
  margin: 0;
  height: 50px;
  line-height: 50px;
}

.aside-menu {
  background: none;
  height: 85vh;
}

.menu-title {
  margin-left: 10px;
  display: flex;
  width: 80%;
}

.message-preview {
  margin-left: 5px;
  color: grey;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: block;
}

.main-content {
  background-image: radial-gradient(circle at center bottom, #fff 0%, #fff 20%, #F0FFF9 20%, #E9FFF6 50%, #DFFFF2 50%);
  padding: 0;
}

.chat-title {
  margin: 0;
  height: 50px;
  line-height: 50px;
  margin-left: 20px;
}

.messages-container {
  position: relative;
  height: 70%;
  padding-left: 20px;
}

.message-item {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
}

.message-item-self {
  margin-top: 15px;
  display: flex;
  flex-direction: row-reverse;
}
.message-header {
  display: flex;
}

.message-sender {
  font-size: 15px;
  margin-left: 10px;
}

.message-box {
  border: solid 1px var(--el-border-color);
  border-radius: 5px;
  background-color: var(--el-bg-color);
  box-sizing: border-box;
  min-height: 20px;
  padding: 5px 10px;
  margin-top: -15px;
  margin-left: 45px;
  display: inline-block;
  width: fit-content;
  max-width: 40%;
}

.message-header-self {
  display: flex;
  flex-direction: row-reverse;
  padding-right: 20px;
}

.message-sender-self {
  font-size: 15px;
  margin-right  : 10px;
}

.message-box-self {
  border: solid 1px var(--el-border-color);
  border-radius: 5px;
  background-color: var(--el-color-success-light-3);
  box-sizing: border-box;
  min-height: 20px;
  padding: 5px 10px;
  margin-top: 5px;
  margin-right: 10px;
  display: inline-block;
  width: fit-content;
}

.message-box span {
  white-space: pre-wrap;
}

.message-input-container {
  position: fixed;
  padding-left: 20px;
  bottom: 3px;
  min-width: 200px;
  width: calc(100vw - 340px);
}

.send-button {
  margin-top: 5px;
  float: right;
}
</style>
