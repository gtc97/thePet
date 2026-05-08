<template>
  <view class="page-blacklist">
    <view class="header"><text class="title">黑名单</text></view>
    <view v-if="list.length === 0"><c-empty-state text="黑名单为空" /></view>
    <view class="list-item" v-for="item in list" :key="item.id">
      <image class="avatar" :src="item.blocked?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
      <view class="info">
        <text class="name">{{ item.blocked?.nickname || '未知用户' }}</text>
        <text class="reason" v-if="item.reason">原因：{{ item.reason }}</text>
      </view>
      <view class="unblock-btn" @tap="handleUnblock(item.id)"><text>解除</text></view>
    </view>
  </view>
</template>

<script setup>
import { ref, onShow } from '@dcloudio/uni-app';
import { getBlacklist, unblockUser } from '@/api/review';

const list = ref([]);

onShow(async () => {
  const res = await getBlacklist();
  list.value = res.data || [];
});

async function handleUnblock(id) {
  await unblockUser(id);
  list.value = list.value.filter(i => i.id !== id);
  uni.showToast({ title: '已解除', icon: 'success' });
}
</script>

<style scoped lang="scss">
.page-blacklist { min-height: 100vh; background: var(--bg-page); }
.header { padding: 24rpx 32rpx; background: var(--bg-white); }
.title { font-size: var(--font-xl); font-weight: bold; }
.list-item { display: flex; align-items: center; padding: 20rpx 32rpx; background: var(--bg-white); margin-bottom: 2rpx; }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: #e8e8e8; margin-right: 16rpx; }
.info { flex: 1; }
.name { font-size: var(--font-md); display: block; }
.reason { font-size: var(--font-xs); color: var(--text-secondary); margin-top: 4rpx; }
.unblock-btn { font-size: var(--font-sm); color: var(--color-danger); padding: 8rpx 16rpx; }
</style>
