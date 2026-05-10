<template>
  <view class="page-order-create">
    <!-- 选择宠护师 -->
    <view class="section provider-section">
      <text class="section-title">选择为你服务的宠护师</text>
      <view class="provider-select" v-if="selectedProvider" @tap="navigateTo('/subPages/user/provider-profile?id=' + selectedProvider.id)">
        <c-avatar :src="selectedProvider.avatar" :name="selectedProvider.nickname" size="md" />
        <view class="pv-info">
          <text class="pv-name">{{ selectedProvider.nickname }}</text>
          <text class="pv-desc">⭐{{ selectedProvider.avgRating?.toFixed(1) || '新手上路' }} | Lv.{{ selectedProvider.level || 0 }}</text>
        </view>
        <text class="change-btn" @tap.stop="selectedProvider = null">✕</text>
      </view>
      <view class="provider-select empty" v-else @tap="navigateTo('/subPages/user/provider-list')">
        <text class="empty-icon">👤</text>
        <text class="empty-text">选择宠护师，或留空后由宠护师申请接单</text>
        <text class="arrow">→</text>
      </view>
    </view>

    <!-- 选择宠物 -->
    <view class="section">
      <text class="section-title">选择宠物</text>
      <view class="pet-select">
        <view class="pet-option" v-for="pet in pets" :key="pet.id"
          :class="{ selected: selectedPets.includes(pet.id) }"
          @tap="togglePet(pet.id)">
          <c-avatar :src="pet.avatar" :name="pet.name" size="sm" />
          <text class="pet-name">{{ pet.name }}</text>
          <view class="check-mark" v-if="selectedPets.includes(pet.id)">✓</view>
        </view>
        <view class="pet-option add" v-if="pets.length === 0" @tap="navigateTo('/subPages/pet/create')">
          <text class="add-icon">+</text>
          <text class="pet-name">添加宠物</text>
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
        <view class="slot" v-for="s in timeSlots" :key="s.value"
          :class="{ active: form.timeSlot === s.value }"
          @tap="form.timeSlot = s.value">{{ s.label }}</view>
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
      <view class="fee-row"><text>服务费</text><text class="fee-amount">¥{{ form.price }}</text></view>
      <view class="fee-row"><text>押金</text><text class="fee-amount">¥100.00</text></view>
    </view>

    <view class="submit-btn" @tap="handleSubmit"><text>确认下单</text></view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { getPets } from '@/api/pet';
import { createOrder } from '@/api/order';
import { request } from '@/api/request';

const SERVICE_ICONS = ['🦴', '💧', '🧹', '🏠', '🐕', '🛁', '✂️', '💉'];

const today = new Date().toISOString().slice(0, 10);
const pets = ref([]);
const selectedPets = ref([]);
const services = ref([]);
const selectedProvider = ref(null);

onLoad((options) => {
  loadPets();
  loadServices();
  // 如果从师傅主页跳转过来，自动选中师傅
  if (options.providerId) {
    loadProvider(options.providerId);
  }
  // 如果从师傅列表页选完回来
  if (options.selectedProvider) {
    try { selectedProvider.value = JSON.parse(decodeURIComponent(options.selectedProvider)); } catch { /* */ }
  }
});

// 从列表页返回时接收选中结果
onShow(() => {
  const pages = getCurrentPages();
  const curr = pages[pages.length - 1];
  if (curr && curr.$vm && curr.$vm.pickedProvider) {
    selectedProvider.value = curr.$vm.pickedProvider;
    curr.$vm.pickedProvider = null;
  }
});

async function loadProvider(id) {
  try {
    const res = await request({ url: `/users/${id}` });
    selectedProvider.value = res.data;
  } catch { /* */ }
}

async function loadPets() {
  try {
    const res = await getPets({ isArchived: false });
    pets.value = Array.isArray(res.data) ? res.data.filter(p => !p.isArchived) : [];
  } catch { /* ignore */ }
}

async function loadServices() {
  try {
    const res = await request({ url: '/services' });
    services.value = (res.data || []).map((s, i) => ({
      value: s.name, name: s.name,
      icon: SERVICE_ICONS[i % SERVICE_ICONS.length],
      price: s.price,
    }));
  } catch { /* ignore */ }
}

const timeSlots = [
  { value: 'morning', label: '上午' },
  { value: 'afternoon', label: '下午' },
  { value: 'evening', label: '晚上' },
];

const form = reactive({
  petIds: [], serviceType: '', address: '',
  scheduledDate: '', timeSlot: '', price: 0, ownerNote: '',
});

function togglePet(id) {
  const idx = selectedPets.value.indexOf(id);
  if (idx >= 0) selectedPets.value.splice(idx, 1);
  else selectedPets.value.push(id);
}

