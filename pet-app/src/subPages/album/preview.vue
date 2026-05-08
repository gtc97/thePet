<template>
  <view class="page-preview">
    <swiper :current="index" class="swiper" @change="(e) => index = e.detail.current">
      <swiper-item v-for="(img, i) in images" :key="i">
        <image :src="img.url" mode="widthFix" class="preview-img" />
      </swiper-item>
    </swiper>
    <view class="counter">{{ index + 1 }} / {{ images.length }}</view>
    <view class="actions">
      <view class="action" @tap="saveImage"><text>保存</text></view>
      <view class="action danger" @tap="handleDelete"><text>删除</text></view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getPhotos, deletePhoto } from '@/api/album';

const petId = ref('');
const images = ref([]);
const index = ref(0);

onLoad(async (options) => {
  petId.value = options.petId || '';
  const res = await getPhotos(petId.value);
  images.value = res.data || [];
  index.value = parseInt(options.index) || 0;
});

function saveImage() {
  const img = images.value[index.value];
  if (img) uni.saveImageToPhotosAlbum({ filePath: img.url, success: () => uni.showToast({ title: '已保存' }) });
}
async function handleDelete() {
  const img = images.value[index.value];
  uni.showModal({
    title: '删除', content: '确定删除该照片？',
    success: async (r) => {
      if (r.confirm) {
        await deletePhoto(petId.value, img.id);
        images.value.splice(index.value, 1);
        if (images.value.length === 0) uni.navigateBack();
      }
    },
  });
}
</script>

<style scoped lang="scss">
.page-preview { width: 100vw; height: 100vh; background: #000; position: relative; }
.swiper { width: 100%; height: 100%; }
.preview-img { width: 100%; }
.counter { position: absolute; top: 40rpx; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.5); color: #fff; font-size: 28rpx; padding: 8rpx 24rpx; border-radius: 20rpx; }
.actions { position: absolute; bottom: 60rpx; left: 0; right: 0; display: flex; justify-content: center; gap: 48rpx; }
.action { padding: 16rpx 32rpx; background: rgba(255,255,255,0.2); color: #fff; border-radius: 24rpx; font-size: 26rpx; }
.danger { background: rgba(255,100,103,0.6); }
</style>
