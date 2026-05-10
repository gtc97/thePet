<template>
  <view class="page-route">
    <!-- 地图展示起终点 -->
    <map
      class="map-view"
      :latitude="centerLat"
      :longitude="centerLng"
      :markers="markers"
      :polyline="polyline"
      :scale="14"
    />

    <!-- 路线信息卡片 -->
    <view class="route-card" v-if="info.distance">
      <view class="route-row">
        <text class="route-icon">📍</text>
        <text class="route-text">{{ originAddr || '起点' }}</text>
      </view>
      <view class="route-line">
        <view class="dot start" /><view class="dash-line" /><view class="dot end" />
      </view>
      <view class="route-row">
        <text class="route-icon">🏁</text>
        <text class="route-text">{{ destAddr || '终点' }}</text>
      </view>
      <view class="route-stats">
        <text class="stat">距离 {{ (info.distance/1000).toFixed(1) }}km</text>
        <text class="stat">预计 {{ Math.round(info.duration/60) }}分钟</text>
      </view>
    </view>

    <view class="route-card" v-else-if="!loading">
      <text style="color:#9E8E7E;font-size:28rpx">暂无路线数据</text>
    </view>

    <!-- 操作按钮 -->
    <view class="actions" v-if="info.distance">
      <view class="btn primary" @tap="openNavigation"><text>🗺️ 导航前往</text></view>
      <view class="btn outline" @tap="goBack"><text>返回</text></view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/api/request';

const info = ref({});
const loading = ref(true);
const originAddr = ref('');
const destAddr = ref('');
const originLng = ref(0);
const originLat = ref(0);
const destLng = ref(0);
const destLat = ref(0);

onLoad(async (options) => {
  if (options.originLng) {
    originLng.value = parseFloat(options.originLng);
    originLat.value = parseFloat(options.originLat);
    originAddr.value = options.originAddr || '';
  }
  if (options.destLng) {
    destLng.value = parseFloat(options.destLng);
    destLat.value = parseFloat(options.destLat);
    destAddr.value = options.destAddr || '';
  }

  if (options.origin && options.destination) {
    // 传的是地址字符串
    originAddr.value = options.origin;
    destAddr.value = options.destination;
  }

  loading.value = true;
  try {
    const origin = `${originLng.value || 116.397},${originLat.value || 39.909}`;
    const destination = `${destLng.value || 116.407},${destLat.value || 39.919}`;
    const res = await request({ url: `/map/route?origin=${origin}&destination=${destination}&type=driving` });
    info.value = res.data || {};
  } catch { /* */ }
  loading.value = false;
});

const centerLat = computed(() => {
  if (originLat.value && destLat.value) return (originLat.value + destLat.value) / 2;
  return 39.909;
});
const centerLng = computed(() => {
  if (originLng.value && destLng.value) return (originLng.value + destLng.value) / 2;
  return 116.397;
});

const markers = computed(() => {
  const list = [];
  if (originLat.value) {
    list.push({ id: 1, latitude: originLat.value, longitude: originLng.value, iconPath: '', width: 30, height: 30, callout: { content: originAddr.value || '起点', fontSize: 12, padding: 4 } });
  }
  if (destLat.value) {
    list.push({ id: 2, latitude: destLat.value, longitude: destLng.value, iconPath: '', width: 30, height: 30, callout: { content: destAddr.value || '终点', fontSize: 12, padding: 4 } });
  }
  return list;
});

const polyline = computed(() => {
  if (!info.value.steps?.length) return [];
  // 简化路线点用于polyline展示
  const points = [];
  for (const step of info.value.steps) {
    if (step.polyline) {
      const coords = step.polyline.split(';');
      for (const c of coords) {
        const [lng, lat] = c.split(',');
        points.push({ latitude: parseFloat(lat), longitude: parseFloat(lng) });
      }
    }
  }
  return points.length > 0 ? [{ points, color: 'var(--theme-primary)', width: 4 }] : [];
});

function openNavigation() {
  uni.openLocation({
    latitude: destLat.value || 39.919,
    longitude: destLng.value || 116.407,
    name: destAddr.value || '目的地',
    scale: 15,
  });
}

function goBack() {
  uni.navigateBack();
}
</script>

<style scoped lang="scss">
.page-route { min-height: 100vh; display: flex; flex-direction: column; background: #FBF8F4; }
.map-view { width: 100%; height: 55vh; }
.route-card { margin: 24rpx; padding: 24rpx; background: #fff; border-radius: 16rpx; }
.route-row { display: flex; align-items: center; gap: 12rpx; margin-bottom: 8rpx; }
.route-icon { font-size: 32rpx; }
.route-text { font-size: 28rpx; color: #2D2016; font-weight: 500; }
.route-line { display: flex; align-items: center; padding-left: 14rpx; margin: 8rpx 0 8rpx 10rpx; }
.dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: var(--theme-primary); }
.dot.end { background: #67C23A; }
.dash-line { flex: 1; height: 2rpx; border-top: 2rpx dashed #F5F0EA; margin: 0 8rpx; }
.route-stats { display: flex; gap: 32rpx; margin-top: 16rpx; padding-top: 16rpx; border-top: 1rpx solid #F5F0EA; }
.stat { font-size: 30rpx; color: var(--theme-primary); font-weight: 600; }
.actions { padding: 24rpx; display: flex; gap: 16rpx; }
.btn { flex: 1; text-align: center; padding: 24rpx; border-radius: 48rpx; font-size: 28rpx; font-weight: 600; }
.btn.primary { background: var(--theme-primary); color: #fff; }
.btn.outline { background: #fff; color: var(--theme-primary); border: 2rpx solid var(--theme-primary); }
</style>
