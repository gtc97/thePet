<template>
  <view class="page-provider" v-if="provider">
    <!-- 头部 -->
    <view class="provider-header">
      <c-avatar :src="provider.avatar" :name="provider.nickname" size="lg" />
      <text class="nickname">{{ provider.nickname }}</text>
      <text class="bio" v-if="provider.bio">{{ provider.bio }}</text>
      <view class="badges">
        <text class="badge level">Lv.{{ provider.level || 0 }}</text>
        <text class="badge rating">⭐ {{ provider.avgRating?.toFixed(1) || '新手上路' }}</text>
      </view>
      <view class="stats-row">
        <view class="stat"><text class="num">{{ provider.totalOrders || 0 }}</text><text class="lbl">总接单</text></view>
        <view class="stat"><text class="num">{{ provider.completedOrders || 0 }}</text><text class="lbl">已完成</text></view>
        <view class="stat"><text class="num">{{ provider.points || 0 }}</text><text class="lbl">积分</text></view>
      </view>
    </view>

    <!-- 近期服务记录 -->
    <view class="section" v-if="provider.recentOrders?.length">
      <text class="section-title">近期服务</text>
      <view class="order-item" v-for="o in provider.recentOrders" :key="o.id" @tap="navigateTo('/subPages/order/detail?id=' + o.id)">
        <view class="od-left">
          <text class="od-type">{{ o.serviceType }}</text>
          <text class="od-owner">宠主：{{ o.owner?.nickname }}</text>
        </view>
        <view class="od-right">
          <text class="od-price">¥{{ o.price }}</text>
          <text class="od-date">{{ o.completedAt?.slice(0,10) }}</text>
        </view>
      </view>
    </view>

    <!-- 最近评价 -->
    <view class="section" v-if="provider.recentReviews?.length">
      <text class="section-title">最近评价</text>
      <view class="review-item" v-for="r in provider.recentReviews" :key="r.id">
        <c-avatar :src="r.reviewer?.avatar" :name="r.reviewer?.nickname" size="sm" />
        <view class="rv-content">
          <text class="rv-name">{{ r.reviewer?.nickname }}</text>
          <text class="rv-stars">{{ '⭐'.repeat(r.rating) }}</text>
          <text class="rv-text" v-if="r.content">{{ r.content }}</text>
        </view>
      </view>
    </view>

    <view class="section" v-else>
      <text class="empty-hint">暂无评价</text>
    </view>
  </view>

  <view v-else class="loading"><text>加载中...</text></view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/api/request';

const provider = ref(null);

onLoad(async (options) => {
  if (!options.id) { uni.navigateBack(); return; }
  try {
    const res = await request({ url: `/users/${options.id}` });
    provider.value = res.data;
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
});

function navigateTo(url) { uni.navigateTo({ url }); }
</script>

<style scoped lang="scss">
.page-provider { min-height: 100vh; background: #FBF8F4; padding-bottom: 60rpx; }
.provider-header { background: #fff; padding: 40rpx 32rpx; text-align: center; margin-bottom: 16rpx; }
.avatar { width: 120rpx; height: 120rpx; border-radius: 50%; margin: 0 auto 16rpx; display: block; }
.nickname { font-size: 36rpx; font-weight: 700; color: #303133; display: block; }
.bio { font-size: 26rpx; color: #909399; display: block; margin-top: 8rpx; }
.badges { display: flex; justify-content: center; gap: 16rpx; margin-top: 16rpx; }
.badge { font-size: 24rpx; padding: 4rpx 16rpx; border-radius: 20rpx; }
.badge.level { background: #FFF3E8; color: var(--theme-primary); }
.badge.rating { background: #FFF8E8; color: #E6A23C; }
.stats-row { display: flex; justify-content: space-around; margin-top: 24rpx; padding-top: 24rpx; border-top: 1rpx solid #F5F0EA; }
.stat { display: flex; flex-direction: column; }
.num { font-size: 32rpx; font-weight: 700; color: #303133; }
.lbl { font-size: 22rpx; color: #909399; margin-top: 4rpx; }
.section { background: #fff; padding: 24rpx 32rpx; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 16rpx; }
.review-item { display: flex; gap: 12rpx; padding: 16rpx 0; border-bottom: 1rpx solid #F5F0EA; }
.rv-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; flex-shrink: 0; }
.rv-content { flex: 1; }
.rv-name { font-size: 26rpx; font-weight: 500; color: #303133; }
.rv-stars { font-size: 22rpx; display: block; margin: 4rpx 0; }
.rv-text { font-size: 26rpx; color: #606266; line-height: 1.5; }
.empty-hint { color: #C0C4CC; font-size: 26rpx; text-align: center; padding: 32rpx; }
.loading { display: flex; justify-content: center; padding: 200rpx; color: #909399; }
.order-item { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #F5F0EA; }
.od-left { display: flex; flex-direction: column; }
.od-type { font-size: 28rpx; font-weight: 500; color: #303133; }
.od-owner { font-size: 24rpx; color: #909399; margin-top: 4rpx; }
.od-right { text-align: right; }
.od-price { font-size: 28rpx; font-weight: 600; color: var(--theme-primary); display: block; }
.od-date { font-size: 24rpx; color: #C4B8AD; margin-top: 4rpx; display: block; }
</style>
