<template>
  <view class="page-message">
    <view class="page-header">
      <view class="header-content">
        <text class="main-title">消息</text>
        <text class="sub-title">您有{{ unreadCount }}条未读消息</text>
      </view>
    </view>

    <scroll-view class="msg-list" scroll-y>
      <view
        class="msg-item"
        v-for="msg in messages"
        :key="msg.id"
        :class="{ 'is-unread': !msg.isRead }"
        @tap="handleRead(msg)"
      >
        <view class="msg-avatar" :class="typeClass(msg.type)">
          <text class="avatar-text">{{ typeIcon(msg.type) }}</text>
          <view class="unread-badge" v-if="!msg.isRead"></view>
        </view>
        <view class="msg-content">
          <view class="msg-header">
            <text class="msg-name">{{ msg.title }}</text>
            <text class="msg-time">{{ formatTime(msg.createdAt) }}</text>
          </view>
          <text class="msg-desc">{{ msg.content }}</text>
        </view>
      </view>

      <view class="empty-state" v-if="messages.length === 0">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无消息</text>
      </view>
    </scroll-view>

    <!-- 消息详情弹窗 -->
    <view class="detail-modal" v-if="currentMsg" @tap="currentMsg = null">
      <view class="detail-content" @tap.stop>
        <text class="detail-title">{{ currentMsg.title }}</text>
        <text class="detail-time">{{ formatTime(currentMsg.createdAt) }}</text>
        <text class="detail-body">{{ currentMsg.content }}</text>
        <view class="detail-close" @tap="currentMsg = null"><text>关闭</text></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { request } from '@/api/request';

const messages = ref([]);
const unreadCount = ref(0);
const currentMsg = ref(null);

onShow(() => {
  loadMessages();
  loadUnreadCount();
});

async function loadMessages() {
  try {
    const res = await request({ url: '/notifications' });
    messages.value = res.data?.list || [];
  } catch { /* ignore */ }
}

async function loadUnreadCount() {
  try {
    const res = await request({ url: '/notifications/unread-count' });
    unreadCount.value = res.data?.count || 0;
  } catch { /* ignore */ }
}

async function handleRead(msg) {
  if (!msg.isRead) {
    try { await request({ url: `/notifications/${msg.id}/read`, method: 'PUT' }); } catch { /* */ }
    msg.isRead = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  }
  currentMsg.value = msg;
}

function typeIcon(type) {
  const map = { SYSTEM: '📢', ORDER: '📋', CHAT: '💬', REVIEW: '⭐', DISPUTE: '⚠️', QUALIFICATION: '📝' };
  return map[type] || '📩';
}

function typeClass(type) {
  const map = { SYSTEM: 'bg-orange', ORDER: 'bg-blue', CHAT: 'bg-green', REVIEW: 'bg-yellow', DISPUTE: 'bg-red', QUALIFICATION: 'bg-purple' };
  return map[type] || 'bg-blue';
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return '刚刚';
  if (h < 24) return h + '小时前';
  return Math.floor(h / 24) + '天前';
}
</script>

<style scoped lang="scss">
.page-message {
  min-height: 100vh;
  background: #FBF8F4;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 60rpx 32rpx 24rpx;
  background: #FBF8F4;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.main-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #2D2016;
  display: block;
  margin-bottom: 8rpx;
}

.sub-title {
  font-size: 26rpx;
  color: #9E8E7E;
}

.msg-list {
  flex: 1;
  width: 100%;
  padding-bottom: 180rpx;
}

.msg-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: #FBF8F4;
  border-bottom: 1rpx solid #EDE5DA;
  position: relative;
}

.msg-item.is-unread {
  background: #FFF8F2;
}

.msg-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  position: relative;
  flex-shrink: 0;

  &.bg-orange { background: #FFF3E8; }
  &.bg-green { background: #E8FBF5; }
  &.bg-blue { background: #E8F4FF; }
  &.bg-purple { background: #F3E8FF; }
  &.bg-yellow { background: #FFF8E8; }
  &.bg-red { background: #FFE8E8; }
}

.avatar-text {
  font-size: 32rpx;
}

.unread-badge {
  position: absolute;
  right: -8rpx;
  top: -8rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #E85454;
}

.msg-content {
  flex: 1;
  min-width: 0;
}

.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.msg-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #2D2016;
}

.msg-time {
  font-size: 24rpx;
  color: #9E8E7E;
}

.msg-desc {
  font-size: 26rpx;
  color: #9E8E7E;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0;
  gap: 16rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #9E8E7E;
}

.detail-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-content {
  width: 85%;
  max-height: 60vh;
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  overflow-y: auto;
}

.detail-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #2D2016;
  display: block;
  margin-bottom: 8rpx;
}

.detail-time {
  font-size: 24rpx;
  color: #9E8E7E;
  display: block;
  margin-bottom: 20rpx;
}

.detail-body {
  font-size: 28rpx;
  color: rgba(45, 32, 22, 0.8);
  line-height: 1.8;
}

.detail-close {
  margin-top: 24rpx;
  text-align: center;
  padding: 16rpx;
  background: var(--theme-primary);
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
}
</style>
