import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/api';

export const useAdminStore = defineStore('admin', () => {
  const token = ref(localStorage.getItem('admin_token') || '');
  const adminInfo = ref<{ id: number; username: string; nickname: string } | null>(null);

  async function login(username: string, password: string) {
    const res = await api.post('/admin/auth/login', { username, password });
    token.value = res.data.token;
    adminInfo.value = res.data.admin;
    localStorage.setItem('admin_token', res.data.token);
    return res;
  }

  async function fetchProfile() {
    const res = await api.get('/admin/auth/me');
    adminInfo.value = res.data;
    return res;
  }

  function logout() {
    token.value = '';
    adminInfo.value = null;
    localStorage.removeItem('admin_token');
  }

  return { token, adminInfo, login, fetchProfile, logout };
});
