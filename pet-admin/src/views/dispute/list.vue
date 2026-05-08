<template>
  <div class="dispute-list">
    <h3>售后仲裁</h3>
    <el-card>
      <el-table :data="disputes" v-loading="loading" border stripe style="width:100%" empty-text="暂无申诉">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="关联订单" width="200">
          <template #default="{ row }">{{ row.order?.orderNo || '-' }}</template>
        </el-table-column>
        <el-table-column label="发起人" width="100">
          <template #default="{ row }">{{ row.initiator?.nickname || '-' }}</template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">{{ typeLabel(row.type) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status==='RESOLVED'?'success':row.status==='REJECTED'?'info':'warning'" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200">
          <template #default="{ row }">
            <template v-if="row.status==='PENDING'||row.status==='REVIEWING'">
              <el-button size="small" type="primary" @click="handleResolve(row.id)">仲裁处理</el-button>
            </template>
            <span v-else style="color:#909399">已处理</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import api from '@/api';

const disputes = ref([]);
const loading = ref(false);

const typeLabel = (t: string) => ({ service_quality:'服务质量', damage:'物品损坏', no_show:'未按时到达', other:'其他' }[t] || t);
const statusLabel = (s: string) => ({ PENDING:'待处理', REVIEWING:'审核中', RESOLVED:'已解决', REJECTED:'已驳回' }[s] || s);

onMounted(() => fetchDisputes());

async function fetchDisputes() {
  loading.value = true;
  try { const res = await api.get('/admin/disputes'); disputes.value = res.data.list || []; }
  finally { loading.value = false; }
}

async function handleResolve(id: number) {
  try {
    await api.put(`/admin/disputes/${id}/resolve`, { resolution: '管理员已处理' });
    ElMessage.success('已处理');
    fetchDisputes();
  } catch { /* ignore */ }
}
</script>
