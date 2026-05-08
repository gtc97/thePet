<template>
  <view class="page-user">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <template v-if="userStore.isLoggedIn">
        <view class="avatar-wrapper" @tap="navigateTo('/subPages/user/profile-edit')">
          <image v-if="userStore.userInfo?.avatar" class="avatar" :src="userStore.userInfo.avatar" mode="aspectFill" />
          <text v-else class="avatar-text">{{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}</text>
        </view>
        <view class="user-info" @tap="navigateTo('/subPages/user/profile-edit')">
          <text class="nickname">{{ userStore.userInfo?.nickname || '用户' }}</text>
          <text class="sub-title">{{ userStore.userInfo?.bio || '陪伴宠物健康成长' }}</text>
          <view class="role-tags">
            <text class="role-tag" v-for="r in userStore.userInfo?.roles || []" :key="r">
              {{ r === 'PET_OWNER' ? '宠物主' : '师傅' }}
            </text>
          </view>
        </view>
        <view class="edit-btn" @tap="navigateTo('/subPages/user/profile-edit')">
          <text class="edit-icon">✏️</text>
        </view>
      </template>
      <template v-else>
        <view class="login-btn" @tap="navigateTo('/subPages/login/index')">
          <text>登录 / 注册</text>
        </view>
      </template>
    </view>

    <!-- 身份切换 -->
    <view class="identity-switch" v-if="userStore.isLoggedIn && userStore.userInfo?.roles?.length > 1">
      <view class="switch-tab" :class="{ active: userStore.currentRole === 'PET_OWNER' }" @tap="handleSwitchRole('PET_OWNER')">宠物主</view>
      <view class="switch-tab" :class="{ active: userStore.currentRole === 'SERVICE_PROVIDER' }" @tap="handleSwitchRole('SERVICE_PROVIDER')">上门师傅</view>
    </view>

    <!-- 数据统计卡片 -->
    <view class="stats-card" v-if="userStore.isLoggedIn">
      <view class="stat-item">
        <text class="stat-value">{{ stats.petCount }}</text>
        <text class="stat-label">宠物</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">{{ stats.diaryCount }}</text>
        <text class="stat-label">日记</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">{{ stats.photoCount }}</text>
        <text class="stat-label">照片</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">{{ stats.orderCount }}</text>
        <text class="stat-label">服务</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <text class="section-title">功能</text>
      <view class="menu-card">
        <view class="menu-item" @tap="navigateTo('/subPages/pet/list')">
          <text class="menu-icon">🐾</text>
          <text class="menu-text">我的宠物</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="navigateTo('/subPages/user/deposit')">
          <text class="menu-icon">💰</text>
          <text class="menu-text">押金中心</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="navigateTo('/subPages/user/favorites')">
          <text class="menu-icon">⭐</text>
          <text class="menu-text">我的收藏</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="navigateTo('/subPages/user/blacklist')">
          <text class="menu-icon">🚫</text>
          <text class="menu-text">黑名单</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="navigateTo('/subPages/user/locations')">
          <text class="menu-icon">📍</text>
          <text class="menu-text">服务地址</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="navigateTo('/subPages/user/reviews')">
          <text class="menu-icon">⭐</text>
          <text class="menu-text">我的评价</text>
          <text class="menu-arrow">→</text>
        </view>
      </view>
    </view>

    <!-- 设置 -->
    <view class="menu-section">
      <text class="section-title">设置</text>
      <view class="menu-card">
        <view class="menu-item" @tap="navigateTo('/subPages/setting/index')">
          <text class="menu-icon">⚙️</text>
          <text class="menu-text">通用设置</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="navigateTo('/subPages/setting/privacy')">
          <text class="menu-icon">🔒</text>
          <text class="menu-text">隐私设置</text>
          <text class="menu-arrow">→</text>
        </view>
        <view class="menu-item" @tap="navigateTo('/subPages/setting/feedback')">
          <text class="menu-icon">💬</text>
          <text class="menu-text">意见反馈</text>
          <text class="menu-arrow">→</text>
        </view>
      </view>
    </view>

    <!-- 资质申请 -->
    <view class="menu-section" v-if="userStore.isLoggedIn && !userStore.isQualified">
      <text class="section-title">资质</text>
      <view class="menu-card">
        <view class="menu-item" @tap="navigateTo('/subPages/user/qualification')">
          <text class="menu-icon">📋</text>
          <text class="menu-text">申请成为上门师傅</text>
          <text class="menu-status">{{ userStore.userInfo?.qualificationStatus === 'pending' ? '审核中...' : '去申请 →' }}</text>
        </view>
      </view>
    </view>

    <!-- 身份切换引导 -->
    <view class="menu-section" v-if="userStore.isLoggedIn">
      <view class="menu-card">
        <view class="menu-item" @tap="navigateTo('/subPages/user/identity-switch')">
          <text class="menu-icon">🔄</text>
          <text class="menu-text">身份切换与管理</text>
          <text class="menu-arrow">→</text>
        </view>
      </view>
    </view>

    <!-- 退出 -->
    <view class="logout-btn" v-if="userStore.isLoggedIn" @tap="handleLogout">
      <text>退出登录</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';
import { request } from '@/api/request';

const userStore = useUserStore();
const stats = reactive({ petCount: 0, diaryCount: 0, photoCount: 0, orderCount: 0 });

onShow(async () => {
  await userStore.fetchProfile();
  await loadStats();
});

// 加载用户统计数据（调用聚合接口）
async function loadStats() {
  if (!userStore.isLoggedIn) return;
  try {
    const res = await request({ url: '/users/me/stats' });
    if (res.data) {
      stats.petCount = res.data.petCount || 0;
      stats.diaryCount = res.data.diaryCount || 0;
      stats.photoCount = res.data.photoCount || 0;
      stats.orderCount = res.data.orderCount || 0;
    }
  } catch { /* ignore */ }
}

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
    title: '退出登录',
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
  background: linear-gradient(135deg, #F5895A 0%, #F7C96E 100%);
  padding: 60rpx 32rpx 40rpx;
  display: flex;
  align-items: center;
}
.avatar-wrapper {
  width: 120rpx; height: 120rpx; border-radius: 50%;
  background: rgba(255,255,255,0.3);
  display: flex; align-items: center; justify-content: center;
  margin-right: 20rpx;
  overflow: hidden;
}
.avatar { width: 100%; height: 100%; }
.avatar-text { font-size: 48rpx; color: #fff; font-weight: 700; }
.user-info { flex: 1; }
.nickname { font-size: 36rpx; font-weight: 700; color: #fff; display: block; }
.sub-title { font-size: 24rpx; color: rgba(255,255,255,0.8); display: block; margin: 4rpx 0 8rpx; }
.role-tags { display: flex; gap: 8rpx; }
.role-tag { font-size: 22rpx; color: #fff; background: rgba(255,255,255,0.2); padding: 4rpx 14rpx; border-radius: 20rpx; }
.edit-btn {
  width: 64rpx; height: 64rpx; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center;
}
.edit-icon { font-size: 28rpx; }
.login-btn { color: #fff; font-size: 32rpx; padding: 20rpx 0; text-align: center; width: 100%; }

.identity-switch {
  display: flex; margin: -20rpx 32rpx 24rpx;
  background: #fff; border-radius: 16rpx; overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(213,155,106,0.12);
}
.switch-tab {
  flex: 1; text-align: center; padding: 24rpx;
  font-size: 28rpx; color: #9E8E7E;
  &.active { color: #F5895A; font-weight: 600; background: #FFF3E8; }
}

.stats-card {
  display: flex; justify-content: space-around; align-items: center;
  margin: 0 32rpx 24rpx; background: #fff; border-radius: 16rpx;
  padding: 24rpx; box-shadow: 0 4rpx 24rpx rgba(213,155,106,0.12);
}
.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-value { font-size: 36rpx; font-weight: 700; color: #2D2016; }
.stat-label { font-size: 22rpx; color: #9E8E7E; margin-top: 4rpx; }
.stat-divider { width: 1rpx; height: 50rpx; background: #F5F0EA; }

.menu-section { padding: 0 32rpx 24rpx; }
.section-title { font-size: 24rpx; color: #9E8E7E; display: block; margin-bottom: 12rpx; padding-left: 8rpx; }
.menu-card { background: #fff; border-radius: 16rpx; overflow: hidden; box-shadow: 0 4rpx 24rpx rgba(213,155,106,0.12); }
.menu-item { display: flex; align-items: center; padding: 24rpx 28rpx; border-bottom: 1rpx solid #F5F0EA; }
.menu-item:last-child { border-bottom: none; }
.menu-icon { font-size: 36rpx; margin-right: 16rpx; width: 48rpx; text-align: center; }
.menu-text { flex: 1; font-size: 28rpx; color: #2D2016; }
.menu-arrow { font-size: 24rpx; color: #C4B8AD; }
.menu-status { font-size: 24rpx; color: #F5895A; }

.logout-btn {
  margin: 32rpx; text-align: center; padding: 24rpx;
  background: #fff; border-radius: 16rpx; color: #FF6467; font-size: 28rpx;
  box-shadow: 0 4rpx 24rpx rgba(213,155,106,0.12);
}
</style>
