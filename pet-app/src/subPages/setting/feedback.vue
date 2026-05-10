<template>
  <view class="page-feedback">
    <view class="section">
      <text class="section-title">反馈类型</text>
      <view class="type-row">
        <view v-for="t in types" :key="t.value" class="type-item" :class="{ active: form.type === t.value }" @tap="form.type = t.value">{{ t.label }}</view>
      </view>
    </view>
    <view class="section">
      <text class="section-title">详细描述</text>
      <textarea class="textarea" v-model="form.content" placeholder="请详细描述你的问题或建议..." :maxlength="1000" />
    </view>
    <view class="section">
      <text class="section-title">联系方式（选填）</text>
      <input class="input" v-model="form.contact" placeholder="手机号或微信号，方便我们联系你" maxlength="50" />
    </view>
    <view class="submit-btn" @tap="handleSubmit"><text>提交反馈</text></view>
  </view>
</template>

<script setup>
import { reactive } from 'vue';
import { request } from '@/api/request';

const types = [
  { value: 'bug', label: 'Bug反馈' },
  { value: 'suggestion', label: '功能建议' },
  { value: 'complaint', label: '投诉' },
  { value: 'other', label: '其他' },
];
const form = reactive({ type: 'bug', content: '', contact: '' });

async function handleSubmit() {
  if (!form.content.trim()) return uni.showToast({ title: '请填写描述', icon: 'none' });
  try {
    await request({ url: '/feedback', method: 'POST', data: form });
    uni.showToast({ title: '感谢反馈！', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1000);
  } catch (e) {
    uni.showToast({ title: e.message || '提交失败', icon: 'none' });
  }
}
</script>

<style scoped lang="scss">
.page-feedback { min-height: 100vh; background: #FBF8F4; }
.section { background: #fff; padding: 24rpx 32rpx; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #2D2016; display: block; margin-bottom: 16rpx; }
.type-row { display: flex; gap: 16rpx; flex-wrap: wrap; }
.type-item { padding: 12rpx 24rpx; border: 2rpx solid #F5F0EA; border-radius: 24rpx; font-size: 26rpx; color: #9E8E7E; }
.type-item.active { border-color: var(--theme-primary); color: var(--theme-primary); background: #FFF3E8; }
.textarea { width: 100%; height: 200rpx; border: 2rpx solid #F5F0EA; border-radius: 12rpx; padding: 16rpx; font-size: 28rpx; box-sizing: border-box; background: #FBF8F4; }
.input { width: 100%; height: 80rpx; border: 2rpx solid #F5F0EA; border-radius: 12rpx; padding: 0 20rpx; font-size: 28rpx; box-sizing: border-box; background: #FBF8F4; }
.submit-btn { margin: 40rpx 32rpx; background: var(--theme-primary); color: #fff; text-align: center; padding: 24rpx; border-radius: 48rpx; font-size: 30rpx; font-weight: 600; }
</style>
