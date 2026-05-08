<template>
  <view class="page-login">
    <view class="login-logo">
      <text class="logo-icon">🐾</text>
      <text class="logo-title">thePet</text>
      <text class="logo-desc">宠物档案记录与上门喂养</text>
    </view>

    <view class="login-form">
      <!-- 手机号输入 -->
      <view class="form-item">
        <text class="form-label">手机号</text>
        <input
          class="form-input"
          v-model="phone"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
          placeholder-style="color:#C0C4CC"
        />
      </view>

      <!-- 验证码输入 -->
      <view class="form-item">
        <text class="form-label">验证码</text>
        <view class="code-row">
          <input
            class="form-input code-input"
            v-model="code"
            type="number"
            maxlength="6"
            placeholder="请输入验证码"
            placeholder-style="color:#C0C4CC"
          />
          <view class="code-btn" :class="{ disabled: countdown > 0 }" @tap="handleSendCode">
            <text>{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}</text>
          </view>
        </view>
      </view>

      <!-- 手机验证码登录 -->
      <view class="login-btn" @tap="handleLogin">
        <text>登录</text>
      </view>

      <!-- 分隔线 -->
      <view class="divider">
        <view class="divider-line" />
        <text class="divider-text">其他登录方式</text>
        <view class="divider-line" />
      </view>

      <!-- 微信手机号授权登录 -->
      <button
        class="wechat-btn"
        open-type="getPhoneNumber"
        @getphonenumber="handleGetPhoneNumber"
      >
        <text class="wechat-icon">💬</text>
        <text>微信手机号快捷登录</text>
      </button>

      <!-- 协议 -->
      <view class="agreement">
        <text>登录即表示同意</text>
        <text class="link">《用户协议》</text>
        <text>和</text>
        <text class="link">《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/store/user';
import { sendSmsCode } from '@/api/auth';

const userStore = useUserStore();
const phone = ref('');
const code = ref('');
const countdown = ref(0);

async function handleSendCode() {
  if (countdown.value > 0) return;
  if (!/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }
  try {
    await sendSmsCode(phone.value, 'login');
    uni.showToast({ title: '验证码已发送', icon: 'success' });
    countdown.value = 60;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) clearInterval(timer);
    }, 1000);
  } catch (e) {
    uni.showToast({ title: e.message || '发送失败', icon: 'none' });
  }
}

async function handleLogin() {
  if (!phone.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return;
  }
  if (!code.value) {
    uni.showToast({ title: '请输入验证码', icon: 'none' });
    return;
  }
  try {
    uni.showLoading({ title: '登录中...' });
    await userStore.login(phone.value, code.value);
    uni.hideLoading();
    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 500);
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '登录失败', icon: 'none' });
  }
}

// 微信手机号授权登录
function handleGetPhoneNumber(e) {
  // #ifdef MP-WEIXIN
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    return;
  }
  uni.showLoading({ title: '登录中...' });
  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
      try {
        await userStore.loginByWechatPhone(
          loginRes.code,
          e.detail.encryptedData,
          e.detail.iv
        );
        uni.hideLoading();
        uni.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 500);
      } catch (err) {
        uni.hideLoading();
        uni.showToast({ title: err.message || '登录失败', icon: 'none' });
      }
    },
    fail: () => {
      uni.hideLoading();
      uni.showToast({ title: '微信登录失败', icon: 'none' });
    },
  });
  // #endif
}
</script>

<style scoped lang="scss">
.page-login {
  min-height: 100vh;
  background: #FBF8F4;
  padding: 80rpx 48rpx;
}
.login-logo { text-align: center; margin-bottom: 60rpx; }
.logo-icon { font-size: 80rpx; display: block; }
.logo-title { font-size: 48rpx; font-weight: bold; color: #2D2016; display: block; margin: 12rpx 0 8rpx; }
.logo-desc { font-size: 26rpx; color: #9E8E7E; }
.form-item { margin-bottom: 28rpx; }
.form-label { font-size: 28rpx; color: #2D2016; display: block; margin-bottom: 10rpx; font-weight: 500; }
.form-input { width: 100%; height: 88rpx; border: 2rpx solid #F5F0EA; border-radius: 16rpx; padding: 0 24rpx; font-size: 28rpx; background: #fff; box-sizing: border-box; }
.code-row { display: flex; gap: 16rpx; }
.code-input { flex: 1; }
.code-btn {
  width: 220rpx; height: 88rpx; background: #FFF3E8; border-radius: 16rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 26rpx; color: #F5895A; font-weight: 500;
}
.code-btn.disabled { color: #C4B8AD; background: #F5F0EA; }
.login-btn {
  width: 100%; height: 96rpx; background: #F5895A; border-radius: 48rpx;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 32rpx; font-weight: 600; margin-top: 32rpx; margin-bottom: 32rpx;
}
.divider { display: flex; align-items: center; gap: 20rpx; margin-bottom: 32rpx; }
.divider-line { flex: 1; height: 1rpx; background: #F5F0EA; }
.divider-text { font-size: 24rpx; color: #C4B8AD; }
.wechat-btn {
  width: 100%; height: 96rpx; background: #fff; border: 2rpx solid #67C23A; border-radius: 48rpx;
  display: flex; align-items: center; justify-content: center; gap: 8rpx;
  color: #67C23A; font-size: 30rpx; font-weight: 600;
}
.wechat-btn::after { border: none; }
.wechat-icon { font-size: 36rpx; }
.agreement { text-align: center; font-size: 22rpx; color: #9E8E7E; margin-top: 40rpx; }
.agreement .link { color: #F5895A; }
</style>
