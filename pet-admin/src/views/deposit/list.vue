<template>
  <div class="deposit-list">
    <h3>押金管理</h3>
    <el-card>
      <el-form :inline="true">
        <el-form-item label="押金金额配置">
          <el-input-number v-model="depositAmount" :min="0" :step="10" />
          <el-button type="primary" style="margin-left:10px" @click="saveConfig">保存</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="deposits" v-loading="loading" border stripe style="width:100%" empty-text="暂无记录">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户" width="120">
          <template #default="{ row }">{{ row.user?.nickname || '-' }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status==='PAID'?'success':row.status==='FROZEN'?'warning':row.status==='FORFEITED'?'danger':'info'" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="150">
          <template #default="{ row }">
            <el-button v-if="row.status==='FROZEN'" size="small" type="danger" @click="handleForfeit(row.id)">罚没</el-button>
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

const deposits = ref([]);
const loading = ref(false);
const depositAmount = ref(100);

const statusLabel = (s: string) => ({ UNPAID:'未缴纳', PAID:'已缴纳', FROZEN:'冻结中', REFUNDED:'已退款', FORFEITED:'已罚没' }[s] || s);

onMounted(async () => {
  const res = await api.get('/admin/config/deposit_amount');
  if (res.data?.value) depositAmount.value = parseInt(res.data.value);
  fetchDeposits();
});

async function fetchDeposits() {
  loading.value = true;
  try { const res = await api.get('/admin/deposits'); deposits.value = res.data.list || []; }
  finally { loading.value = false; }
}

async function saveConfig() {
  await api.put('/admin/deposits/config', { amount: String(depositAmount.value) });
  ElMessage.success('已保存');
}

async function handleForfeit(id: number) {
  await api.post(`/admin/deposits/${id}/forfeit`);
  ElMessage.success('已罚没');
  fetchDeposits();
}
</script>
