<template>
  <div class="pet-list">
    <h3>宠物内容风控</h3>
    <el-card>
      <el-table :data="[]" border stripe style="width: 100%" empty-text="功能开发中，将支持审核宠物档案、相册、日记内容">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="宠物名称" width="120" />
        <el-table-column prop="owner" label="宠主" width="120" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" min-width="200" />
      </el-table>
    </el-card>
  </div>
</template>
