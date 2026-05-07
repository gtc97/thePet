<template>
  <view class="page-home">
    <!-- 顶部搜索/标题 -->
    <view class="header">
      <text class="logo-text">thePet</text>
      <text class="slogan">记录毛孩子的每一个瞬间</text>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-actions" v-if="userStore.isLoggedIn">
      <view class="action-item" @tap="navigateTo('/subPages/pet/list')">
        <view class="action-icon">🐾</view>
        <text class="action-text">我的宠物</text>
      </view>
      <view class="action-item" @tap="navigateTo('/subPages/order/create')">
        <view class="action-icon">🏠</view>
        <text class="action-text">预约上门</text>
      </view>
      <view class="action-item" @tap="navigateTo('/subPages/user/favorites')">
        <view class="action-icon">⭐</view>
        <text class="action-text">我的收藏</text>
      </view>
      <view class="action-item" @tap="navigateTo('/subPages/setting/feedback')">
        <view class="action-icon">💬</view>
        <text class="action-text">意见反馈</text>
      </view>
    </view>

    <!-- 未登录提示 -->
    <view class="login-prompt" v-else>
      <view class="prompt-card" @tap="navigateTo('/subPages/login/index')">
        <text class="prompt-text">登录解锁更多功能</text>
        <text class="prompt-arrow">→</text>
      </view>
    </view>

    <!-- 公开宠物展示 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">发现萌宠</text>
      </view>
      <view class="pet-grid">
        <view class="pet-card" v-for="i in 4" :key="i">
          <view class="pet-card-img"></view>
          <text class="pet-card-name">可爱萌宠 {{ i }}</text>
          <text class="pet-card-breed">未知品种</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <c-empty-state
      v-if="false"
      text="暂无内容"
    />
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/user';
const userStore = useUserStore();

function navigateTo(url) {
  uni.navigateTo({ url });
}
</script>

<style scoped lang="scss">
.page-home {
  padding-bottom: 40rpx;
}
.header {
  background: var(--theme-gradient-vertical);
  padding: 60rpx 40rpx 40rpx;
  color: #fff;
}
.logo-text {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}
.slogan {
  font-size: 26rpx;
  opacity: 0.9;
}
.quick-actions {
  display: flex;
  padding: 24rpx;
  background: #fff;
  margin: -20rpx 24rpx 0;
  border-radius: 16rpx;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
}
.action-icon {
  font-size: 44rpx;
  margin-bottom: 8rpx;
}
.action-text {
  font-size: 24rpx;
  color: #606266;
}
.login-prompt {
  padding: 24rpx;
}
.prompt-card {
  background: #fff;
  padding: 32rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.prompt-text {
  font-size: 28rpx;
  color: var(--theme-primary);
}
.prompt-arrow {
  color: #409EFF;
  font-size: 32rpx;
}
.section {
  padding: 24rpx;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #303133;
}
.pet-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.pet-card {
  width: calc(50% - 8rpx);
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}
.pet-card-img {
  width: 100%;
  height: 240rpx;
  background: #e8e8e8;
}
.pet-card-name {
  display: block;
  font-size: 28rpx;
  color: #303133;
  padding: 12rpx 16rpx 4rpx;
}
.pet-card-breed {
  display: block;
  font-size: 22rpx;
  color: #909399;
  padding: 0 16rpx 16rpx;
}
</style>
