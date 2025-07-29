<template>
  <div class="coin-view">
    <!-- 滚动区域开始 -->
    <div class="scroll-area">
      <!-- 账户余额 -->
      <div class="balance-box">
        <div class="balance-title">账户余额（金币）</div>
        <div class="balance-value">
          <span class="balance-label">余额</span>
          <span class="balance-amount">{{ (userStore.userInfo.goldCoins ?? 0).toFixed(2) }}</span>
        </div>
        <button class="record-btn" @click="goToPurchase">消费明细</button>
      </div>

      <!-- 充值金额 -->
      <div class="section-title">选择充值金额</div>
      <div class="coin-grid">
        <div
          v-for="(item, index) in coinOptions"
          :key="index"
          :class="['coin-item', { active: selectedIndex === index }]"
          @click="selectedIndex = index"
        >
          <span class="badge" v-if="item.tag">{{ item.tag }}</span>
          <div class="icon-glow-wrapper">
            <img src="/icons/coin.svg" class="coin-icon" />
          </div>
          <div class="coin-amount">{{ item.amount }}金币</div>
          <div class="coin-price">￥{{ item.price }}</div>
         <div class="coin-bonus" v-if="item.gift_coins && item.gift_coins > 0">
  赠送{{ item.gift_coins }}金币
</div>
        </div>
      </div>

      <!-- 支付提醒 -->
      <div class="pay-notice modern-card">
  <h3 class="notice-title">支付提醒</h3>
  <ol class="notice-list">
    <li><strong>【非常重要】</strong> 充值前一定要注册绑定账号，并妥善保管您的账号！方便以后账号找回！以免账号丢失，受到经济损失。</li>
    <li>如遇多次充值失败、长时间未到账且消费金额未返还情况，请在【我的】-【在线客服】中联系客服，发送支付截图凭证为您处理。</li>
    <li>请尽量在生成订单的两分钟内支付，若不能支付可以尝试重新发起订单请求。</li>
  </ol>
</div>

    </div>
    <!-- 滚动区域结束 -->

    <!-- 支付按钮 -->
    <div class="pay-bar">
      <button class="pay-btn">
  立即支付 ￥{{ coinOptions[selectedIndex]?.price ?? '--' }}
</button>
      <div class="pay-reminder">
        支付中如有问题反馈，请联系 <span class="service-link" @click="goToService">在线客服</span>

      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCoinPackageStore } from '@/store/coinPackage';
import { useUserStore } from '@/store/user';

const router = useRouter();
const coinPackageStore = useCoinPackageStore();
const userStore = useUserStore();

const selectedIndex = ref<number>(0);

onMounted(() => {
  userStore.fetchUserInfo();
  coinPackageStore.loadList();
});

const coinOptions = computed(() => coinPackageStore.list || []);

function handlePay() {
  const selected = coinOptions.value[selectedIndex.value];
  if (!selected) {
    return alert('请选择套餐');
  }
  console.log('要支付的套餐：', selected);
  alert(`下单：${selected.amount}金币，售价￥${selected.price}`);
}

function goToService() {
  router.push('/online-service');
}
function goToPurchase() {
  router.push('/my-purchase');
}

</script>

<style scoped>
.coin-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 滚动区域 */
.scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 4.3vw; /* 16px */
  padding-bottom: 53.3vw; /* 200px */
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
}

/* 余额盒子 */
.balance-box {
  background: #f5f5f5;
  margin-bottom: 4.3vw; /*16px*/
  border-radius: 3.2vw; /*12px*/
  padding: 4.3vw; /*16px*/
  position: relative;
  box-shadow: 0 0.27vw 1.3vw rgba(0, 0, 0, 0.04);
}
.balance-title {
  font-size: 4.3vw; /*16px*/
  font-weight: bold;
  color: #333;
  margin-bottom: 1.6vw; /*6px*/
}
.balance-value {
  display: flex;
  align-items: baseline;
  gap: 2.1vw; /*8px*/
}
.balance-label {
  font-size: 3.5vw; /*13px*/
  color: #888;
}
.balance-amount {
  font-size: 5.9vw; /*22px*/
  font-weight: bold;
  color: #f44336;
}
.record-btn {
  position: absolute;
  right: 4.3vw; /*16px*/
  top: 4.3vw;
  background: #ff4d7e;
  color: #fff;
  border: none;
  border-radius: 1.6vw; /*6px*/
  padding: 1.1vw 2.7vw; /*4px 10px*/
  font-size: 3.5vw; /*13px*/
}

