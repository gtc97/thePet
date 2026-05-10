<template>
  <div class="dashboard">
    <h3>数据概览</h3>

    <!-- 核心统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="4" v-for="item in statCards" :key="item.label">
        <el-card shadow="hover" class="stat-card" :style="{ borderTop: `3px solid ${item.color}` }">
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px">
      <!-- 最近订单 -->
      <el-col :span="12">
        <el-card>
          <template #header>最近订单</template>
          <el-table :data="dashData.recentOrders || []" size="small">
            <el-table-column prop="orderNo" label="订单号" width="140" />
            <el-table-column label="宠主" width="80">
              <template #default="{ row }">{{ row.owner?.nickname }}</template>
            </el-table-column>
            <el-table-column label="宠护师" width="80">
              <template #default="{ row }">{{ row.provider?.nickname || '-' }}</template>
            </el-table-column>
            <el-table-column prop="serviceType" label="服务" width="70" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="statusTag(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="金额" width="60">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 宠护师排行 -->
      <el-col :span="12">
        <el-card>
          <template #header>宠护师排行 TOP5</template>
          <el-table :data="dashData.topProviders || []" size="small">
            <el-table-column type="index" label="#" width="40" />
            <el-table-column prop="nickname" label="昵称" width="100" />
            <el-table-column label="等级" width="60">
              <template #default="{ row }">
                <el-tag :type="levelTag(row.level)" size="small">Lv.{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="avgRating" label="评分" width="70">
              <template #default="{ row }">⭐{{ row.avgRating?.toFixed(1) || '-' }}</template>
            </el-table-column>
            <el-table-column prop="totalOrders" label="接单数" width="70" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待处理工单 -->
    <el-card class="section">
      <template #header>待处理工单</template>
      <el-table :data="pendingTasks" empty-text="暂无待处理工单" size="small">
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="desc" label="描述" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleTask(row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';

const router = useRouter();
const dashData = ref<any>({});

const statCards = ref([
  { label: '总用户数', value: '--', color: '#409EFF' },
  { label: '宠物数量', value: '--', color: '#67C23A' },
  { label: '服务订单', value: '--', color: '#E6A23C' },
  { label: '宠护师数', value: '--', color: '#F56C6C' },
  { label: '已付款', value: '--', color: '#909399' },
  { label: '今日完成', value: '--', color: '#67C23A' },
]);

const pendingTasks = ref<any[]>([]);

onMounted(async () => {
  try {
    const res = await api.get('/admin/dashboard');
    const d = dashData.value = res.data;
    statCards.value[0].value = String(d.userCount);
    statCards.value[1].value = String(d.petCount);
    statCards.value[2].value = String(d.orderCount);
    statCards.value[3].value = String(d.providerCount || 0);
    statCards.value[4].value = String(d.paidOrders || 0);
    statCards.value[5].value = String(d.completedToday || 0);
    pendingTasks.value = [
      { type: '资质审核', desc: `${d.pendingQualifications}条待审核`, route: 'qualification' },
      { type: '售后申诉', desc: `${d.pendingDisputes}条待处理`, route: 'disputes' },
      { type: '用户反馈', desc: `${d.pendingFeedbacks}条未读`, route: 'feedbacks' },
    ].filter(t => !t.desc.startsWith('0'));
  } catch { /* ignore */ }
});

function handleTask(task: any) {
  if (task.route === 'qualification') router.push({ path: '/users', query: { qualification: 'pending' } });
  else if (task.route === 'disputes') router.push('/disputes');
  else if (task.route === 'feedbacks') router.push('/feedbacks');
}

const statusColors: Record<string, string> = {
  PENDING:'warning', ACCEPTED:'primary', PAID:'success', IN_PROGRESS:'', WAITING_CONFIRM:'warning', COMPLETED:'success', CANCELLED:'danger', DISPUTE:'danger',
};
function statusTag(s: string) { return statusColors[s] || 'info'; }
function levelTag(lv: number) {
  const map: Record<number, string> = { 0:'info', 1:'', 2:'warning', 3:'success', 4:'', 5:'danger' };
  return map[lv] || 'info';
}
</script>

<style scoped>
.dashboard h3 { margin-bottom: 20px; color: #303133; }
.stat-row { margin-bottom: 16px; }
.stat-card { text-align: center; cursor: default; }
.stat-label { font-size: 13px; color: #909399; margin-bottom: 6px; }
.stat-value { font-size: 26px; font-weight: bold; color: #303133; }
.section { margin-top: 16px; }
</style>
