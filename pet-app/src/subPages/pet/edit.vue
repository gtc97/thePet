<template>
  <view class="page-pet-edit">
    <view class="form-section">
      <text class="section-title">基本信息</text>
      <view class="form-item"><text class="label">昵称 *</text><input class="input" v-model="form.name" placeholder="宠物名字" /></view>
      <view class="form-item"><text class="label">品种</text><input class="input" v-model="form.breed" placeholder="如：英短、金毛" /></view>
      <view class="form-item">
        <text class="label">性别</text>
        <view class="gender-row">
          <view v-for="g in genders" :key="g.value" class="gender-opt" :class="{ active: form.gender === g.value }" @tap="form.gender = g.value">{{ g.label }}</view>
        </view>
      </view>
      <view class="form-item"><text class="label">体重 (kg)</text><input class="input" v-model.number="form.weight" type="digit" /></view>
      <view class="form-item"><text class="label">饮食习惯</text><textarea class="textarea" v-model="form.dietHabits" /></view>
      <view class="form-item"><text class="label">禁忌事项</text><textarea class="textarea" v-model="form.taboos" /></view>
      <view class="form-item">
        <text class="label">隐私</text>
        <view class="privacy-row">
          <view class="privacy-opt" :class="{ active: form.privacy === 'PUBLIC' }" @tap="form.privacy = 'PUBLIC'"><text>公开</text></view>
          <view class="privacy-opt" :class="{ active: form.privacy === 'PRIVATE' }" @tap="form.privacy = 'PRIVATE'"><text>私密</text></view>
        </view>
      </view>
    </view>
    <view class="submit-btn" @tap="handleSave"><text>保存</text></view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getPetDetail, updatePet } from '@/api/pet';

const petId = ref('');
const form = reactive({ name: '', breed: '', gender: 'UNKNOWN', weight: null, dietHabits: '', taboos: '', privacy: 'PUBLIC' });
const genders = [{ value: 'MALE', label: '♂ 男生' }, { value: 'FEMALE', label: '♀ 女生' }, { value: 'UNKNOWN', label: '未知' }];

onLoad(async (options) => {
  petId.value = options.id || '';
  if (petId.value) {
    const res = await getPetDetail(petId.value);
    Object.assign(form, res.data);
  }
});

async function handleSave() {
  if (!form.name) return uni.showToast({ title: '请输入昵称', icon: 'none' });
  try {
    await updatePet(petId.value, form);
    uni.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 800);
  } catch (e) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' });
  }
}
</script>

<style scoped lang="scss">
.page-pet-edit { min-height: 100vh; background: #FBF8F4; }
.form-section { background: #fff; padding: 24rpx 32rpx; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #2D2016; display: block; margin-bottom: 16rpx; }
.form-item { margin-bottom: 20rpx; }
.label { font-size: 28rpx; color: #2D2016; display: block; margin-bottom: 10rpx; }
.input { width: 100%; height: 80rpx; border: 2rpx solid #F5F0EA; border-radius: 12rpx; padding: 0 20rpx; font-size: 28rpx; box-sizing: border-box; background: #FBF8F4; }
.textarea { width: 100%; height: 120rpx; border: 2rpx solid #F5F0EA; border-radius: 12rpx; padding: 16rpx; font-size: 28rpx; box-sizing: border-box; background: #FBF8F4; }
.gender-row, .privacy-row { display: flex; gap: 16rpx; }
.gender-opt, .privacy-opt { flex: 1; text-align: center; padding: 16rpx 0; border: 2rpx solid #F5F0EA; border-radius: 12rpx; font-size: 26rpx; color: #9E8E7E; }
.gender-opt.active, .privacy-opt.active { border-color: var(--theme-primary); color: var(--theme-primary); background: #FFF3E8; }
.submit-btn { margin: 40rpx 32rpx; background: var(--theme-primary); color: #fff; text-align: center; padding: 24rpx; border-radius: 48rpx; font-size: 30rpx; font-weight: 600; }
</style>
