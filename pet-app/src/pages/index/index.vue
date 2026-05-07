<template>
  <view class="page-home">
    <!-- 顶部渐变区域 -->
    <view class="top-banner">
      <view class="banner-content">
        <view class="header-section">
          <view class="greeting">
            <text class="greeting-text">你好，铲屎官</text>
            <text class="greeting-title">开启今天的萌宠之旅</text>
          </view>
          <view class="message-btn" @tap="navigateTo('/subPages/chat/room')">
            <view class="message-icon">📩</view>
            <view class="badge"></view>
          </view>
        </view>
        
        <!-- 统计数据 -->
        <view class="stats-row">
          <view class="stat-card">
            <text class="stat-num">3</text>
            <text class="stat-label">我的宠物</text>
          </view>
          <view class="stat-card">
            <text class="stat-num">12</text>
            <text class="stat-label">服务订单</text>
          </view>
          <view class="stat-card">
            <text class="stat-num">86</text>
            <text class="stat-label">萌宠日记</text>
          </view>
          <view class="stat-card">
            <text class="stat-num">23</text>
            <text class="stat-label">收藏萌宠</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷入口卡片 -->
    <view class="quick-cards">
      <view class="section-header">
        <text class="section-title">快捷服务</text>
        <view class="section-more">
          <text class="more-text">查看全部</text>
          <text class="more-arrow">→</text>
        </view>
      </view>
      
      <view class="cards-row">
        <view class="quick-card warm" @tap="navigateTo('/subPages/order/create')">
          <view class="card-header">
            <view class="icon-wrap orange">🐕</view>
            <view class="card-info">
              <text class="card-title">遛狗服务</text>
              <text class="card-desc">专业遛狗师，安全可靠</text>
            </view>
          </view>
          <view class="card-stats">
            <view class="stat-item">
              <text class="stat-value">128</text>
              <text class="stat-name">订单</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">4.9</text>
              <text class="stat-name">评分</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">3km</text>
              <text class="stat-name">距离</text>
            </view>
          </view>
        </view>
        
        <view class="quick-card fresh" @tap="navigateTo('/subPages/order/create')">
          <view class="card-header">
            <view class="icon-wrap green">🛁</view>
            <view class="card-info">
              <text class="card-title">宠物洗澡</text>
              <text class="card-desc">专业洗护，毛发柔顺</text>
            </view>
          </view>
          <view class="card-stats">
            <view class="stat-item">
              <text class="stat-value">89</text>
              <text class="stat-name">订单</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">4.8</text>
              <text class="stat-name">评分</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">5km</text>
              <text class="stat-name">距离</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="function-section">
      <view class="section-header">
        <text class="section-title">服务分类</text>
      </view>
      
      <view class="function-grid">
        <view class="function-item" @tap="navigateTo('/subPages/order/create')">
          <view class="func-icon warm-bg">🐕</view>
          <text class="func-text">遛狗</text>
        </view>
        <view class="function-item" @tap="navigateTo('/subPages/order/create')">
          <view class="func-icon fresh-bg">🛁</view>
          <text class="func-text">洗澡</text>
        </view>
        <view class="function-item" @tap="navigateTo('/subPages/order/create')">
          <view class="func-icon purple-bg">🏠</view>
          <text class="func-text">寄养</text>
        </view>
        <view class="function-item" @tap="navigateTo('/subPages/order/create')">
          <view class="func-icon yellow-bg">💉</view>
          <text class="func-text">疫苗</text>
        </view>
      </view>
    </view>

    <!-- 日记动态 -->
    <view class="diary-section">
      <view class="section-header">
        <text class="section-title">萌宠日记</text>
        <view class="section-more">
          <text class="more-text">更多日记</text>
          <text class="more-arrow">→</text>
        </view>
      </view>
      
      <view class="diary-list">
        <view class="diary-card" v-for="(item, index) in diaryList" :key="index">
          <view class="diary-header">
            <view class="user-info">
              <view class="avatar">{{ item.avatar }}</view>
              <view class="user-detail">
                <text class="user-name">{{ item.name }}</text>
                <view class="user-tag" :class="item.tagClass">{{ item.tag }}</view>
              </view>
            </view>
            <text class="diary-time">{{ item.time }}</text>
          </view>
          <text class="diary-content">{{ item.content }}</text>
        </view>
      </view>
    </view>

    <!-- 快速预约入口 -->
    <view class="quick-order" @tap="navigateTo('/subPages/order/create')">
      <view class="order-icon">🚀</view>
      <view class="order-info">
        <text class="order-title">一键预约服务</text>
        <text class="order-desc">专业服务，安心托付</text>
      </view>
      <text class="order-arrow">→</text>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-bottom"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const diaryList = ref([
  {
    avatar: '🐱',
    name: '小猫咪',
    tag: '宠物达人',
    tagClass: 'orange-tag',
    time: '2小时前',
    content: '今天带主子去公园玩了，它追着蝴蝶跑了好久，累坏了回来就睡了一下午，真是可爱的小家伙！'
  },
  {
    avatar: '🐶',
    name: '汪汪队',
    tag: '新手铲屎官',
    tagClass: 'green-tag',
    time: '5小时前',
    content: '我家旺财今天学会握手了！训练了整整一周，终于成功了，太开心了！'
  }
]);

