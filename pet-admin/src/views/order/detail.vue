<template>
  <div class="order-detail">
    <h3>订单详情</h3>
    <el-card v-loading="loading">
      <template v-if="order.id">
        <el-descriptions title="订单信息" :column="2" border>
          <el-descriptions-item label="订单编号">{{ order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="服务类型">{{ order.serviceType }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="statusTag(order.status)">{{ order.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="金额">¥{{ order.price }}</el-descriptions-item>
          <el-descriptions-item label="预约日期">{{ order.scheduledDate?.slice(0, 10) }}</el-descriptions-item>
          <el-descriptions-item label="时间段">{{ order.timeSlot }}</el-descriptions-item>
          <el-descriptions-item label="服务地址">{{ order.address }}</el-descriptions-item>
          <el-descriptions-item label="支付状态">
            <el-tag :type="order.paymentStatus === 'PAID' ? 'success' : 'info'">
              {{ order.paymentStatus === 'PAID' ? '已付款' : '未付款' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="order.paymentProof" label="支付凭证">
            <el-image :src="order.paymentProof" style="width:100px;height:100px" fit="cover" :preview-src-list="[order.paymentProof]" />
          </el-descriptions-item>
          <el-descriptions-item label="宠主确认">{{ order.ownerConfirmedAt?.slice(0,19) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ order.createdAt?.slice(0, 10) }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>宠主信息</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="昵称">{{ order.owner?.nickname }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ $maskPhone(order.owner?.phone) }}</el-descriptions-item>
        </el-descriptions>

        <template v-if="order.provider">
          <el-divider>宠护师信息</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="昵称">{{ order.provider.nickname }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ $maskPhone(order.provider.phone) }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="order.statusLogs?.length">
          <el-divider>状态时间线</el-divider>
          <el-timeline>
            <el-timeline-item
              v-for="log in order.statusLogs" :key="log.id"
              :timestamp="log.createdAt?.slice(0, 19).replace('T', ' ')"
            >
              {{ log.fromStatus ? `${log.fromStatus} → ${log.toStatus}` : `创建 (${log.toStatus})` }}
              <span v-if="log.remark" style="color:#909399;margin-left:8px">{{ log.remark }}</span>
            </el-timeline-item>
          </el-timeline>
        </template>

        <div style="margin-top:20px">
          <el-button @click="$router.back()">返回列表</el-button>
        </div>
      </template>
      <el-empty v-else description="暂无数据" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api';

const route = useRoute();
const order = ref<any>({});
const loading = ref(false);

const statusMap: Record<string, string> = {
  PENDING: 'warning', ACCEPTED: 'primary', PAID: 'success', IN_PROGRESS: '', WAITING_CONFIRM: 'warning', COMPLETED: 'success', CANCELLED: 'danger', DISPUTE: 'danger',
};
function statusTag(s: string) { return statusMap[s] || 'info'; }

onMounted(async () => {
  loading.value = true;
  try {
    const res = await api.get(`/admin/orders/${route.params.id}`);
    order.value = res.data;
  } finally { loading.value = false; }
});
</script>

<style scoped>
.order-detail h3 { margin-bottom: 20px; color: #303133; }
</style>
