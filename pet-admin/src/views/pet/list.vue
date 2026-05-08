<template>
  <div class="pet-list">
    <h3>宠物内容风控</h3>
    <el-card>
      <el-form :inline="true" :model="query">
        <el-form-item label="宠物名称">
          <el-input v-model="query.name" placeholder="搜索名称" clearable />
        </el-form-item>
        <el-form-item label="宠主手机号">
          <el-input v-model="query.ownerPhone" placeholder="搜索手机号" clearable />
        </el-form-item>
        <el-form-item label="可见性">
          <el-select v-model="query.privacy" placeholder="全部" clearable>
            <el-option label="公开" value="PUBLIC" />
            <el-option label="私有" value="PRIVATE" />
          </el-select>
        </el-form-item>
        <el-form-item label="封存状态">
          <el-select v-model="query.isArchived" placeholder="全部" clearable>
            <el-option label="正常" value="false" />
            <el-option label="已封存" value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchPets">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="pets" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="宠物名称" width="120" />
        <el-table-column prop="breed" label="品种" width="100" />
        <el-table-column label="宠主" width="120">
          <template #default="{ row }">{{ row.owner?.nickname || '-' }}</template>
        </el-table-column>
        <el-table-column label="可见性" width="80">
          <template #default="{ row }">
            <el-tag :type="row.privacy === 'PUBLIC' ? 'success' : 'info'" size="small">
              {{ row.privacy === 'PUBLIC' ? '公开' : '私有' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isArchived ? 'warning' : 'success'" size="small">
              {{ row.isArchived ? '已封存' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="内容统计" width="180">
          <template #default="{ row }">
            <span>📷{{ row._count?.photos || 0 }}</span>
            <span style="margin-left:8px">📝{{ row._count?.diaries || 0 }}</span>
            <span style="margin-left:8px">📁{{ row._count?.albums || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">{{ row.createdAt?.slice(0, 10) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="showDetail(row.id)">详情</el-button>
            <el-button size="small" :type="row.isArchived ? 'success' : 'warning'" @click="handleArchive(row)">
              {{ row.isArchived ? '解除封存' : '封存' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="total > query.pageSize"
        style="margin-top:16px;justify-content:flex-end"
        background layout="total, prev, pager, next"
        :total="total" :page-size="query.pageSize" v-model:current-page="query.page"
        @current-change="fetchPets"
      />
    </el-card>

    <!-- 宠物详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="宠物详情" width="700px" destroy-on-close>
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="宠物名称">{{ detail.name }}</el-descriptions-item>
          <el-descriptions-item label="品种">{{ detail.breed || '-' }}</el-descriptions-item>
          <el-descriptions-item label="物种">{{ detail.species || '-' }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ { MALE:'公', FEMALE:'母', UNKNOWN:'未知' }[detail.gender] }}</el-descriptions-item>
          <el-descriptions-item label="体重">{{ detail.weight ? detail.weight + 'kg' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="可见性">{{ detail.privacy === 'PUBLIC' ? '公开' : '私有' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>宠主信息</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="昵称">{{ detail.owner?.nickname }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detail.owner?.phone }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>内容概览</el-divider>
        <p>相册：{{ detail._count?.albums || 0 }} 本 | 照片：{{ detail._count?.photos || 0 }} 张 | 日记：{{ detail._count?.diaries || 0 }} 篇 | 分享：{{ detail._count?.shares || 0 }} 次</p>

        <div v-if="detail.diaries?.length" style="margin-top:12px">
          <el-tag type="info" style="margin-bottom:8px">最近日记</el-tag>
          <div v-for="d in detail.diaries" :key="d.id" style="padding:6px 0;font-size:13px;color:#606266">
            📝 {{ d.title }} <span style="color:#909399;margin-left:8px">{{ d.createdAt?.slice(0,10) }}</span>
          </div>
        </div>

        <div v-if="detail.photos?.length" style="margin-top:12px">
          <el-tag type="info" style="margin-bottom:8px">最近照片</el-tag>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <img v-for="p in detail.photos" :key="p.id" :src="p.url || p.thumbnailUrl"
              style="width:100px;height:100px;object-fit:cover;border-radius:8px" />
          </div>
        </div>
      </template>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '@/api';

const query = reactive({ name: '', ownerPhone: '', privacy: '', isArchived: '', page: 1, pageSize: 20 });
const pets = ref([]);
const total = ref(0);
const loading = ref(false);
const dialogVisible = ref(false);
const detail = ref<any>(null);

onMounted(() => fetchPets());

async function fetchPets() {
  loading.value = true;
  try {
    const res = await api.get('/admin/pets', { params: query });
    pets.value = res.data.list || [];
    total.value = res.data.total || 0;
  } finally { loading.value = false; }
}

async function showDetail(petId: number) {
  try {
    const res = await api.get(`/admin/pets/${petId}`);
    detail.value = res.data;
    dialogVisible.value = true;
  } catch { /* ignore */ }
}

async function handleArchive(row: any) {
  const action = row.isArchived ? '解除封存' : '封存';
  try {
    await ElMessageBox.confirm(`确定要${action}「${row.name}」吗？`, '确认操作', { type: 'warning' });
    await api.put(`/admin/pets/${row.id}`, { isArchived: !row.isArchived });
    ElMessage.success(`${action}成功`);
    fetchPets();
  } catch { /* cancel or error */ }
}
</script>

<style scoped>
.pet-list h3 { margin-bottom: 20px; color: #303133; }
</style>
