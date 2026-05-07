<template>
  <view class="page-diary-detail" v-if="diary">
    <text class="diary-title">{{ diary.title }}</text>
    <text class="diary-time">📅 {{ formatDate(diary.createdAt) }} · {{ diary.isPinned ? '📌 已置顶' : '' }}</text>
    <view class="diary-content"><rich-text :nodes="diary.content" /></view>
    <view class="diary-images" v-if="diary.images && diary.images.length">
      <image v-for="(img, i) in diary.images" :key="i" :src="img" mode="widthFix" class="content-img" @tap="previewImage(i)" />
    </view>

    <view class="actions">
      <view class="action-btn" @tap="handleTogglePin">
        <text>{{ diary.isPinned ? '📌 取消置顶' : '📌 置顶' }}</text>
      </view>
      <view class="action-btn" @tap="handleEdit">
        <text>✏️ 编辑</text>
      </view>
      <view class="action-btn danger" @tap="handleDelete">
        <text>🗑️ 删除</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onLoad } from '@dcloudio/uni-app';
import { getDiaryDetail, deleteDiary, togglePinDiary } from '@/api/diary';

const petId = ref('');
const diary = ref(null);

onLoad(async (options) => {
  petId.value = options.petId || '';
  const res = await getDiaryDetail(petId.value, options.id);
  diary.value = res.data;
});

function formatDate(d) { return d ? d.slice(0, 10) : ''; }

function previewImage(current) {
  uni.previewImage({ urls: diary.value.images, current: diary.value.images[current] });
}

async function handleTogglePin() {
  await togglePinDiary(petId.value, diary.value.id);
  diary.value.isPinned = !diary.value.isPinned;
  uni.showToast({ title: diary.value.isPinned ? '已置顶' : '已取消置顶', icon: 'success' });
}

function handleEdit() {
  uni.navigateTo({ url: `/subPages/diary/create?petId=${petId.value}&id=${diary.value.id}` });
}

function handleDelete() {
  uni.showModal({
    title: '删除日记',
    content: '删除后无法恢复，确定删除？',
    success: async (res) => {
      if (res.confirm) {
        await deleteDiary(petId.value, diary.value.id);
        uni.showToast({ title: '已删除', icon: 'success' });
        setTimeout(() => uni.navigateBack(), 800);
      }
    },
  });
}
</script>

<style scoped lang="scss">
.page-diary-detail { padding: 32rpx; background: #fff; min-height: 100vh; }
.diary-title { font-size: 40rpx; font-weight: bold; color: #303133; display: block; margin-bottom: 12rpx; }
.diary-time { font-size: 24rpx; color: #C0C4CC; display: block; margin-bottom: 32rpx; }
.diary-content { font-size: 30rpx; color: #303133; line-height: 1.8; margin-bottom: 24rpx; }
.content-img { width: 100%; border-radius: 8rpx; margin-bottom: 16rpx; }
.actions { display: flex; gap: 20rpx; margin-top: 60rpx; padding-top: 40rpx; border-top: 2rpx solid #f0f0f0; }
.action-btn { flex: 1; text-align: center; padding: 20rpx; background: #f5f7fa; border-radius: 12rpx; font-size: 26rpx; color: #606266; }
.action-btn.danger { color: #F56C6C; background: #fef0f0; }
</style>
