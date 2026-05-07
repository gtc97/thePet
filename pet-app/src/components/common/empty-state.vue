<template>
  <view class="empty-state">
    <text class="empty-icon">📭</text>
    <text class="empty-text">{{ text }}</text>
  </view>
</template>

<script setup>
defineProps({
  text: { type: String, default: '暂无数据' },
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}
.empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }
.empty-text { font-size: 28rpx; color: #C0C4CC; }
</style>
