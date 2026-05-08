<template>
  <view class="page-review">
    <view class="section">
      <text class="section-title">评分</text>
      <view class="star-row">
        <text v-for="i in 5" :key="i" class="star" :class="{ filled: i <= rating }" @tap="rating = i">★</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">评价内容</text>
      <textarea class="form-textarea" v-model="content" placeholder="写下你的评价..." :maxlength="500" />
    </view>

    <view class="section">
      <text class="section-title">标签（选填）</text>
      <view class="tag-grid">
        <view v-for="t in tagOptions" :key="t" class="tag" :class="{ active: tags.includes(t) }"
          @tap="toggleTag(t)">{{ t }}</view>
      </view>
    </view>

    <view class="submit-btn" @tap="handleSubmit"><text>提交评价</text></view>
  </view>
</template>

<script setup>
import { ref, onLoad } from '@dcloudio/uni-app';
import { createReview } from '@/api/review';

const orderId = ref('');
const rating = ref(0);
const content = ref('');
const tags = ref([]);

const tagOptions = ['按时到达', '细致认真', '态度好', '干净整洁', '沟通顺畅', '专业', '守时', '负责'];

onLoad((options) => { orderId.value = options.orderId || ''; });

function toggleTag(t) {
  const idx = tags.value.indexOf(t);
  if (idx >= 0) tags.value.splice(idx, 1);
  else tags.value.push(t);
}

async function handleSubmit() {
  if (rating.value === 0) return uni.showToast({ title: '请评分', icon: 'none' });
  try {
    await createReview(orderId.value, { rating: rating.value, content: content.value, tags: tags.value });
    uni.showToast({ title: '评价成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 800);
  } catch (e) {
    uni.showToast({ title: e.message || '提交失败', icon: 'none' });
  }
}
</script>

<style scoped lang="scss">
.page-review { min-height: 100vh; background: var(--bg-page); }
.section { background: var(--bg-white); padding: 24rpx 32rpx; margin-bottom: 16rpx; }
.section-title { font-size: var(--font-lg); font-weight: 600; display: block; margin-bottom: 16rpx; }
.star-row { display: flex; gap: 8rpx; }
.star { font-size: 52rpx; color: #DCDFE6; }
.star.filled { color: #E6A23C; }
.form-textarea { width: 100%; height: 200rpx; border: 2rpx solid var(--border-color); border-radius: 8rpx; padding: 16rpx; font-size: var(--font-md); box-sizing: border-box; }
.tag-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.tag { padding: 10rpx 24rpx; border: 2rpx solid var(--border-color); border-radius: 24rpx; font-size: var(--font-sm); }
.tag.active { border-color: var(--theme-primary); background: var(--theme-primary-light); color: var(--theme-primary); }
.submit-btn { margin: 40rpx 32rpx; background: var(--theme-primary); color: #fff; text-align: center; padding: 24rpx; border-radius: var(--border-radius-round); font-size: var(--font-lg); font-weight: 600; }
</style>
