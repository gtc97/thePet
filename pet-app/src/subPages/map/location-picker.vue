<template>
  <view class="page-picker">
    <view class="map-placeholder">
      <text class="map-icon">📍</text>
      <text class="map-hint">地图选点功能需配置高德SDK</text>
    </view>
    <view class="form">
      <text class="label">手动输入地址</text>
      <input class="input" v-model="address" placeholder="请输入详细地址" />
      <view class="btn" @tap="confirm"><text>确认</text></view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
const address = ref('');
function confirm() {
  if (!address.value.trim()) return uni.showToast({ title: '请输入地址', icon: 'none' });
  // 将地址返回上一页
  const pages = getCurrentPages();
  const prev = pages[pages.length - 2];
  if (prev) prev.$vm.address = address.value;
  uni.navigateBack();
}
</script>

<style scoped lang="scss">
.page-picker { min-height: 100vh; background: #FBF8F4; }
.map-placeholder { height: 400rpx; background: #F5F0EA; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.map-icon { font-size: 80rpx; }
.map-hint { font-size: 26rpx; color: #9E8E7E; margin-top: 16rpx; }
.form { padding: 32rpx; }
.label { font-size: 28rpx; color: #2D2016; display: block; margin-bottom: 12rpx; }
.input { width: 100%; height: 80rpx; border: 2rpx solid #F5F0EA; border-radius: 12rpx; padding: 0 20rpx; font-size: 28rpx; box-sizing: border-box; background: #fff; }
.btn { margin-top: 24rpx; background: #F5895A; color: #fff; text-align: center; padding: 20rpx; border-radius: 48rpx; font-size: 28rpx; font-weight: 600; }
</style>
