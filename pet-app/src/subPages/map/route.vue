<template>
  <view class="page-route">
    <view class="map-placeholder">
      <text class="map-icon">🗺️</text>
      <text class="map-hint">路线规划需配置高德SDK</text>
      <text class="info" v-if="info.distance">距离约 {{ (info.distance/1000).toFixed(1) }}km · 约 {{ Math.round(info.duration/60) }}分钟</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/api/request';

const info = ref({});

onLoad(async (options) => {
  if (options.origin && options.destination) {
    const res = await request({ url: `/map/route?origin=${options.origin}&destination=${options.destination}&type=driving` });
    info.value = res.data || {};
  }
});
</script>

<style scoped lang="scss">
.page-route { min-height: 100vh; background: #FBF8F4; }
.map-placeholder { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #F5F0EA; }
.map-icon { font-size: 80rpx; }
.map-hint { font-size: 28rpx; color: #9E8E7E; margin-top: 16rpx; }
.info { font-size: 32rpx; color: #F5895A; font-weight: 600; margin-top: 24rpx; }
</style>
