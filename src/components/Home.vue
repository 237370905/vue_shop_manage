<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-botton" @click="toggleCollapse">|||</div>
        <!-- 一级 -->
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <el-submenu v-for="ele in menus" :index="ele.id + ''" :key="ele.id">
            <template slot="title">
              <i :class="icons[ele.id]"></i>
              <span>{{ ele.authName }}</span>
            </template>
            <!-- 二级 -->
            <el-menu-item
              v-for="child in ele.children"
              :index="'/' + child.path"
              :key="child.id"
              @click="saveNavPath('/' + child.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ child.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created() {
    this.getMenuList();
  },
  beforeUpdate() {
    this.activePath = window.sessionStorage.getItem("activePath");
  },
  data() {
    return {
      menus: [],
      icons: {
        125: "iconfont icon-users",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
      isCollapse: false,
      activePath: "",
    };
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login"); //{ name: "login" }
    },
    async getMenuList() {
      let { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);

      this.menus = res.data;
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存active path
    saveNavPath(path) {
      this.activePath = path;
      window.sessionStorage.setItem("activePath", path);
    },
  },
};
</script>
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 0 10px;
  background-color: #373d41;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;

    span {
      padding-left: 10px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}

.iconfont {
  padding-right: 4px;
}

.el-main {
  background-color: #eaedf1;
}
.toggle-botton {
  font-size: 10px;
  line-height: 24px;
  letter-spacing: 0.3em;
  background-color: #4a5064;
  text-align: center;
  color: #fff;
}
</style>