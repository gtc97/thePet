<template>
  <div class="user-list">
    <h3>用户管理</h3>
    <el-card>
      <el-form :inline="true" :model="query">
        <el-form-item label="手机号">
          <el-input v-model="query.phone" placeholder="搜索手机号" clearable />
        </el-form-item>
        <el-form-item label="身份">
          <el-select v-model="query.role" placeholder="全部" clearable>
            <el-option label="宠物主" value="PET_OWNER" />
            <el-option label="上门师傅" value="SERVICE_PROVIDER" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable>
            <el-option label="正常" value="ACTIVE" />
            <el-option label="已禁用" value="DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="资质审核">
          <el-select v-model="query.qualification" placeholder="全部" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchUsers">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="users" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="身份" width="150">
          <template #default="{ row }">
            <el-tag v-for="r in row.roles" :key="r" size="small" style="margin-right: 4px">
              {{ r === 'PET_OWNER' ? '宠物主' : '上门师傅' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qualificationStatus" label="资质状态" width="100" />
        <el-table-column label="操作" min-width="200">
          <template #default="{ row }">
            <el-button size="small" @click="$router.push(`/users/${row.id}`)">详情</el-button>
            <el-button
              v-if="row.qualificationStatus === 'pending'"
              type="success" size="small"
            >通过</el-button>
            <el-button
              v-if="row.qualificationStatus === 'pending'"
              type="danger" size="small"
            >驳回</el-button>
            <el-button
              :type="row.status === 'ACTIVE' ? 'warning' : 'success'"
              size="small"
            >{{ row.status === 'ACTIVE' ? '禁用' : '解封' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const query = ref({ phone: '', role: '', status: '', qualification: '' });
const users = ref([]);

function fetchUsers() {
  // TODO: API integration
}
</script>

<style scoped>
.user-list h3 { margin-bottom: 20px; color: #303133; }
</style>
