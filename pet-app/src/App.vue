<script setup>
import { onLaunch } from '@dcloudio/uni-app';

// 主题配色方案
const themeColors = {
  warm:  { '--theme-primary':'#F5895A', '--theme-primary-light':'#FFF3E8', '--theme-primary-dark':'#D4723D', '--success':'#7ECFB3', '--success-bg':'#E8FBF5', '--bg-page':'#FBF8F4', '--text-dark':'#2D2016', '--text-sub':'#9E8E7E' },
  blue:  { '--theme-primary':'#409EFF', '--theme-primary-light':'#ECF5FF', '--theme-primary-dark':'#337ECC', '--success':'#67C23A', '--success-bg':'#F0F9EB', '--bg-page':'#F0F5FF', '--text-dark':'#1D2B3A', '--text-sub':'#7A8B9E' },
  green: { '--theme-primary':'#6ABF69', '--theme-primary-light':'#E8F8E8', '--theme-primary-dark':'#4DA04C', '--success':'#6ABF69', '--success-bg':'#E8F8E8', '--bg-page':'#F2F8F2', '--text-dark':'#1D2E1D', '--text-sub':'#7E9E7E' },
  pink:  { '--theme-primary':'#F0989B', '--theme-primary-light':'#FFF0F1', '--theme-primary-dark':'#D07A7D', '--success':'#7ECFB3', '--success-bg':'#E8FBF5', '--bg-page':'#FFF5F5', '--text-dark':'#2D1A1B', '--text-sub':'#9E7A7D' },
  purple:{ '--theme-primary':'#9B7EC4', '--theme-primary-light':'#F3EFF9', '--theme-primary-dark':'#7C65A0', '--success':'#7ECFB3', '--success-bg':'#E8FBF5', '--bg-page':'#F5F2FA', '--text-dark':'#1E1830', '--text-sub':'#7E7A9E' },
};

onLaunch(() => {
  const savedTheme = uni.getStorageSync('theme') || 'warm';
  const vars = themeColors[savedTheme] || themeColors.warm;

  // 小程序环境：通过 page 元素设置 CSS 变量
  try {
    const pageStyle = Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';');
    // 将变量写入全局（小程序中通过 wx 接口无法直接设置，但可以用其他方式）
    if (typeof wx !== 'undefined' && wx.setPageStyle) {
      // 部分小程序基础库支持
    }
    // 备用：设置 Storage 供页面读取
    uni.setStorageSync('themeVars', vars);
  } catch { /* ignore */ }
});
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  background-color: #FBF8F4;
  font-size: 28rpx;
  color: #2D2016;
  line-height: 1.5;
}
</style>
