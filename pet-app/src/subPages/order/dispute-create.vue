<template>
  <view class="page-dispute">
    <view class="section">
      <text class="section-title">申诉类型</text>
      <view class="type-grid">
        <view v-for="t in types" :key="t.value" class="type-item"
          :class="{ active: form.type === t.value }" @tap="form.type = t.value">{{ t.label }}</view>
      </view>
    </view>

    <view class="section">
      <text class="section-title">申诉原因</text>
      <input class="form-input" v-model="form.reason" placeholder="简述你的问题" maxlength="200" />
    </view>

    <view class="section">
      <text class="section-title">详细说明</text>
      <textarea class="form-textarea" v-model="form.description" placeholder="详细描述遇到的问题" :maxlength="1000" />
    </view>

    <view class="submit-btn" @tap="handleSubmit"><text>提交申诉</text></view>
  </view>
</template>

<script setup>
import { ref, reactive, onLoad } from '@dcloudio/uni-app';
import { createDispute } from '@/api/review';

const orderId = ref('');

const types = [
  { value: 'service_quality', label: '服务质量差' },
  { value: 'damage', label: '物品损坏' },
  { value: 'no_show', label: '未按时到达' },
  { value: 'other', label: '其他问题' },
];

const form = reactive({ type: '', reason: '', description: '' });

onLoad((options) => { orderId.value = options.orderId || ''; });

async function handleSubmit() {
  if (!form.type) return uni.showToast({ title: '请选择申诉类型', icon: 'none' });
  if (!form.reason) return uni.showToast({ title: '请填写申诉原因', icon: 'none' });
  try {
    await createDispute(orderId.value, form);
    uni.showToast({ title: '申诉已提交', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 800);
  } catch (e) {
    uni.showToast({ title: e.message || '提交失败', icon: 'none' });
  }
}
</script>

<style scoped lang="scss">
.page-dispute { min-height: 100vh; background: var(--bg-page); }
.section { background: var(--bg-white); padding: 24rpx 32rpx; margin-bottom: 16rpx; }
.section-title { font-size: var(--font-lg); font-weight: 600; display: block; margin-bottom: 16rpx; }
.type-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.type-item { padding: 16rpx 28rpx; border: 2rpx solid var(--border-color); border-radius: 8rpx; font-size: var(--font-md); }
.type-item.active { border-color: var(--theme-primary); background: var(--theme-primary-light); color: var(--theme-primary); }
.form-input { width: 100%; height: 80rpx; border: 2rpx solid var(--border-color); border-radius: 8rpx; padding: 0 20rpx; font-size: var(--font-md); box-sizing: border-box; }
.form-textarea { width: 100%; height: 200rpx; border: 2rpx solid var(--border-color); border-radius: 8rpx; padding: 16rpx; font-size: var(--font-md); box-sizing: border-box; }
.submit-btn { margin: 40rpx 32rpx; background: var(--theme-primary); color: #fff; text-align: center; padding: 24rpx; border-radius: var(--border-radius-round); font-size: var(--font-lg); font-weight: 600; }
</style>
