<template>
  <view class="page-favorites">
    <view class="header"><text class="title">我的收藏</text></view>
    <view class="pet-list" v-if="favorites.length > 0">
      <view class="pet-card" v-for="fav in favorites" :key="fav.id" @tap="navigateTo('/subPages/pet/detail?id=' + fav.targetId)">
        <image :src="'/static/default-pet.png'" mode="aspectFill" class="pet-avatar" />
        <view class="pet-info">
          <text class="pet-name">宠物 #{{ fav.targetId }}</text>
          <text class="fav-time">收藏于 {{ fav.createdAt?.slice(0,10) }}</text>
        </view>
        <view class="unfav-btn" @tap.stop="handleRemove(fav.id)"><text>取消收藏</text></view>
      </view>
    </view>
    <c-empty-state v-else text="还没有收藏任何宠物" />
  </view>
</template>

<script setup>
import { ref, onShow } from '@dcloudio/uni-app';
import { getFavorites, removeFavorite } from '@/api/share';

const favorites = ref([]);

onShow(async () => {
  try {
    const res = await getFavorites();
    favorites.value = res.data || [];
  } catch (e) { /* ignore */ }
});

async function handleRemove(id) {
  await removeFavorite(id);
  favorites.value = favorites.value.filter(f => f.id !== id);
  uni.showToast({ title: '已取消收藏', icon: 'success' });
}

function navigateTo(url) {
  uni.navigateTo({ url });
}
</script>

<style scoped lang="scss">
.page-favorites { min-height: 100vh; background: #f5f7fa; }
.header { padding: 24rpx 32rpx; background: #fff; }
.title { font-size: 36rpx; font-weight: bold; color: #303133; }
.pet-list { padding: 20rpx 32rpx; }
.pet-card { display: flex; align-items: center; background: #fff; padding: 20rpx; border-radius: 12rpx; margin-bottom: 16rpx; }
.pet-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: #e8e8e8; margin-right: 16rpx; }
.pet-info { flex: 1; }
.pet-name { font-size: 28rpx; color: #303133; display: block; }
.fav-time { font-size: 22rpx; color: #C0C4CC; }
.unfav-btn { font-size: 24rpx; color: #F56C6C; padding: 8rpx 16rpx; }
</style>
