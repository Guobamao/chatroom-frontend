import {defineStore} from "pinia";
import { logout } from '@/api/auth';

export const userStore = defineStore('user',{
    state: () => ({
            id: '',
            username: '',
            role: '',
            avatar: '',
            registerTime: '',
        }
    ),
    persist: true,
    actions: {
        logOut() {
            return new Promise((resolve, reject) => {
                logout().then(() => {
                    this.id = ''
                    this.username = ''
                    this.role = ''
                    this.avatar = ''
                    this.registerTime = ''
                    localStorage.removeItem('user')
                    resolve()
                }).catch(() => {
                    reject()
                })
            })
        }
    }
});