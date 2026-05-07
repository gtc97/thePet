<template>
  <view class="page-service">
    <view class="page-header">
      <view class="header-content">
        <text class="main-title">服务</text>
        <view class="book-btn" @tap="navigateTo('/subPages/order/create')">
          <image src="/static/image/svg26.png" mode="aspectFit" class="book-icon" />
          <text class="book-text">预约</text>
        </view>
      </view>
    </view>

    <view class="service-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @tap="activeTab = tab.value"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <view class="quick-entry">
      <view class="entry-card" @tap="navigateTo('/subPages/order/create')">
        <view class="entry-icon-wrapper">
          <text class="entry-icon">1</text>
        </view>
        <view class="entry-info">
          <text class="entry-title">上门服务</text>
          <text class="entry-desc">专业人员到家服务</text>
        </view>
        <image src="/static/image/svg25.png" mode="aspectFit" class="entry-arrow" />
      </view>
    </view>

    <scroll-view class="service-list" scroll-y>
      <view class="service-card" v-for="service in services" :key="service.id" @tap="navigateTo('/subPages/order/detail?id=' + service.id)">
        <view class="card-header">
          <view class="service-name-row">
            <text class="service-name">{{ service.name }}</text>
            <view class="hot-tag" v-if="service.isHot">热门</view>
          </view>
        </view>

        <view class="card-body">
          <view class="provider-info">
            <view class="provider-avatar">
              <text>{{ service.providerAvatar }}</text>
            </view>
            <view class="provider-detail">
              <text class="provider-name">{{ service.providerName }}</text>
              <view class="provider-rating">
                <text class="star">★</text>
                <text class="rating-value">{{ service.rating }}</text>
              </view>
            </view>
            <view class="price-info">
              <text class="price">¥{{ service.price }}</text>
              <text class="price-unit">/{{ service.unit }}</text>
            </view>
          </view>

          <view class="service-tags">
            <text class="tag" v-for="tag in service.tags" :key="tag">{{ tag }}</text>
          </view>

          <view class="card-footer">
            <text class="service-desc">{{ service.desc }}</text>
          </view>
        </view>

        <view class="book-action">
          <view class="book-btn-small">立即预约</view>
        </view>
      </view>

      <view class="empty-state" v-if="services.length === 0">
        <text class="empty-icon">🛒</text>
        <text class="empty-text">暂无服务</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

const activeTab = ref('all');
const tabs = [
  { label: '全部', value: 'all' },
  { label: '上门服务', value: 'home' },
  { label: '到店服务', value: 'store' },
  { label: '寄养服务', value: 'boarding' },
];

const services = ref([
  {
    id: '1',
    name: '专业宠物美容',
    isHot: true,
    providerAvatar: 'A',
    providerName: '张师傅',
    rating: '4.9',
    price: '128',
    unit: '次',
    tags: ['洗护', '剪毛', '造型'],
    desc: '专业美容师一对一服务，让您的宠物焕然一新'
  },
  {
    id: '2',
    name: '宠物健康体检',
    isHot: false,
    providerAvatar: 'B',
    providerName: '李医生',
    rating: '4.8',
    price: '198',
    unit: '次',
    tags: ['体检', '疫苗', '驱虫'],
    desc: '全面健康检查，关爱宠物健康'
  },
  {
    id: '3',
    name: '宠物寄养',
    isHot: true,
    providerAvatar: 'C',
    providerName: '王阿姨',
    rating: '4.7',
    price: '68',
    unit: '天',
    tags: ['寄养', '看护', '喂养'],
    desc: '温馨家庭式寄养，让宠物不再孤单'
  }
]);

function navigateTo(url) {
  uni.navigateTo({ url });
}
</script>

<style scoped lang="scss">
.page-service {
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
  justify-content: space-between;
  align-items: center;
}

.main-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #2D2016;
}

.book-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #F5895A;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
}

.book-icon {
  width: 32rpx;
  height: 32rpx;
}

.book-text {
  font-size: 28rpx;
  color: #fff;
  font-weight: 600;
}

.service-tabs {
  display: flex;
  padding: 0 32rpx 24rpx;
  gap: 16rpx;
}

.tab-item {
  padding: 12rpx 28rpx;
  border-radius: 32rpx;
  font-size: 28rpx;
  background: #F5F0EA;
  color: #9E8E7E;
  transition: all 0.3s;

  &.active {
    background: #F5895A;
    color: #fff;
  }
}

.quick-entry {
  padding: 0 32rpx 24rpx;
}

.entry-card {
  display: flex;
  align-items: center;
  background: #FFF3E8;
  border-radius: 16rpx;
  padding: 20rpx;
}

.entry-icon-wrapper {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(245, 137, 90, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.entry-icon {
  font-size: 28rpx;
  color: #F5895A;
  font-weight: 600;
}

.entry-info {
  flex: 1;
}

.entry-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2D2016;
  display: block;
  margin-bottom: 4rpx;
}

.entry-desc {
  font-size: 24rpx;
  color: #9E8E7E;
}

.entry-arrow {
  width: 32rpx;
  height: 32rpx;
}

.service-list {
  flex: 1;
  width: 100%;
  padding: 0 32rpx;
  padding-bottom: 180rpx;
  box-sizing: border-box;
}

.service-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx 24rpx 0;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 32rpx rgba(213, 155, 106, 0.12);
}

.card-header {
  margin-bottom: 16rpx;
}

.service-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.service-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #2D2016;
}

.hot-tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  background: #E8FBF5;
  color: #7ECFB3;
  border-radius: 20rpx;
}

.card-body {
  margin-bottom: 16rpx;
}

.provider-info {
  display: flex;
  align-items: center;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #F5F0EA;
}

.provider-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #F5F0EA;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.provider-detail {
  flex: 1;
}

.provider-name {
  font-size: 28rpx;
  color: #2D2016;
  display: block;
  margin-bottom: 4rpx;
}

.provider-rating {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.star {
  font-size: 24rpx;
  color: #F7C96E;
}

.rating-value {
  font-size: 24rpx;
  color: #9E8E7E;
}

.price-info {
  text-align: right;
}

.price {
  font-size: 32rpx;
  font-weight: 700;
  color: #2D2016;
}

.price-unit {
  font-size: 24rpx;
  color: #9E8E7E;
}

.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  padding: 16rpx 0;
}

.tag {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  background: #FFF3E8;
  color: #8B4513;
  border-radius: 20rpx;
}

.card-footer {
  padding-top: 8rpx;
}

.service-desc {
  font-size: 26rpx;
  color: #9E8E7E;
  line-height: 1.5;
}

.book-action {
  padding: 16rpx 0 24rpx;
}

.book-btn-small {
  // width: 100%;
  text-align: center;
  padding: 20rpx;
  background: #F5895A;
  color: #fff;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
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