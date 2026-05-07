<template>
  <div class="deposit-list">
    <h3>押金管理</h3>
    <el-card>
      <el-form :inline="true">
        <el-form-item label="押金金额配置">
          <el-input-number :min="0" :step="10" />
          <el-button type="primary" style="margin-left: 10px">保存</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="[]" border stripe style="width: 100%" empty-text="功能开发中">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userName" label="用户" width="120" />
        <el-table-column prop="amount" label="金额" width="100" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" min-width="200" />
      </el-table>
    </el-card>
  </div>
</template>
