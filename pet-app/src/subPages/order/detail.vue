<template>
  <view class="page-order-detail" v-if="order">
    <!-- 状态标签 -->
    <view class="status-bar" :class="statusClass(order.status)">
      <text class="status-text">{{ statusLabel(order.status) }}</text>
    </view>

    <!-- 订单基本信息 -->
    <view class="info-card">
      <text class="order-no">订单号：{{ order.orderNo }}</text>
      <text class="order-service">服务：{{ order.serviceType }}</text>
      <text class="order-date">预约：{{ order.scheduledDate?.slice(0,10) }} {{ timeSlotLabel(order.timeSlot) }}</text>
      <text class="order-addr">地址：{{ order.address }}</text>
      <text class="order-price">¥{{ order.price }}</text>
    </view>

    <!-- 人员信息 -->
    <view class="info-card">
      <view class="user-row">
        <image class="avatar" :src="order.owner?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <text>{{ order.owner?.nickname }}（宠主）</text>
      </view>
      <view class="user-row" v-if="order.provider">
        <image class="avatar" :src="order.provider?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <text>{{ order.provider?.nickname }}（师傅）⭐{{ order.provider?.avgRating?.toFixed(1) }}</text>
      </view>
    </view>

    <!-- 备注 -->
    <view class="info-card" v-if="order.ownerNote">
      <text class="card-label">宠主备注</text>
      <text>{{ order.ownerNote }}</text>
    </view>
    <view class="info-card" v-if="order.providerNote">
      <text class="card-label">服务总结</text>
      <text>{{ order.providerNote }}</text>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <!-- 师傅：待接单时可接单/拒单 -->
      <template v-if="isProvider && order.status === 'PENDING'">
        <view class="btn primary" @tap="handleAccept">接单</view>
        <view class="btn outline" @tap="showReject = true">拒单</view>
      </template>
      <!-- 师傅：已接单时开始服务 -->
      <view v-if="isProvider && order.status === 'ACCEPTED'" class="btn primary" @tap="handleStart">开始服务</view>
      <!-- 师傅：服务中时完成服务 -->
      <view v-if="isProvider && order.status === 'IN_PROGRESS'" class="btn primary" @tap="handleComplete">完成服务</view>
      <!-- 双方：待接单/已接单时可取消 -->
      <view v-if="['PENDING','ACCEPTED'].includes(order.status)" class="btn danger" @tap="handleCancel">取消订单</view>
      <!-- 聊天入口 -->
      <view v-if="['ACCEPTED','IN_PROGRESS','COMPLETED'].includes(order.status)" class="btn outline" @tap="openChat">💬 私聊</view>
      <!-- 评价入口 -->
      <view v-if="order.status === 'COMPLETED'" class="btn outline" @tap="navigateTo('/subPages/order/review-create?orderId=' + order.id)">⭐ 评价</view>
      <!-- 申诉入口 -->
      <view class="btn outline" @tap="navigateTo('/subPages/order/dispute-create?orderId=' + order.id)">⚠️ 申诉</view>
    </view>

    <!-- 拒单弹窗 -->
    <view class="modal" v-if="showReject">
      <view class="modal-content">
        <text class="modal-title">拒单原因</text>
        <view class="reasons">
          <view v-for="r in rejectReasons" :key="r" class="reason-item" @tap="handleReject(r)">{{ r }}</view>
        </view>
        <view class="btn outline" @tap="showReject = false">取消</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onLoad } from '@dcloudio/uni-app';
import { getOrderDetail, acceptOrder, rejectOrder, startService, completeService, cancelOrder } from '@/api/order';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const order = ref(null);
const showReject = ref(false);
const isProvider = ref(false);

const rejectReasons = ['时间不合适', '距离太远', '已有其他安排', '订单信息不明确'];

onLoad(async (options) => {
  const res = await getOrderDetail(options.id);
  order.value = res.data;
  isProvider.value = userStore.userInfo?.id === res.data.providerId;
});

