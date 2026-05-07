<template>
  <div class="sidebar">
    <div class="logo">thePet 管理后台</div>
    <el-menu
      :default-active="route.path"
      router
      background-color="#1d1e2c"
      text-color="#a6aebf"
      active-text-color="#409eff"
    >
      <el-menu-item index="/dashboard">
        <el-icon><DataAnalysis /></el-icon>
        <span>数据概览</span>
      </el-menu-item>
      <el-menu-item index="/users">
        <el-icon><User /></el-icon>
        <span>用户管理</span>
      </el-menu-item>
      <el-menu-item index="/pets">
        <el-icon><Picture /></el-icon>
        <span>宠物内容风控</span>
      </el-menu-item>
      <el-menu-item index="/orders">
        <el-icon><Document /></el-icon>
        <span>订单管理</span>
      </el-menu-item>
      <el-menu-item index="/deposits">
        <el-icon><Wallet /></el-icon>
        <span>押金管理</span>
      </el-menu-item>
      <el-menu-item index="/disputes">
        <el-icon><Warning /></el-icon>
        <span>售后仲裁</span>
      </el-menu-item>
      <el-menu-item index="/feedbacks">
        <el-icon><ChatLineRound /></el-icon>
        <span>用户反馈</span>
      </el-menu-item>
      <el-menu-item index="/settings">
        <el-icon><Setting /></el-icon>
        <span>平台配置</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
</script>

<style scoped>
.logo { color: #fff; font-size: 18px; font-weight: bold; padding: 20px; text-align: center; border-bottom: 1px solid #2d2e3c; }
.sidebar { height: 100%; }
.el-menu { border-right: none; }
</style>
