<template>
  <view class="page-user">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <template v-if="userStore.isLoggedIn">
        <image class="avatar" :src="userStore.userInfo?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="user-info">
          <text class="nickname">{{ userStore.userInfo?.nickname || '用户' }}</text>
          <view class="role-tags">
            <text class="role-tag" v-for="r in userStore.userInfo?.roles || []" :key="r">
              {{ r === 'PET_OWNER' ? '宠物主' : '上门师傅' }}
            </text>
          </view>
        </view>
        <text class="edit-btn" @tap="navigateTo('/subPages/user/profile-edit')">编辑</text>
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

    <!-- 资质申请入口 -->
    <view class="menu-card" v-if="userStore.isLoggedIn && !userStore.isQualified">
      <view class="menu-item" @tap="navigateTo('/subPages/user/qualification')">
        <text class="menu-text">申请成为上门师傅</text>
        <text class="menu-status">
          {{ userStore.userInfo?.qualificationStatus === 'pending' ? '审核中...' : '去申请 →' }}
        </text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-card">
      <view class="menu-item" @tap="navigateTo('/subPages/pet/list')">
        <text class="menu-text">🐾 我的宠物</text>
        <text class="menu-arrow">→</text>
      </view>
      <view class="menu-item" @tap="navigateTo('/subPages/user/deposit')">
        <text class="menu-text">💰 押金中心</text>
        <text class="menu-arrow">→</text>
      </view>
      <view class="menu-item" @tap="navigateTo('/subPages/user/favorites')">
        <text class="menu-text">⭐ 我的收藏</text>
        <text class="menu-arrow">→</text>
      </view>
      <view class="menu-item" @tap="navigateTo('/subPages/user/blacklist')">
        <text class="menu-text">🚫 黑名单</text>
        <text class="menu-arrow">→</text>
      </view>
      <view class="menu-item" @tap="navigateTo('/subPages/user/locations')">
        <text class="menu-text">📍 服务地址</text>
        <text class="menu-arrow">→</text>
      </view>
    </view>

    <view class="menu-card">
      <view class="menu-item" @tap="navigateTo('/subPages/setting/index')">
        <text class="menu-text">⚙️ 设置</text>
        <text class="menu-arrow">→</text>
      </view>
      <view class="menu-item" @tap="navigateTo('/subPages/setting/feedback')">
        <text class="menu-text">💬 意见反馈</text>
        <text class="menu-arrow">→</text>
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
.page-user { padding-bottom: 40rpx; }
.user-header {
  background: var(--theme-gradient-vertical);
  padding: 80rpx 32rpx 40rpx;
  display: flex;
  align-items: center;
}
.avatar { width: 120rpx; height: 120rpx; border-radius: 60rpx; border: 4rpx solid rgba(255,255,255,0.5); margin-right: 20rpx; }
.user-info { flex: 1; }
.nickname { font-size: 36rpx; color: #fff; font-weight: 600; display: block; }
.role-tags { margin-top: 8rpx; display: flex; gap: 12rpx; }
.role-tag { font-size: 22rpx; color: #fff; background: rgba(255,255,255,0.25); padding: 4rpx 16rpx; border-radius: 20rpx; }
.edit-btn { color: #fff; font-size: 28rpx; padding: 8rpx 16rpx; }
.login-btn { color: #fff; font-size: 32rpx; padding: 20rpx 0; }
.identity-switch {
  display: flex; margin: -20rpx 32rpx 0; background: #fff; border-radius: 12rpx;
  overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.switch-tab { flex: 1; text-align: center; padding: 24rpx; font-size: 28rpx; color: #606266; }
.switch-tab.active { color: var(--theme-primary); font-weight: 600; background: var(--theme-primary-light); }
.menu-card { background: #fff; margin: 16rpx 32rpx; border-radius: 12rpx; overflow: hidden; }
.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 28rpx 24rpx; border-bottom: 1rpx solid #f0f0f0; }
.menu-item:last-child { border-bottom: none; }
.menu-text { font-size: 28rpx; color: #303133; }
.menu-status { font-size: 24rpx; color: #E6A23C; }
.menu-arrow { color: #C0C4CC; font-size: 28rpx; }
.logout-btn { margin: 40rpx 32rpx; text-align: center; padding: 24rpx; background: #fff; border-radius: 12rpx; color: #F56C6C; font-size: 28rpx; }
</style>
