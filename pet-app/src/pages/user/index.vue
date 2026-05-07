<template>
  <view class="page-user">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <template v-if="userStore.isLoggedIn">
        <view class="avatar-wrapper">
          <text class="avatar-text">{{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}</text>
        </view>
        <view class="user-info">
          <text class="nickname">{{ userStore.userInfo?.nickname || '用户' }}</text>
          <text class="sub-title">陪伴宠物健康成长</text>
          <view class="role-tags">
            <text class="role-tag" v-for="r in userStore.userInfo?.roles || []" :key="r">
              {{ r === 'PET_OWNER' ? '宠物主' : '上门师傅' }}
            </text>
          </view>
        </view>
        <view class="edit-btn" @tap="navigateTo('/subPages/user/profile-edit')">
          <image src="/static/image/svg15.png" mode="aspectFit" class="edit-icon" />
        </view>
      </template>
      <template v-else>
        <view class="login-btn" @tap="navigateTo('/subPages/login/index')">
          <text>登录/注册</text>
        </view>
      </template>
    </view>

    <!-- 身份切换 -->
    <view class="identity-switch" v-if="userStore.isLoggedIn && userStore.userInfo?.roles?.length > 1">
      <view
        class="switch-tab"
        :class="{ active: userStore.currentRole === 'PET_OWNER' }"
        @tap="handleSwitchRole('PET_OWNER')"
      >宠物主</view>
      <view
        class="switch-tab"
        :class="{ active: userStore.currentRole === 'SERVICE_PROVIDER' }"
        @tap="handleSwitchRole('SERVICE_PROVIDER')"
      >上门师傅</view>
    </view>

    <!-- 数据统计卡片 -->
    <view class="stats-card" v-if="userStore.isLoggedIn">
      <view class="stat-item">
        <text class="stat-value">3</text>
        <text class="stat-label">宠物</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">28</text>
        <text class="stat-label">日记</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">126</text>
        <text class="stat-label">照片</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">5</text>
        <text class="stat-label">服务</text>
      </view>
    </view>

    <!-- 功能菜单区域 -->
    <view class="menu-section">
      <text class="section-title">功能</text>
      
      <view class="menu-card">
        <view class="menu-item" @tap="navigateTo('/subPages/pet/list')">
           <text class="menu-text">我的宠物</text>
          <image src="/static/image/svg25.png" mode="aspectFit" class="menu-arrow" />
        </view>
        <view class="menu-item" @tap="navigateTo('/subPages/user/deposit')">
          <image src="/static/image/svg2.png" mode="aspectFit" class="menu-icon" />
          <text class="menu-text">押金中心</text>
          <image src="/static/image/svg25.png" mode="aspectFit" class="menu-arrow" />
        </view>
        <view class="menu-item" @tap="navigateTo('/subPages/user/favorites')">
          <image src="/static/image/svg3.png" mode="aspectFit" class="menu-icon" />
          <text class="menu-text">我的收藏</text>
          <image src="/static/image/svg25.png" mode="aspectFit" class="menu-arrow" />
        </view>
        <view class="menu-item" @tap="navigateTo('/subPages/user/blacklist')">
          <image src="/static/image/svg4.png" mode="aspectFit" class="menu-icon" />
          <text class="menu-text">黑名单</text>
          <image src="/static/image/svg25.png" mode="aspectFit" class="menu-arrow" />
        </view>
        <view class="menu-item" @tap="navigateTo('/subPages/user/locations')">
          <image src="/static/image/svg5.png" mode="aspectFit" class="menu-icon" />
          <text class="menu-text">服务地址</text>
          <image src="/static/image/svg25.png" mode="aspectFit" class="menu-arrow" />
        </view>
      </view>
    </view>

    <!-- 设置菜单区域 -->
    <view class="menu-section">
      <text class="section-title">设置</text>
      
      <view class="menu-card">
        <view class="menu-item" @tap="navigateTo('/subPages/setting/index')">
          <image src="/static/image/svg6.png" mode="aspectFit" class="menu-icon" />
          <text class="menu-text">设置</text>
          <image src="/static/image/svg25.png" mode="aspectFit" class="menu-arrow" />
        </view>
        <view class="menu-item" @tap="navigateTo('/subPages/setting/feedback')">
          <image src="/static/image/svg7.png" mode="aspectFit" class="menu-icon" />
          <text class="menu-text">意见反馈</text>
          <image src="/static/image/svg25.png" mode="aspectFit" class="menu-arrow" />
        </view>
      </view>
    </view>

    <!-- 资质申请入口 -->
    <view class="menu-section" v-if="userStore.isLoggedIn && !userStore.isQualified">
      <text class="section-title">资质</text>
      
      <view class="menu-card">
        <view class="menu-item" @tap="navigateTo('/subPages/user/qualification')">
          <image src="/static/image/svg8.png" mode="aspectFit" class="menu-icon" />
          <text class="menu-text">申请成为上门师傅</text>
          <text class="menu-status">
            {{ userStore.userInfo?.qualificationStatus === 'pending' ? '审核中...' : '去申请' }}
          </text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-btn" v-if="userStore.isLoggedIn" @tap="handleLogout">
      <text>退出登录</text>
    </view>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/user';
const userStore = useUserStore();

function navigateTo(url) {
  uni.navigateTo({ url });
}

async function handleSwitchRole(role) {
  if (role === userStore.currentRole) return;
  try {
    await userStore.switchRole(role);
    uni.showToast({ title: '身份切换成功', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: e.message || '切换失败', icon: 'none' });
  }
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定退出登录？',
    success: (res) => {
      if (res.confirm) userStore.logout();
    },
  });
}
</script>