const statusLabel = (s) => ({ PENDING:'待接单', ACCEPTED:'已接单', IN_PROGRESS:'服务中', COMPLETED:'已完成', CANCELLED:'已取消', DISPUTE:'申诉中' }[s] || s);
const statusClass = (s) => ({ PENDING:'warn', ACCEPTED:'info', IN_PROGRESS:'primary', COMPLETED:'success', CANCELLED:'', DISPUTE:'danger' }[s] || '');
const timeSlotLabel = (s) => ({ morning:'上午', afternoon:'下午', evening:'晚上' }[s] || s);

async function handleAccept() {
  await acceptOrder(order.value.id);
  order.value.status = 'ACCEPTED';
  uni.showToast({ title: '已接单', icon: 'success' });
}

async function handleStart() {
  await startService(order.value.id);
  order.value.status = 'IN_PROGRESS';
  uni.showToast({ title: '服务已开始', icon: 'success' });
}

async function handleComplete() {
  await completeService(order.value.id, { summary: '服务已完成' });
  order.value.status = 'COMPLETED';
  uni.showToast({ title: '服务已完成', icon: 'success' });
}

async function handleCancel() {
  uni.showModal({
    title: '取消订单', content: '确定取消？', editable: true, placeholderText: '请填写取消原因',
    success: async (res) => {
      if (res.confirm) {
        await cancelOrder(order.value.id, res.content || '用户取消');
        order.value.status = 'CANCELLED';
        uni.showToast({ title: '已取消', icon: 'success' });
      }
    },
  });
}

async function handleReject(reason) {
  showReject.value = false;
  await rejectOrder(order.value.id, reason);
  uni.showToast({ title: '已拒单', icon: 'success' });
  setTimeout(() => uni.navigateBack(), 800);
}

function openChat() {
  uni.navigateTo({ url: `/subPages/chat/room?orderId=${order.value.id}` });
}

function navigateTo(url) { uni.navigateTo({ url }); }
</script>

<style scoped lang="scss">
.page-order-detail { background: var(--bg-page); min-height: 100vh; padding-bottom: 40rpx; }
.status-bar { padding: 40rpx 32rpx; text-align: center; }
.status-bar.warn { background: #FDF6EC; color: var(--color-warning); }
.status-bar.info { background: var(--theme-primary-light); color: var(--theme-primary); }
.status-bar.primary { background: var(--theme-primary-light); color: var(--theme-primary); }
.status-bar.success { background: #F0F9EB; color: var(--color-success); }
.status-bar.danger { background: #FEF0F0; color: var(--color-danger); }
.status-text { font-size: var(--font-xl); font-weight: bold; }
.info-card { background: var(--bg-white); margin: 16rpx 32rpx; padding: 24rpx; border-radius: var(--border-radius); }
.order-no { font-size: var(--font-xs); color: var(--text-secondary); display: block; }
.order-service, .order-date, .order-addr { font-size: var(--font-md); display: block; margin-top: 8rpx; }
.order-price { font-size: var(--font-xl); color: var(--color-danger); font-weight: bold; margin-top: 12rpx; }
.user-row { display: flex; align-items: center; gap: 12rpx; margin-bottom: 12rpx; font-size: var(--font-md); }
.avatar { width: 50rpx; height: 50rpx; border-radius: 50%; background: #e8e8e8; }
.card-label { font-size: var(--font-xs); color: var(--text-secondary); display: block; margin-bottom: 4rpx; }
.actions { padding: 24rpx 32rpx; display: flex; flex-wrap: wrap; gap: 16rpx; }
.btn { flex: 1; min-width: 45%; text-align: center; padding: 20rpx; border-radius: var(--border-radius); font-size: var(--font-md); }
.btn.primary { background: var(--theme-primary); color: #fff; }
.btn.outline { border: 2rpx solid var(--border-color); color: var(--text-regular); }
.btn.danger { background: #FEF0F0; color: var(--color-danger); }
.modal { position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; justify-content: center; z-index: 999; }
.modal-content { width: 100%; background: #fff; border-radius: 24rpx 24rpx 0 0; padding: 32rpx; }
.modal-title { font-size: var(--font-lg); font-weight: 600; display: block; margin-bottom: 20rpx; text-align: center; }
.reason-item { padding: 20rpx; text-align: center; border-bottom: 1rpx solid #f0f0f0; font-size: var(--font-md); }
</style>
