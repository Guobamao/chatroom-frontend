<template>
  <div style="height: 75vh">
    <el-scrollbar style="height: 100%">
      <div>{{ sid }}</div>
      <div v-for="message in messages" :key="message.id">
        {{ message.message }}
      </div>
    </el-scrollbar>
  </div>
  <div style="position: fixed; bottom: 10px; min-width: 200px; width: calc(100vw - 340px)">
    <el-input v-model="input" placeholder="输入要发送的消息..." type="textarea" :rows="5"/>
    <el-button type="success" style="margin-top: 5px; float: right" @click="sendMessage">发送</el-button>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { get, post } from "@/net";
import { userStore } from "@/store";

const props = defineProps({
  avatar: String,
  name: String,
  sid: Number,
});

const messages = ref([]);
const input = ref('');
const store = userStore();

const message = reactive({
  sendId: store.id,  // 获取用户 ID
  toId: props.sid,        // 设置接收者 ID
  message: ''
});

let socket = null;

function openSocket() {
  const userId = store.id;
  const socketUrl = `ws://localhost:8081/ws/${userId}`;

  console.log(socketUrl);
  if (socket) {
    socket.close();
    socket = null;
  }

  socket = new WebSocket(socketUrl);

  // 打开 WebSocket 连接事件
  socket.onopen = function() {
    console.log("WebSocket 已打开");
  };

  // 接收到消息的事件
  socket.onmessage = function(event) {
    console.log(event.data);
    // 处理接收到的消息，更新消息列表
    const receivedMessage = JSON.parse(event.data);
    messages.value.push(receivedMessage);
  };

  // 关闭事件
  socket.onclose = function() {
    console.log("WebSocket 已关闭");
  };

  // 发生错误的事件
  socket.onerror = function(error) {
    console.log("WebSocket 发生了错误", error);
  };
}

// 发送消息函数
function sendMessage() {
  if (!input.value.trim()) {
    return; // 防止发送空消息
  }

  message.message = input.value;

  post('/api/message/sendMessage', message, () => {
    console.log("消息发送成功！");
    messages.value.push({ ...message }); // 推送新消息到消息列表
    input.value = ''; // 清空输入框
  });
}

// 获取消息记录
get(`/api/message/getMessage?id=${store.id}&sid=${props.sid}`, (data) => {
  messages.value = data;
  console.log("消息记录：", data);
});

// 打开 WebSocket 连接
openSocket();
</script>

<style scoped>
/* 可根据需要调整样式 */
</style>
