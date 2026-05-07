<script setup>
import { onLaunch } from '@dcloudio/uni-app';

onLaunch(() => {
  console.log('thePet App Launched');
  // 应用用户保存的主题
  const savedTheme = uni.getStorageSync('theme') || 'warm';
  // 通过全局className控制主题
  if (typeof document !== 'undefined') {
    document.documentElement.className = `theme-${savedTheme}`;
  }
  // 小程序通过page样式变量控制（在uni.scss中定义）
});
</script>

<style lang="scss">
@import '@/uni.scss';

/* 全局页面基础样式 */
page {
  background-color: var(--bg-page);
  font-size: var(--font-md);
  color: var(--text-primary);
  line-height: 1.5;
}
</style>
