<template>
  <view class="page-share-public" v-if="share">
    <!-- 宠物基本信息 -->
    <view class="pet-hero">
      <image class="cover" :src="share.pet.coverImage || share.pet.avatar || '/static/default-pet.png'" mode="aspectFill" />
      <view class="hero-info">
        <text class="pet-name">{{ share.pet.name }}</text>
        <text class="pet-breed">{{ share.pet.breed || '未知品种' }}</text>
      </view>
    </view>

    <!-- 宠主信息 -->
    <view class="owner-bar">
      <image class="owner-avatar" :src="share.user.avatar || '/static/default-avatar.png'" mode="aspectFill" />
      <text class="owner-name">{{ share.user.nickname }}</text>
    </view>

    <!-- 分享标题 -->
    <view class="share-title-bar">
      <text class="share-title">{{ share.title }}</text>
      <text class="share-desc" v-if="share.description">{{ share.description }}</text>
    </view>

    <!-- 数据行 -->
    <view class="stats-row">
      <text class="views">👁 {{ share.viewCount }}次浏览</text>
      <text class="likes">❤ {{ share.likeCount }}次点赞</text>
      <view class="like-btn" :class="{ liked }" @tap="handleLike"><text>{{ liked ? '❤ 已点赞' : '🤍 点赞' }}</text></view>
    </view>

    <!-- 宠物详情 -->
    <view class="info-section">
      <text class="section-title">基本信息</text>
      <view class="info-row"><text class="label">品种</text><text class="value">{{ share.pet.breed || '-' }}</text></view>
      <view class="info-row"><text class="label">性别</text><text class="value">{{ genderLabel(share.pet.gender) }}</text></view>
      <view class="info-row" v-if="share.pet.weight"><text class="label">体重</text><text class="value">{{ share.pet.weight }}kg</text></view>
    </view>

    <view class="info-section" v-if="share.pet.dietHabits || share.pet.taboos">
      <text class="section-title">照料备注</text>
      <view v-if="share.pet.dietHabits"><text class="label">饮食习惯：</text><text>{{ share.pet.dietHabits }}</text></view>
      <view v-if="share.pet.taboos"><text class="label">禁忌事项：</text><text>{{ share.pet.taboos }}</text></view>
    </view>

    <c-empty-state text="更多内容请打开thePet APP查看" />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getShareByCode, likeShare, unlikeShare } from '@/api/share';

const share = ref(null);
const liked = ref(false); // 当前用户是否已点赞（本地状态）

onLoad(async (options) => {
  const code = options.code || '';
  if (code) {
    const res = await getShareByCode(code);
    share.value = res.data;
  }
});

function genderLabel(g) {
  return { MALE: '♂ 男生', FEMALE: '♀ 女生', UNKNOWN: '未知' }[g] || '未知';
}

async function handleLike() {
  try {
    if (liked.value) {
      await unlikeShare(share.value.id);
      share.value.likeCount = Math.max(0, share.value.likeCount - 1);
      liked.value = false;
      uni.showToast({ title: '已取消点赞', icon: 'none' });
    } else {
      await likeShare(share.value.id);
      share.value.likeCount++;
      liked.value = true;
      uni.showToast({ title: '已点赞', icon: 'success' });
    }
  } catch { /* */ }
}
</script>

<style scoped lang="scss">
.page-share-public { background: #f5f7fa; min-height: 100vh; padding-bottom: 40rpx; }
.pet-hero { position: relative; }
.cover { width: 100%; height: 500rpx; background: #e8e8e8; }
.hero-info { position: absolute; bottom: 0; left: 0; right: 0; padding: 80rpx 32rpx 24rpx; background: linear-gradient(transparent, rgba(0,0,0,0.6)); }
.pet-name { font-size: 44rpx; font-weight: bold; color: #fff; display: block; }
.pet-breed { font-size: 26rpx; color: rgba(255,255,255,0.8); }
.owner-bar { display: flex; align-items: center; padding: 20rpx 32rpx; background: #fff; gap: 12rpx; }
.owner-avatar { width: 60rpx; height: 60rpx; border-radius: 50%; background: #e8e8e8; }
.owner-name { font-size: 26rpx; color: #606266; }
.share-title-bar { padding: 20rpx 32rpx; background: #fff; margin-top: 16rpx; }
.share-title { font-size: 34rpx; font-weight: 600; color: #303133; display: block; }
.share-desc { font-size: 26rpx; color: #909399; margin-top: 8rpx; display: block; }
.stats-row { display: flex; align-items: center; padding: 16rpx 32rpx; background: #fff; margin-top: 2rpx; gap: 24rpx; }
.views, .likes { font-size: 24rpx; color: #909399; }
.like-btn { margin-left: auto; background: #fef0f0; color: #F56C6C; padding: 8rpx 24rpx; border-radius: 24rpx; font-size: 24rpx; }
.info-section { background: #fff; margin-top: 16rpx; padding: 24rpx 32rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 16rpx; }
.info-row { display: flex; margin-bottom: 12rpx; }
.label { font-size: 26rpx; color: #909399; width: 120rpx; }
.value { font-size: 26rpx; color: #303133; flex: 1; }
</style>
