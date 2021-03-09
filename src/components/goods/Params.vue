<template>
  <div class="params">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-alert title="只允许为第三级分类设置相关参数" type="warning" show-icon>
      </el-alert>
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedKeys"
            :options="categories"
            :props="cascaderProps"
            @change="cascaderChange"
            clearable
          >
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeTab" @tab-click="tabItemChange">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            size="mini"
            type="primary"
            :disabled="isDisibledBtn"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <el-table style="width: 100%" :data="manyParams" border>
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <el-tag
                  v-for="(item, index) in splitTags(slotProps.row)"
                  :key="index"
                  closable
                  @close="removeTag(slotProps.row, index)"
                >
                  {{ item }}
                </el-tag>
                <!-- <el-button
                  class="button-new-tag"
                  size="small"
                  @click="showAddTag(slotProps.row)"
                >
                  新增标记
                </el-button> -->
                <el-input
                  v-if="slotProps.row.inputTagVisible"
                  v-model="slotProps.row.inputTagValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(slotProps.row)"
                  @blur="handleInputConfirm(slotProps.row)"
                >
                </el-input>
                <el-button
                  v-else
                  size="small"
                  @click="showAddTag(slotProps.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="editParam(slotProps.row)"
                >
                  修改
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParam(slotProps.row)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            size="mini"
            type="primary"
            :disabled="isDisibledBtn"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <el-table style="width: 100%" :data="onlyParams" border>
            <el-table-column type="expand">
              <template v-slot="slotProps">
                <el-tag
                  v-for="(item, index) in splitTags(slotProps.row)"
                  :key="index"
                  closable
                  @close="removeTag(slotProps.row, index)"
                >
                  {{ item }}
                </el-tag>
                <el-button
                  class="button-new-tag"
                  size="small"
                  @click="showAddTag(slotProps.row)"
                >
                  新增标记
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name">
            </el-table-column>
            <el-table-column label="操作">
              <template v-slot="slotProps">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="editParam(slotProps.row)"
                >
                  修改
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParam(slotProps.row)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加dialog -->
    <el-dialog
      :title="'添加' + title"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form
        :model="addForm"
        label-width="80px"
        :rules="addFormRules"
        ref="addFormRef"
      >
        <el-form-item :label="title" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParam">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改dialog -->
    <el-dialog
      :title="'修改' + title"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <el-form
        :model="editForm"
        label-width="80px"
        :rules="addFormRules"
        ref="editFormRef"
      >
        <el-form-item :label="title" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyParam">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 选择分类
      categories: [],
      selectedKeys: [],
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 查询
      activeTab: "many", //many, only
      manyParams: [],
      onlyParams: [],

      // 修改
      addDialogVisible: false,
      addForm: {
        attr_name: "",
      },
      addFormRules: {
        attr_name: [{ required: true, message: "请输入内容", trigger: "blur" }],
      },

      // 修改
      editDialogVisible: false,
      currentParamId: "",
      editForm: {
        attr_name: "",
      },
    };
  },
  created() {
    this.getCategroies();
  },
  methods: {
    async getCategroies() {
      let { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类失败！");
      }
      this.categories = res.data;
    },
    cascaderChange() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyParams = [];
        this.onlyParams = [];
        return;
      }
      this.getParams();
    },
    tabItemChange(tab, event) {
      this.getParams();
    },
    async getParams() {
      let id = this.categoryId;
      if (!id) {
        return;
      }

      let { data: res } = await this.$http.get(`categories/${id}/attributes`, {
        params: {
          sel: this.activeTab,
        },
      });
      // 解决全局控制新增tag BUG
      res.data.forEach((element) => {
        element.inputTagValue = "";
        element.inputTagVisible = false;
      });

      if (this.activeTab === "many") {
        this.manyParams = res.data;
      } else {
        this.onlyParams = res.data;
      }
    },
    // 增加参数
    addDialogClose() {
      this.$refs["addFormRef"].resetFields();
      this.addForm.attr_name = "";
    },
    addParam() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("参数验证失败！");
        }
        let { data: res } = await this.$http.post(
          `categories/${this.categoryId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeTab,
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加失败！");
        }
        this.$message.success("添加成功！");
        this.addDialogVisible = false;
        this.getParams();
      });
    },
    // 移除参数
    async removeParam(param) {
      let result = await this.$confirm(
        `此操作将永久删除该${this.title}, 是否继续?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (result !== "confirm") {
        return this.$message.info("取消删除操作!");
      }
      let { data: res } = await this.$http.delete(
        `categories/${this.categoryId}/attributes/${param.attr_id}`
      );

      if (res.meta.status !== 200) {
        return this.$message.error("删除失败！");
      }

      this.$message.success("删除成功!");
      this.getParams();
    },
    // 编辑参数
    async editParam(param) {
      this.currentParamId = param.attr_id;
      let { data: res } = await this.$http.get(
        `categories/${this.categoryId}/attributes/${param.attr_id}`,
        {
          params: {
            attr_sel: param.attr_sel,
          },
        }
      );
      // console.log(res);
      this.editForm.attr_name = res.data.attr_name;
      this.editDialogVisible = true;
    },
    modifyParam() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("验证不通过！");
        }

        let { data: res } = await this.$http.put(
          `categories/${this.categoryId}/attributes/${this.currentParamId}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeTab,
          }
        );

        if (res.meta.status !== 200) {
          this.$message.error("修改失败！");
        }
        this.$message.success("修改成功！");
        this.editDialogVisible = false;
        this.getParams();
      });
    },
    editDialogClose() {
      this.currentParamId = "";
      this.editForm.attr_name = "";
      this.$refs.editFormRef.resetFields();
    },

    //tag
    async addTag(param) {
      let items = param.attr_vals.split(",");
      if (!items[0].length) {
        items.shift();
      }
      items.push(param.inputTagValue);
      let vals = items.join(",");
      let { data: res } = await this.$http.put(
        `categories/${this.categoryId}/attributes/${param.attr_id}`,
        {
          attr_name: param.attr_name,
          attr_sel: param.attr_sel,
          attr_vals: vals,
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("增加标记失败！");
      }
      param.attr_vals = res.data.attr_vals;
      this.$message.success("增加标记成功！");
    },
    async removeTag(param, index) {
      if (index < 0) {
        return;
      }

      let result = await this.$confirm(
        "此操作将永久删除该标记, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (result != "confirm") {
        return this.$message.info("取消删除标记");
      }

      let items = param.attr_vals.split(",");
      if (!items[0].length) {
        items.shift();
      }
      items.splice(index, 1);
      let vals = items.join(",");
      let { data: res } = await this.$http.put(
        `categories/${param.cat_id}/attributes/${param.attr_id}`,
        {
          attr_name: param.attr_name,
          attr_sel: param.attr_sel,
          attr_vals: vals,
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("移除标记失败！");
      }
      this.$message.success("移除标记成功！");
      param.attr_vals = res.data.attr_vals;
    },
    async showAddTag(param) {
      param.inputTagVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    splitTags(param) {
      if (!param || !param.attr_vals.length) {
        return [];
      }
      return param.attr_vals.split(",");
    },
    handleInputConfirm(param) {
      if (param.inputTagValue.length) {
        this.addTag(param);
      }
      param.inputTagValue = "";
      param.inputTagVisible = false;
    },
  },
  computed: {
    isDisibledBtn() {
      return this.selectedKeys.length !== 3;
    },
    categoryId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2];
      }
      return null;
    },
    title() {
      let str = "动态参数";
      if (this.activeTab === "only") {
        str = "静态属性";
      }
      return str;
    },
  },
};
</script>
<style lang="less" scoped>
.el-row {
  padding: 10px 0;
}
.el-cascader {
  width: 300px;
}
.el-tag {
  margin: 8px;
}
.el-input {
  width: 180px;
}
</style>