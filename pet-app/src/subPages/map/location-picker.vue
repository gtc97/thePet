<template>
  <view class="page-picker">
    <!-- 地图预览（如果有坐标） -->
    <view class="map-area" v-if="marker">
      <map
        class="map-view"
        :latitude="marker.latitude"
        :longitude="marker.longitude"
        :markers="[marker]"
        :scale="15"
      />
    </view>
    <view class="map-placeholder" v-else @tap="hasLocationAuth ? handleChooseLocation() : null">
      <text class="map-icon">{{ hasLocationAuth ? '📍' : '🔒' }}</text>
      <text class="map-hint">{{ hasLocationAuth ? '点击打开地图选点' : '需授权位置权限后使用' }}</text>
      <text class="map-sub" v-if="!hasLocationAuth">请在设置中开启位置权限</text>
    </view>

    <!-- 选点结果 -->
    <view class="form">
      <view class="pick-btn" @tap="handleChooseLocation">
        <text>🗺️ 微信地图选点</text>
      </view>
      <view class="divider-row"><view class="line" /><text>或手动输入</text><view class="line" /></view>
      <input class="input" v-model="address" placeholder="请输入详细地址" />
      <view class="input" style="margin-top:12rpx">
        <input v-model="city" placeholder="城市（可选）" />
      </view>
      <view class="btn" @tap="confirm"><text>确认地址</text></view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/api/request';

const address = ref('');
const city = ref('');
const marker = ref(null);
const hasLocationAuth = ref(true);

onLoad((options) => {
  if (options.address) address.value = options.address;
  getCurrentPosition();
});

// 获取当前位置
function getCurrentPosition() {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      marker.value = {
        id: 0, latitude: res.latitude, longitude: res.longitude,
        title: '当前位置', iconPath: '', width: 30, height: 30,
      };
      // 逆地理编码获取地址
      request({ url: `/map/reverse-geocode?longitude=${res.longitude}&latitude=${res.latitude}` })
        .then(r => { if (r.data?.address) address.value = r.data.address; })
        .catch(() => {});
    },
    fail: () => {
      hasLocationAuth.value = false;
      // 无权限时不显示地图，引导手动操作
    },
  });
}

function handleChooseLocation() {
  // #ifdef MP-WEIXIN
  uni.chooseLocation({
    success: (res) => {
      address.value = res.address || res.name;
      city.value = '';
      marker.value = {
        id: 1,
        latitude: res.latitude,
        longitude: res.longitude,
        title: res.name || res.address,
        iconPath: '',
        width: 30,
        height: 30,
      };
    },
    fail: (err) => {
      if (err.errMsg?.includes('cancel')) return;
      uni.showToast({ title: '选点失败，请重试', icon: 'none' });
    },
  });
  // #endif
  // #ifdef APP-HARMONY
  uni.showToast({ title: '请在地图上长按选择位置或手动输入地址', icon: 'none', duration: 2000 });
  // #endif
  // #ifndef MP-WEIXIN
  // #ifndef APP-HARMONY
  uni.showToast({ title: '请在微信小程序或鸿蒙APP中使用地图选点', icon: 'none' });
  // #endif
  // #endif
}

async function confirm() {
  if (!address.value.trim()) {
    uni.showToast({ title: '请选择或输入地址', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '解析地址...' });

  // 如果有坐标直接用，否则调用地理编码
  if (marker.value) {
    uni.hideLoading();
    returnResult();
    return;
  }

  try {
    const fullAddr = city.value ? `${city.value} ${address.value}` : address.value;
    const res = await request({ url: `/map/geocode?address=${encodeURIComponent(fullAddr)}` });
    if (res.data?.longitude) {
      marker.value = {
        id: 1,
        latitude: res.data.latitude,
        longitude: res.data.longitude,
        title: res.data.formattedAddress || address.value,
        iconPath: '',
        width: 30,
        height: 30,
      };
    }
  } catch { /* geocode failed, use address only */ }
  uni.hideLoading();
  returnResult();
}

function returnResult() {
  const pages = getCurrentPages();
  const prev = pages[pages.length - 2];
  const result = {
    address: address.value,
    latitude: marker.value?.latitude,
    longitude: marker.value?.longitude,
  };
  // 回调上一页
  if (prev) {
    prev.$vm.$set(prev.$vm, 'selectedLocation', result);
    // 也支持直接写入 address 变量
    if (prev.$vm.address !== undefined) prev.$vm.address = address.value;
    if (prev.$vm.latitude !== undefined && marker.value) prev.$vm.latitude = marker.value.latitude;
    if (prev.$vm.longitude !== undefined && marker.value) prev.$vm.longitude = marker.value.longitude;
  }
  uni.navigateBack();
}
</script>

<style scoped lang="scss">
.page-picker { min-height: 100vh; background: #FBF8F4; }
.map-area { width: 100%; height: 500rpx; }
.map-view { width: 100%; height: 100%; }
.map-placeholder { height: 400rpx; background: #F5F0EA; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.map-icon { font-size: 80rpx; }
.map-hint { font-size: 26rpx; color: #9E8E7E; margin-top: 16rpx; }
.map-sub { font-size: 22rpx; color: #C4B8AD; margin-top: 8rpx; }
.form { padding: 32rpx; }
.pick-btn { background: #E8F5E8; color: #67C23A; text-align: center; padding: 20rpx; border-radius: 12rpx; font-size: 28rpx; font-weight: 600; margin-bottom: 24rpx; border: 2rpx solid #C8E6C9; }
.divider-row { display: flex; align-items: center; gap: 16rpx; margin: 24rpx 0; }
.divider-row text { font-size: 24rpx; color: #C4B8AD; }
.line { flex: 1; height: 1rpx; background: #F5F0EA; }
.input { width: 100%; height: 80rpx; border: 2rpx solid #F5F0EA; border-radius: 12rpx; padding: 0 20rpx; font-size: 28rpx; box-sizing: border-box; background: #fff; }
.btn { margin-top: 24rpx; background: var(--theme-primary); color: #fff; text-align: center; padding: 20rpx; border-radius: 48rpx; font-size: 28rpx; font-weight: 600; }
</style>
