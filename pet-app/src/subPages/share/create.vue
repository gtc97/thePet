<template>
  <view class="page-share-create">
    <view class="form-section">
      <text class="section-title">选择宠物</text>
      <picker :range="petNames" @change="(e) => selectPet(e.detail.value)">
        <view class="picker">{{ selectedPet ? selectedPet.name : '请选择宠物' }}</view>
      </picker>
    </view>

    <view class="form-section" v-if="selectedPet">
      <text class="section-title">分享标题</text>
      <input class="form-input" v-model="form.title" placeholder="给分享起个名字" maxlength="50" />
    </view>

    <view class="form-section" v-if="selectedPet">
      <text class="section-title">展示内容设置</text>
      <view class="toggle-list">
        <view class="toggle-item">
          <text>展示相册</text>
          <switch :checked="form.showAlbum" @change="(e) => form.showAlbum = e.detail.value" color="#409EFF" />
        </view>
        <view class="toggle-item">
          <text>展示成长日记</text>
          <switch :checked="form.showDiary" @change="(e) => form.showDiary = e.detail.value" color="#409EFF" />
        </view>
        <view class="toggle-item">
          <text>展示服务记录</text>
          <switch :checked="form.showServiceLogs" @change="(e) => form.showServiceLogs = e.detail.value" color="#409EFF" />
        </view>
      </view>
    </view>

    <view class="submit-btn" v-if="selectedPet" @tap="handleSubmit">
      <text>生成分享卡片</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getPets } from '@/api/pet';
import { createShare } from '@/api/share';

const pets = ref([]);
const selectedPet = ref(null);
const form = reactive({ title: '', showAlbum: true, showDiary: true, showServiceLogs: false });

const petNames = ref([]);

onLoad(async (options) => {
  const res = await getPets();
  pets.value = res.data || [];
  petNames.value = pets.value.map(p => p.name);
  if (options.petId) {
    const idx = pets.value.findIndex(p => p.id == options.petId);
    if (idx >= 0) selectPet(idx);
  }
});

function selectPet(index) {
  selectedPet.value = pets.value[index];
  form.title = `${selectedPet.value.name}的宠物档案`;
}

async function handleSubmit() {
  if (!form.title.trim()) {
    uni.showToast({ title: '请输入分享标题', icon: 'none' });
    return;
  }
  try {
    uni.showLoading({ title: '生成中...' });
    const res = await createShare({
      petId: selectedPet.value.id,
      title: form.title,
      images: [selectedPet.value.avatar].filter(Boolean),
      showAlbum: form.showAlbum,
      showDiary: form.showDiary,
      showServiceLogs: form.showServiceLogs,
    });
    uni.hideLoading();
    uni.showToast({ title: '分享卡片已生成', icon: 'success' });
    // 跳转到分享详情页
    setTimeout(() => {
      uni.redirectTo({ url: `/subPages/share/detail?id=${res.data.id}` });
    }, 500);
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '创建失败', icon: 'none' });
  }
}
</script>

<style scoped lang="scss">
.page-share-create { min-height: 100vh; background: #f5f7fa; padding: 20rpx 0; }
.form-section { background: #fff; padding: 24rpx 32rpx; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 16rpx; }
.form-input { width: 100%; height: 80rpx; border: 2rpx solid #DCDFE6; border-radius: 8rpx; padding: 0 20rpx; font-size: 28rpx; box-sizing: border-box; }
.picker { width: 100%; height: 80rpx; border: 2rpx solid #DCDFE6; border-radius: 8rpx; padding: 0 20rpx; font-size: 28rpx; display: flex; align-items: center; color: #303133; box-sizing: border-box; }
.toggle-list { margin-top: 16rpx; }
.toggle-item { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #f5f7fa; }
.toggle-item text { font-size: 28rpx; color: #303133; }
.submit-btn { margin: 40rpx 32rpx; background: #409EFF; color: #fff; text-align: center; padding: 24rpx; border-radius: 48rpx; font-size: 30rpx; font-weight: 600; }
</style>
