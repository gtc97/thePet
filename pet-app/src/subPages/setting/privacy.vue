<template>
  <view class="page-privacy">
    <view class="section">
      <text class="section-title">个人信息可见范围</text>
      <view class="item">
        <view class="item-info">
          <text class="item-title">手机号</text>
          <text class="item-desc">控制谁可以看到你的手机号</text>
        </view>
        <picker :range="visibilityOptions" :value="phoneVisibility" @change="(e) => { phoneVisibility = e.detail.value; saveSettings(); }">
          <text class="picker-value">{{ visibilityOptions[phoneVisibility] }}</text>
        </picker>
      </view>
      <view class="item">
        <view class="item-info">
          <text class="item-title">地址</text>
          <text class="item-desc">控制谁可以看到你的地址</text>
        </view>
        <picker :range="visibilityOptions" :value="addrVisibility" @change="(e) => { addrVisibility = e.detail.value; saveSettings(); }">
          <text class="picker-value">{{ visibilityOptions[addrVisibility] }}</text>
        </picker>
      </view>
    </view>
    <view class="section">
      <text class="section-title">沟通设置</text>
      <view class="item">
        <view class="item-info">
          <text class="item-title">关闭私信</text>
          <text class="item-desc">开启后其他人无法给你发私信</text>
        </view>
        <switch :checked="chatDisabled" @change="(e) => handleToggle(e.detail.value)" color="var(--theme-primary)" />
      </view>
    </view>
    <view class="section">
      <text class="section-title">账户安全</text>
      <view class="item" @tap="handleLogout">
        <text class="item-title">退出登录</text>
        <text class="arrow">→</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { request } from '@/api/request';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const visibilityOptions = ['仅自己可见', '订单关联用户可见'];
const settings = userStore.userInfo?.settings || {};
const phoneVisibility = ref(settings.phoneVisibility ?? 1);
const addrVisibility = ref(settings.addrVisibility ?? 1);
const chatDisabled = ref(userStore.userInfo?.chatDisabled || false);

// 保存隐私设置
async function saveSettings() {
  try {
    const s = { ...settings, phoneVisibility: phoneVisibility.value, addrVisibility: addrVisibility.value };
    await request({ url: '/users/me', method: 'PUT', data: { settings: s } });
    // 更新本地store
    if (userStore.userInfo) userStore.userInfo.settings = s;
  } catch { /* ignore */ }
}

async function handleToggle(val) {
  chatDisabled.value = val;
  await request({ url: '/users/me', method: 'PUT', data: { chatDisabled: val } });
}

function handleLogout() {
  uni.showModal({
    title: '退出登录', content: '确定退出？',
    success: (res) => { if (res.confirm) userStore.logout(); },
  });
}
</script>

<style scoped lang="scss">
.page-privacy { min-height: 100vh; background: #FBF8F4; }
.section { background: #fff; margin-bottom: 16rpx; padding: 24rpx 32rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #2D2016; display: block; margin-bottom: 16rpx; }
.item { display: flex; align-items: center; justify-content: space-between; padding: 16rpx 0; border-bottom: 1rpx solid #F5F0EA; }
.item:last-child { border-bottom: none; }
.item-info { flex: 1; }
.item-title { font-size: 28rpx; color: #2D2016; display: block; }
.item-desc { font-size: 24rpx; color: #9E8E7E; margin-top: 4rpx; display: block; }
.picker-value { font-size: 26rpx; color: var(--theme-primary); }
.arrow { color: #C4B8AD; font-size: 28rpx; }
</style>
