<script setup>
import { onLaunch, onShow } from '@dcloudio/uni-app';

onLaunch(() => {
  console.log('thePet App Launched');
  // Check login status
  const token = uni.getStorageSync('access_token');
  if (!token) {
    // Not logged in — user can browse public content
  }
});

onShow(() => {
  console.log('thePet App Show');
});
</script>

<style lang="scss">
@import '@/uni.scss';

/* 全局样式 */
page {
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
}
</style>
