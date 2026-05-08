<template>
  <view class="page-qualification">
    <view class="section">
      <text class="section-title">申请成为上门师傅</text>
      <text class="section-desc">提交资料后我们会在1-3个工作日内审核</text>
    </view>
    <view class="section">
      <view class="form-item">
        <text class="label">真实姓名</text>
        <input class="input" v-model="form.realName" placeholder="请输入真实姓名" />
      </view>
      <view class="form-item">
        <text class="label">身份证号</text>
        <input class="input" v-model="form.idCard" placeholder="请输入身份证号" maxlength="18" />
      </view>
      <view class="form-item">
        <text class="label">个人介绍</text>
        <textarea class="textarea" v-model="form.bio" placeholder="介绍你的经验和服务优势" :maxlength="500" />
      </view>
      <view class="form-item">
        <text class="label">资质照片</text>
        <view class="photo-row">
          <image v-for="(img, i) in form.photos" :key="i" :src="img" mode="aspectFill" class="photo" @tap="removePhoto(i)" />
          <view class="add-photo" v-if="form.photos.length < 3" @tap="addPhoto">+</view>
        </view>
      </view>
    </view>
    <view class="submit-btn" @tap="handleSubmit"><text>提交申请</text></view>
  </view>
</template>

<script setup>
import { reactive } from 'vue';
import { request } from '@/api/request';

const form = reactive({ realName: '', idCard: '', bio: '', photos: [] });

function addPhoto() {
  uni.chooseImage({
    count: 3 - form.photos.length, sizeType: ['compressed'],
    success: (res) => { form.photos.push(...res.tempFilePaths); },
  });
}
function removePhoto(i) { form.photos.splice(i, 1); }

async function handleSubmit() {
  if (!form.realName) return uni.showToast({ title: '请填写真实姓名', icon: 'none' });
  try {
    uni.showLoading({ title: '提交中...' });
    await request({ url: '/users/me/qualification', method: 'POST', data: form });
    uni.hideLoading();
    uni.showToast({ title: '已提交，等待审核', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1000);
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '提交失败', icon: 'none' });
  }
}
</script>

<style scoped lang="scss">
.page-qualification { min-height: 100vh; background: #FBF8F4; }
.section { background: #fff; padding: 24rpx 32rpx; margin-bottom: 16rpx; }
.section-title { font-size: 32rpx; font-weight: 600; color: #2D2016; display: block; }
.section-desc { font-size: 24rpx; color: #9E8E7E; display: block; margin-top: 8rpx; }
.form-item { margin-top: 20rpx; }
.label { font-size: 28rpx; color: #2D2016; display: block; margin-bottom: 10rpx; }
.input { width: 100%; height: 80rpx; border: 2rpx solid #F5F0EA; border-radius: 12rpx; padding: 0 20rpx; font-size: 28rpx; box-sizing: border-box; background: #FBF8F4; }
.textarea { width: 100%; height: 140rpx; border: 2rpx solid #F5F0EA; border-radius: 12rpx; padding: 16rpx; font-size: 28rpx; box-sizing: border-box; background: #FBF8F4; }
.photo-row { display: flex; gap: 16rpx; }
.photo { width: 160rpx; height: 160rpx; border-radius: 12rpx; background: #F5F0EA; }
.add-photo { width: 160rpx; height: 160rpx; border: 2rpx dashed #F5F0EA; border-radius: 12rpx; display: flex; align-items: center; justify-content: center; font-size: 48rpx; color: #C4B8AD; }
.submit-btn { margin: 40rpx 32rpx; background: #F5895A; color: #fff; text-align: center; padding: 24rpx; border-radius: 48rpx; font-size: 30rpx; font-weight: 600; }
</style>
