<template>
  <view class="page-locations">
    <view class="list" v-if="locations.length > 0">
      <view class="card" v-for="loc in locations" :key="loc.id">
        <view class="card-body">
          <text class="addr">{{ loc.address }}</text>
          <text class="city" v-if="loc.city">{{ loc.city }} {{ loc.district || '' }}</text>
          <text class="tag" v-if="loc.isDefault">默认</text>
        </view>
        <view class="card-actions">
          <text class="action" @tap="handleSetDefault(loc.id)">设为默认</text>
          <text class="action danger" @tap="handleDelete(loc.id)">删除</text>
        </view>
      </view>
    </view>
    <c-empty-state v-else text="暂无服务地址" />
    <view class="add-btn" @tap="handleAdd"><text>+ 添加地址</text></view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { request } from '@/api/request';

const locations = ref([]);

onShow(async () => {
  const res = await request({ url: '/users/me/locations' });
  locations.value = res.data || [];
});

async function handleAdd() {
  uni.showModal({
    title: '添加地址', editable: true, placeholderText: '请输入详细地址',
    success: async (res) => {
      if (res.confirm && res.content) {
        await request({ url: '/users/me/locations', method: 'POST', data: { address: res.content, city: '', latitude: 0, longitude: 0 } });
        const r = await request({ url: '/users/me/locations' });
        locations.value = r.data || [];
      }
    },
  });
}
async function handleSetDefault(id) {
  await request({ url: `/users/me/locations/${id}`, method: 'PUT', data: { isDefault: true } });
  const r = await request({ url: '/users/me/locations' });
  locations.value = r.data || [];
}
async function handleDelete(id) {
  uni.showModal({
    title: '删除地址', content: '确定删除？',
    success: async (r) => {
      if (r.confirm) {
        await request({ url: `/users/me/locations/${id}`, method: 'DELETE' });
        locations.value = locations.value.filter(l => l.id !== id);
      }
    },
  });
}
</script>

<style scoped lang="scss">
.page-locations { min-height: 100vh; background: #FBF8F4; padding-top: 16rpx; }
.list { padding: 0 32rpx; }
.card { background: #fff; border-radius: 16rpx; padding: 24rpx; margin-bottom: 16rpx; }
.card-body { margin-bottom: 12rpx; }
.addr { font-size: 30rpx; color: #2D2016; display: block; }
.city { font-size: 24rpx; color: #9E8E7E; margin-top: 4rpx; display: block; }
.tag { display: inline-block; background: #FFF3E8; color: var(--theme-primary); font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 10rpx; margin-top: 8rpx; }
.card-actions { display: flex; gap: 32rpx; padding-top: 12rpx; border-top: 1rpx solid #F5F0EA; }
.action { font-size: 26rpx; color: var(--theme-primary); }
.action.danger { color: #FF6467; }
.add-btn { margin: 40rpx 32rpx; background: var(--theme-primary); color: #fff; text-align: center; padding: 24rpx; border-radius: 48rpx; font-size: 30rpx; font-weight: 600; }
</style>
