<template>
  <div class="goodsList">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input
            placeholder="请输入商品名称"
            v-model="queryInfo.query"
            clearable
            @clear="getGoods"
            @keyup.enter.native="getGoods"
          >
            <template #append>
              <el-button icon="el-icon-search" @click="getGoods"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="goods" stripe border style="width: 100%">
        <el-table-column label="#" type="index"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px">
        </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="75px">
        </el-table-column>
        <el-table-column label="创建时间" width="160px">
          <template v-slot="slotProps">
            {{ slotProps.row.add_time | dateFormater }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template v-slot="slotProps">
            <el-button type="primary" icon="el-icon-edit" size="mini">
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteGoods(slotProps.row)"
            >
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 40, 80, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询
      goods: [],
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
    };
  },
  created() {
    this.getGoods();
  },
  methods: {
    async getGoods() {
      let { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败！");
      }
      this.goods = res.data.goods;
      this.total = res.data.total;
      this.$message.success("获取商品列表成功！");
    },
    // 分页
    handleSizeChange(val) {
      this.queryInfo.pagesize = val;
      this.getGoods();
    },
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val;
      this.getGoods();
    },
    // 删除商品
    async deleteGoods(goods) {
      let result = await this.$confirm(
        "此操作将永久删除该商品, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (result !== "confirm") {
        return this.$message.info("取消删除商品！");
      }
      let { data: res } = await this.$http.delete(`goods/${goods.goods_id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("删除商品失败！");
      }
      this.$message.success("删除商品成功！");
      // 处理最后一页删除最后一条数据时，页码错误BUG
      if (this.goods.length === 1) {
        this.queryInfo.pagenum -= 1;
      }
      this.getGoods();
    },
    addGoodsPage() {
      this.$router.push("/goods/add");
    },
  },
};
</script>

<style lang="less" scoped>
</style>