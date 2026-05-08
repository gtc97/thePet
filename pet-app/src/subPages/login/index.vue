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

      <!-- 登录按钮 -->
      <view class="login-btn" @tap="handleLogin">
        <text>登录 / 注册</text>
      </view>

      <!-- 微信登录 -->
      <view class="wechat-login">
        <view class="wechat-btn" @tap="handleWechatLogin">
          <text>微信一键登录</text>
        </view>
      </view>

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
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 500);
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '登录失败', icon: 'none' });
  }
}

function handleWechatLogin() {
  // #ifdef MP-WEIXIN
  uni.login({
    provider: 'weixin',
    success: async (loginRes) => {
      try {
        await userStore.wechatLogin(loginRes.code);
        uni.switchTab({ url: '/pages/index/index' });
      } catch (e) {
        uni.showToast({ title: e.message || '微信登录失败', icon: 'none' });
      }
    },
  });
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({ title: '请在小程序中使用微信登录', icon: 'none' });
  // #endif
}
</script>

<style scoped lang="scss">
.page-login {
  min-height: 100vh;
  background: #fff;
  padding: 120rpx 64rpx;
}
.login-logo { text-align: center; margin-bottom: 80rpx; }
.logo-icon { font-size: 80rpx; display: block; }
.logo-title { font-size: 48rpx; font-weight: bold; color: #303133; display: block; margin: 16rpx 0 8rpx; }
.logo-desc { font-size: 26rpx; color: #909399; }
.form-item { margin-bottom: 32rpx; }
.form-label { font-size: 28rpx; color: #303133; display: block; margin-bottom: 12rpx; }
.form-input { width: 100%; height: 88rpx; border: 2rpx solid #DCDFE6; border-radius: 12rpx; padding: 0 24rpx; font-size: 28rpx; box-sizing: border-box; }
.code-row { display: flex; gap: 16rpx; }
.code-input { flex: 1; }
.code-btn {
  width: 220rpx; height: 88rpx; background: #FFF3E8; border-radius: 12rpx;
  display: flex; align-items: center; justify-content: center;
  font-size: 26rpx; color: #F5895A;
}
.code-btn.disabled { color: #C0C4CC; background: #f5f7fa; }
.login-btn {
  width: 100%; height: 96rpx; background: #F5895A; border-radius: 48rpx;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 32rpx; font-weight: 600; margin-top: 40rpx; margin-bottom: 40rpx;
}
.wechat-login { text-align: center; margin-bottom: 40rpx; }
.wechat-btn { color: #67C23A; font-size: 28rpx; }
.agreement { text-align: center; font-size: 22rpx; color: #909399; }
.agreement .link { color: var(--theme-primary); }
</style>