<style scoped lang="scss">
.page-user {
  min-height: 100vh;
  background: #FBF8F4;
  padding-bottom: 180rpx;
}

.user-header {
  width: 100%;
  height: 300rpx;
  background: linear-gradient(135deg, #F5895A 0%, #F7C96E 100%);
  padding: 60rpx 32rpx 40rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.avatar-wrapper {
  width: 144rpx;
  height: 144rpx;
  border-radius: 48rpx;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.avatar-text {
  font-size: 48rpx;
  color: #fff;
  font-weight: 400;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 40rpx;
}

.user-info {
  flex: 1;
}

.nickname {
  font-size: 40rpx;
  font-family: "Noto Sans SC-Bold";
  font-weight: 700;
  line-height: 56rpx;
  color: #fff;
  display: block;
  margin-bottom: 4rpx;
}

.sub-title {
  font-size: 24rpx;
  font-family: "Noto Sans SC-Regular";
  font-weight: 400;
  line-height: 32rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-bottom: 12rpx;
}

.role-tags {
  display: flex;
  gap: 12rpx;
}

.role-tag {
  font-size: 22rpx;
  font-family: "Noto Sans SC-Regular";
  font-weight: 400;
  line-height: 28rpx;
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.edit-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-icon {
  width: 32rpx;
  height: 32rpx;
}

.login-btn {
  color: #fff;
  font-size: 32rpx;
  padding: 20rpx 0;
}

.identity-switch {
  display: flex;
  margin: -20rpx 32rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(213, 155, 106, 0.12);
}

.switch-tab {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  font-size: 28rpx;
  color: #9E8E7E;
  transition: all 0.3s;

  &.active {
    color: #F5895A;
    font-weight: 600;
    background: #FFF3E8;
  }
}

.stats-card {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 0 32rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(213, 155, 106, 0.12);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  font-family: "Noto Sans SC-Bold";
  font-weight: 700;
  line-height: 56rpx;
  color: #2D2016;
}

.stat-label {
  font-size: 22rpx;
  font-family: "Noto Sans SC-Regular";
  font-weight: 400;
  line-height: 28rpx;
  color: #9E8E7E;
  margin-top: 4rpx;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #F5F0EA;
}

.menu-section {
  padding: 0 32rpx 24rpx;
}

.section-title {
  font-size: 24rpx;
  font-family: "Noto Sans SC-Medium";
  font-weight: 500;
  line-height: 32rpx;
  color: #9E8E7E;
  display: block;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}

.menu-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(213, 155, 106, 0.12);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #EDE5DA;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  width: 56rpx;
  height: 56rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  font-family: "Noto Sans SC-Medium";
  font-weight: 500;
  line-height: 42rpx;
  color: #2D2016;
}

.menu-status {
  font-size: 26rpx;
  font-family: "Noto Sans SC-Regular";
  font-weight: 400;
  line-height: 36rpx;
  color: #F5895A;
}

.menu-arrow {
  width: 28rpx;
  height: 28rpx;
}

.logout-btn {
  margin: 32rpx;
  text-align: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  color: #E85454;
  font-size: 28rpx;
  font-family: "Noto Sans SC-Regular";
  font-weight: 400;
  line-height: 40rpx;
  box-shadow: 0 4rpx 24rpx rgba(213, 155, 106, 0.12);
}
</style>