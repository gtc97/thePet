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
          <view class="message-btn" @tap="switchTab('/pages/message/index')">
            <view class="message-icon">📩</view>
            <view class="badge"></view>
          </view>
        </view>
        
        <!-- 统计数据 -->
        <view class="stats-row">
          <view class="stat-card">
            <text class="stat-num">{{ stats.petCount }}</text>
            <text class="stat-label">我的宠物</text>
          </view>
          <view class="stat-card">
            <text class="stat-num">{{ stats.orderCount }}</text>
            <text class="stat-label">服务订单</text>
          </view>
          <view class="stat-card">
            <text class="stat-num">{{ stats.diaryCount }}</text>
            <text class="stat-label">萌宠日记</text>
          </view>
          <view class="stat-card">
            <text class="stat-num">{{ stats.favCount }}</text>
            <text class="stat-label">收藏萌宠</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 公告栏 -->
    <view class="notice-bar" v-if="announcements.length > 0" @tap="showAnnouncement = true">
      <text class="notice-icon">📢</text>
      <text class="notice-text">{{ announcements[0].title }}</text>
      <text class="notice-more" v-if="announcements.length > 1">等{{ announcements.length }}条</text>
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
        <view class="quick-card" :class="index % 2 === 0 ? 'warm' : 'fresh'"
          v-for="(svc, index) in topServices" :key="svc.name"
          @tap="navigateTo('/subPages/order/create')"
        >
          <view class="card-header">
            <view class="icon-wrap" :class="index % 2 === 0 ? 'orange' : 'green'">{{ svc.icon }}</view>
            <view class="card-info">
              <text class="card-title">{{ svc.name }}服务</text>
              <text class="card-desc">¥{{ svc.price }}/次，专业可靠</text>
            </view>
          </view>
          <view class="card-stats">
            <view class="stat-item">
              <text class="stat-value">¥{{ svc.price }}</text>
              <text class="stat-name">起</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">预约</text>
              <text class="stat-name">服务</text>
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
        <view class="function-item" v-for="(svc, i) in services" :key="svc.name" @tap="navigateTo('/subPages/order/create')">
          <view class="func-icon" :class="['warm-bg','fresh-bg','purple-bg','yellow-bg'][i % 4]">{{ svc.icon }}</view>
          <text class="func-text">{{ svc.name }}</text>
        </view>
        <view class="function-item" @tap="navigateTo('/subPages/pet/create')">
          <view class="func-icon warm-bg">➕</view>
          <text class="func-text">添加宠物</text>
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
        <view class="diary-card" v-for="item in diaryList" :key="item.id" @tap="navigateTo('/subPages/diary/detail?id=' + item.id)">
          <view class="diary-header">
            <view class="user-info">
              <c-avatar :src="item.pet?.avatar" :name="item.pet?.name" size="sm" />
              <view class="user-detail">
                <text class="user-name">{{ item.pet?.name || '未知' }}</text>
                <view class="user-tag orange-tag">{{ item.pet?.breed || '萌宠' }}</view>
              </view>
            </view>
            <text class="diary-time">{{ formatTime(item.createdAt) }}</text>
          </view>
          <text class="diary-content">{{ item.content }}</text>
        </view>
        <view class="empty-state" v-if="diaryList.length === 0">
          <text class="empty-text">暂无动态，快去写第一篇日记吧</text>
        </view>
      </view>
    </view>

    <!-- 推荐宠护师 -->
    <view class="provider-section">
      <view class="section-header">
        <text class="section-title">推荐宠护师</text>
        <view class="section-more" @tap="navigateTo('/subPages/user/provider-list')">
          <text class="more-text">更多</text>
          <text class="more-arrow">→</text>
        </view>
      </view>
      <scroll-view scroll-x class="provider-scroll">
        <view class="provider-card" v-for="p in topProviders" :key="p.id" @tap="navigateTo('/subPages/user/provider-profile?id=' + p.id)">
          <c-avatar :src="p.avatar" :name="p.nickname" size="md" />
          <text class="pv-name">{{ p.nickname }}</text>
          <text class="pv-rating">⭐{{ p.avgRating?.toFixed(1) || '新手上路' }}</text>
          <text class="pv-level">Lv.{{ p.level || 0 }} | {{ p.totalOrders || 0 }}单</text>
        </view>
        <view class="provider-card join" @tap="navigateTo('/subPages/user/qualification')">
          <text class="join-icon">🎓</text>
          <text class="pv-name">成为宠护师</text>
          <text class="pv-rating">接单赚钱</text>
        </view>
      </scroll-view>
    </view>

    <!-- 快速预约入口 -->
    <view class="quick-order" @tap="navigateTo('/subPages/order/create')">
      <view class="order-icon">🚀</view>
      <view class="order-info">
        <text class="order-title">一键预约服务</text>
        <text class="order-desc">选择宠护师，安心托付</text>
      </view>
      <text class="order-arrow">→</text>
    </view>

    <!-- 公告弹窗 -->
    <view class="notice-modal" v-if="showAnnouncement" @tap="showAnnouncement = false">
      <view class="notice-modal-content" @tap.stop>
        <text class="notice-modal-title">📢 平台公告</text>
        <scroll-view class="notice-list" scroll-y>
          <view class="notice-item" v-for="a in announcements" :key="a.id">
            <text class="notice-item-title">{{ a.title }}</text>
            <text class="notice-item-content">{{ a.content }}</text>
            <text class="notice-item-time">{{ a.createdAt?.slice(0,10) }}</text>
          </view>
        </scroll-view>
        <view class="notice-close" @tap="showAnnouncement = false"><text>关闭</text></view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-bottom"></view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { request } from '@/api/request';

