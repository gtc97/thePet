<template>
  <div class="setting">
    <h3>平台配置</h3>
    <el-card class="section">
      <template #header>服务项目管理</template>
      <el-table :data="services" border stripe style="width: 100%">
        <el-table-column prop="name" label="服务名称" />
        <el-table-column prop="price" label="默认价格" />
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button size="small">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary" style="margin-top: 12px">新增服务项</el-button>
    </el-card>
    <el-card class="section">
      <template #header>平台公告</template>
      <el-table :data="[]" border stripe style="width: 100%" empty-text="暂无公告">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="createdAt" label="发布时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default>
            <el-button size="small">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary" style="margin-top: 12px">发布公告</el-button>
    </el-card>
    <el-card class="section">
      <template #header>管理员账号</template>
      <el-form label-width="100px">
        <el-form-item label="修改密码">
          <el-input type="password" placeholder="新密码" style="width: 300px" />
          <el-button type="primary" style="margin-left: 10px">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const services = ref([
  { name: '喂食', price: 30 },
  { name: '换水', price: 10 },
  { name: '铲屎', price: 20 },
  { name: '环境清理', price: 25 },
]);
</script>

<style scoped>
.setting h3 { margin-bottom: 20px; color: #303133; }
.section { margin-bottom: 20px; }
</style>
