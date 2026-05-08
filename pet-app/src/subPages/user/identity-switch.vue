<template>
  <view class="page-switch">
    <view class="hero">
      <text class="hero-icon">{{ isProvider ? '🔧' : '🐾' }}</text>
      <text class="hero-title">当前身份：{{ isProvider ? '上门师傅' : '宠物主' }}</text>
    </view>
    <view class="cards">
      <view class="card" :class="{ active: !isProvider }" @tap="switchRole('PET_OWNER')">
        <text class="card-icon">🐾</text>
        <text class="card-title">宠物主</text>
        <text class="card-desc">管理宠物、预约服务</text>
        <text class="check" v-if="!isProvider">✓ 当前</text>
      </view>
      <view class="card" :class="{ active: isProvider }" @tap="switchRole('SERVICE_PROVIDER')">
        <text class="card-icon">🔧</text>
        <text class="card-title">上门师傅</text>
        <text class="card-desc">接单服务、赚取收入</text>
        <text class="check" v-if="isProvider">✓ 当前</text>
        <text class="need" v-if="!isQualified">需资质审核</text>
      </view>
    </view>
    <view class="hint" v-if="!isQualified">
      <text>成为上门师傅需要先提交资质申请，审核通过后可切换身份接单。</text>
      <view class="apply-btn" @tap="navigateTo('/subPages/user/qualification')"><text>去申请资质</text></view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const isProvider = ref(userStore.isProvider);
const isQualified = userStore.isQualified;

async function switchRole(role) {
  if ((role === 'PET_OWNER' && !isProvider.value) || (role === 'SERVICE_PROVIDER' && isProvider.value)) return;
  try {
    await userStore.switchRole(role);
    isProvider.value = role === 'SERVICE_PROVIDER';
    uni.showToast({ title: '已切换', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: e.message || '切换失败', icon: 'none' });
  }
}
function navigateTo(url) { uni.navigateTo({ url }); }
</script>

<style scoped lang="scss">
.page-switch { min-height: 100vh; background: #FBF8F4; }
.hero { text-align: center; padding: 60rpx 0 40rpx; }
.hero-icon { font-size: 80rpx; display: block; }
.hero-title { font-size: 30rpx; color: #2D2016; font-weight: 600; margin-top: 16rpx; display: block; }
.cards { display: flex; gap: 20rpx; padding: 0 32rpx; }
.card { flex: 1; background: #fff; border-radius: 16rpx; padding: 40rpx 24rpx; text-align: center; border: 2rpx solid #F5F0EA; position: relative; }
.card.active { border-color: #F5895A; background: #FFF3E8; }
.card-icon { font-size: 56rpx; display: block; }
.card-title { font-size: 30rpx; font-weight: 600; color: #2D2016; display: block; margin: 12rpx 0 8rpx; }
.card-desc { font-size: 24rpx; color: #9E8E7E; display: block; }
.check { position: absolute; top: 12rpx; right: 12rpx; background: #F5895A; color: #fff; font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 20rpx; }
.need { font-size: 22rpx; color: #FF6467; display: block; margin-top: 12rpx; }
.hint { text-align: center; padding: 40rpx 32rpx; }
.hint text { font-size: 26rpx; color: #9E8E7E; }
.apply-btn { margin-top: 24rpx; background: #F5895A; color: #fff; display: inline-block; padding: 16rpx 40rpx; border-radius: 32rpx; font-size: 28rpx; }
</style>
