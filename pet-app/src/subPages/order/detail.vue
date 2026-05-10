<template>
  <view class="page-order-detail" v-if="order">
    <!-- 状态标签 + 操作提示 -->
    <view class="status-bar" :class="statusClass(order.status)">
      <text class="status-text">{{ statusLabel(order.status) }}</text>
      <text class="status-hint" v-if="statusHint">{{ statusHint }}</text>
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
        <c-avatar :src="order.owner?.avatar" :name="order.owner?.nickname" size="sm" />
        <text>{{ order.owner?.nickname }}（宠主）</text>
      </view>
      <view class="user-row" v-if="order.provider" @tap="navigateTo('/subPages/user/provider-profile?id=' + order.provider.id)">
        <c-avatar :src="order.provider?.avatar" :name="order.provider?.nickname" size="sm" />
        <text>{{ order.provider?.nickname }}（宠护师）⭐{{ order.provider?.avgRating?.toFixed(1) }}</text>
        <text class="arrow">→</text>
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

    <!-- 申请列表（宠主视角，PENDING状态） -->
    <view class="info-card" v-if="!isProvider && order.status === 'PENDING' && applicants.length > 0">
      <text class="card-label">申请接单 ({{ applicants.length }}人)</text>
      <view class="applicant-item" v-for="a in applicants" :key="a.providerId">
        <c-avatar :src="a.avatar" :name="a.nickname" size="sm" @tap="navigateTo('/subPages/user/provider-profile?id=' + a.providerId)" />
        <view class="ap-info">
          <text class="ap-name">{{ a.nickname }}</text>
          <text class="ap-rating">⭐{{ a.avgRating?.toFixed(1) || '新手上路' }}</text>
        </view>
        <view class="btn small primary" @tap="handleSelect(a.providerId)">选择</view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <!-- 宠护师：开放订单→申请接单 -->
      <template v-if="isProvider && order.status === 'PENDING' && !order.providerId">
        <view v-if="!hasApplied" class="btn primary" @tap="handleApply">申请接单</view>
        <view v-else class="btn outline disabled">已申请，等待确认</view>
      </template>
      <!-- 宠护师：指定给你的订单→直接接单 -->
      <template v-if="isProvider && order.status === 'PENDING' && order.providerId === userStore.userInfo?.id">
        <view class="btn primary" @tap="handleAccept">接单</view>
        <view class="btn outline" @tap="handleReject('暂时无法接单')">拒单</view>
      </template>
      <!-- 宠护师：已接单时开始服务 -->
      <view v-if="isProvider && order.status === 'ACCEPTED'" class="btn primary" @tap="handleStart">开始服务</view>
      <!-- 宠护师：服务中时完成服务 -->
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
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { computed } from 'vue';
import { getOrderDetail, acceptOrder, rejectOrder, startService, completeService, cancelOrder } from '@/api/order';
import { useUserStore } from '@/store/user';
import { request } from '@/api/request';

const userStore = useUserStore();
const order = ref(null);
const showReject = ref(false);
const isProvider = ref(false);

const applicants = computed(() => order.value?.applicants || []);
const hasApplied = computed(() => {
  if (!order.value?.applicants) return false;
  return order.value.applicants.some(a => a.providerId === userStore.userInfo?.id);
});

onLoad(async (options) => {
  const res = await getOrderDetail(options.id);
  order.value = res.data;
  isProvider.value = userStore.userInfo?.id === res.data.providerId;
});

const statusLabel = (s) => ({ PENDING:'待接单', ACCEPTED:'已接单', IN_PROGRESS:'服务中', COMPLETED:'已完成', CANCELLED:'已取消', DISPUTE:'申诉中' }[s] || s);
const statusClass = (s) => ({ PENDING:'warn', ACCEPTED:'info', IN_PROGRESS:'primary', COMPLETED:'success', CANCELLED:'', DISPUTE:'danger' }[s] || '');
const statusHint = computed(() => {
  if (!order.value) return '';
  const s = order.value.status;
  const isOwner = !isProvider.value;
  const hints = {
    PENDING: isOwner ? (order.value.providerId ? '等待宠护师接单' : '开放中，等待宠护师申请') : (order.value.providerId === userStore.userInfo?.id ? '已指定给你，请尽快接单' : '你可申请接单'),
    ACCEPTED: isOwner ? '宠护师已接单，等待上门服务' : '请按时上门开始服务',
    IN_PROGRESS: isOwner ? '服务进行中' : '请在服务完成后提交总结',
    COMPLETED: '订单已完成，可评价',
    CANCELLED: '订单已取消',
    DISPUTE: '申诉处理中',
  };
  return hints[s] || '';
});
const timeSlotLabel = (s) => ({ morning:'上午', afternoon:'下午', evening:'晚上' }[s] || s);

async function handleApply() {
  try {
    await request({ url: `/orders/${order.value.id}/apply`, method: 'POST' });
    // 刷新数据
    const res = await getOrderDetail(order.value.id);
    order.value = res.data;
    uni.showToast({ title: '已申请', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: e.message || '申请失败', icon: 'none' });
  }
}

async function handleSelect(providerId) {
  uni.showModal({
    title: '确认选择',
    content: '确定选择该宠护师？选择后其他申请将失效。',
    success: async (res) => {
      if (res.confirm) {
        await request({ url: `/orders/${order.value.id}/select`, method: 'POST', data: { providerId } });
        const detail = await getOrderDetail(order.value.id);
        order.value = detail.data;
        uni.showToast({ title: '已选择宠护师', icon: 'success' });
      }
    },
  });
}

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
  uni.showModal({
    title: '完成服务', content: '确认已完成服务？完成后订单将自动结算。', editable: true, placeholderText: '服务总结（可选）',
    success: async (res) => {
      if (res.confirm) {
        await completeService(order.value.id, { summary: res.content || '' });
        order.value.status = 'COMPLETED';
        uni.showToast({ title: '服务完成', icon: 'success' });
      }
    },
  });
}

async function handleCancel() {
  const isPaid = order.value.status === 'PAID';
  const warnText = isPaid ? '已付款订单取消后将自动解冻押金，确认取消？' : '确定取消该订单？';
  uni.showModal({
    title: '取消订单', content: warnText, editable: true, placeholderText: '请填写取消原因',
    success: async (res) => {
      if (res.confirm) {
        await cancelOrder(order.value.id, res.content || '用户取消');
        order.value.status = 'CANCELLED';
        uni.showToast({ title: isPaid ? '已取消，押金已解冻' : '已取消', icon: 'success' });
      }
    },
  });
}

async function handleReject(reason) {
  try {
    await rejectOrder(order.value.id, reason);
    uni.showToast({ title: '已拒单', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 800);
  } catch (e) {
    uni.showToast({ title: e.message || '操作失败', icon: 'none' });
  }
}

function openChat() {
  uni.navigateTo({ url: `/subPages/chat/room?orderId=${order.value.id}` });
}

function previewImage(url) {
  uni.previewImage({ urls: [url] });
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
.status-text { font-size: var(--font-xl); font-weight: bold; display: block; }
.status-hint { font-size: 24rpx; display: block; margin-top: 8rpx; opacity: 0.8; }
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
