<template>
  <view class="page-pet-detail" v-if="pet">
    <!-- 头部 -->
    <view class="detail-header">
      <image class="cover" :src="pet.coverImage || pet.avatar || '/static/default-pet.png'" mode="aspectFill" />
      <view class="header-info">
        <text class="pet-name">{{ pet.name }}</text>
        <text class="pet-breed">{{ pet.breed || '未知品种' }} · {{ genderLabel(pet.gender) }}</text>
        <view class="privacy-badge" :class="pet.privacy === 'PRIVATE' ? 'private' : 'public'">
          {{ pet.privacy === 'PRIVATE' ? '私密档案' : '公开档案' }}
        </view>
      </view>
    </view>

    <!-- 数据统计看板 -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-num">{{ stats.days }}</text>
        <text class="stat-label">饲养天数</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.diaryCount }}</text>
        <text class="stat-label">日记</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.photoCount }}</text>
        <text class="stat-label">相册</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.orderCount }}</text>
        <text class="stat-label">服务次数</text>
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="section">
      <text class="section-title">基本信息</text>
      <view class="info-grid">
        <view class="info-item"><text class="label">品种</text><text class="value">{{ pet.breed || '未设置' }}</text></view>
        <view class="info-item"><text class="label">性别</text><text class="value">{{ genderLabel(pet.gender) }}</text></view>
        <view class="info-item"><text class="label">体重</text><text class="value">{{ pet.weight ? pet.weight + 'kg' : '未设置' }}</text></view>
        <view class="info-item"><text class="label">出生日期</text><text class="value">{{ pet.birthDate || '未设置' }}</text></view>
      </view>
    </view>

    <!-- 饮食习惯 & 禁忌 -->
    <view class="section" v-if="pet.dietHabits || pet.taboos">
      <text class="section-title">照料备注</text>
      <view class="note-item" v-if="pet.dietHabits">
        <text class="note-label">饮食习惯</text>
        <text class="note-text">{{ pet.dietHabits }}</text>
      </view>
      <view class="note-item" v-if="pet.taboos">
        <text class="note-label">禁忌事项</text>
        <text class="note-text">{{ pet.taboos }}</text>
      </view>
    </view>

    <!-- 快速入口 -->
    <view class="section">
      <text class="section-title">快捷入口</text>
      <view class="quick-grid">
        <view class="quick-item" @tap="navigateTo('/subPages/album/list?petId=' + pet.id)">
          <text class="quick-icon">📸</text>
          <text class="quick-text">相册</text>
        </view>
        <view class="quick-item" @tap="navigateTo('/subPages/diary/list?petId=' + pet.id)">
          <text class="quick-icon">📝</text>
          <text class="quick-text">成长日记</text>
        </view>
        <view class="quick-item" @tap="navigateTo('/subPages/share/create?petId=' + pet.id)">
          <text class="quick-icon">🔗</text>
          <text class="quick-text">分享</text>
        </view>
        <view class="quick-item" @tap="navigateTo('/subPages/order/create?petId=' + pet.id)">
          <text class="quick-icon">🏠</text>
          <text class="quick-text">预约上门</text>
        </view>
      </view>
    </view>

    <!-- 历史服务记录 -->
    <view class="section">
      <text class="section-title">服务记录</text>
      <view v-if="serviceRecords.length === 0" style="padding: 20rpx 0;">
        <text style="color: #C0C4CC; font-size: 26rpx;">暂无服务记录</text>
      </view>
    </view>

    <!-- 档案封存操作 -->
    <view class="section">
      <view class="action-btns">
        <view class="action-btn" @tap="navigateTo('/subPages/pet/edit?id=' + pet.id)">
          <text>✏️ 编辑档案</text>
        </view>
        <view class="action-btn" :class="{ warn: !pet.isArchived }" @tap="handleToggleArchive">
          <text>{{ pet.isArchived ? '📂 解除封存' : '📦 封存档案' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onLoad } from 'vue';
import { usePetStore } from '@/store/pet';

const petStore = usePetStore();
const pet = ref(null);
const serviceRecords = ref([]);
const stats = reactive({ days: 0, diaryCount: 0, photoCount: 0, orderCount: 0 });

onLoad(async (options) => {
  if (options.id) {
    pet.value = await petStore.fetchPetDetail(options.id);
  }
});

function genderLabel(g) {
  return { MALE: '♂ 男生', FEMALE: '♀ 女生', UNKNOWN: '未知' }[g] || '未知';
}

function navigateTo(url) {
  uni.navigateTo({ url });
}

async function handleToggleArchive() {
  const action = pet.value.isArchived ? '解除封存' : '封存';
  uni.showModal({
    title: '确认操作',
    content: `确定要${action}「${pet.value.name}」的档案吗？${!pet.value.isArchived ? '封存后将无法下单、无法编辑。' : ''}`,
    success: async (res) => {
      if (res.confirm) {
        try {
          if (pet.value.isArchived) {
            // await unarchivePet(pet.value.id);
          } else {
            // await archivePet(pet.value.id);
          }
          pet.value.isArchived = !pet.value.isArchived;
          uni.showToast({ title: `${action}成功`, icon: 'success' });
        } catch (e) {
          uni.showToast({ title: e.message || '操作失败', icon: 'none' });
        }
      }
    },
  });
}
</script>

<style scoped lang="scss">
.page-pet-detail { padding-bottom: 60rpx; }
.detail-header { position: relative; }
.cover { width: 100%; height: 400rpx; background: #e8e8e8; }
.header-info { padding: 24rpx 32rpx; background: #fff; }
.pet-name { font-size: 40rpx; font-weight: bold; color: #303133; display: block; }
.pet-breed { font-size: 26rpx; color: #909399; display: block; margin-top: 4rpx; }
.privacy-badge { display: inline-block; margin-top: 8rpx; font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 20rpx; }
.privacy-badge.public { background: #ecf5ff; color: #409EFF; }
.privacy-badge.private { background: #fef0f0; color: #F56C6C; }
.stats-bar { display: flex; background: #fff; margin: 16rpx 0; padding: 24rpx 0; }
.stat-item { flex: 1; text-align: center; }
.stat-num { font-size: 36rpx; font-weight: bold; color: #303133; display: block; }
.stat-label { font-size: 22rpx; color: #909399; display: block; margin-top: 4rpx; }
.section { background: #fff; padding: 24rpx 32rpx; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #303133; display: block; margin-bottom: 16rpx; }
.info-grid { display: flex; flex-wrap: wrap; }
.info-item { width: 50%; margin-bottom: 16rpx; }
.info-item .label { font-size: 24rpx; color: #909399; display: block; }
.info-item .value { font-size: 28rpx; color: #303133; display: block; margin-top: 4rpx; }
.note-item { margin-bottom: 16rpx; }
.note-label { font-size: 24rpx; color: #909399; display: block; }
.note-text { font-size: 28rpx; color: #303133; display: block; margin-top: 4rpx; }
.quick-grid { display: flex; gap: 16rpx; }
.quick-item { flex: 1; text-align: center; padding: 20rpx 0; background: #f5f7fa; border-radius: 12rpx; }
.quick-icon { font-size: 40rpx; display: block; margin-bottom: 8rpx; }
.quick-text { font-size: 22rpx; color: #606266; }
.action-btns { display: flex; gap: 20rpx; }
.action-btn { flex: 1; text-align: center; padding: 20rpx; background: #ecf5ff; border-radius: 12rpx; font-size: 26rpx; color: #409EFF; }
.action-btn.warn { background: #fef0f0; color: #F56C6C; }
</style>
