<template>
  <div class="addGoods">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        center
        :closable="false"
      ></el-alert>
      <el-steps :active="stepsActive - 0" finish-status="success" align-center>
        <el-step
          v-for="(item, index) in steps"
          :title="item"
          :key="index"
        ></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-position="top"
      >
        <el-tabs
          v-model="stepsActive"
          tabPosition="left"
          :before-leave="beforLeaveTab"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                @change="handleChange"
                :props="categoryProps"
                :options="catgories"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="param in manyParams"
              :key="param.attr_id"
              :label="param.attr_name"
            >
              <el-checkbox-group v-model="param.attr_vals">
                <el-checkbox
                  v-for="(item, index) in param.attr_vals"
                  :label="item"
                  border
                  :key="index"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in onlyParams"
              :key="item.attr_id - 0"
              :label="item.attr_name"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadDestination"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="uploadHeader"
              :on-success="uploadSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor
              ref="quillEditor"
              v-model="addForm.goods_introduce"
              :options="editorOption"
              @blur="onEditorBlur($event)"
              @focus="onEditorFocus($event)"
              @ready="onEditorReady($event)"
            />
            <el-button @click="addGoods" type="primary">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      @close="previewClose"
      width="30%"
    >
      <el-image class="previewImg" :src="previewImgURL" fit="full"></el-image>
    </el-dialog>
  </div>
</template>

<script>
var _ = require("lodash");

export default {
  data() {
    return {
      stepsActive: "0",
      steps: ["基本信息", "商品参数", "商品属性", "商品图片", "商品内容"],

      // 添加商品
      addForm: {
        goods_name: "",
        goods_cat: [],
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: "",
        pics: [],
        attrs: [],
      },
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [{ required: true, message: "请选择分类", trigger: "blur" }],
      },

      // 分类
      catgories: [],
      categoryProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },

      // 动态参数或者静态属性
      manyParams: [],
      onlyParams: [],
      // 上传地址
      uploadDestination: "http://127.0.0.1:8888/api/private/v1/upload",
      uploadHeader: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      previewDialogVisible: false,
      previewImgURL: "",

      // 富文本
      editorOption: {},
    };
  },
  created() {
    this.getCategories();
  },
  methods: {
    async getCategories(level) {
      let { data: res } = await this.$http.get("categories", {
        params: {
          type: level,
        },
      });
      if (res.meta.status !== 200) {
      }
      this.catgories = res.data;
    },
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
        return;
      }
    },
    beforLeaveTab(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请选择分类！");
        return false;
      }
    },
    tabClicked() {
      if (this.stepsActive === "1") {
        this.getAttr("many");
      } else if (this.stepsActive === "2") {
        this.getAttr("only");
      }
    },
    async getAttr(sel) {
      let { data: res } = await this.$http.get(
        `categories/${this.categoryId}/attributes`,
        {
          params: {
            sel: sel,
          },
        }
      );
      let message = `获取${sel === "many" ? "动态参数" : "静态属性"}失败！`;
      if (res.meta.status !== 200) {
        return this.$message.error(message);
      }
      if (sel === "many") {
        res.data.forEach((ele) => {
          ele.attr_vals = !ele.attr_vals.length ? [] : ele.attr_vals.split(",");
        });
        this.manyParams = res.data;
      } else {
        this.onlyParams = res.data;
      }
    },
    // 照片预览
    handlePreview(file) {
      this.previewImgURL = file.response.data.url;
      this.previewDialogVisible = true;
    },
    // 移除照片
    handleRemove(file, filelist) {
      let res = file.response;
      if (res.meta.status === 200) {
        let index = this.addForm.pics.findIndex((ele) => {
          return ele.pic === res.data.tmp_path;
        });
        if (index !== -1) {
          this.addForm.pics.splice(index, 1);
        }
      }
    },
    //上传成功
    uploadSuccess(response, file) {
      if (response.meta.status !== 200) {
        // 改变file 状态，然后再写相应.el-[状态名称]，显示上传失败状态
        file.status = "failure";
        return this.$message.error(`上传失败！${file.name}`);
      }
      let imgInfo = {
        pic: response.data.tmp_path,
      };
      this.addForm.pics.push(imgInfo);
    },
    // 关闭previewdialog
    previewClose() {
      this.previewImgURL = "";
    },
    // 富文本
    onEditorBlur(eve) {},
    onEditorFocus(eve) {},
    onEditorReady(eve) {},
    // 添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("请填写商品基本信息！");
        }

        let form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(",");

        // 处理动态属性
        this.manyParams.forEach((ele) => {
          let newInfo = {
            attr_id: ele.attr_id,
            attr_value: ele.attr_vals.join(","),
          };
          this.addForm.attrs.push(newInfo);
        });
        // 处理静态属性
        this.onlyParams.forEach((ele) => {
          let newInfo = {
            attr_id: ele.attr_id,
            attr_value: ele.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;

        let { data: res } = await this.$http.post("goods", form);
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品失败！");
        }

        this.$message.success("添加商品成功！");
        this.$router.push("/goods");
      });
    },
  },
  computed: {
    categoryId() {
      if (this.addForm.goods_cat.length !== 3) {
        return null;
      }
      return this.addForm.goods_cat[2];
    },
  },
};
</script>

<style lang="less" scoped>
/deep/.el-step__title {
  font-size: 14px;
}
.el-steps {
  margin: 20px auto;
  width: 90%;
}
p {
  font-size: 14px;
}
.el-checkbox {
  margin: 0 10px 0 !important;
}
.previewImg {
  width: 100%;
  height: 100%;
}
// 自定义file上传状态
/deep/.el-upload-list--picture .is-failure {
  border: 1px solid red;
}
/deep/.ql-container {
  min-height: 300px;
}
.el-button {
  margin-top: 15px;
}
</style>