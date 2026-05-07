<template>
  <div class="user-detail">
    <h3>用户详情</h3>
    <el-card>
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="ID">{{ user.id }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ user.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ user.phone }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ user.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="账号状态">
          <el-tag :type="user.status === 'ACTIVE' ? 'success' : 'danger'">{{ user.status }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const user = ref({ id: '', nickname: '', phone: '', createdAt: '', status: '' });
</script>
