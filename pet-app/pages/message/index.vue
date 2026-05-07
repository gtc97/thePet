<template>
  <view class="page-message">
    <view class="header">
      <text class="header-title">消息</text>
    </view>

    <view class="msg-tabs">
      <view class="tab active"><text>通知</text></view>
      <view class="tab"><text>私聊</text></view>
    </view>

    <!-- 通知列表 -->
    <view class="msg-list">
      <view class="msg-item" v-for="msg in notifications" :key="msg.id">
        <view class="msg-icon">
          <text>{{ iconForType(msg.type) }}</text>
        </view>
        <view class="msg-content">
          <text class="msg-title">{{ msg.title }}</text>
          <text class="msg-desc">{{ msg.content }}</text>
        </view>
        <view class="msg-time">
          <text>{{ formatTime(msg.createdAt) }}</text>
          <view class="unread-dot" v-if="!msg.isRead"></view>
        </view>
      </view>
    </view>

    <c-empty-state v-if="notifications.length === 0" text="暂无消息" />
  </view>
</template>

<script setup>
import { ref } from 'vue';

const notifications = ref([]);

function iconForType(type) {
  const map = { SYSTEM: '📢', ORDER: '📦', CHAT: '💬', REVIEW: '⭐', DISPUTE: '⚠️', QUALIFICATION: '📋' };
  return map[type] || '📌';
}

function formatTime(t) {
  return t ? t.slice(0, 16) : '';
}
</script>

<style scoped lang="scss">
.page-message { padding-bottom: 40rpx; }
.header { padding: 40rpx 32rpx 20rpx; }
.header-title { font-size: 40rpx; font-weight: bold; color: #303133; }
.msg-tabs { display: flex; padding: 0 32rpx 20rpx; gap: 40rpx; }
.tab { font-size: 28rpx; color: #909399; padding: 8rpx 0; }
.tab.active { color: #409EFF; font-weight: 600; border-bottom: 4rpx solid #409EFF; }
.msg-list { padding: 0 32rpx; }
.msg-item { display: flex; align-items: flex-start; background: #fff; padding: 24rpx; border-radius: 12rpx; margin-bottom: 12rpx; }
.msg-icon { font-size: 40rpx; margin-right: 16rpx; }
.msg-content { flex: 1; }
.msg-title { font-size: 28rpx; color: #303133; display: block; margin-bottom: 4rpx; }
.msg-desc { font-size: 24rpx; color: #909399; display: block; }
.msg-time { text-align: right; }
.msg-time text { font-size: 22rpx; color: #C0C4CC; display: block; }
.unread-dot { width: 12rpx; height: 12rpx; background: #F56C6C; border-radius: 6rpx; margin-top: 8rpx; margin-left: auto; }
</style>