const STATIC_ICONS = ['🐕', '🛁', '🐱', '💉', '🏠', '✂️', '🦴', '🧹'];

const announcements = ref([]);
const showAnnouncement = ref(false);
const diaryList = ref([]);
const services = ref([]);
const topServices = ref([]);
const topProviders = ref([]);
const stats = reactive({ petCount: '--', orderCount: '--', diaryCount: '--', favCount: '--' });

onShow(() => {
  // 并行加载首页所有数据
  Promise.all([loadAnnouncements(), loadStats(), loadServices(), loadDiaryFeed(), loadProviders()]);
});

async function loadAnnouncements() {
  try {
    const res = await request({ url: '/announcements' });
    announcements.value = res.data || [];
  } catch { /* ignore */ }
}

async function loadStats() {
  try {
    const res = await request({ url: '/users/me/stats' });
    const d = res.data || {};
    stats.petCount = d.petCount ?? '--';
    stats.orderCount = d.orderCount ?? '--';
    stats.diaryCount = d.diaryCount ?? '--';
    stats.favCount = d.favCount ?? '--';
  } catch { /* ignore */ }
}

async function loadServices() {
  try {
    const res = await request({ url: '/services' });
    const list = (res.data || []).map((s, i) => ({
      ...s,
      icon: STATIC_ICONS[i % STATIC_ICONS.length],
    }));
    services.value = list;
    topServices.value = list.slice(0, 2);
  } catch { /* ignore */ }
}

async function loadDiaryFeed() {
  try {
    const res = await request({ url: '/diaries/feed?pageSize=5' });
    diaryList.value = res.data?.list || [];
  } catch { /* ignore */ }
}

async function loadProviders() {
  try {
    const res = await request({ url: '/providers?pageSize=6' });
    topProviders.value = res.data?.list || [];
  } catch { /* ignore */ }
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return '刚刚';
  if (hours < 24) return hours + '小时前';
  return Math.floor(hours / 24) + '天前';
}

function navigateTo(url) {
  uni.navigateTo({ url });
}
function switchTab(url) {
  uni.switchTab({ url });
}
</script>

<style scoped lang="scss">
.page-home {
  min-height: 100vh;
  background: #FBF8F4;
  padding-bottom: env(safe-area-inset-bottom);
}

.top-banner {
  background: linear-gradient(135deg, var(--theme-primary) 0%, #F7C96E 100%);
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
  color: var(--theme-primary);
}

.more-arrow {
  font-size: 24rpx;
  color: var(--theme-primary);
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
  color: var(--theme-primary);
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

.avatar-img {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #FFF3E8;
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
    color: var(--theme-primary);
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

.provider-section { padding: 0 20rpx 20rpx; }
.provider-scroll { white-space: nowrap; padding: 8rpx 0; }
.provider-card { display: inline-flex; flex-direction: column; align-items: center; width: 160rpx; background: #fff; border-radius: 16rpx; padding: 20rpx 0; margin-right: 16rpx; box-shadow: 0 2rpx 12rpx rgba(213,155,106,0.08); }
.pv-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: #F5F0EA; margin-bottom: 10rpx; }
.pv-name { font-size: 26rpx; font-weight: 500; color: #2D2016; white-space: nowrap; max-width: 140rpx; overflow: hidden; text-overflow: ellipsis; }
.pv-rating { font-size: 22rpx; color: #E6A23C; margin-top: 2rpx; }
.pv-level { font-size: 20rpx; color: #9E8E7E; margin-top: 2rpx; }
.provider-card.join { background: linear-gradient(135deg, #FFF3E8, #FFF8E8); border: 2rpx dashed var(--theme-primary); }
.join-icon { font-size: 48rpx; margin-bottom: 8rpx; }

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
  color: var(--theme-primary);
}

/* 公告栏 */
.notice-bar {
  margin: 16rpx 20rpx; padding: 16rpx 20rpx;
  background: #FFF3E8; border-radius: 12rpx;
  display: flex; align-items: center; gap: 12rpx;
}
.notice-icon { font-size: 28rpx; }
.notice-text { flex: 1; font-size: 26rpx; color: var(--theme-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.notice-more { font-size: 22rpx; color: #9E8E7E; }
/* 公告弹窗 */
.notice-modal { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center; }
.notice-modal-content { width: 85%; max-height: 70vh; background: #fff; border-radius: 20rpx; padding: 32rpx; }
.notice-modal-title { font-size: 34rpx; font-weight: 600; color: #2D2016; display: block; margin-bottom: 20rpx; text-align: center; }
.notice-list { max-height: 50vh; }
.notice-item { padding: 16rpx 0; border-bottom: 1rpx solid #F5F0EA; }
.notice-item-title { font-size: 28rpx; font-weight: 500; color: #2D2016; display: block; }
.notice-item-content { font-size: 26rpx; color: #9E8E7E; display: block; margin: 8rpx 0; }
.notice-item-time { font-size: 22rpx; color: #C4B8AD; }
.notice-close { margin-top: 20rpx; text-align: center; padding: 16rpx; background: var(--theme-primary); color: #fff; border-radius: 40rpx; font-size: 28rpx; }

.safe-bottom {
  height: env(safe-area-inset-bottom);
}
</style>