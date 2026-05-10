<template>
  <view class="page-pet-create">
    <view class="form-section">
      <text class="section-title">基本信息</text>

      <view class="form-item">
        <text class="form-label">头像</text>
        <view class="avatar-upload" @tap="handleChooseAvatar">
          <image v-if="form.avatar" :src="form.avatar" mode="aspectFill" class="avatar-preview" />
          <text v-else class="avatar-placeholder">+</text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">昵称 *</text>
        <input class="form-input" v-model="form.name" placeholder="给毛孩子取个名字" />
      </view>

      <view class="form-item">
        <text class="form-label">物种</text>
        <picker :range="speciesOptions" @change="(e) => form.species = speciesOptions[e.detail.value]">
          <view class="form-picker">{{ form.species || '请选择' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">品种</text>
        <input class="form-input" v-model="form.breed" placeholder="如：英短、金毛、布偶" />
      </view>

      <view class="form-item">
        <text class="form-label">性别</text>
        <view class="gender-switch">
          <view class="gender-option" :class="{ active: form.gender === 'MALE' }" @tap="form.gender = 'MALE'">♂ 男生</view>
          <view class="gender-option" :class="{ active: form.gender === 'FEMALE' }" @tap="form.gender = 'FEMALE'">♀ 女生</view>
          <view class="gender-option" :class="{ active: form.gender === 'UNKNOWN' }" @tap="form.gender = 'UNKNOWN'">未知</view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">出生日期</text>
        <picker mode="date" @change="(e) => form.birthDate = e.detail.value">
          <view class="form-picker">{{ form.birthDate || '请选择' }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">体重 (kg)</text>
        <input class="form-input" v-model.number="form.weight" type="digit" placeholder="如：5.5" />
      </view>
    </view>

    <view class="form-section">
      <text class="section-title">照料信息</text>

      <view class="form-item">
        <text class="form-label">饮食习惯</text>
        <textarea class="form-textarea" v-model="form.dietHabits" placeholder="如：每日两餐、品牌猫粮、不吃鱼" />
      </view>

      <view class="form-item">
        <text class="form-label">禁忌事项</text>
        <textarea class="form-textarea" v-model="form.taboos" placeholder="如：不能吃巧克力、对花粉过敏" />
      </view>

      <view class="form-item">
        <text class="form-label">自定义备注</text>
        <textarea class="form-textarea" v-model="form.description" placeholder="其他需要注意的事项" />
      </view>
    </view>

    <view class="form-section">
      <text class="section-title">隐私设置</text>
      <view class="privacy-row">
        <view class="privacy-option" :class="{ active: form.privacy === 'PUBLIC' }" @tap="form.privacy = 'PUBLIC'">
          <text>公开</text>
          <text class="privacy-desc">他人可查看</text>
        </view>
        <view class="privacy-option" :class="{ active: form.privacy === 'PRIVATE' }" @tap="form.privacy = 'PRIVATE'">
          <text>私密</text>
          <text class="privacy-desc">仅自己可见</text>
        </view>
      </view>
    </view>

    <view class="submit-btn" @tap="handleSubmit">
      <text>{{ isEdit ? '保存修改' : '添加宠物' }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { usePetStore } from '@/store/pet';

const petStore = usePetStore();
const isEdit = ref(false);
const petId = ref('');

const speciesOptions = ['猫', '狗', '鸟', '鱼', '兔子', '仓鼠', '乌龟', '其他'];

const form = reactive({
  name: '', avatar: '', species: '', breed: '',
  gender: 'UNKNOWN', birthDate: '', weight: null,
  dietHabits: '', taboos: '', description: '',
  privacy: 'PUBLIC',
});

onLoad((options) => {
  if (options.id) {
    isEdit.value = true;
    petId.value = options.id;
    // 加载已有数据填充form
  }
});

function handleChooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    success: (res) => { form.avatar = res.tempFilePaths[0]; },
  });
}

async function handleSubmit() {
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入宠物昵称', icon: 'none' });
    return;
  }
  try {
    uni.showLoading({ title: '保存中...' });
    if (isEdit.value) {
      await petStore.editPet(petId.value, form);
    } else {
      await petStore.addPet(form);
    }
    uni.hideLoading();
    uni.showToast({ title: isEdit.value ? '修改成功' : '添加成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 800);
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '保存失败', icon: 'none' });
  }
}
</script>

<style scoped lang="scss">
.page-pet-create { padding-bottom: 60rpx; }
.form-section { background: #fff; margin: 16rpx 0; padding: 24rpx 32rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 20rpx; }
.form-item { margin-bottom: 24rpx; }
.form-label { font-size: 28rpx; color: #303133; display: block; margin-bottom: 12rpx; }
.form-input { width: 100%; height: 80rpx; border: 2rpx solid #DCDFE6; border-radius: 8rpx; padding: 0 20rpx; font-size: 28rpx; box-sizing: border-box; }
.form-textarea { width: 100%; height: 160rpx; border: 2rpx solid #DCDFE6; border-radius: 8rpx; padding: 16rpx 20rpx; font-size: 28rpx; box-sizing: border-box; }
.form-picker { width: 100%; height: 80rpx; border: 2rpx solid #DCDFE6; border-radius: 8rpx; padding: 0 20rpx; font-size: 28rpx; display: flex; align-items: center; color: #303133; box-sizing: border-box; }
.avatar-upload { width: 160rpx; height: 160rpx; border: 2rpx dashed #DCDFE6; border-radius: 16rpx; display: flex; align-items: center; justify-content: center; }
.avatar-preview { width: 100%; height: 100%; border-radius: 16rpx; }
.avatar-placeholder { font-size: 60rpx; color: #C0C4CC; }
.gender-switch { display: flex; gap: 16rpx; }
.gender-option { flex: 1; text-align: center; padding: 16rpx 0; border: 2rpx solid #DCDFE6; border-radius: 8rpx; font-size: 26rpx; color: #606266; }
.gender-option.active { border-color: var(--theme-primary); color: var(--theme-primary); background: #FFF3E8; }
.privacy-row { display: flex; gap: 16rpx; }
.privacy-option { flex: 1; text-align: center; padding: 20rpx 0; border: 2rpx solid #DCDFE6; border-radius: 8rpx; }
.privacy-option text { display: block; font-size: 28rpx; color: #303133; }
.privacy-desc { font-size: 22rpx !important; color: #909399 !important; }
.privacy-option.active { border-color: var(--theme-primary); background: var(--theme-primary-light); }
.submit-btn { margin: 40rpx 32rpx; background: var(--theme-primary); color: #fff; text-align: center; padding: 24rpx; border-radius: 48rpx; font-size: 30rpx; font-weight: 600; }
</style>
