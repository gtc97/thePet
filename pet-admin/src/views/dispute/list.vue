<template>
  <div class="dispute-list">
    <h3>售后仲裁</h3>
    <el-card>
      <el-table :data="[]" border stripe style="width: 100%" empty-text="功能开发中">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="orderNo" label="关联订单" width="200" />
        <el-table-column prop="initiator" label="发起人" width="100" />
        <el-table-column prop="type" label="申诉类型" width="120" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" min-width="150">
          <template #default>
            <el-button size="small" type="primary">仲裁处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
