<template>
  <div class="dashboard">
    <h3>数据概览</h3>
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="item in statCards" :key="item.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-card class="section">
      <template #header>待处理工单</template>
      <el-table :data="pendingTasks" empty-text="暂无待处理工单" style="width: 100%">
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="createdAt" label="提交时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default>
            <el-button type="primary" size="small" link>处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const statCards = ref([
  { label: '总用户数', value: '--' },
  { label: '宠物数量', value: '--' },
  { label: '总订单数', value: '--' },
  { label: '待处理工单', value: '--' },
]);

const pendingTasks = ref([]);
</script>

<style scoped>
.dashboard h3 { margin-bottom: 20px; color: #303133; }
.stat-row { margin-bottom: 20px; }
.stat-card { text-align: center; }
.stat-label { font-size: 14px; color: #909399; margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: bold; color: #303133; }
.section { margin-top: 20px; }
</style>
