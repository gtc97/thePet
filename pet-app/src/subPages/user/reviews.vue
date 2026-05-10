<template>
  <view class="page-reviews">
    <view class="list" v-if="reviews.length > 0">
      <view class="card" v-for="r in reviews" :key="r.id">
        <view class="card-header">
          <c-avatar :src="r.reviewer?.avatar" :name="r.reviewer?.nickname" size="sm" />
          <view class="user-info">
            <text class="name">{{ r.reviewer?.nickname || '用户' }}</text>
            <view class="stars">
              <text v-for="i in 5" :key="i" class="star" :class="{ filled: i <= r.rating }">★</text>
            </view>
          </view>
          <text class="time">{{ r.createdAt?.slice(0, 10) }}</text>
        </view>
        <text class="content" v-if="r.content">{{ r.content }}</text>
        <view class="tags" v-if="r.tags">
          <text class="tag" v-for="(t, i) in JSON.parse(r.tags)" :key="i">{{ t }}</text>
        </view>
      </view>
    </view>
    <c-empty-state v-else text="暂无评价" />
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { request } from '@/api/request';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const reviews = ref([]);

onShow(async () => {
  if (!userStore.userInfo?.id) return;
  const res = await request({ url: `/users/${userStore.userInfo.id}/reviews` });
  reviews.value = res.data || [];
});
</script>

<style scoped lang="scss">
.page-reviews { min-height: 100vh; background: #FBF8F4; padding-top: 16rpx; }
.list { padding: 0 32rpx; }
.card { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; }
.card-header { display: flex; align-items: center; gap: 12rpx; margin-bottom: 12rpx; }
.avatar { width: 64rpx; height: 64rpx; border-radius: 50%; background: #F5F0EA; }
.user-info { flex: 1; }
.name { font-size: 28rpx; color: #2D2016; display: block; }
.stars { display: flex; gap: 2rpx; }
.star { font-size: 24rpx; color: #F5F0EA; }
.star.filled { color: #F7C96E; }
.time { font-size: 22rpx; color: #C4B8AD; }
.content { font-size: 26rpx; color: #2D2016; line-height: 1.6; display: block; }
.tags { display: flex; gap: 8rpx; margin-top: 8rpx; flex-wrap: wrap; }
.tag { background: #FFF3E8; color: var(--theme-primary); font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 10rpx; }
</style>
