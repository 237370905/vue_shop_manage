<template>
  <div class="category">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row>
        <el-button type="primary" @click="showAddCategoryDialog"
          >添加分类</el-button
        >
      </el-row>
      <!-- default-expand-all -->
      <el-table
        :data="categories"
        style="width: 100%"
        row-key="cat_id"
        border
        :tree-props="{ children: 'children' }"
      >
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="分类名称" prop="cat_name"></el-table-column>
        <el-table-column label="是否有效">
          <template v-slot="slotProps">
            <i
              class="el-icon-error"
              v-if="slotProps.row.cat_deleted"
              style="color: lightgray; font-size: 18px"
            ></i>
            <i
              class="el-icon-success"
              v-else
              style="color: lightgreen; font-size: 18px"
            ></i>
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template v-slot="slotProps">
            <el-tag v-if="slotProps.row.cat_level === 0"> 一级 </el-tag>
            <el-tag v-else-if="slotProps.row.cat_level === 1" type="success">
              二级
            </el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="slotProps">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="openEdit(slotProps.row)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteCategory(slotProps.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form
        :model="addCategoryForm"
        :rules="categoryRules"
        ref="addCategoryFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCategoryForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            :options="parentCategories"
            :props="cascaderProps"
            @change="handleChange(true)"
            v-model="selectedKeys"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="eidtDialogClose"
    >
      <el-form
        :model="editCategoryForm"
        :rules="categoryRules"
        ref="editCategoryFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCategoryForm.cat_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="modifyCategory">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      categories: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //   总页数
      total: 0,
      //   添加分类
      parentCategories: [],
      addDialogVisible: false,
      addCategoryForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      // 编辑分类
      editCategoryForm: {
        cat_name: "",
      },
      editDialogVisible: false,
      category: {},

      // 分类检查
      categoryRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
          { min: 2, max: 30, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
      },
      cascaderProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        checkStrictly: true,
      },
      selectedKeys: [],
    };
  },
  created() {
    this.getCategories();
  },
  methods: {
    async getCategories() {
      let { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类失败！");
      }
      this.categories = res.data.result;
      this.total = res.data.total;
      this.$message.success("获取分类成功！");
    },
    // 分页
    handleSizeChange(val) {
      this.queryInfo.pagesize = val;
      this.getCategories();
    },
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val;
      this.getCategories();
    },
    // 添加分类
    showAddCategoryDialog() {
      this.addDialogVisible = true;
      this.getParentCategories();
    },
    handleChange() {
      if (this.selectedKeys) {
        this.addCategoryForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCategoryForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCategoryForm.cat_pid = 0;
        this.addCategoryForm.cat_level = 0;
      }
    },
    addDialogClose() {
      this.$refs.addCategoryFormRef.resetFields();
      this.addCategoryForm = {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      };
      this.selectedKeys = [];
      this.parentCategories = [];
    },
    async getParentCategories() {
      let { data: res } = await this.$http.get("categories", {
        params: {
          type: 2,
        },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类失败！");
      }
      this.parentCategories = res.data;
      this.$message.success("获取父级分类成功！");
    },
    addCategory() {
      this.$refs.addCategoryFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("分类信息验证失败！");
        }
        let { data: res } = await this.$http.post(
          "categories",
          this.addCategoryForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败！");
        }
        this.addDialogVisible = false;
        this.$message.success("添加分类成功！");
        this.getCategories();
      });
    },
    // 编辑
    async openEdit(category) {
      this.getParentCategories();
      let { data: res } = await this.$http.get(`categories/${category.cat_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类失败！");
      }
      this.$message.success("获取分类成功！");
      this.category = res.data;
      this.editCategoryForm.cat_name = this.category.cat_name;
      this.editDialogVisible = true;
    },
    modifyCategory() {
      this.$refs.editCategoryFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("分类信息验证失败！");
        }
        let { data: res } = await this.$http.put(
          `categories/${this.category.cat_id}`,
          this.editCategoryForm
        );
        if (res.meta.status !== 200) {
          return this.$message.error("添加分类失败！");
        }
        this.editDialogVisible = false;
        this.$message.success("添加分类成功！");
        this.getCategories();
      });
    },
    eidtDialogClose() {
      this.category = {};
      this.editCategoryForm.cat_pid = 0;
      this.editCategoryForm.cat_level = 0;
      this.editCategoryForm.cat_name = "";
      this.selectedKeys = [];
      this.parentCategories = [];
    },
    // 删除
    async deleteCategory(cate) {
      let result = await this.$confirm("删除该分类, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).catch((err) => err);

      if (result !== "confirm") {
        return this.$message.info("取消删除操作!");
      }

      let { data: res } = await this.$http.delete(`categories/${cate.cat_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除分类失败!");
      }
      this.$message.success("删除分类成功！");
      if (this.categories.length === 1) {
        this.queryInfo.pagenum -= 1;
      }
      this.getCategories();
    },
  },
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>