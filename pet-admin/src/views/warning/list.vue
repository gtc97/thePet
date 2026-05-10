<template>
  <div class="warning-list">
    <h3>预警管理</h3>
    <el-card>
      <div style="margin-bottom:12px;display:flex;gap:8px">
        <el-button type="primary" @click="runCheck" :loading="checking">运行检测</el-button>
        <el-tag size="small" type="info">检测近7天异常数据：高频取消、差评集中、投诉激增</el-tag>
      </div>
      <el-table :data="warnings" border stripe v-loading="loading">
        <el-table-column label="级别" width="80">
          <template #default="{ row }">
            <el-tag :type="levelTag(row.level)" size="small">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" width="160" />
        <el-table-column prop="content" label="详细内容" />
        <el-table-column prop="createdAt" label="时间" width="160">
          <template #default="{ row }">{{ row.createdAt?.slice(0,19).replace('T',' ') }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button v-if="!row.handled" size="small" type="warning" @click="handleMark(row.id)">标记处理</el-button>
            <el-tag v-else type="success" size="small">已处理</el-tag>
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

const warnings = ref<any[]>([]);
const loading = ref(false);
const checking = ref(false);

onMounted(() => fetchWarnings());

async function fetchWarnings() {
  loading.value = true;
  try {
    const res = await api.get('/admin/warnings');
    warnings.value = res.data.list || [];
  } finally { loading.value = false; }
}

async function runCheck() {
  checking.value = true;
  try {
    await api.post('/admin/warnings/check');
    ElMessage.success('检测完成');
    fetchWarnings();
  } finally { checking.value = false; }
}

async function handleMark(id: number) {
  await api.put(`/admin/warnings/${id}/handle`);
  ElMessage.success('已标记处理');
  fetchWarnings();
}

function levelTag(level: string) {
  const map: Record<string, string> = { info: 'info', warn: 'warning', alert: 'danger' };
  return map[level] || 'info';
}
</script>

<style scoped>
.warning-list h3 { margin-bottom: 20px; color: #303133; }
</style>
