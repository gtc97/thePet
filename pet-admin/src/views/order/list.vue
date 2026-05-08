<template>
  <div class="order-list">
    <h3>订单管理</h3>
    <el-card>
      <el-form :inline="true">
        <el-form-item label="订单状态">
          <el-select v-model="query.status" placeholder="全部" clearable @change="fetchOrders">
            <el-option label="待接单" value="PENDING" />
            <el-option label="已接单" value="ACCEPTED" />
            <el-option label="服务中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
            <el-option label="申诉中" value="DISPUTE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchOrders">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="orders" v-loading="loading" border stripe style="width: 100%" empty-text="暂无订单">
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column label="宠主" width="100">
          <template #default="{ row }">{{ row.owner?.nickname || '-' }}</template>
        </el-table-column>
        <el-table-column label="师傅" width="100">
          <template #default="{ row }">{{ row.provider?.nickname || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status==='COMPLETED'?'success':row.status==='CANCELLED'?'info':row.status==='DISPUTE'?'danger':'warning'" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="金额" width="100" />
        <el-table-column label="操作" min-width="150">
          <template #default="{ row }">
            <el-button size="small" @click="$router.push('/orders/' + row.id)">详情</el-button>
            <el-button v-if="row.status==='DISPUTE'" size="small" type="warning" @click="handleStatusChange(row.id)">强制完成</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import api from '@/api';

const orders = ref([]);
const total = ref(0);
const loading = ref(false);
const query = reactive({ status: '', orderNo: '', page: 1, pageSize: 20 });

const statusLabel = (s: string) => ({ PENDING:'待接单', ACCEPTED:'已接单', IN_PROGRESS:'服务中', COMPLETED:'已完成', CANCELLED:'已取消', DISPUTE:'申诉中' }[s] || s);

onMounted(() => fetchOrders());

async function fetchOrders() {
  loading.value = true;
  try {
    const res = await api.get('/admin/orders', { params: query });
    orders.value = res.data.list || [];
    total.value = res.data.total || 0;
  } finally { loading.value = false; }
}

async function handleStatusChange(orderId: number) {
  try {
    await api.put(`/admin/orders/${orderId}/status`, { status: 'COMPLETED' });
    ElMessage.success('已变更');
    fetchOrders();
  } catch { /* ignore */ }
}
</script>
