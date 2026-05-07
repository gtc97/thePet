<template>
  <view class="page-album-list">
    <view class="pet-header" v-if="petInfo">
      <image class="pet-avatar" :src="petInfo.avatar || '/static/default-pet.png'" mode="aspectFill" />
      <text class="pet-name">{{ petInfo.name }}</text>
      <text class="photo-count">{{ photos.length }}张</text>
    </view>

    <view class="source-tabs">
      <view class="tab" :class="{ active: sourceType === '' }" @tap="switchSource('')"><text>全部</text></view>
      <view class="tab" :class="{ active: sourceType === 'user' }" @tap="switchSource('user')"><text>日常素材</text></view>
      <view class="tab" :class="{ active: sourceType === 'service' }" @tap="switchSource('service')"><text>服务记录</text></view>
    </view>

    <view class="photo-grid" v-if="photos.length > 0">
      <view class="photo-item" v-for="photo in photos" :key="photo.id" @tap="previewPhoto(photo)">
        <image :src="photo.thumbnailUrl || photo.url" mode="aspectFill" class="photo-img" lazy-load />
        <view class="video-badge" v-if="photo.type === 'VIDEO'"><text>▶</text></view>
      </view>
    </view>

    <c-empty-state v-else text="暂无照片" />

    <view class="upload-fab" @tap="handleUpload"><text>+</text></view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getPetDetail } from '@/api/pet';
import { getPhotos, addPhotos } from '@/api/album';

const petId = ref('');
const petInfo = ref(null);
const photos = ref([]);
const sourceType = ref('');

onLoad(async (options) => {
  petId.value = options.petId || '';
  if (petId.value) {
    const res = await getPetDetail(petId.value);
    petInfo.value = res.data;
    await loadPhotos();
  }
});

async function loadPhotos() {
  const params = {};
  if (sourceType.value) params.sourceType = sourceType.value;
  const res = await getPhotos(petId.value, params);
  photos.value = res.data || [];
}

function switchSource(type) {
  sourceType.value = type;
  loadPhotos();
}

function previewPhoto(photo) {
  const images = photos.value.filter(p => p.type === 'IMAGE').map(p => p.url);
  uni.previewImage({ urls: images.length > 0 ? images : [photo.url], current: photo.url });
}

function handleUpload() {
  uni.chooseImage({
    count: 9,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      uni.showLoading({ title: '上传中...' });
      const uploaded = [];
      for (const fp of res.tempFilePaths) {
        const r = await new Promise((resolve, reject) => {
          uni.uploadFile({
            url: 'http://localhost:3000/api/v1/upload/image',
            filePath: fp,
            name: 'file',
            formData: { module: 'pet_photos' },
            header: { Authorization: `Bearer ${uni.getStorageSync('access_token')}` },
            success: (r) => resolve(JSON.parse(r.data)),
            fail: reject,
          });
        });
        if (r.code === 0) uploaded.push({ url: r.data.url, thumbnailUrl: r.data.thumbnailUrl, type: 'IMAGE', sourceType: 'user', width: r.data.width, height: r.data.height, size: r.data.size });
      }
      if (uploaded.length > 0) {
        await addPhotos(petId.value, uploaded);
        uni.showToast({ title: `上传${uploaded.length}张成功`, icon: 'success' });
        await loadPhotos();
      }
      uni.hideLoading();
    },
  });
}
</script>

<style scoped lang="scss">
.page-album-list { padding-bottom: 120rpx; background: #f5f7fa; min-height: 100vh; }
.pet-header { display: flex; align-items: center; padding: 24rpx 32rpx; background: #fff; margin-bottom: 16rpx; gap: 16rpx; }
.pet-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: #e8e8e8; }
.pet-name { font-size: 30rpx; font-weight: 600; flex: 1; }
.photo-count { font-size: 24rpx; color: #909399; }
.source-tabs { display: flex; padding: 16rpx 32rpx; background: #fff; gap: 32rpx; margin-bottom: 4rpx; }
.tab { font-size: 26rpx; color: #909399; padding: 8rpx 0; }
.tab.active { color: #409EFF; font-weight: 600; border-bottom: 4rpx solid #409EFF; }
.photo-grid { display: flex; flex-wrap: wrap; padding: 4rpx; }
.photo-item { width: calc(33.33% - 4rpx); aspect-ratio: 1; margin: 2rpx; position: relative; background: #e8e8e8; }
.photo-img { width: 100%; height: 100%; }
.video-badge { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 60rpx; height: 60rpx; background: rgba(0,0,0,0.5); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24rpx; }
.upload-fab { position: fixed; right: 40rpx; bottom: 120rpx; width: 100rpx; height: 100rpx; background: #409EFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 48rpx; box-shadow: 0 4px 16px rgba(64,158,255,0.4); }
</style>
