<template>
  <div class="order-list">
    <h3>订单管理</h3>
    <el-card>
      <el-form :inline="true">
        <el-form-item label="订单状态">
          <el-select placeholder="全部" clearable>
            <el-option label="待接单" value="PENDING" />
            <el-option label="已接单" value="ACCEPTED" />
            <el-option label="服务中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
            <el-option label="申诉中" value="DISPUTE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="[]" border stripe style="width: 100%" empty-text="功能开发中">
        <el-table-column prop="orderNo" label="订单号" width="200" />
        <el-table-column prop="ownerName" label="宠主" width="100" />
        <el-table-column prop="providerName" label="师傅" width="100" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column prop="price" label="金额" width="100" />
        <el-table-column label="操作" min-width="150" />
      </el-table>
    </el-card>
  </div>
</template>