function navigateTo(url) {
  uni.navigateTo({ url });
}
</script>

<style scoped lang="scss">
.page-home {
  min-height: 100vh;
  background: #FBF8F4;
  padding-bottom: env(safe-area-inset-bottom);
}

.top-banner {
  background: linear-gradient(135deg, #F5895A 0%, #F7C96E 100%);
  padding: 60rpx 20rpx 30rpx;
  border-radius: 0 0 32rpx 32rpx;
}

.banner-content {
  padding: 0 10rpx;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32rpx;
}

.greeting {
  display: flex;
  flex-direction: column;
}

.greeting-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8rpx;
}

.greeting-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}

.message-btn {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-icon {
  font-size: 36rpx;
}

.badge {
  position: absolute;
  right: 4rpx;
  top: 4rpx;
  width: 16rpx;
  height: 16rpx;
  background: #FF6467;
  border-radius: 50%;
}

.stats-row {
  display: flex;
  justify-content: space-between;
}

.stat-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  padding: 16rpx 0;
  margin: 0 6rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.quick-cards {
  padding: 20rpx;
  margin-top: -10rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2D2016;
}

.section-more {
  display: flex;
  align-items: center;
}

.more-text {
  font-size: 26rpx;
  color: #F5895A;
}

.more-arrow {
  font-size: 24rpx;
  color: #F5895A;
  margin-left: 4rpx;
}

.cards-row {
  display: flex;
  gap: 12rpx;
}

.quick-card {
  flex: 1;
  border-radius: 16rpx;
  padding: 16rpx;
  box-shadow: 0 2px 16px rgba(213, 155, 106, 0.12);
  
  &.warm {
    background: #FFF3E8;
  }
  
  &.fresh {
    background: #E8FBF5;
  }
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 12rpx;
  
  &.orange {
    background: rgba(245, 137, 90, 0.19);
  }
  
  &.green {
    background: rgba(126, 207, 179, 0.19);
  }
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D2016;
  margin-bottom: 4rpx;
}

.card-desc {
  font-size: 22rpx;
  color: #9E8E7E;
}

.card-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #F5895A;
  margin-bottom: 2rpx;
}

.stat-name {
  font-size: 22rpx;
  color: #9E8E7E;
}

.function-section {
  padding: 0 20rpx 20rpx;
}

.function-grid {
  display: flex;
  justify-content: space-around;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 0;
  box-shadow: 0 2px 16px rgba(213, 155, 106, 0.12);
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.func-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-bottom: 8rpx;
  
  &.warm-bg {
    background: #FFF3E8;
  }
  
  &.fresh-bg {
    background: #E8FBF5;
  }
  
  &.purple-bg {
    background: #EDF0FA;
  }
  
  &.yellow-bg {
    background: #FFF8E8;
  }
}

.func-text {
  font-size: 24rpx;
  color: #2D2016;
  font-weight: 500;
}

.diary-section {
  padding: 20rpx;
}

.diary-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.diary-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 16rpx;
  box-shadow: 0 2px 16px rgba(213, 155, 106, 0.12);
}

.diary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #FFF3E8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 12rpx;
}

.user-detail {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.user-name {
  font-size: 26rpx;
  font-weight: 500;
  color: #2D2016;
}

.user-tag {
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  
  &.orange-tag {
    background: #FFF3E8;
    color: #F5895A;
  }
  
  &.green-tag {
    background: #E8FBF5;
    color: #7ECFB3;
  }
}

.diary-time {
  font-size: 22rpx;
  color: #9E8E7E;
}

.diary-content {
  font-size: 26rpx;
  color: rgba(45, 32, 22, 0.8);
  line-height: 1.6;
}

.quick-order {
  margin: 0 20rpx 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 16px rgba(213, 155, 106, 0.12);
}

.order-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.order-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #2D2016;
  margin-bottom: 4rpx;
}

.order-desc {
  font-size: 22rpx;
  color: #9E8E7E;
}

.order-arrow {
  font-size: 32rpx;
  color: #F5895A;
}

.safe-bottom {
  height: env(safe-area-inset-bottom);
}
</style>