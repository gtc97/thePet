<template>
  <view class="page-provider-list">
    <view class="page-header">
      <text class="title">选择宠护师</text>
      <text class="sub">选择为你服务的上门宠护师</text>
    </view>

    <view class="p-list">
      <view class="p-card" v-for="p in providers" :key="p.id" @tap="selectProvider(p)">
        <c-avatar :src="p.avatar" :name="p.nickname" size="md" />
        <view class="p-info">
          <view class="p-name-row">
            <text class="p-name">{{ p.nickname }}</text>
            <text class="p-level">Lv.{{ p.level || 0 }}</text>
          </view>
          <text class="p-bio" v-if="p.bio">{{ p.bio }}</text>
          <view class="p-stats">
            <text>⭐{{ p.avgRating?.toFixed(1) || '新手上路' }}</text>
            <text>{{ p.totalOrders || 0 }}单</text>
            <text v-if="p.city">{{ p.city }}</text>
          </view>
        </view>
        <text class="select-arrow">→</text>
      </view>
      <view class="empty" v-if="providers.length === 0">
        <text>暂无可选宠护师</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/api/request';

const providers = ref([]);

onLoad(async () => {
  try {
    const res = await request({ url: '/providers' });
    providers.value = res.data?.list || [];
  } catch { /* */ }
});

function selectProvider(p) {
  const pages = getCurrentPages();
  const prev = pages[pages.length - 2]; // 下单页
  if (prev) {
    prev.$vm.selectedProvider = p;
  }
  uni.navigateBack();
}
</script>

<style scoped lang="scss">
.page-provider-list { min-height: 100vh; background: #FBF8F4; }
.page-header { padding: 60rpx 32rpx 24rpx; }
.title { font-size: 40rpx; font-weight: 700; color: #303133; display: block; }
.sub { font-size: 26rpx; color: #909399; margin-top: 8rpx; display: block; }
.p-list { padding: 0 32rpx; }
.p-card { display: flex; align-items: center; background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; gap: 16rpx; }
.p-avatar { width: 88rpx; height: 88rpx; border-radius: 50%; background: #F5F0EA; flex-shrink: 0; }
.p-info { flex: 1; }
.p-name-row { display: flex; align-items: center; gap: 8rpx; margin-bottom: 6rpx; }
.p-name { font-size: 30rpx; font-weight: 600; color: #303133; }
.p-level { font-size: 22rpx; background: #FFF3E8; color: var(--theme-primary); padding: 2rpx 10rpx; border-radius: 8rpx; }
.p-bio { font-size: 24rpx; color: #909399; display: block; margin-bottom: 6rpx; }
.p-stats { display: flex; gap: 20rpx; font-size: 24rpx; color: #606266; }
.select-arrow { font-size: 28rpx; color: #C4B8AD; flex-shrink: 0; }
.empty { text-align: center; padding: 120rpx; color: #909399; }
</style>
