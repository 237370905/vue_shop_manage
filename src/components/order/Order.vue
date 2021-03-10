<template>
  <div class="order">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入订单编号"
            v-model="queryInfo.query"
            clearable
            @clear="getOrders"
            @keyup.enter.native="getOrders"
          >
            <template #append>
              <el-button icon="el-icon-search" @click="getOrders"></el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="orders" style="width: 100%" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column
          label="订单价格"
          prop="order_price"
          width="80px"
        ></el-table-column>
        <el-table-column label="是否付款" prop="order_price" width="80px">
          <template v-slot="slotProps">
            <el-tag v-if="slotProps.row.order_pay === '1'" type="success">
              已付款
            </el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="80px">
        </el-table-column>
        <el-table-column label="下单时间" width="160px">
          <template v-slot="slotProps">
            {{ slotProps.row.create_time | dateFormater }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template v-slot="slotProps">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="addressDialogVisible = true"
            ></el-button>
            <el-tooltip content="物流信息" placement="top" :enterable="false">
              <el-button
                type="success"
                icon="el-icon-location"
                size="mini"
                @click="showProgress"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClose"
    >
      <el-form
        :model="addressForm"
        :rules="addressRules"
        ref="addressRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="provinces">
          <el-cascader
            v-model="addressForm.provinces"
            :options="cityData"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="addressForm.detail"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 物流进度 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%"
      @close="progressDialogClose"
    >
      <el-timeline>
        <el-timeline-item timestamp="2018/4/12" placement="top">
          <el-card>
            <h4>更新 Github 模板</h4>
            <p>王小虎 提交于 2018/4/12 20:46</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2018/4/3" placement="top">
          <el-card>
            <h4>更新 Github 模板</h4>
            <p>王小虎 提交于 2018/4/3 20:46</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2018/4/2" placement="top">
          <el-card>
            <h4>更新 Github 模板</h4>
            <p>王小虎 提交于 2018/4/2 20:46</p>
          </el-card>
        </el-timeline-item>
        <el-timeline-item timestamp="2018/4/2" placement="top">
          <el-card>
            <h4>更新 Github 模板</h4>
            <p>王小虎 提交于 2018/4/2 20:46</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata";
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      orders: [],

      // 修改地址
      addressDialogVisible: false,
      cityData,
      addressForm: {
        provinces: [],
        detail: "",
      },
      addressRules: {
        provinces: [
          {
            required: true,
            message: "请选择城市！",
            trigger: "blur",
          },
        ],
        detail: [
          {
            required: true,
            message: "详细地址不能为空！",
            trigger: "blur",
          },
        ],
      },
      // 物流进度
      progressDialogVisible: false,
      progress: [],
    };
  },
  created() {
    this.getOrders();
  },
  methods: {
    async getOrders() {
      let { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单列表失败！");
      }
      this.$message.success("获取订单列表成功！");
      this.orders = res.data.goods;
      this.total = res.data.total;
    },
    // 分页
    handleSizeChange(val) {
      this.queryInfo.pagesize = val;
      this.getOrders();
    },
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val;
      this.getOrders();
    },
    //关闭dialog
    addressDialogClose() {
      this.addressForm.provinces = [];
      this.addressForm.detail = "";
      this.$refs.addressRef.resetFields();
    },
    // 物流进度
    async showProgress() {
      /*
      let { data: res } = await this.$http.get("kuaidi/1106975712662");
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("查询物流进度失败！");
      }
      this.$message.success("查询物流进度成功！");*/
      this.progressDialogVisible = true;
    },
    progressDialogClose() {
      this.progress = [];
    },
  },
};
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>