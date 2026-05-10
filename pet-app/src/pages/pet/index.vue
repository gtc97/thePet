<template>
  <view class="page-pet">
    <view class="page-header">
      <view class="header-content">
        <view class="title-section">
          <text class="main-title">我的宠物</text>
          <text class="sub-title">陪伴是最长情的告白</text>
        </view>
        <view class="add-btn" @tap="navigateTo('/subPages/pet/create')">
          <image src="/static/image/svg34.png" mode="aspectFit" class="add-icon" />
        </view>
      </view>
    </view>

    <view class="filter-tabs">
      <view class="tab" :class="{ active: !showArchived }" @tap="showArchived = false">
        <text>活跃</text>
        <view class="tab-indicator" v-if="!showArchived"></view>
      </view>
      <view class="tab" :class="{ active: showArchived }" @tap="showArchived = true">
        <text>已封存</text>
        <view class="tab-indicator" v-if="showArchived"></view>
      </view>
    </view>

    <scroll-view class="pet-list" scroll-y>
      <view class="pet-card" v-for="pet in filteredPets" :key="pet.id" @tap="navigateTo('/subPages/pet/detail?id=' + pet.id)">
        <view class="pet-avatar-wrapper" :class="pet.gender === 'MALE' ? 'male' : 'female'">
          <c-avatar :src="pet.avatar" :name="pet.name" size="sm" />
        </view>
        <view class="pet-info">
          <view class="pet-header">
            <text class="pet-name">{{ pet.name }}</text>
            <view class="gender-tag" :class="pet.gender === 'MALE' ? 'male' : 'female'">
              {{ pet.gender === 'MALE' ? '公' : '母' }}
            </view>
          </view>
          <text class="pet-breed">{{ pet.breed || '未知品种' }}</text>
          <view class="pet-stats">
            <view class="stat-item">
              <text class="stat-value">{{ pet.days || '0' }}</text>
              <text class="stat-label">天</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ pet.diaryCount || '0' }}</text>
              <text class="stat-label">日记</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ pet.photoCount || '0' }}</text>
              <text class="stat-label">照片</text>
            </view>
          </view>
        </view>
        <image src="/static/image/svg33.png" mode="aspectFit" class="arrow-icon" />
      </view>

      <view class="empty-state" v-if="filteredPets.length === 0">
        <text class="empty-icon">🐾</text>
        <text class="empty-text">{{ showArchived ? '暂无已封存宠物' : '还没有添加宠物' }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePetStore } from '@/store/pet';
import { onShow } from '@dcloudio/uni-app';

const petStore = usePetStore();
const showArchived = ref(false);

const filteredPets = computed(() =>
  petStore.pets.filter(p => p.isArchived === showArchived.value)
);

onShow(async () => {
  await petStore.fetchPets();
});

function navigateTo(url) {
  uni.navigateTo({ url });
}
</script>

<style scoped lang="scss">
.page-pet {
  min-height: 100vh;
  background: #FBF8F4;
}

.page-header {
  padding: 60rpx 32rpx 32rpx;
  background: #FBF8F4;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.main-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #2D2016;
}

.sub-title {
  font-size: 24rpx;
  color: #9E8E7E;
}

.add-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: var(--theme-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  width: 40rpx;
  height: 40rpx;
}

.filter-tabs {
  display: flex;
  padding: 0 32rpx 24rpx;
  gap: 48rpx;
}

.tab {
  position: relative;
  font-size: 32rpx;
  color: #9E8E7E;
  padding-bottom: 8rpx;
  transition: color 0.3s;

  &.active {
    color: #2D2016;
    font-weight: 600;
  }
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: var(--theme-primary);
  border-radius: 3rpx;
}

.pet-list {
  flex: 1;
  padding: 0 32rpx;
  padding-bottom: 180rpx;
}

.pet-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 32rpx rgba(213, 155, 106, 0.12);
}

.pet-avatar-wrapper {
  width: 128rpx;
  height: 128rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;

  &.male {
    background: #FFF3E8;
  }

  &.female {
    background: #E8FBF5;
  }
}

.pet-avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 32rpx;
}

.pet-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.pet-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.pet-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #2D2016;
}

.gender-tag {
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;

  &.male {
    background: rgba(245, 137, 90, 0.13);
    color: var(--theme-primary);
  }

  &.female {
    background: rgba(126, 207, 179, 0.13);
    color: #7ECFB3;
  }
}

.pet-breed {
  font-size: 28rpx;
  color: #9E8E7E;
}

.pet-stats {
  display: flex;
  gap: 32rpx;
  margin-top: 8rpx;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}

.stat-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D2016;
}

.stat-label {
  font-size: 24rpx;
  color: #9E8E7E;
}

.arrow-icon {
  width: 32rpx;
  height: 32rpx;
  margin-left: 16rpx;
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