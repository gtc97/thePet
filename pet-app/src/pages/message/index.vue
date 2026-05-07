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
        @tap="navigateTo('/subPages/message/detail?id=' + msg.id)"
      >
        <view class="msg-avatar" :class="msg.avatarBg">
          <text class="avatar-text">{{ msg.avatar }}</text>
          <view class="unread-badge" v-if="msg.unread > 0">{{ msg.unread }}</view>
        </view>
        
        <view class="msg-content">
          <view class="msg-header">
            <text class="msg-name">{{ msg.name }}</text>
            <text class="msg-time">{{ msg.time }}</text>
          </view>
          <text class="msg-desc">{{ msg.desc }}</text>
        </view>
      </view>

      <view class="empty-state" v-if="messages.length === 0">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无消息</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';

const messages = ref([
  {
    id: '1',
    avatar: 'A',
    avatarBg: 'bg-orange',
    name: '系统通知',
    time: '10:30',
    desc: '您的订单已完成，请进行评价',
    unread: 2
  },
  {
    id: '2',
    avatar: 'B',
    avatarBg: 'bg-green',
    name: '张师傅',
    time: '昨天',
    desc: '明天上午10点可以上门服务',
    unread: 1
  },
  {
    id: '3',
    avatar: 'C',
    avatarBg: 'bg-blue',
    name: '客服中心',
    time: '09:00',
    desc: '感谢您的使用，有问题随时联系我们',
    unread: 0
  },
  {
    id: '4',
    avatar: 'D',
    avatarBg: 'bg-purple',
    name: '宠物店',
    time: '周一',
    desc: '您的宠物疫苗接种时间快到了',
    unread: 0
  }
]);

const unreadCount = computed(() => {
  return messages.value.reduce((sum, msg) => sum + msg.unread, 0);
});

function navigateTo(url) {
  uni.navigateTo({ url });
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

  &.bg-orange {
    background: #FFF3E8;
  }
  &.bg-green {
    background: #E8FBF5;
  }
  &.bg-blue {
    background: #E8F4FF;
  }
  &.bg-purple {
    background: #F3E8FF;
  }
}

.avatar-text {
  font-size: 32rpx;
  color: #2D2016;
  font-weight: 500;
}

.unread-badge {
  position: absolute;
  right: -8rpx;
  top: -8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  background: #E85454;
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
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
</style>