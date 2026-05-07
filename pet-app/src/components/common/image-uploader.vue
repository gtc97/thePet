<template>
  <view class="image-uploader">
    <view class="image-grid">
      <view class="image-item" v-for="(img, index) in innerValue" :key="index">
        <image :src="img.url || img" mode="aspectFill" class="image-preview" />
        <view class="image-delete" @tap="removeImage(index)">×</view>
      </view>
      <view class="image-add" v-if="innerValue.length < max" @tap="handleChooseImage">
        <text class="add-icon">+</text>
        <text class="add-text">{{ innerValue.length === 0 ? '上传图片' : '' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  max: { type: Number, default: 9 },
});

const emit = defineEmits(['update:modelValue']);
const innerValue = ref([...props.modelValue]);

watch(() => props.modelValue, (v) => { innerValue.value = [...v]; });
watch(innerValue, (v) => { emit('update:modelValue', v); });

function handleChooseImage() {
  uni.chooseImage({
    count: props.max - innerValue.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      innerValue.value = [...innerValue.value, ...res.tempFilePaths];
    },
  });
}

function removeImage(index) {
  innerValue.value.splice(index, 1);
}
</script>

<style scoped>
.image-uploader { padding: 20rpx 0; }
.image-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.image-item { width: 200rpx; height: 200rpx; border-radius: 12rpx; overflow: hidden; position: relative; }
.image-preview { width: 100%; height: 100%; }
.image-delete { position: absolute; top: 4rpx; right: 4rpx; width: 44rpx; height: 44rpx; background: rgba(0,0,0,0.5); border-radius: 22rpx; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 28rpx; }
.image-add { width: 200rpx; height: 200rpx; border: 2rpx dashed #DCDFE6; border-radius: 12rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.add-icon { font-size: 48rpx; color: #C0C4CC; }
.add-text { font-size: 22rpx; color: #C0C4CC; margin-top: 4rpx; }
</style>
