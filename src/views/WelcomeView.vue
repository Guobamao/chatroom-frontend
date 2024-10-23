<script setup>

</script>

<template>
    <div style="width: 100vw; height: 100vh; overflow: hidden;">
      <el-image style="width: 100%; height: 100%;" fit="cover"
        src="https://ts1.cn.mm.bing.net/th/id/R-C.76cc493c2b3a9e37d0ee79f001f96faa?rik=KIYLn%2bHRg1kBOw&riu=http%3a%2f%2fimg.netbian.com%2ffile%2f20120517%2f18f6ace5b96c37ba502d89731c72e4b8.jpg&ehk=HpRysXz4UsXGTCB5MH8gEBCgY4XM9QXn1%2bauU95AUjg%3d&risl=&pid=ImgRaw&r=0"/>
      <div class="login-page">
        <router-view v-slot="{ Component }">
          <transition name="el-fade-in-linear" mode="out-in">
            <component :is="Component" style="height: 100%"/>
          </transition>
        </router-view>
      </div>
    </div>
</template>

<style scoped>
.login-page {
  position: absolute;
  left: 50vw;
  top: 50vh;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 450px;
  border-radius: 10px;
  background-color: white;
}
</style>