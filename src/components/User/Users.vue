<template>
  <div class="users-list">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <!-- 头部 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUsers"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUsers"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加新用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格数据 -->
      <el-table :data="users" stripe style="width: 100%" border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="mobile" label="联系电话"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="slotProps">
            <el-switch
              v-model="slotProps.row.mg_state"
              active-color="#13ce66"
              @change="userStatusChanged(slotProps.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="slotProps">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="intoEdit(slotProps.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(slotProps.row.id)"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!--添加用户 dialog -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="dialogClose('userForm')"
    >
      <el-form
        label-width="80px"
        :model="newUser"
        :rules="newUserRules"
        ref="userForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="newUser.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="newUser.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="newUser.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="newUser.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改dialog -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="dialogClose('editUserRef')"
    >
      <el-form
        label-width="80px"
        :model="editUser"
        :rules="editUserRules"
        ref="editUserRef"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUser.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUser.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUser.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义验证规则
    var validEmail = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("邮箱不能为空"));
      }
      let reg = /^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/;
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error("邮箱不符合规则"));
      }
    };

    var validMoble = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("手机不能为空"));
      }
      let reg = /^[1][3,4,5,7,8][0-9]{9}$/;
      if (reg.test(value)) {
        callback();
      } else {
        callback(new Error("手机不符合规则"));
      }
    };

    return {
      users: [],
      total: 0,
      queryInfo: {
        query: null,
        // 当前页
        pagenum: 1,
        // 每页显示几条数据
        pagesize: 2,
      },
      // 添加用户
      addDialogVisible: false,
      newUser: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 验证规则
      newUserRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "用户名长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 30,
            message: "密码长度在 6 到 30 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: validEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: validMoble, trigger: "blur" },
        ],
      },

      // 修改用户
      editDialogVisible: false,
      editUser: {
        id: "",
        username: "",
        email: "",
        mobile: "",
      },
      editUserRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "用户名长度在 2 到 10 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: validEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: validMoble, trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getUsers();
  },
  methods: {
    async getUsers() {
      let { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status == 200) {
        this.users = res.data.users;
        this.total = res.data.total;
      } else {
        this.$message.error("用户列表获取失败.");
      }
    },
    // 当前页面显示多少数据参数改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUsers();
    },
    handleCurrentChange(page) {
      this.queryInfo.pagenum = page;
      this.getUsers();
    },
    async userStatusChanged(user) {
      let path = "users/" + user.id + "/state/" + user.mg_state;

      let { data: res } = await this.$http.put(path);
      if (res.meta.status === 200) {
        this.$message.success(res.meta.msg);
      } else {
        user.mg_state = !user.mg_state;
        this.$message.error(res.meta.msg);
      }
    },
    addUser() {
      this.$refs.userForm.validate(async (valid, obj) => {
        if (valid) {
          let { data: res } = await this.$http.post("users", this.newUser);
          if (res.meta.status !== 201) {
            this.$message.error(res.meta.msg);
          } else {
            this.$message.success(res.meta.msg);
            this.addDialogVisible = false;
            this.getUsers();
          }
        } else {
          this.$message.error("验证失败！");
        }
      });
    },
    async intoEdit(id) {
      let { data: res } = await this.$http.get(`users/${id}`);
      if (res.meta.status !== 200) {
        return;
      }
      this.editUser.id = id;
      this.editUser.username = res.data.username;
      this.editUser.email = res.data.email;
      this.editUser.mobile = res.data.mobile;
      this.editDialogVisible = true;
    },
    updateUser() {
      this.$refs.editUserRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        let { email, mobile } = { ...this.editUser };
        let { data: res } = await this.$http.put(`users/${this.currentId}`, {
          email,
          mobile,
        });
        if (res.meta.status !== 200) {
          this.$message.error("修改用户信息失败！");
        } else {
          this.$message.success("修改用户信心成功！");
          this.getUsers();
          this.editDialogVisible = false;
        }
      });
    },
    async deleteUser(id) {
      let confirmResult = await this.$confirm("确定永久删除用户", "确认删除", {
        distinguishCancelAndClose: true,
        confirmButtonText: "确认",
        cancelButtonText: "取消",
      }).catch((error) => error);
      console.log(confirmResult);
      if (confirmResult !== "confirm") {
        this.$message.info("已经取消删除！");
        return;
      }

      let { data: res } = await this.$http.delete(`users/${id}`);

      if (res.meta.status !== 200) {
        this.$message.error("用户删除失败!");
      } else {
        this.$message.success("用户删除成功!");
      }

      this.getUsers();
    },
    dialogClose(refName) {
      this.$refs[refName].resetFields();
      this.$refs[refName].clearValidate();
    },
  },
};
</script>

<style lang="less" scoped>
</style>