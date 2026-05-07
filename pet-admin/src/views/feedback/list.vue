<template>
  <div class="feedback-list">
    <h3>用户反馈管理</h3>
    <el-card>
      <el-form :inline="true">
        <el-form-item label="反馈类型">
          <el-select placeholder="全部" clearable>
            <el-option label="Bug反馈" value="bug" />
            <el-option label="功能建议" value="suggestion" />
            <el-option label="投诉" value="complaint" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select placeholder="全部" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已解决" value="resolved" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="[]" border stripe style="width: 100%" empty-text="暂无用户反馈">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="content" label="内容" min-width="300" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column prop="createdAt" label="提交时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button size="small">标记处理</el-button>
            <el-button size="small" type="primary">备注</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
