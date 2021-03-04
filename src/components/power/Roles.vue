<template>
  <div class="roles">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-button type="primary" @click="addDialogFormVisible = true"
          >添加角色</el-button
        ></el-row
      >
      <el-table :data="roles" border stripe>
        <!-- 角色权限 -->
        <el-table-column type="expand">
          <!-- 一级 -->
          <template v-slot="slotProps">
            <el-row
              :gutter="10"
              v-for="(item, i) in slotProps.row.children"
              :key="item.id"
              type="flex"
              :class="['rowBottomLine', i === 0 ? 'rowTopLine' : '']"
            >
              <!-- 一级 -->
              <el-col :span="4">
                <el-tag closable @close="removeRigth(slotProps.row, item.id)">{{
                  item.authName
                }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="20">
                <el-row
                  :gutter="10"
                  v-for="(item1, i1) in item.children"
                  :key="item1.id"
                  type="flex"
                  :class="i1 === 0 ? '' : 'rowTopLine'"
                >
                  <!-- 二级 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRigth(slotProps.row, item1.id)"
                      >{{ item1.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级级 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item2 in item1.children"
                      :key="item2.id"
                      closable
                      @close="removeRigth(slotProps.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="slotProps">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRole(slotProps.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRole(slotProps.row)"
              >删除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="configRights(slotProps.row)"
              >配置权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 新增角色 -->
    <el-dialog
      title="新增角色"
      :visible.sync="addDialogFormVisible"
      @close="addDialogClose"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 编辑角色 -->
    <el-dialog
      title="修改角色"
      :visible.sync="modifyDialogFormVisible"
      @close="modifyDialogClose"
    >
      <el-form :model="modifyForm" :rules="addFormRules" ref="modifyFormRef">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="modifyForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="modifyForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="modifyDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyRole">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑权限 -->
    <el-dialog
      title="权限设置"
      :visible.sync="rightDialogVisible"
      width="30%"
      @close="rightDialogClose"
    >
      <el-tree
        show-checkbox
        :data="rights"
        :props="treeProps"
        default-expand-all
        node-key="id"
        :default-checked-keys="defaultCheckedKeys"
        ref="rightTreeRef"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
export default {
  data() {
    return {
      roles: [],
      addDialogFormVisible: false,
      modifyDialogFormVisible: false,
      rightDialogVisible: false,
      addForm: {
        roleName: "",
        roleDesc: "",
      },
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 3, max: 30, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
        roleDesc: [],
      },
      modifyForm: {
        roleId: "",
        roleName: "",
        roleDesc: "",
      },
      rights: [],
      defaultCheckedKeys: [],
      treeProps: {
        children: "children",
        label: "authName",
      },
      roleId: "", //当前分配权限的角色id
    };
  },
  created() {
    this.getRoles();
  },
  methods: {
    async getRoles() {
      let { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败!");
      }
      this.$message.success("获取角色列表成功!");
      this.roles = res.data;
    },
    async removeRigth(role, rightId) {
      let confirmResult = await this.$confirm("移除权限, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((error) => error);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消移除权限操作！");
      }
      //   console.log(`roles/${role.id}/rights/${rightId}`);
      let { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("移除权限失败！");
      }

      this.$message.success("移除权限成功！");
      //   将刷新整个页面，
      //   this.getRoles();
      //
      //   console.log(res);
      role.children = res.data;
    },
    async removeRole(role) {
      let confirmResult = await this.$confirm("将移除角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((error) => error);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消移除角色操作！");
      }
      let { data: res } = await this.$http.delete(`roles/${role.id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("角色移除失败！");
      }
      this.$message.success("角色移除成功！");
      this.getRoles();
    },
    addRole() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("验证失败！");
        }
        let { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201) {
          return this.$message.error("添加角色失败！");
        }
        this.$message.success("添加角色成功！");
        this.getRoles();
        this.addDialogFormVisible = false;
      });
    },
    async editRole(id) {
      let { data: res } = await this.$http.get(`roles/${id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色失败！");
      }
      this.modifyForm = res.data;
      this.modifyDialogFormVisible = true;
    },
    async modifyRole() {
      let { roleId, roleName, roleDesc } = this.modifyForm;
      let { data: res } = await this.$http.put(`roles/${roleId}`, {
        roleName,
        roleDesc,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("修改失败！");
      }
      this.$message.success("修改成功！");
      this.modifyDialogFormVisible = false;
      this.getRoles();
    },
    addDialogClose() {
      this.$refs.addFormRef.resetFields();
    },
    modifyDialogClose() {
      this.$refs.modifyFormRef.resetFields();
    },
    async configRights(role) {
      this.roleId = role.id;
      let { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败");
      }
      this.$message.success("获取权限列表成功");
      this.rights = res.data;
      this.getLeefKeys(role, this.defaultCheckedKeys);
      this.rightDialogVisible = true;
    },
    getLeefKeys(node, arr) {
      if (!node.children) {
        arr.push(node.id);
        return;
      }
      node.children.forEach((item) => this.getLeefKeys(item, arr));
    },
    rightDialogClose() {
      this.defaultCheckedKeys = [];
      this.roleId = "";
    },
    async setRights() {
      let keys = [
        ...this.$refs.rightTreeRef.getCheckedKeys(),
        ...this.$refs.rightTreeRef.getHalfCheckedKeys(),
      ];
      console.log(keys);
      let idStr = keys.join(",");
      let { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr,
      });
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败！");
      }

      this.$message.success("分配权限成功！");
      this.rightDialogVisible = false;
      this.getRoles();
    },
  },
};
</script>

<style lang="less" scoped>
.rowTopLine {
  border-top: 1px solid #eee;
}
.rowBottomLine {
  border-bottom: 1px solid #eee;
}

.el-row {
  align-items: center;
}
.el-tag {
  margin: 10px 10px;
}
.right_container {
  height: 60%;
}
</style>