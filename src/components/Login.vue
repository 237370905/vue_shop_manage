<template>
  <div class="login_container">
    <div class="login_box">
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <el-form
        ref="loginFormRef"
        class="loginForm"
        :model="loginForm"
        :rules="rules"
      >
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <div class="btns">
          <el-button type="primary" @click="login">登入</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: "admin",
        password: "123456",
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入用户密码", trigger: "blur" },
          {
            min: 6,
            max: 30,
            message: "用户密码长度在 6 到 30 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    login: function () {
      // 表单预验证
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        let { data: res } = await this.$http.post("login", this.loginForm);
        if (res.meta.status !== 200) {
          this.$message.error("登入失败.");
          return;
        }
        // 保存登入状态
        this.$message.success("登入成功");
        // 跳转到管理界面
        window.sessionStorage.setItem("token", res.data.token);
        this.$router.push("/home");
      });
    },
    reset() {
      // 表单重置
      this.$refs["loginFormRef"].resetFields();
    },
  },
};
</script>

<style lang="less" scoped>
.login_container {
  position: relative;
  height: 100%;
  background-color: #2b4b6b;
}
.login_box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  border-radius: 4px;
  background-color: white;
}
.avatar_box {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 4px;
  width: 130px;
  height: 130px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 50%;
  box-shadow: 0 0 10px #ddd;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.loginForm {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;

  .btns {
    float: right;
  }
}
</style>