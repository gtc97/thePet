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
            <el-option label="宠护师" value="SERVICE_PROVIDER" />
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
        <el-table-column label="手机号" width="130">
          <template #default="{ row }">{{ $maskPhone(row.phone) }}</template>
        </el-table-column>
        <el-table-column label="身份" width="150">
          <template #default="{ row }">
            <el-tag v-for="r in row.roles" :key="r" size="small" style="margin-right: 4px">
              {{ r === 'PET_OWNER' ? '宠物主' : '宠护师' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qualificationStatus" label="资质状态" width="100" />
        <el-table-column label="等级" width="70">
          <template #default="{ row }">
            <el-tag v-if="row.roles?.includes('SERVICE_PROVIDER')" type="warning" size="small">Lv.{{ row.level }}</el-tag>
            <span v-else style="color:#C0C4CC">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="70">
          <template #default="{ row }">
            <span v-if="row.roles?.includes('SERVICE_PROVIDER')">{{ row.points }}</span>
            <span v-else style="color:#C0C4CC">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="200">
          <template #default="{ row }">
            <el-button size="small" @click="$router.push(`/users/${row.id}`)">详情</el-button>
            <el-button
              v-if="row.qualificationStatus === 'pending'"
              type="success" size="small" @click="handleApprove(row.id)"
            >通过</el-button>
            <el-button
              v-if="row.qualificationStatus === 'pending'"
              type="danger" size="small" @click="handleReject(row.id)"
            >驳回</el-button>
            <el-button
              :type="row.status === 'ACTIVE' ? 'warning' : 'success'"
              size="small" @click="handleToggleStatus(row.id)"
            >{{ row.status === 'ACTIVE' ? '禁用' : '解封' }}</el-button>
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

const query = ref({ phone: '', role: '', status: '', qualification: '' });
const users = ref([]);
const loading = ref(false);

onMounted(() => fetchUsers());

async function fetchUsers() {
  loading.value = true;
  try {
    const res = await api.get('/admin/users', { params: query.value });
    users.value = res.data.list || [];
  } finally { loading.value = false; }
}

async function handleApprove(userId: number) {
  try {
    await api.post(`/admin/users/${userId}/approve-qualification`);
    ElMessage.success('资质已通过');
    fetchUsers();
  } catch { /* ignore */ }
}

async function handleReject(userId: number) {
  try {
    await api.post(`/admin/users/${userId}/reject-qualification`, { remark: '资料不符合要求' });
    ElMessage.success('已驳回');
    fetchUsers();
  } catch { /* ignore */ }
}

async function handleToggleStatus(userId: number) {
  try {
    await api.put(`/admin/users/${userId}/status`);
    ElMessage.success('状态已更新');
    fetchUsers();
  } catch { /* ignore */ }
}
</script>

<style scoped>
.user-list h3 { margin-bottom: 20px; color: #303133; }
</style>
