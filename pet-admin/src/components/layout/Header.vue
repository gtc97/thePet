<template>
  <div class="header-content">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <span class="admin-name">{{ store.adminInfo?.nickname || '管理员' }}</span>
      <el-button type="danger" text @click="handleLogout">退出登录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin';

const route = useRoute();
const router = useRouter();
const store = useAdminStore();

function handleLogout() {
  store.logout();
  router.push('/login');
}
</script>

<style scoped>
.header-content { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.header-right { display: flex; align-items: center; gap: 12px; }
.admin-name { color: #606266; }
</style>