async function handleSubmit() {
  // 师傅可选
  if (selectedPets.value.length === 0) return uni.showToast({ title: '请选择宠物', icon: 'none' });
  if (!form.serviceType) return uni.showToast({ title: '请选择服务', icon: 'none' });
  if (!form.scheduledDate) return uni.showToast({ title: '请选择日期', icon: 'none' });
  if (!form.timeSlot) return uni.showToast({ title: '请选择时段', icon: 'none' });
  if (!form.address.trim()) return uni.showToast({ title: '请填写地址', icon: 'none' });

  try {
    uni.showLoading({ title: '下单中...' });
    await createOrder({
      ...form, petIds: selectedPets.value, price: form.price,
      providerId: selectedProvider.value.id,
    });
    uni.hideLoading();
    uni.showToast({ title: '已下单，等待宠护师确认', icon: 'success' });
    setTimeout(() => uni.switchTab({ url: '/pages/order/list' }), 800);
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: e.message || '下单失败', icon: 'none' });
  }
}

function navigateTo(url) { uni.navigateTo({ url }); }
</script>

<style scoped lang="scss">
.page-order-create { padding-bottom: 40rpx; background: #FBF8F4; min-height: 100vh; }
.section { background: #fff; padding: 24rpx 32rpx; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; display: block; margin-bottom: 16rpx; color: #303133; }
// 师傅选择
.provider-select { display: flex; align-items: center; padding: 16rpx; background: #F8FAFB; border-radius: 12rpx; border: 2rpx solid #E8ECF0; }
.provider-select.empty { justify-content: center; gap: 12rpx; border-style: dashed; padding: 32rpx; }
.pv-avatar { width: 72rpx; height: 72rpx; border-radius: 50%; background: #e8e8e8; margin-right: 16rpx; }
.pv-info { flex: 1; }
.pv-name { font-size: 28rpx; font-weight: 600; color: #303133; display: block; }
.pv-desc { font-size: 24rpx; color: #909399; }
.change-btn { font-size: 24rpx; color: var(--theme-primary); padding: 8rpx 16rpx; }
.empty-icon { font-size: 40rpx; }
.empty-text { font-size: 28rpx; color: #909399; }
.arrow { font-size: 24rpx; color: #909399; margin-left: 4rpx; }
// 宠物选择
.pet-select { display: flex; gap: 20rpx; flex-wrap: wrap; }
.pet-option { width: 140rpx; text-align: center; position: relative; padding: 16rpx 0; border-radius: 12rpx; border: 2rpx solid #F5F0EA; }
.pet-option.selected { border-color: var(--theme-primary); background: #FFF3E8; }
.pet-option.add { opacity: 0.6; }
.add-icon { font-size: 48rpx; color: #C4B8AD; display: block; }
.pet-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: #e8e8e8; margin-bottom: 8rpx; }
.pet-name { font-size: 24rpx; display: block; }
.check-mark { position: absolute; top: 8rpx; right: 8rpx; color: var(--theme-primary); font-weight: bold; }
// 服务
.service-grid { display: flex; gap: 16rpx; }
.service-option { flex: 1; text-align: center; padding: 20rpx 0; border: 2rpx solid #F5F0EA; border-radius: 12rpx; }
.service-option.active { border-color: var(--theme-primary); background: #FFF3E8; }
.service-icon { font-size: 40rpx; display: block; }
.service-name { font-size: 24rpx; display: block; margin: 4rpx 0; }
.service-price { font-size: 22rpx; color: #F56C6C; }
.picker { height: 80rpx; border: 2rpx solid #F5F0EA; border-radius: 8rpx; display: flex; align-items: center; padding: 0 20rpx; }
.time-slots { display: flex; gap: 16rpx; margin-top: 16rpx; }
.slot { flex: 1; text-align: center; padding: 16rpx 0; border: 2rpx solid #F5F0EA; border-radius: 8rpx; font-size: 26rpx; }
.slot.active { border-color: var(--theme-primary); background: #FFF3E8; color: var(--theme-primary); }
.form-input { width: 100%; height: 80rpx; border: 2rpx solid #F5F0EA; border-radius: 8rpx; padding: 0 20rpx; font-size: 28rpx; box-sizing: border-box; }
.form-textarea { width: 100%; height: 150rpx; border: 2rpx solid #F5F0EA; border-radius: 8rpx; padding: 16rpx; font-size: 28rpx; box-sizing: border-box; }
.fee-row { display: flex; justify-content: space-between; font-size: 28rpx; margin-bottom: 12rpx; }
.fee-amount { color: #F56C6C; font-weight: 600; }
.submit-btn { margin: 40rpx 32rpx; background: var(--theme-primary); color: #fff; text-align: center; padding: 24rpx; border-radius: 48rpx; font-size: 32rpx; font-weight: 600; }
</style>
