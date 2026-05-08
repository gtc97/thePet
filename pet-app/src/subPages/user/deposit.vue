<template>
  <view class="page-deposit">
    <view class="header"><text class="title">押金中心</text></view>

    <view class="status-card">
      <text class="status-label">押金状态</text>
      <text class="status-value" :class="statusClass(deposit.status)">{{ statusLabel(deposit.status) }}</text>
      <text class="amount">¥{{ deposit.amount || '0.00' }}</text>
    </view>

    <view class="actions" v-if="deposit.status === 'UNPAID'">
      <view class="btn primary" @tap="handlePay"><text>缴纳押金 ¥100.00</text></view>
    </view>

    <view class="section">
      <text class="section-title">流水明细</text>
      <view v-if="logs.length === 0"><text class="empty">暂无记录</text></view>
      <view class="log-item" v-for="log in logs" :key="log.id">
        <view>
          <text class="log-action">{{ actionLabel(log.action) }}</text>
          <text class="log-remark" v-if="log.remark">{{ log.remark }}</text>
        </view>
        <text class="log-amount" :class="{ plus: log.action === 'pay' || log.action === 'unfreeze' }">
          {{ log.action === 'pay' ? '+' : '-' }}¥{{ log.amount }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onShow } from '@dcloudio/uni-app';
import { getDepositStatus, payDeposit, getDepositLogs } from '@/api/deposit';

const deposit = reactive({ status: 'UNPAID', amount: 0 });
const logs = ref([]);

onShow(async () => {
  try {
    const res = await getDepositStatus();
    if (res.data) { deposit.status = res.data.status; deposit.amount = res.data.amount; }
    const logRes = await getDepositLogs();
    logs.value = logRes.data || [];
  } catch { /* ignore */ }
});

const statusLabel = (s) => ({ UNPAID:'未缴纳', PAID:'已缴纳', FROZEN:'冻结中', REFUNDING:'退款中', REFUNDED:'已退款', FORFEITED:'已罚没' }[s] || s);
const statusClass = (s) => ({ UNPAID:'warn', PAID:'success', FROZEN:'info', REFUNDED:'', FORFEITED:'danger' }[s] || '');
const actionLabel = (a) => ({ pay:'缴纳', freeze:'冻结', unfreeze:'解冻', forfeit:'罚没', refund:'退款' }[a] || a);

async function handlePay() {
  try {
    uni.showLoading({ title: '支付中...' });
    await payDeposit(100);
    deposit.status = 'PAID';
    deposit.amount = 100;
    uni.hideLoading();
    uni.showToast({ title: '押金缴纳成功', icon: 'success' });
    const logRes = await getDepositLogs();
    logs.value = logRes.data || [];
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '支付失败', icon: 'none' });
  }
}
</script>

<style scoped lang="scss">
.page-deposit { min-height: 100vh; background: var(--bg-page); }
.header { padding: 24rpx 32rpx; background: var(--bg-white); }
.title { font-size: var(--font-xl); font-weight: bold; }
.status-card { text-align: center; padding: 60rpx 32rpx; background: var(--bg-white); margin: 16rpx 0; }
.status-label { font-size: var(--font-sm); color: var(--text-secondary); display: block; }
.status-value { font-size: var(--font-xl); font-weight: bold; display: block; margin: 12rpx 0; }
.status-value.success { color: var(--color-success); }
.status-value.warn { color: var(--color-warning); }
.status-value.info { color: var(--theme-primary); }
.status-value.danger { color: var(--color-danger); }
.amount { font-size: var(--font-xxl); font-weight: bold; color: var(--color-danger); margin-top: 8rpx; }
.actions { padding: 0 32rpx; }
.btn { width: 100%; text-align: center; padding: 24rpx; border-radius: var(--border-radius-round); font-size: var(--font-lg); font-weight: 600; }
.btn.primary { background: var(--theme-primary); color: #fff; }
.section { background: var(--bg-white); margin: 16rpx 0; padding: 24rpx 32rpx; }
.section-title { font-size: var(--font-lg); font-weight: 600; display: block; margin-bottom: 16rpx; }
.empty { color: var(--text-placeholder); font-size: var(--font-sm); }
.log-item { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #f5f7fa; }
.log-action { font-size: var(--font-md); display: block; }
.log-remark { font-size: var(--font-xs); color: var(--text-secondary); display: block; margin-top: 4rpx; }
.log-amount { font-size: var(--font-md); font-weight: 600; color: var(--text-primary); }
.log-amount.plus { color: var(--color-success); }
</style>
