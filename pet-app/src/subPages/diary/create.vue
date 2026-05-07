<template>
  <view class="page-diary-create">
    <view class="form-section">
      <input class="title-input" v-model="form.title" placeholder="日记标题" maxlength="100" />
      <textarea class="content-input" v-model="form.content" placeholder="记录毛孩子今天的趣事..." :maxlength="5000" />
      <view class="image-row">
        <c-image-uploader v-model="form.images" :max="6" />
      </view>
    </view>
    <view class="submit-btn" @tap="handleSubmit"><text>{{ isEdit ? '保存修改' : '发布日记' }}</text></view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { createDiary, updateDiary, getDiaryDetail } from '@/api/diary';

const isEdit = ref(false);
const petId = ref('');
const diaryId = ref('');
const form = reactive({ title: '', content: '', images: [] });

onLoad(async (options) => {
  petId.value = options.petId || '';
  if (options.id) {
    isEdit.value = true;
    diaryId.value = options.id;
    const res = await getDiaryDetail(petId.value, diaryId.value);
    form.title = res.data.title || '';
    form.content = res.data.content || '';
    form.images = res.data.images || [];
  }
});

async function handleSubmit() {
  if (!form.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' });
    return;
  }
  try {
    uni.showLoading({ title: '保存中...' });
    if (isEdit.value) {
      await updateDiary(petId.value, diaryId.value, form);
    } else {
      await createDiary(petId.value, form);
    }
    uni.hideLoading();
    uni.showToast({ title: isEdit.value ? '修改成功' : '发布成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 800);
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '保存失败', icon: 'none' });
  }
}
</script>

<style scoped lang="scss">
.page-diary-create { min-height: 100vh; background: #fff; }
.form-section { padding: 24rpx 32rpx; }
.title-input { width: 100%; font-size: 36rpx; font-weight: 600; padding: 16rpx 0; border-bottom: 2rpx solid #f0f0f0; }
.content-input { width: 100%; min-height: 400rpx; font-size: 28rpx; padding: 24rpx 0; line-height: 1.8; }
.image-row { margin-top: 16rpx; }
.submit-btn { margin: 40rpx 32rpx; background: #409EFF; color: #fff; text-align: center; padding: 24rpx; border-radius: 48rpx; font-size: 30rpx; font-weight: 600; }
</style>
