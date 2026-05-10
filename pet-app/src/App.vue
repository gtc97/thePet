<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';

// 直接从 storage 读取主题（每次页面可见时更新）
const themeClass = ref('theme-warm');
const updateTheme = () => {
  themeClass.value = 'theme-' + (uni.getStorageSync('theme') || 'warm');
};
updateTheme();

// 监听主题变更（通过全局事件）
const instance = getCurrentInstance();
if (instance) {
  uni.$on('themeChanged', updateTheme);
}
</script>

<template>
  <view :class="themeClass"></view>
</template>

<style lang="scss">
@import '@/uni.scss';

page {
  background-color: #FBF8F4;
  font-size: 28rpx;
  color: #2D2016;
  line-height: 1.5;
}
</style>
