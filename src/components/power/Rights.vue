<template>
  <div class="users-list">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-table :data="rights" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column label="权限等级">
          <template v-slot="slotProps">
            <el-tag v-if="slotProps.row.level === '0'"> 一级 </el-tag>
            <el-tag v-else-if="slotProps.row.level === '1'" type="success">
              二级
            </el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rights: [],
    };
  },
  created() {
    this.getRights();
  },
  methods: {
    async getRights() {
      let { data: res } = await this.$http.get("rights/list");
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败！");
      }
      this.rights = res.data;
      this.$message.success("获取权限列表成功！");
    },
  },
};
</script>

<style lang="less" scoped>
</style>