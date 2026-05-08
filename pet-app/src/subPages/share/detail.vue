<template>
  <view class="page-share-detail" v-if="share">
    <view class="hero">
      <image class="cover" :src="share.pet?.coverImage || share.pet?.avatar || '/static/default-pet.png'" mode="aspectFill" />
      <view class="hero-meta">
        <text class="name">{{ share.pet?.name }}</text>
        <text class="breed">{{ share.pet?.breed || '未知品种' }}</text>
      </view>
    </view>
    <view class="info">
      <text class="title">{{ share.title }}</text>
      <view class="stats">
        <text>👁 {{ share.viewCount }}</text>
        <text>❤ {{ share.likeCount }}</text>
      </view>
      <view class="share-row">
        <text class="share-code">分享码：{{ share.shareCode }}</text>
        <button class="share-btn" open-type="share">分享给好友</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getShareDetail } from '@/api/share';

const share = ref(null);

onLoad(async (options) => {
  if (options.id) {
    const res = await getShareDetail(options.id);
    share.value = res.data;
  }
});
</script>

<style scoped lang="scss">
.page-share-detail { min-height: 100vh; background: #FBF8F4; }
.hero { position: relative; }
.cover { width: 100%; height: 500rpx; background: #F5F0EA; }
.hero-meta { position: absolute; bottom: 0; left: 0; right: 0; padding: 60rpx 32rpx 24rpx; background: linear-gradient(transparent, rgba(0,0,0,0.6)); }
.name { font-size: 40rpx; font-weight: bold; color: #fff; display: block; }
.breed { font-size: 26rpx; color: rgba(255,255,255,0.8); }
.info { padding: 24rpx 32rpx; background: #fff; }
.title { font-size: 30rpx; font-weight: 600; color: #2D2016; display: block; margin-bottom: 12rpx; }
.stats { display: flex; gap: 24rpx; margin-bottom: 16rpx; font-size: 26rpx; color: #9E8E7E; }
.share-row { display: flex; align-items: center; justify-content: space-between; }
.share-code { font-size: 24rpx; color: #9E8E7E; }
.share-btn { background: #F5895A; color: #fff; font-size: 24rpx; padding: 8rpx 20rpx; border-radius: 20rpx; border: none; line-height: 1.5; }
.share-btn::after { border: none; }
</style>
