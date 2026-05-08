<template>
  <div class="feedback-list">
    <h3>用户反馈管理</h3>
    <el-card>
      <el-form :inline="true">
        <el-form-item label="状态">
          <el-select v-model="filterStatus" placeholder="全部" clearable @change="fetchFeedbacks">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已解决" value="resolved" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" @click="fetchFeedbacks">查询</el-button></el-form-item>
      </el-form>
      <el-table :data="feedbacks" v-loading="loading" border stripe style="width:100%" empty-text="暂无反馈">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户" width="120">
          <template #default="{ row }">{{ row.user?.nickname || '匿名' }}</template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">{{ typeLabel(row.type) }}</template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="250" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status==='resolved'?'success':row.status==='processing'?'warning':'info'" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="160">
          <template #default="{ row }">{{ row.createdAt?.slice(0,16) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button v-if="row.status!=='resolved'" size="small" type="primary" @click="handleMark(row.id, 'resolved')">标记已解决</el-button>
            <span v-else style="color:#909399">--</span>
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

const feedbacks = ref([]);
const loading = ref(false);
const filterStatus = ref('');

const typeLabel = (t: string) => ({ bug:'Bug', suggestion:'建议', complaint:'投诉', other:'其他' }[t] || t);
const statusLabel = (s: string) => ({ pending:'待处理', processing:'处理中', resolved:'已解决' }[s] || s);

onMounted(() => fetchFeedbacks());

async function fetchFeedbacks() {
  loading.value = true;
  try {
    const params: any = {};
    if (filterStatus.value) params.status = filterStatus.value;
    const res = await api.get('/admin/feedbacks', { params });
    feedbacks.value = res.data.list || [];
  } finally { loading.value = false; }
}

async function handleMark(id: number, status: string) {
  await api.put(`/admin/feedbacks/${id}`, { status });
  ElMessage.success('已更新');
  fetchFeedbacks();
}
</script>
