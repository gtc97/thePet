<template>
  <view class="page-service">
    <view class="page-header">
      <view class="header-content">
        <text class="main-title">{{ isProvider ? '接单' : '服务' }}</text>
        <view class="book-btn" v-if="!isProvider" @tap="navigateTo('/subPages/order/create')">
          <text class="book-text">+ 预约</text>
        </view>
        <view class="book-btn" v-if="isProvider" @tap="switchView">
          <text class="book-text">{{ showNearby ? '我的订单' : '附近订单' }}</text>
        </view>
      </view>
    </view>

    <!-- 状态筛选Tab -->
    <view class="service-tabs">
      <view v-for="tab in tabs" :key="tab.value" class="tab-item"
        :class="{ active: activeTab === tab.value }" @tap="activeTab = tab.value; loadOrders()">
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view class="service-list" scroll-y @scrolltolower="loadMore">
      <view class="order-card" v-for="order in orders" :key="order.id"
        @tap="navigateTo('/subPages/order/detail?id=' + order.id)">
        <view class="card-header">
          <text class="order-no">#{{ order.orderNo }}</text>
          <text class="order-status" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</text>
        </view>
        <view class="card-body">
          <view class="order-info-row">
            <text class="order-type">{{ order.serviceType }}</text>
            <text class="order-price">¥{{ order.price }}</text>
          </view>
          <text class="order-date">{{ order.scheduledDate?.slice(0,10) }} {{ timeSlotLabel(order.timeSlot) }}</text>
          <text class="order-addr">{{ order.address }}</text>
        </view>
        <view class="card-footer" v-if="!showNearby">
          <text>{{ isProvider ? '宠主：' + order.owner?.nickname : '师傅：' + (order.provider?.nickname || '待接单') }}</text>
        </view>
      </view>

      <view class="empty-state" v-if="orders.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">{{ isProvider ? '暂无附近订单' : '暂无订单' }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getOrders, getNearbyOrders } from '@/api/order';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const isProvider = ref(false);
const showNearby = ref(false);
const activeTab = ref('all');
const orders = ref([]);
const page = ref(1);

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待接单', value: 'PENDING' },
  { label: '服务中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
];

const statusLabel = (s) => ({ PENDING:'待接单', ACCEPTED:'已接单', IN_PROGRESS:'服务中', COMPLETED:'已完成', CANCELLED:'已取消', DISPUTE:'申诉中' }[s] || s);
const statusClass = (s) => ({ PENDING:'warn', ACCEPTED:'info', IN_PROGRESS:'primary', COMPLETED:'success', CANCELLED:'', DISPUTE:'danger' }[s] || '');
const timeSlotLabel = (s) => ({ morning:'上午', afternoon:'下午', evening:'晚上' }[s] || s);

onShow(async () => {
  isProvider.value = userStore.isProvider;
  await loadOrders();
});

async function loadOrders() {
  try {
    const params = {};
    if (activeTab.value !== 'all') params.status = activeTab.value;
    if (isProvider.value) params.role = 'SERVICE_PROVIDER';
    const res = showNearby.value ? await getNearbyOrders(page.value) : await getOrders(params);
    orders.value = res.data?.list || [];
  } catch { /* ignore */ }
}

function loadMore() {
  page.value++;
  loadOrders();
}

function switchView() {
  showNearby.value = !showNearby.value;
  page.value = 1;
  loadOrders();
}

function navigateTo(url) { uni.navigateTo({ url }); }
</script>

<style scoped lang="scss">
.page-service { min-height: 100vh; background: #FBF8F4; display: flex; flex-direction: column; }
.page-header { padding: 60rpx 32rpx 24rpx; background: #FBF8F4; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
.main-title { font-size: 40rpx; font-weight: 700; color: #2D2016; }
.book-btn { display: flex; align-items: center; gap: 8rpx; background: var(--theme-primary, #F5895A); padding: 12rpx 24rpx; border-radius: 32rpx; }
.book-text { font-size: 28rpx; color: #fff; font-weight: 600; }
.service-tabs { display: flex; padding: 0 32rpx 24rpx; gap: 16rpx; }
.tab-item { padding: 12rpx 28rpx; border-radius: 32rpx; font-size: 28rpx; background: #F5F0EA; color: #9E8E7E; }
.tab-item.active { background: var(--theme-primary, #F5895A); color: #fff; }
.service-list { flex: 1; padding: 0 32rpx; padding-bottom: 180rpx; }
.order-card { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: 0 2rpx 16rpx rgba(213,155,106,0.08); }
.card-header { display: flex; justify-content: space-between; margin-bottom: 12rpx; }
.order-no { font-size: 22rpx; color: #9E8E7E; }
.order-status { font-size: 24rpx; padding: 4rpx 12rpx; border-radius: 12rpx; }
.order-status.warn { background: #FDF6EC; color: #E6A23C; }
.order-status.info { background: var(--theme-primary-light, #F5EDE3); color: var(--theme-primary, #C8956C); }
.order-status.primary { background: var(--theme-primary-light, #F5EDE3); color: var(--theme-primary, #C8956C); }
.order-status.success { background: #F0F9EB; color: #67C23A; }
.order-status.danger { background: #FEF0F0; color: #F56C6C; }
.order-info-row { display: flex; justify-content: space-between; margin-bottom: 8rpx; }
.order-type { font-size: 30rpx; font-weight: 600; }
.order-price { font-size: 32rpx; font-weight: 700; color: #2D2016; }
.order-date, .order-addr { font-size: 24rpx; color: #9E8E7E; display: block; margin-top: 4rpx; }
.card-footer { margin-top: 12rpx; padding-top: 12rpx; border-top: 1rpx solid #F5F0EA; font-size: 24rpx; color: #9E8E7E; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 120rpx 0; }
.empty-icon { font-size: 80rpx; margin-bottom: 16rpx; }
.empty-text { font-size: 28rpx; color: #9E8E7E; }
</style>
