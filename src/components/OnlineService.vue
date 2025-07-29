<template>
  <div class="online-service">
    <van-nav-bar title="在线客服" left-arrow @click-left="$router.back()" />

    <div class="faq-section">
      <div class="faq-title">常见问题与反馈</div>

      <van-cell-group inset>
        <van-cell
          v-for="(item, index) in faqList"
          :key="index"
          :title="item.question"
          :label="item.answer"
          :border="false"
          class="faq-cell"
        />
      </van-cell-group>
    </div>

    <div class="service-icon">
      <img src="/icons/customer-service.svg" alt="客服" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface FAQItem {
  question: string
  answer: string
}

const faqList: FAQItem[] = [
  {
    question: '充值未到账',
    answer: '客官，刷新页面或者退出app重新进入，如果还没有显示会员，提供支付截图联系客服'
  },
  {
    question: '如何充值金币',
    answer: '客官，您可以在我的页面点击左上角的金币充值进入选择充值所需金币的金额即可，推荐用支付宝支付'
  },
  {
    question: '如何填写邀请码',
    answer: '您好，在我的页面点击填写邀请码进入填写被邀请人的邀请码就可以获得相应的奖励'
  },
  {
    question: '会员福利群如何加入',
    answer: '您好，请到个人中心，点击官方交流群就可以了。'
  },
  {
    question: '充值怎么还没有到账？',
    answer: '哥哥，充值一般在30分钟内到账，如若超时未到账，请凭借支付截图及订单号联系客服，客服将马上为您处理哦。'
  },
  {
    question: '为什么充值不了？',
    answer: '哥哥，充值不了可能因为当前支付方式的充值人数过多，通道拥挤，建议您换个支付方式或者金额多次尝试。'
  },
  {
    question: '充值会员之后还是看不了？',
    answer: '哥哥，充值成功后若仍然无法观看，请在后台退出APP，并重新启动尝试。若多次仍然无效请联系客服处理。'
  }
]
</script>

<style scoped>
.online-service {
  background: #f2f3f5;
  min-height: 100vh;
  color: #333;
}

/* 顶部导航栏保留 */
.van-nav-bar {
  background-color: #fff;
  color: #333;
}

/* 标题 */
.faq-title {
  padding: 4.3vw 5.3vw 3.2vw;
  font-size: 4.8vw;
  font-weight: bold;
  color: #ff375f;
  border-left: 1.1vw solid #ff375f;
  background: #fff;
  margin-bottom: 2.7vw;
}

/* 卡片样式：高级美化 + 玻璃质感 + 阴影渐变 */
::v-deep(.faq-cell) {
  background: rgba(255, 255, 255, 0.65);
  border-radius: 4.3vw;
  margin: 3.7vw 4.3vw;
  padding: 3.7vw 4.8vw;
  backdrop-filter: blur(12px);
  box-shadow:
    0 1.1vw 2.1vw rgba(0, 0, 0, 0.05),
    0 3.2vw 6.4vw rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 0.3vw solid rgba(255, 255, 255, 0.3);
}
::v-deep(.faq-cell:hover) {
  transform: translateY(-0.8vw);
  box-shadow:
    0 2.1vw 4.3vw rgba(0, 0, 0, 0.06),
    0 4.3vw 8.5vw rgba(0, 0, 0, 0.12);
}
::v-deep(.van-nav-bar) {
  position: sticky;
  top: 0;
  z-index: 999;
  background-color: #fff !important;
  box-shadow: 0 0.5vw 2.1vw rgba(0, 0, 0, 0.05);
}

::v-deep(.faq-cell .van-cell__title) {
  font-weight: 500;
  font-size: 4vw;
  color: #111;
  line-height: 1.5;
}

::v-deep(.faq-cell .van-cell__label) {
  font-size: 3.5vw;
  color: #333;
  line-height: 1.7;
  margin-top: 2.1vw;
  font-weight: 350;
}

/* 客服图标 */
.service-icon {
  position: fixed;
  bottom: 5.3vw;
  right: 4.3vw;
  z-index: 10;
}
.service-icon img {
  width: 17vw;
  height: 17vw;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff7b7b, #ff3f3f);
  box-shadow: 0 2.7vw 5.3vw rgba(255, 63, 63, 0.25);
  transition: transform 0.2s ease;
}
.service-icon img:hover {
  transform: scale(1.08);
}

/* 顶部标题字体微调 */
::v-deep(.van-nav-bar__title) {
  font-size: 5.1vw !important;
  font-weight: bold !important;
  color: #333 !important;
}

/* 返回按钮微调 */
::v-deep(.van-icon-arrow-left) {
  font-size: 6.9vw !important;
  color: #333 !important;
}
</style>
