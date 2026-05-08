<template>
  <div class="user-detail">
    <h3>用户详情</h3>
    <el-card v-loading="loading">
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="ID">{{ user.id }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ user.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ user.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="城市">{{ user.city || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ user.createdAt?.slice(0, 10) }}</el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag :type="user.status === 'ACTIVE' ? 'success' : 'danger'">{{ user.status === 'ACTIVE' ? '正常' : '已禁用' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="身份">
          <el-tag v-for="r in (user.roles || [])" :key="r" size="small" style="margin-right:4px">
            {{ r === 'PET_OWNER' ? '宠物主' : '上门师傅' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="资质状态">{{ user.qualificationStatus || '-' }}</el-descriptions-item>
        <el-descriptions-item label="评分">{{ user.avgRating?.toFixed(1) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="接单数">{{ user.totalOrders || 0 }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>宠物列表</el-divider>
      <el-table :data="user.pets || []" border stripe size="small">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="breed" label="品种" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isArchived ? 'warning' : 'success'" size="small">
              {{ row.isArchived ? '已封存' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-divider>订单统计</el-divider>
      <p>已发布订单：{{ user._count?.ownedOrders || 0 }} 单 | 已接订单：{{ user._count?.providerOrders || 0 }} 单</p>

      <div style="margin-top:20px">
        <el-button @click="$router.back()">返回列表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api';

const route = useRoute();
const user = ref<any>({});
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const res = await api.get(`/admin/users/${route.params.id}`);
    user.value = res.data;
  } finally { loading.value = false; }
});
</script>

<style scoped>
.user-detail h3 { margin-bottom: 20px; color: #303133; }
</style>