.section-title {
  font-size: 4vw; /*15px*/
  font-weight: bold;
  margin-bottom: 3.2vw; /*12px*/
}

/* 卡片区域 */
.coin-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3.2vw; /*12px*/
}
.coin-item {
  background: #f9f9f9;
  border-radius: 3.2vw; /*12px*/
  padding: 3.2vw; /*12px*/
  text-align: center;
  position: relative;
  border: 0.27vw solid transparent;
  box-shadow: 0 0.53vw 1.6vw rgba(0, 0, 0, 0.04);
}
.coin-item.active {
  border: 0.27vw solid #f14b4b;
  box-shadow: 0 0 2.7vw rgba(255,112,112,0.3);
}
.badge {
  position: absolute;
  top: 1.6vw; /*6px*/
  left: 1.6vw;
  background: #ff4d7e;
  color: #fff;
  font-size: 3.2vw; /*12px*/
  padding: 0.5vw 1.6vw; /*2px 6px*/
  border-radius: 2.7vw; /*10px*/
  z-index: 1;
}
.icon-glow-wrapper {
  width: 12.8vw; /*48px*/
  height: 12.8vw;
  margin: 0 auto 1.6vw; /*6px*/
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,82,140,0.15) 0%, rgba(255,82,140,0) 70%);
  box-shadow: 0 0 2.7vw rgba(255,82,140,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}
.coin-icon {
  width: 7.5vw; /*28px*/
  height: 7.5vw;
}
.coin-amount {
  font-size: clamp(12px,3.5vw,15px);
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.coin-price {
  font-size: clamp(11px,3vw,13px);
  color: #888;
  margin-top: 1.1vw; /*4px*/
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.coin-bonus {
  font-size: clamp(11px,3vw,13px);
  color: #e53935;
  background: #f2f2f2;
  display: inline-block;
  padding: 0.5vw 1.6vw; /*2px 6px*/
  border-radius: 1.6vw; /*6px*/
  margin-top: 1.6vw; /*6px*/
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 固定底部按钮 */
.pay-bar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background: #fff;
  padding: 3.2vw 4.3vw; /*12px 16px*/
  box-shadow: 0 -0.53vw 2.7vw rgba(0,0,0,0.08);
}
.pay-btn {
  width: 100%;
  padding: 3.2vw; /*12px*/
  background: #ff3b3b;
  border: none;
  color: #fff;
  font-weight: bold;
  font-size: 4.3vw; /*16px*/
  border-radius: 2.1vw; /*8px*/
}
.pay-reminder {
  font-size: 3.5vw; /*13px*/
  color: #666;
  text-align: center;
  margin-top: 2.1vw; /*8px*/
}
.service-link {
  color: #ff3b3b;
  font-weight: 500;
  margin-left: 1.1vw; /*4px*/
}
.modern-card {
  background: #fff;
  border: 0.27vw solid #eee;
  border-radius: 2.7vw; /*10px*/
  padding: 4.3vw; /*16px*/
  box-shadow: 0 0.53vw 2.1vw rgba(0,0,0,0.05);
  font-size: 3.5vw; /*13px*/
}
.modern-card .notice-title {
  font-weight: bold;
  font-size: 3.7vw; /*14px*/
  margin-bottom: 2.1vw; /*8px*/
}
.modern-card .notice-list {
  padding-left: 0.27vw; /*1px*/
}
.modern-card .notice-list li {
  margin-bottom: 1.6vw; /*6px*/
  line-height: 1.6;
}
/* 隐藏滚动条 */
.scroll-area {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scroll-area::-webkit-scrollbar {
  display: none;
}
</style>
