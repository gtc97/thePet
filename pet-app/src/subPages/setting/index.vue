<template>
  <view class="page-setting">
    <view class="header"><text class="title">设置</text></view>

    <!-- 主题色选择 -->
    <view class="section">
      <text class="section-title">主题色</text>
      <text class="section-desc">选择你喜欢的主题配色</text>
      <view class="theme-grid">
        <view
          v-for="theme in themes" :key="theme.key"
          class="theme-item" :class="{ active: currentTheme === theme.key }"
          @tap="handleThemeChange(theme.key)"
        >
          <view class="theme-circle" :style="{ background: theme.color }">
            <text v-if="currentTheme === theme.key" class="check-mark">✓</text>
          </view>
          <text class="theme-name">{{ theme.name }}</text>
        </view>
      </view>
    </view>

    <!-- 功能设置 -->
    <view class="section">
      <text class="section-title">功能设置</text>
      <view class="toggle-item">
        <text>关闭私信</text>
        <switch :checked="chatDisabled" @change="(e) => handleToggle('chat', e.detail.value)" :color="themeColor" />
      </view>
    </view>

    <!-- 其他入口 -->
    <view class="menu-list">
      <view class="menu-item" @tap="navigateTo('/subPages/setting/privacy')">
        <text>隐私设置</text>
        <text class="arrow">→</text>
      </view>
      <view class="menu-item" @tap="navigateTo('/subPages/setting/feedback')">
        <text>意见反馈</text>
        <text class="arrow">→</text>
      </view>
      <view class="menu-item" @tap="showAbout">
        <text>关于 thePet</text>
        <text class="arrow">→</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/store/user';
import { request } from '@/api/request';

const userStore = useUserStore();

const themes = [
  { key: 'warm', name: '暖棕色', color: '#C8956C' },
  { key: 'blue', name: '天蓝', color: '#409EFF' },
  { key: 'green', name: '草绿', color: '#67C23A' },
  { key: 'pink', name: '樱花粉', color: '#F0989B' },
  { key: 'purple', name: '深紫', color: '#9B7EC4' },
];

const currentTheme = ref(uni.getStorageSync('theme') || 'warm');
const chatDisabled = ref(userStore.userInfo?.chatDisabled || false);

const themeColor = computed(() => {
  const t = themes.find(t => t.key === currentTheme.value);
  return t ? t.color : '#C8956C';
});

function handleThemeChange(key) {
  currentTheme.value = key;
  uni.setStorageSync('theme', key);
  uni.$emit('themeChanged', key);
  uni.showToast({ title: `已切换为${themes.find(t=>t.key===key).name}`, icon: 'success' });
}

async function handleToggle(type, value) {
  if (type === 'chat') {
    chatDisabled.value = value;
    try { await request({ url: '/users/me', method: 'PUT', data: { chatDisabled: value } }); } catch { /* */ }
  }
}

function navigateTo(url) {
  uni.navigateTo({ url });
}

function showAbout() {
  uni.showModal({
    title: '关于 thePet',
    content: '宠物档案记录与上门喂养\nVersion 1.0.0\n\n记录毛孩子的每一个瞬间 🐾',
    showCancel: false,
  });
}
</script>

<style scoped lang="scss">
.page-setting { min-height: 100vh; background: var(--bg-page); }
.header { padding: 24rpx 32rpx; background: var(--bg-white); }
.title { font-size: var(--font-xl); font-weight: bold; color: var(--text-primary); }
.section { background: var(--bg-white); margin: 16rpx 0; padding: 24rpx 32rpx; }
.section-title { font-size: var(--font-lg); font-weight: 600; color: var(--text-primary); display: block; }
.section-desc { font-size: var(--font-sm); color: var(--text-secondary); display: block; margin: 4rpx 0 20rpx; }
.theme-grid { display: flex; gap: 20rpx; }
.theme-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.theme-circle { width: 64rpx; height: 64rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.theme-circle .check-mark { color: #fff; font-size: 28rpx; font-weight: bold; }
.theme-item.active .theme-circle { box-shadow: 0 0 0 4rpx var(--theme-primary-light), 0 0 0 6rpx var(--theme-primary); }
.theme-name { font-size: var(--font-xs); color: var(--text-secondary); }
.toggle-item { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid var(--border-color); margin-top: 16rpx; }
.toggle-item text { font-size: var(--font-md); color: var(--text-primary); }
.menu-list { background: var(--bg-white); margin: 16rpx 0; }
.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 28rpx 32rpx; border-bottom: 1rpx solid var(--bg-page); }
.menu-item text { font-size: var(--font-md); color: var(--text-primary); }
.arrow { color: var(--text-placeholder) !important; }
</style>
