<template>
  <view class="page-order">
    <!-- 身份感知头部 -->
    <view class="order-header">
      <text class="header-title">
        {{ userStore.isProvider ? '接单大厅' : '我的订单' }}
      </text>
    </view>

    <!-- 订单状态Tab -->
    <view class="status-tabs">
      <view
        v-for="tab in tabs" :key="tab.value"
        class="tab-item" :class="{ active: activeTab === tab.value }"
        @tap="activeTab = tab.value"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list" v-if="orders.length > 0">
      <view class="order-card" v-for="order in orders" :key="order.id" @tap="navigateTo('/subPages/order/detail?id=' + order.id)">
        <view class="order-top">
          <text class="order-no">{{ order.orderNo }}</text>
          <text class="order-status">{{ statusLabel(order.status) }}</text>
        </view>
        <view class="order-body">
          <text class="order-service">{{ order.serviceType }}</text>
          <text class="order-date">{{ order.scheduledDate }} {{ order.timeSlot }}</text>
        </view>
        <view class="order-bottom">
          <text class="order-price">¥{{ order.price }}</text>
        </view>
      </view>
    </view>

    <c-empty-state v-else text="暂无订单" />

    <!-- 下单按钮（宠物主身份） -->
    <view class="create-btn" v-if="userStore.isOwner" @tap="navigateTo('/subPages/order/create')">
      <text>+ 预约上门</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/store/user';
const userStore = useUserStore();

const activeTab = ref('all');
const tabs = [
  { label: '全部', value: 'all' },
  { label: '待接单', value: 'PENDING' },
  { label: '服务中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
];

const orders = ref([]);

const statusLabel = (s) => ({
  PENDING: '待接单', ACCEPTED: '已接单', IN_PROGRESS: '服务中',
  COMPLETED: '已完成', CANCELLED: '已取消', DISPUTE: '申诉中',
}[s] || s);

function navigateTo(url) {
  uni.navigateTo({ url });
}
</script>

<style scoped lang="scss">
.page-order { padding-bottom: 100rpx; }
.order-header { padding: 40rpx 32rpx 20rpx; }
.header-title { font-size: 40rpx; font-weight: bold; color: #303133; }
.status-tabs { display: flex; padding: 0 32rpx 20rpx; gap: 24rpx; }
.tab-item { font-size: 28rpx; color: #909399; padding: 8rpx 0; }
.tab-item.active { color: #409EFF; font-weight: 600; border-bottom: 4rpx solid #409EFF; }
.order-list { padding: 0 32rpx; }
.order-card { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
.order-top { display: flex; justify-content: space-between; margin-bottom: 12rpx; }
.order-no { font-size: 24rpx; color: #909399; }
.order-status { font-size: 24rpx; color: #409EFF; }
.order-body { margin-bottom: 12rpx; }
.order-service { font-size: 28rpx; color: #303133; display: block; margin-bottom: 4rpx; }
.order-date { font-size: 24rpx; color: #909399; }
.order-bottom { text-align: right; }
.order-price { font-size: 32rpx; color: #F56C6C; font-weight: 600; }
.create-btn {
  position: fixed; bottom: 32rpx; left: 64rpx; right: 64rpx;
  background: #409EFF; color: #fff; text-align: center; padding: 24rpx;
  border-radius: 48rpx; font-size: 30rpx; box-shadow: 0 4px 16px rgba(64,158,255,0.4);
}
</style>
