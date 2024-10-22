<template>
  <div style="text-align: center">
    <div>
      <el-avatar :size="100" style="margin-top: 30px"
        src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
    </div>
    <div style="margin: 30px 20px 0;">
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item prop="username">
          <el-input v-model="form.username" maxlength="10" type="text" placeholder="用户名/邮箱">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" maxlength="20" style="margin-top: 10px" placeholder="密码">
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-row style="margin-top: 5px">
          <el-col :span="12" style="text-align: left">
            <el-form-item prop="remember">
              <el-checkbox v-model="form.remember" label="记住我" />
            </el-form-item>
          </el-col>
          <el-col :span="12" style="text-align: right">
            <el-link @click="router.push('/forget')">忘记密码？</el-link>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div style="margin-top: 5px">
      <el-button @click="userLogin" style="width: 260px" type="success" plain>立即登录</el-button>
    </div>
    <div style="margin-top: 20px">
      <el-row>
        <el-col :span="11" style="text-align: right">
          <el-link @click="router.push('/forget')">服务条款</el-link>
        </el-col>
        <el-col :span="2">
          <el-divider direction="vertical" />
        </el-col>
        <el-col :span="11" style="text-align: left">
          <el-link @click="router.push('/register')">立即注册</el-link>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { User, Lock } from '@element-plus/icons-vue';
import { ref, reactive } from 'vue';
import router from '@/router';
import { login } from '@/api/auth';
import { userStore } from '@/store';
import { ElMessage } from 'element-plus';

const formRef = ref();
const form = reactive({
  username: '',
  password: '',
  remember: false
});
const store = userStore();

const rules = {
  username: [
    { required: true, message: '请输入用户名' }
  ],
  password: [
    { required: true, message: '请输入密码' }
  ]
};

function userLogin() {
  formRef.value.validate((isValid) => {
    if (isValid) {
      login(form.username, form.password, form.remember).then(data => {
        store.id = data.id;
        store.username = data.username;
        store.role = data.role;
        store.avatar = data.avatar,
        store.registerTime = data.registerTime;

        ElMessage.success(`登录成功, 欢迎${data.username}来到我们的系统`);
        router.push('/index');
      })
    }
  });
}
</script>

<style scoped>
/* 样式可以在此处进行定制，如果不需要，可以保持为空 */
</style>
