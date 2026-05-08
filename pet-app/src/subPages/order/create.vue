<template>
  <view class="page-order-create">
    <!-- 选择宠物 -->
    <view class="section">
      <text class="section-title">选择宠物</text>
      <view class="pet-select">
        <view class="pet-option" v-for="pet in pets" :key="pet.id"
          :class="{ selected: selectedPets.includes(pet.id) }"
          @tap="togglePet(pet.id)">
          <image class="pet-avatar" :src="pet.avatar || '/static/default-pet.png'" mode="aspectFill" />
          <text class="pet-name">{{ pet.name }}</text>
          <view class="check-mark" v-if="selectedPets.includes(pet.id)">✓</view>
        </view>
      </view>
    </view>

    <!-- 服务类型 -->
    <view class="section">
      <text class="section-title">服务类型</text>
      <view class="service-grid">
        <view class="service-option" v-for="s in services" :key="s.value"
          :class="{ active: form.serviceType === s.value }"
          @tap="form.serviceType = s.value; form.price = s.price">
          <text class="service-icon">{{ s.icon }}</text>
          <text class="service-name">{{ s.name }}</text>
          <text class="service-price">¥{{ s.price }}</text>
        </view>
      </view>
    </view>

    <!-- 日期时间 -->
    <view class="section">
      <text class="section-title">上门时间</text>
      <picker mode="date" :start="today" @change="(e) => form.scheduledDate = e.detail.value">
        <view class="picker">{{ form.scheduledDate || '选择日期' }}</view>
      </picker>
      <view class="time-slots">
        <view class="slot" v-for="slot in timeSlots" :key="slot.value"
          :class="{ active: form.timeSlot === slot.value }"
          @tap="form.timeSlot = slot.value">{{ slot.label }}</view>
      </view>
    </view>

    <!-- 地址 -->
    <view class="section">
      <text class="section-title">服务地址</text>
      <input class="form-input" v-model="form.address" placeholder="请输入详细地址" />
    </view>

    <!-- 备注 -->
    <view class="section">
      <text class="section-title">备注</text>
      <textarea class="form-textarea" v-model="form.ownerNote"
        placeholder="宠物喂养要求、开门方式等注意事项" :maxlength="500" />
    </view>

    <!-- 费用预览 -->
    <view class="section" v-if="form.price > 0">
      <view class="fee-row">
        <text>服务费</text><text class="fee-amount">¥{{ form.price }}</text>
      </view>
      <view class="fee-row">
        <text>押金</text><text class="fee-amount">¥100.00</text>
      </view>
    </view>

    <view class="submit-btn" @tap="handleSubmit"><text>确认下单</text></view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getPets } from '@/api/pet';
import { createOrder } from '@/api/order';

const today = new Date().toISOString().slice(0, 10);
const pets = ref([]);
const selectedPets = ref([]);

const services = [
  { value: 'feeding', name: '喂食', icon: '🦴', price: 30 },
  { value: 'water', name: '换水', icon: '💧', price: 10 },
  { value: 'litter', name: '铲屎', icon: '🧹', price: 20 },
  { value: 'clean', name: '环境清理', icon: '🏠', price: 25 },
];

const timeSlots = [
  { value: 'morning', label: '上午 (8-12点)' },
  { value: 'afternoon', label: '下午 (12-18点)' },
  { value: 'evening', label: '晚上 (18-22点)' },
];

const form = reactive({
  petIds: [],
  serviceType: '',
  address: '',
  scheduledDate: '',
  timeSlot: '',
  price: 0,
  ownerNote: '',
});

onLoad(async () => {
  const res = await getPets({ archived: '0' });
  pets.value = (res.data || []).filter(p => !p.isArchived);
});

function togglePet(id) {
  const idx = selectedPets.value.indexOf(id);
  if (idx >= 0) selectedPets.value.splice(idx, 1);
  else selectedPets.value.push(id);
}

async function handleSubmit() {
  if (selectedPets.value.length === 0) return uni.showToast({ title: '请选择宠物', icon: 'none' });
  if (!form.serviceType) return uni.showToast({ title: '请选择服务', icon: 'none' });
  if (!form.scheduledDate) return uni.showToast({ title: '请选择日期', icon: 'none' });
  if (!form.timeSlot) return uni.showToast({ title: '请选择时段', icon: 'none' });
  if (!form.address.trim()) return uni.showToast({ title: '请填写地址', icon: 'none' });

  try {
    uni.showLoading({ title: '下单中...' });
    await createOrder({ ...form, petIds: selectedPets.value, price: form.price });
    uni.hideLoading();
    uni.showToast({ title: '下单成功', icon: 'success' });
    setTimeout(() => uni.switchTab({ url: '/pages/order/list' }), 800);
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '下单失败', icon: 'none' });
  }
}
</script>

<style scoped lang="scss">
.page-order-create { padding-bottom: 40rpx; background: var(--bg-page); min-height: 100vh; }
.section { background: var(--bg-white); padding: 24rpx 32rpx; margin-bottom: 16rpx; }
.section-title { font-size: var(--font-lg); font-weight: 600; display: block; margin-bottom: 16rpx; }
.pet-select { display: flex; gap: 20rpx; flex-wrap: wrap; }
.pet-option { width: 140rpx; text-align: center; position: relative; padding: 16rpx 0; border-radius: 12rpx; border: 2rpx solid var(--border-color); }
.pet-option.selected { border-color: var(--theme-primary); background: var(--theme-primary-light); }
.pet-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: #e8e8e8; margin-bottom: 8rpx; }
.pet-name { font-size: var(--font-sm); display: block; }
.check-mark { position: absolute; top: 8rpx; right: 8rpx; color: var(--theme-primary); font-weight: bold; }
.service-grid { display: flex; gap: 16rpx; }
.service-option { flex: 1; text-align: center; padding: 20rpx 0; border: 2rpx solid var(--border-color); border-radius: 12rpx; }
.service-option.active { border-color: var(--theme-primary); background: var(--theme-primary-light); }
.service-icon { font-size: 40rpx; display: block; }
.service-name { font-size: var(--font-sm); display: block; margin: 4rpx 0; }
.service-price { font-size: var(--font-xs); color: var(--color-danger); }
.picker { height: 80rpx; border: 2rpx solid var(--border-color); border-radius: 8rpx; display: flex; align-items: center; padding: 0 20rpx; }
.time-slots { display: flex; gap: 16rpx; margin-top: 16rpx; }
.slot { flex: 1; text-align: center; padding: 16rpx 0; border: 2rpx solid var(--border-color); border-radius: 8rpx; font-size: var(--font-sm); }
.slot.active { border-color: var(--theme-primary); background: var(--theme-primary-light); color: var(--theme-primary); }
.form-input { width: 100%; height: 80rpx; border: 2rpx solid var(--border-color); border-radius: 8rpx; padding: 0 20rpx; font-size: var(--font-md); box-sizing: border-box; }
.form-textarea { width: 100%; height: 150rpx; border: 2rpx solid var(--border-color); border-radius: 8rpx; padding: 16rpx; font-size: var(--font-md); box-sizing: border-box; }
.fee-row { display: flex; justify-content: space-between; font-size: var(--font-md); margin-bottom: 12rpx; }
.fee-amount { color: var(--color-danger); font-weight: 600; }
.submit-btn { margin: 40rpx 32rpx; background: var(--theme-primary); color: #fff; text-align: center; padding: 24rpx; border-radius: var(--border-radius-round); font-size: var(--font-lg); font-weight: 600; }
</style>
