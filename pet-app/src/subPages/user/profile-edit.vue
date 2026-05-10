<template>
  <view class="page-profile-edit">
    <view class="section">
      <text class="section-title">头像</text>
      <view class="avatar-row" @tap="handleChooseAvatar">
        <c-avatar :src="form.avatar" :name="form.nickname" size="lg" />
        <text class="change-text">点击更换</text>
      </view>
    </view>
    <view class="section">
      <view class="form-item">
        <text class="label">昵称</text>
        <input class="input" v-model="form.nickname" maxlength="20" placeholder="请输入昵称" />
      </view>
      <view class="form-item">
        <text class="label">简介</text>
        <textarea class="textarea" v-model="form.bio" maxlength="200" placeholder="介绍一下自己" />
      </view>
      <view class="form-item">
        <text class="label">地区</text>
        <input class="input" v-model="form.city" maxlength="20" placeholder="所在城市" />
      </view>
    </view>
    <view class="submit-btn" @tap="handleSave"><text>保存</text></view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request, BASE_URL } from '@/api/request';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const form = reactive({
  avatar: '', nickname: '', bio: '', city: '',
});

onLoad(() => {
  if (userStore.userInfo) {
    form.avatar = userStore.userInfo.avatar || '';
    form.nickname = userStore.userInfo.nickname || '';
    form.bio = userStore.userInfo.bio || '';
    form.city = userStore.userInfo.city || '';
  }
});

function handleChooseAvatar() {
  uni.chooseImage({
    count: 1, sizeType: ['compressed'],
    success: async (res) => {
      uni.showLoading({ title: '上传中...' });
      uni.uploadFile({
        url: BASE_URL + '/upload/image',
        filePath: res.tempFilePaths[0],
        name: 'file',
        formData: { module: 'avatars' },
        header: { Authorization: `Bearer ${uni.getStorageSync('access_token')}` },
        success: (r) => {
          const data = JSON.parse(r.data);
          if (data.code === 0) form.avatar = data.data.url;
        },
        complete: () => uni.hideLoading(),
      });
    },
  });
}

async function handleSave() {
  try {
    uni.showLoading({ title: '保存中...' });
    await request({ url: '/users/me', method: 'PUT', data: form });
    await userStore.fetchProfile();
    uni.hideLoading();
    uni.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 800);
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '保存失败', icon: 'none' });
  }
}
</script>

<style scoped lang="scss">
.page-profile-edit { min-height: 100vh; background: #FBF8F4; }
.section { background: #fff; padding: 24rpx 32rpx; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #2D2016; margin-bottom: 20rpx; display: block; }
.avatar-row { display: flex; align-items: center; gap: 20rpx; }
.avatar { width: 120rpx; height: 120rpx; border-radius: 50%; background: #F5F0EA; }
.change-text { font-size: 26rpx; color: var(--theme-primary); }
.form-item { margin-bottom: 20rpx; }
.label { font-size: 28rpx; color: #2D2016; display: block; margin-bottom: 10rpx; }
.input { width: 100%; height: 80rpx; border: 2rpx solid #F5F0EA; border-radius: 12rpx; padding: 0 20rpx; font-size: 28rpx; box-sizing: border-box; background: #FBF8F4; }
.textarea { width: 100%; height: 140rpx; border: 2rpx solid #F5F0EA; border-radius: 12rpx; padding: 16rpx 20rpx; font-size: 28rpx; box-sizing: border-box; background: #FBF8F4; }
.submit-btn { margin: 40rpx 32rpx; background: var(--theme-primary); color: #fff; text-align: center; padding: 24rpx; border-radius: 48rpx; font-size: 30rpx; font-weight: 600; }
</style>
