import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loginByCode, wechatPhoneLogin } from '@/api/auth';
import { request } from '@/api/request';

export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('access_token') || '');
  const userInfo = ref(null);
  const currentRole = ref('PET_OWNER');

  const isLoggedIn = computed(() => !!token.value);
  const isOwner = computed(() => currentRole.value === 'PET_OWNER');
  const isProvider = computed(() => currentRole.value === 'SERVICE_PROVIDER');
  const isQualified = computed(() =>
    userInfo.value?.qualificationStatus === 'approved'
  );

  async function fetchProfile() {
    if (!token.value) return;
    try {
      const res = await request({ url: '/users/me' });
      userInfo.value = res.data;
      // 验证当前角色是否仍有效
      const roles = userInfo.value.roles || ['PET_OWNER'];
      if (!roles.includes(currentRole.value)) {
        currentRole.value = roles[0];
      }
    } catch {
      // Token可能已过期
      logout();
    }
  }

  async function login(phone, code) {
    const res = await loginByCode(phone, code);
    token.value = res.data.accessToken;
    uni.setStorageSync('access_token', res.data.accessToken);
    uni.setStorageSync('refresh_token', res.data.refreshToken);
    await fetchProfile();
    return res;
  }

  // 微信code登录
  async function loginByWechat(code) {
    const res = await wechatLogin(code);
    token.value = res.data.accessToken;
    uni.setStorageSync('access_token', res.data.accessToken);
    uni.setStorageSync('refresh_token', res.data.refreshToken);
    // 保存session_key用于后续手机号解密
    if (res.data.session_key) {
      uni.setStorageSync('wx_session_key', res.data.session_key);
    }
    await fetchProfile();
    return res;
  }

  // 微信手机号授权登录
  async function loginByWechatPhone(code, encryptedData, iv) {
    const res = await wechatPhoneLogin(code, encryptedData, iv);
    token.value = res.data.accessToken;
    uni.setStorageSync('access_token', res.data.accessToken);
    uni.setStorageSync('refresh_token', res.data.refreshToken);
    await fetchProfile();
    return res;
  }

  async function switchRole(role) {
    const res = await request({ url: '/users/me/roles', method: 'PUT', data: { role } });
    token.value = res.data.token;
    uni.setStorageSync('access_token', res.data.token);
    currentRole.value = role;
    await fetchProfile();
    return res;
  }

  function logout() {
    token.value = '';
    userInfo.value = null;
    currentRole.value = 'PET_OWNER';
    uni.removeStorageSync('access_token');
    uni.removeStorageSync('refresh_token');
    uni.reLaunch({ url: '/pages/index/index' });
  }

  return {
    token, userInfo, currentRole,
    isLoggedIn, isOwner, isProvider, isQualified,
    login, loginByWechat, loginByWechatPhone, fetchProfile, switchRole, logout,
  };
});
