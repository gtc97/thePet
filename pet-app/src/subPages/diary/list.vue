<template>
  <view class="page-diary">
    <view class="header">
      <text class="title">成长日记</text>
      <view class="add-btn" @tap="navigateTo('/subPages/diary/create?petId=' + petId)"><text>+ 写日记</text></view>
    </view>

    <!-- 置顶日记 -->
    <view class="pinned-section" v-if="pinnedList.length > 0">
      <view class="section-label"><text>📌 置顶</text></view>
      <view class="diary-card pinned" v-for="d in pinnedList" :key="d.id"
        @tap="navigateTo('/subPages/diary/detail?petId=' + petId + '&id=' + d.id)">
        <text class="diary-title">{{ d.title }}</text>
        <text class="diary-preview">{{ stripHtml(d.content) }}</text>
        <view class="diary-images" v-if="d.images && d.images.length">
          <image v-for="(img, i) in d.images.slice(0,3)" :key="i" :src="img" mode="aspectFill" class="diary-img" />
        </view>
        <text class="diary-time">{{ formatDate(d.createdAt) }}</text>
      </view>
    </view>

    <!-- 时间线 -->
    <view class="timeline" v-if="normalList.length > 0">
      <view class="diary-card" v-for="d in normalList" :key="d.id"
        @tap="navigateTo('/subPages/diary/detail?petId=' + petId + '&id=' + d.id)">
        <text class="diary-title">{{ d.title }}</text>
        <text class="diary-preview">{{ stripHtml(d.content) }}</text>
        <view class="diary-images" v-if="d.images && d.images.length">
          <image v-for="(img, i) in d.images.slice(0,3)" :key="i" :src="img" mode="aspectFill" class="diary-img" />
        </view>
        <text class="diary-time">{{ formatDate(d.createdAt) }}</text>
      </view>
    </view>

    <c-empty-state v-if="allDiaries.length === 0" text="还没有写日记，记录毛孩子的成长瞬间吧" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getDiaries } from '@/api/diary';

const petId = ref('');
const allDiaries = ref([]);

const pinnedList = computed(() => allDiaries.value.filter(d => d.isPinned));
const normalList = computed(() => allDiaries.value.filter(d => !d.isPinned));

onLoad(async (options) => {
  petId.value = options.petId || '';
  await loadDiaries();
});

async function loadDiaries() {
  try {
    const res = await getDiaries(petId.value, { page: 1, pageSize: 50 });
    allDiaries.value = res.data?.list || [];
  } catch (e) { /* ignore */ }
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '').slice(0, 100);
}

function formatDate(d) {
  return d ? d.slice(0, 10) : '';
}

function navigateTo(url) {
  uni.navigateTo({ url });
}
</script>

<style scoped lang="scss">
.page-diary { padding-bottom: 40rpx; background: #f5f7fa; min-height: 100vh; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 24rpx 32rpx; background: #fff; }
.title { font-size: 36rpx; font-weight: bold; color: #303133; }
.add-btn { background: #409EFF; color: #fff; padding: 12rpx 28rpx; border-radius: 32rpx; font-size: 26rpx; }
.pinned-section { background: #fffef5; padding: 8rpx 0; }
.section-label { padding: 8rpx 32rpx; font-size: 24rpx; color: #E6A23C; }
.diary-card { margin: 0 32rpx 16rpx; background: #fff; border-radius: 12rpx; padding: 24rpx; box-shadow: 0 1px 6px rgba(0,0,0,0.06); }
.diary-card.pinned { border-left: 6rpx solid #E6A23C; }
.diary-title { font-size: 30rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 8rpx; }
.diary-preview { font-size: 26rpx; color: #909399; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 12rpx; }
.diary-images { display: flex; gap: 8rpx; margin-bottom: 12rpx; }
.diary-img { width: 160rpx; height: 160rpx; border-radius: 8rpx; background: #e8e8e8; }
.diary-time { font-size: 22rpx; color: #C0C4CC; }
.timeline { padding: 16rpx 0; }
</style>
