<template>
  <div class="setting">
    <h3>平台配置</h3>

    <!-- 服务项目管理 -->
    <el-card class="section">
      <template #header>服务项目管理</template>
      <el-table :data="services" border stripe style="width: 100%">
        <el-table-column prop="name" label="服务名称" />
        <el-table-column prop="price" label="默认价格（元）" width="150" />
        <el-table-column label="操作" width="200">
          <template #default="{ row, $index }">
            <el-button size="small" @click="editService($index, row)">编辑</el-button>
            <el-button size="small" type="danger" @click="removeService($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary" style="margin-top:12px" @click="addService">新增服务项</el-button>
    </el-card>

    <!-- 平台公告 -->
    <el-card class="section">
      <template #header>平台公告</template>
      <el-table :data="announcements" border stripe style="width: 100%">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="createdAt" label="发布时间" width="180">
          <template #default="{ row }">{{ row.createdAt?.slice(0, 10) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row, $index }">
            <el-button size="small" @click="editAnnouncement($index, row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteAnnouncement(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary" style="margin-top:12px" @click="addAnnouncement">发布公告</el-button>
    </el-card>

    <!-- 管理员账号 -->
    <el-card class="section">
      <template #header>管理员账号</template>
      <el-form label-width="100px">
        <el-form-item label="原密码">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" style="width:300px" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" style="width:300px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="changePassword">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 服务项编辑弹窗 -->
    <el-dialog v-model="serviceDialogVisible" :title="editingServiceIndex >= 0 ? '编辑服务' : '新增服务'" width="400px">
      <el-form label-width="80px">
        <el-form-item label="服务名称">
          <el-input v-model="serviceForm.name" placeholder="如：喂食" />
        </el-form-item>
        <el-form-item label="价格(元)">
          <el-input-number v-model="serviceForm.price" :min="0" :step="5" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="serviceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveService">保存</el-button>
      </template>
    </el-dialog>

    <!-- 公告编辑弹窗 -->
    <el-dialog v-model="announceDialogVisible" title="发布/编辑公告" width="500px">
      <el-form label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="announceForm.title" placeholder="公告标题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="announceForm.content" type="textarea" :rows="4" placeholder="公告内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="announceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAnnouncement">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '@/api';

// ─── 服务项目管理 ───
const services = ref<{ name: string; price: number }[]>([]);
const serviceDialogVisible = ref(false);
const editingServiceIndex = ref(-1);
const serviceForm = reactive({ name: '', price: 30 });

onMounted(async () => {
  await loadServices();
  await loadAnnouncements();
});

async function loadServices() {
  try {
    const res = await api.get('/admin/config/services');
    services.value = res.data?.value ? JSON.parse(res.data.value) : [];
  } catch { services.value = []; }
}

async function saveServices() {
  try {
    await api.put('/admin/config/services', { value: JSON.stringify(services.value) });
  } catch { /* ignore */ }
}

function addService() {
  editingServiceIndex.value = -1;
  serviceForm.name = '';
  serviceForm.price = 30;
  serviceDialogVisible.value = true;
}

function editService(index: number, row: { name: string; price: number }) {
  editingServiceIndex.value = index;
  serviceForm.name = row.name;
  serviceForm.price = row.price;
  serviceDialogVisible.value = true;
}

async function removeService(index: number) {
  try {
    await ElMessageBox.confirm('确定删除该服务项？', '确认', { type: 'warning' });
    services.value.splice(index, 1);
    await saveServices();
    ElMessage.success('已删除');
  } catch { /* cancel */ }
}

async function saveService() {
  if (!serviceForm.name.trim()) { ElMessage.warning('请输入服务名称'); return; }
  if (editingServiceIndex.value >= 0) {
    services.value[editingServiceIndex.value] = { ...serviceForm };
  } else {
    services.value.push({ ...serviceForm });
  }
  await saveServices();
  serviceDialogVisible.value = false;
  ElMessage.success('已保存');
}

// ─── 公告管理 ───
const announcements = ref<any[]>([]);
const announceDialogVisible = ref(false);
const announceForm = reactive({ title: '', content: '' });

async function loadAnnouncements() {
  try {
    const res = await api.get('/admin/announcements');
    announcements.value = res.data || [];
  } catch { announcements.value = []; }
}

function addAnnouncement() {
  announceForm.title = '';
  announceForm.content = '';
  announceDialogVisible.value = true;
}

function editAnnouncement(index: number, row: any) {
  announceForm.title = row.title;
  announceForm.content = row.content;
  // 编辑时直接修改原公告（覆盖发布）
  announceDialogVisible.value = true;
  // 暂时存储编辑目标id
  (announceForm as any)._editId = row.id;
}

async function saveAnnouncement() {
  if (!announceForm.title.trim()) { ElMessage.warning('请输入标题'); return; }
  try {
    await api.post('/admin/announcements', { title: announceForm.title, content: announceForm.content });
    announceDialogVisible.value = false;
    ElMessage.success('已发布');
    await loadAnnouncements();
  } catch { /* ignore */ }
}

async function deleteAnnouncement(id: number) {
  try {
    await ElMessageBox.confirm('确定删除该公告？', '确认', { type: 'warning' });
    await api.delete(`/admin/announcements/${id}`);
    ElMessage.success('已删除');
    await loadAnnouncements();
  } catch { /* cancel */ }
}

// ─── 修改密码 ───
const passwordForm = reactive({ oldPassword: '', newPassword: '' });

async function changePassword() {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    ElMessage.warning('请填写原密码和新密码'); return;
  }
  try {
    await api.put('/admin/auth/password', passwordForm);
    ElMessage.success('密码已修改');
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
  } catch { /* ignore */ }
}
</script>

<style scoped>
.setting h3 { margin-bottom: 20px; color: #303133; }
.section { margin-bottom: 20px; }
</style>
