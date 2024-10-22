import { createApp } from 'vue'
import App from './App.vue'
import router from "@/router";
import axios from "axios";
import {createPinia} from "pinia";
import 'element-plus/theme-chalk/dark/css-vars.css'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')