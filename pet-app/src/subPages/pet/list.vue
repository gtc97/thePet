<template>
  <view class="page-pet-list">
    <view class="header">
      <text class="title">我的宠物</text>
      <view class="add-btn" @tap="navigateTo('/subPages/pet/create')">
        <text>+ 添加</text>
      </view>
    </view>

    <!-- 封存Tab切换 -->
    <view class="filter-tabs">
      <view class="tab" :class="{ active: !showArchived }" @tap="showArchived = false"><text>活跃</text></view>
      <view class="tab" :class="{ active: showArchived }" @tap="showArchived = true"><text>已封存</text></view>
    </view>

    <view class="pet-list" v-if="filteredPets.length > 0">
      <view
        class="pet-card"
        v-for="pet in filteredPets"
        :key="pet.id"
        @tap="navigateTo('/subPages/pet/detail?id=' + pet.id)"
      >
        <image
          class="pet-avatar"
          :src="pet.avatar || '/static/default-pet.png'"
          mode="aspectFill"
        />
        <view class="pet-info">
          <text class="pet-name">{{ pet.name }}</text>
          <text class="pet-breed">{{ pet.breed || '未知品种' }}</text>
          <text class="pet-age" v-if="pet.birthDate">{{ pet.age || '' }}</text>
        </view>
        <view class="pet-tags">
          <text class="privacy-tag" :class="pet.privacy === 'PRIVATE' ? 'private' : 'public'">
            {{ pet.privacy === 'PRIVATE' ? '私密' : '公开' }}
          </text>
          <text class="archive-tag" v-if="pet.isArchived">已封存</text>
        </view>
      </view>
    </view>

    <c-empty-state v-else :text="showArchived ? '暂无已封存宠物' : '还没有添加宠物'" />
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
.page-pet-list { padding-bottom: 40rpx; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 24rpx 32rpx; }
.title { font-size: 36rpx; font-weight: bold; color: #303133; }
.add-btn { background: #F5895A; color: #fff; padding: 12rpx 28rpx; border-radius: 32rpx; font-size: 26rpx; }
.filter-tabs { display: flex; padding: 0 32rpx 20rpx; gap: 24rpx; }
.tab { font-size: 28rpx; color: #909399; padding: 8rpx 0; }
.tab.active { color: #F5895A; font-weight: 600; border-bottom: 4rpx solid #F5895A; }
.pet-list { padding: 0 32rpx; }
.pet-card { display: flex; align-items: center; background: #fff; padding: 24rpx; border-radius: 12rpx; margin-bottom: 16rpx; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
.pet-avatar { width: 100rpx; height: 100rpx; border-radius: 50%; margin-right: 20rpx; background: #f0f0f0; }
.pet-info { flex: 1; }
.pet-name { font-size: 30rpx; color: #303133; font-weight: 600; display: block; margin-bottom: 4rpx; }
.pet-breed { font-size: 24rpx; color: #909399; }
.pet-tags { display: flex; flex-direction: column; gap: 8rpx; align-items: flex-end; }
.privacy-tag { font-size: 22rpx; padding: 4rpx 12rpx; border-radius: 20rpx; }
.privacy-tag.public { background: var(--theme-primary-light); color: var(--theme-primary); }
.privacy-tag.private { background: #fef0f0; color: #F56C6C; }
.archive-tag { font-size: 22rpx; background: #f5f7fa; color: #909399; padding: 4rpx 12rpx; border-radius: 20rpx; }
</style>
