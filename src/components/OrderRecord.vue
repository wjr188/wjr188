<template>
  <div class="order-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="充值记录"
      left-arrow
      @click-left="$router.back()"
    />

    <!-- 温馨提示区域 -->
    <div class="order-tip">
      <span class="tip-label">充值未到账？</span>
      请复制订单编号和支付截图联系
      <span class="tip-action">在线客服</span>，火速为您解决！！！
    </div>

    <!-- 折叠列表 -->
    <div class="order-list">
      <van-collapse v-model="activeNames" accordion>
        <van-collapse-item
          v-for="(order, index) in orderList"
          :key="order.orderNo"
          :name="index"
        >
          <template #title>
            <div
              class="card-wrapper"
              :class="{ selected: activeNames === index }"
            >
              <div class="order-header">
                <div class="card-title">{{ order.title }}</div>
                <van-tag
                  plain
                  round
                  :style="{
                    borderColor: order.status === 'paid' ? '#4caf50' : '#ff4d4f',
                    color: order.status === 'paid' ? '#4caf50' : '#ff4d4f',
                    backgroundColor: '#fff'
                  }"
                >
                  {{ order.statusText }}
                </van-tag>
              </div>
            </div>
          </template>

          <!-- 展开内容 -->
          <div class="card-wrapper detail-wrapper">
            <div class="order-line">支付方式：{{ order.payType }}</div>
            <div class="order-line">订单编号：{{ order.orderNo }}</div>
            <div class="order-line">金额：￥{{ order.amount }}</div>
            <div class="order-line">时间：{{ order.time }}</div>
            <div class="copy-row">
              <van-button
                size="small"
                color="#ff0000"
                text-color="#fff"
                round
                style="padding: 0 12px; height: 28px; font-size: 13px;"
                @click="copy(order.orderNo)"
              >
                复制
              </van-button>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'

interface OrderItem {
  title: string
  payType: string
  status: 'paid' | 'pending'
  statusText: string
  orderNo: string
  amount: number
  time: string
}

const activeNames = ref<number | null>(null)

const orderList = ref<OrderItem[]>([
  {
    title: '荣耀至尊卡',
    payType: '微信支付',
    status: 'paid',
    statusText: '已付款',
    orderNo: 'xy4_20250423173818086720',
    amount: 500,
    time: '2025-04-23 17:38',
  },
  {
    title: '荣耀至尊卡',
    payType: '支付宝支付',
    status: 'pending',
    statusText: '待付款',
    orderNo: 'wp20250423173717022851',
    amount: 500,
    time: '2025-04-23 17:37',
  },
  {
    title: '荣耀至尊卡',
    payType: '微信支付',
    status: 'paid',
    statusText: '已付款',
    orderNo: 'xy4_20250423173616012345',
    amount: 500,
    time: '2025-04-23 17:36',
  },
  {
    title: '荣耀至尊卡',
    payType: '支付宝支付',
    status: 'pending',
    statusText: '待付款',
    orderNo: 'wp20250423173515098765',
    amount: 500,
    time: '2025-04-23 17:35',
  },
  {
    title: '荣耀至尊卡',
    payType: '微信支付',
    status: 'paid',
    statusText: '已付款',
    orderNo: 'xy4_20250423173414054321',
    amount: 500,
    time: '2025-04-23 17:34',
  },
  {
    title: '荣耀至尊卡',
    payType: '支付宝支付',
    status: 'pending',
    statusText: '待付款',
    orderNo: 'wp20250423173313098765',
    amount: 500,
    time: '2025-04-23 17:33',
  },
  {
    title: '荣耀至尊卡',
    payType: '微信支付',
    status: 'paid',
    statusText: '已付款',
    orderNo: 'xy4_20250423173212012345',
    amount: 500,
    time: '2025-04-23 17:32',
  },
  {
    title: '荣耀至尊卡',
    payType: '支付宝支付',
    status: 'pending',
    statusText: '待付款',
    orderNo: 'wp20250423173111098765',
    amount: 500,
    time: '2025-04-23 17:31',
  },
  {
    title: '荣耀至尊卡',
    payType: '微信支付',
    status: 'paid',
    statusText: '已付款',
    orderNo: 'xy4_20250423173010054321',
    amount: 500,
    time: '2025-04-23 17:30',
  },
  {
    title: '荣耀至尊卡',
    payType: '支付宝支付',
    status: 'pending',
    statusText: '待付款',
    orderNo: 'wp20250423172909098765',
    amount: 500,
    time: '2025-04-23 17:29',
  }
])

function copy(text: string) {
  navigator.clipboard.writeText(text)
  showToast('复制成功')
}
</script>

<style scoped>
.order-page {
  background: #f8f8f8;
  min-height: 100vh;
  padding-top: 28vw; /* 12.3vw(nav) + 16vw(tip) + 额外间距 */
}

.order-list {
  padding: 3.2vw;
}

.card-wrapper {
  background: #fff;
  border: 0.27vw solid #d2a96a;
  border-radius: 3.2vw;
  padding: 3.7vw;
  box-shadow: 0 0.5vw 1.6vw rgba(240, 200, 100, 0.05);
  margin-bottom: 3.2vw;
  transition: all 0.2s ease;
}

.card-wrapper.selected {
  border-color: #f14b4b;
  box-shadow: 0 1.1vw 2.7vw rgba(241, 75, 75, 0.15);
}

.order-header {
  display: flex;
  align-items: center;
  gap: 2.1vw;
}

.card-title {
  font-weight: bold;
  font-size: 4vw;
  color: #333;
}

.detail-wrapper {
  margin-top: -2.1vw;
  border-top: 0.27vw solid #f0e8d9;
}

.order-line {
  font-size: 3.5vw;
  color: #666;
  margin-bottom: 1.6vw;
}

.copy-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 2.7vw;
}

::v-deep(.van-nav-bar__title) {
  font-size: 5.1vw !important;
  font-weight: bold !important;
  color: #333 !important;
}

::v-deep(.van-icon-arrow-left) {
  font-size: 6.9vw !important;
  color: #333 !important;
}

.order-tip {
  position: fixed;
  top: 12.3vw; /* van-nav-bar高度：12.3vw（约46px） */
  left: 0;
  right: 0;
  z-index: 998;
  background: #fff;
  padding: 3.7vw;
  box-shadow: 0 1vw 2vw rgba(0,0,0,0.05);
  font-size: 3.7vw;
  color: #333;
  line-height: 1.6;
}

.tip-label {
  font-weight: bold;
  color: #d32f2f;
  margin-right: 1.1vw;
}

.tip-action {
  color: #e53935;
  font-weight: bold;
  margin: 0 1.1vw;
}
::v-deep(.van-nav-bar) {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}
</style>
