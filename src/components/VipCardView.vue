<template>
  <!-- 整体容器 -->
  <div class="page-container">
    <!-- 用户信息区 -->
    <div class="user-card">
  <img :src="avatar" class="avatar" />
  <div class="user-info">
    <div class="username">{{ nickname }}</div>
    <div class="vip-status">
      {{ isVIP ? `尊贵的${vipCardName ? vipCardName + '会员' : '会员'}👑` : '您还不是会员' }}
    </div>
  </div>
</div>

    <!-- 会员卡滑动栏 -->
    <div
  class="card-scroll-wrapper"
  ref="cardScrollRef"
  @scroll="handleScroll"
>
  <div class="card-scroll card-swipe-area">
    <div
      class="vip-card"
      v-for="(card, index) in vipCards"
      :key="card.id || index"
      :class="{ selected: selectedIndex === index }"
      @click="selectedIndex = index"
    >
      <div class="card-tag" :class="getTagClass(card.tag)">{{ card.tag }}</div>
      <div class="card-name">{{ card.name }}</div>
      <div class="card-price">￥{{ card.price }}</div>
      <div class="card-old-price">￥{{ card.oldPrice }}</div>
      <div class="card-desc">{{ card.desc }}</div>
    </div>
  </div>
</div>
<!-- 滑动进度条 -->
<div class="scroll-track">
  <div
    class="scroll-thumb"
    :style="{ transform: `translateX(${thumbOffset}px)` }"
  ></div>
</div>

    <!-- 权益区域 -->
    <div class="vip-benefits-box">
      <div class="vip-benefits-title">
        <span class="line"></span>
        <span class="diamond"></span>
        <span class="text">
          尊享{{ vipCards[selectedIndex]?.benefitKeys?.length || 0 }}项会员权益
        </span>
        <span class="diamond"></span>
        <span class="line"></span>
      </div>
      <div class="vip-benefits-scroll">
        <div class="vip-benefits">
          <div class="benefit-grid">
  <div
    class="benefit-item"
    v-for="(key, i) in vipCards[selectedIndex]?.benefitKeys"
    :key="i"
  >
    <img
      :src="`/icons/${allBenefits[key]?.icon || 'default.svg'}`"
      class="benefit-icon"
    />
    <div class="benefit-label">{{ allBenefits[key]?.label || '未知权益' }}</div>
  </div>
</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 固定支付按钮 -->
  <div class="pay-bar">
    <button class="pay-btn">立即支付 ￥{{ vipCards[selectedIndex]?.price }}</button>
    <p class="pay-hint">
      支付中如有问题反馈，请联系 <span class="online-service" @click="goToService">在线客服</span>
    </p>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useVipCardStore } from '@/store/vipCardStore'
import { allBenefits } from '@/constants/vipCardBenefits' // ✅ 引入

const userStore = useUserStore()
const { nickname, avatar } = storeToRefs(userStore)
const router = useRouter()
const vipCardStore = useVipCardStore()
const { allCards } = storeToRefs(vipCardStore)
const cardScrollRef = ref<HTMLDivElement | null>(null)
const thumbOffset = ref(0)


onMounted(async () => {
  userStore.initUser()
  await vipCardStore.loadAllCards()

  intervalId = setInterval(() => {
    offset.value -= speed
    if (Math.abs(offset.value) > marqueeText.length * 12 + 60) {
      offset.value = 0
    }
  }, 16)

  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  document.body.style.overflow = ''
})

const { isVIP, vipCardName } = storeToRefs(userStore)
const selectedIndex = ref<number>(0)

const vipCards = computed(() => allCards.value || [])

function getTagClass(tag: string) {
  if (!tag) return 'red'
  if (tag.includes('推荐')) return 'red'
  if (tag.includes('永久')) return 'pink'
  if (tag.includes('至尊')) return 'purple'
  if (tag.includes('帝王')) return 'blue'
  if (tag.includes('王者')) return 'green'
  if (tag.includes('季卡')) return 'orange'
  if (tag.includes('白银')) return 'teal'
  if (tag.includes('黄金')) return 'amber'
  if (tag.includes('暗网')) return 'black'
  return 'red'
}

const marqueeText = '充值前一定要注册绑定账号，并妥善保管您的账号和密码！只有提供您的账号我们才可协助找回！'
const offset = ref<number>(0)
let speed = 0.4
let intervalId: ReturnType<typeof setInterval> | null = null

function goToService() {
  router.push('/online-service')
}
function handleScroll() {
  const el = cardScrollRef.value
  if (!el) return

  const maxScroll = el.scrollWidth - el.clientWidth
  const percent = maxScroll > 0 ? el.scrollLeft / maxScroll : 0

  const trackWidthPx = 34 // px
  const thumbWidthPx = 15 // px
  const maxThumbMove = trackWidthPx - thumbWidthPx

  thumbOffset.value = percent * maxThumbMove
}
onMounted(() => {
  handleScroll()
})

</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  /* 新增：为底部按钮留空 */
  padding-bottom: 20vw;
}

/* 用户信息 */
.user-card {
  background: #f5f5f5;
  margin: 3vw;
  padding: 3vw;
  border-radius: 3vw;
  display: flex;
  align-items: center;
}
.avatar {
  width: 12vw;
  height: 12vw;
  border-radius: 2vw;
  object-fit: cover;
  margin-right: 3vw;
}
.user-info .username {
  font-weight: bold;
  color: #333;
  font-size: 4vw;
}
.user-info .vip-status {
  font-size: 3vw;
  color: #888;
}

/* 卡片滑动 */
.card-scroll-wrapper {
  overflow-x: auto;
  padding: 3vw 0;
}
.card-scroll {
  display: inline-flex;
  gap: 3vw;
  padding-left: 3vw;
  padding-right: 3vw;
  width: max-content;
}
.vip-card {
  flex-shrink: 0;
  width: 40vw;
  background: #fff;
  border-radius: 3vw;
  padding: 3vw;
  box-shadow: 0 1vw 3vw rgba(0,0,0,0.05);
  text-align: center;
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 50vw;
}
.vip-card.selected {
  transform: scale(1.05);
  box-shadow: 0 1.5vw 4vw rgba(255, 0, 120, 0.2);
}
.card-tag {
  font-size: 3vw;
  color: #fff;
  padding: 0.5vw 2vw;
  border-radius: 2vw;
  display: inline-block;
  margin-bottom: 1.5vw;
}
.card-tag.red { background: #ff4b4b; }
.card-tag.pink { background: #ff66a1; }
.card-tag.purple { background: #a04bff; }
.card-tag.blue { background: #4A90E2; }
.card-tag.green { background: #4CAF50; }
.card-tag.orange { background: #FF9800; }
.card-tag.teal { background: #009688; }
.card-tag.amber { background: #FFC107; }
.card-tag.cyan { background: #00BCD4; }
.card-tag.black { background: #000000; }
.card-name {
  font-size: 4vw;
  font-weight: bold;
  color: #333;
  margin: 1vw 0;
}
.card-price {
  font-size: 5vw;
  color: #000;
  font-weight: bold;
}
.card-old-price {
  text-decoration: line-through;
  font-size: 3vw;
  color: #aaa;
  margin-top: 1vw;
}
.card-desc {
  font-size: 3vw;
  color: #666;
  margin-top: 1.5vw;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 权益区域 */
.vip-benefits-box {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  margin: 4vw;
  padding: 4vw;
  background: #f8f8f8;
  border-radius: 4vw;
  box-shadow: 0 1vw 3vw rgba(0, 0, 0, 0.06);
}
.vip-benefits-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3vw;
}
.vip-benefits-title .line {
  flex: 1;
  height: 0.3vw;
  background: #f0e2d2;
  margin: 0 1vw;
}
.vip-benefits-title .diamond {
  width: 1.5vw;
  height: 1.5vw;
  background: #f0e2d2;
  transform: rotate(45deg);
  margin: 0 1.5vw;
  flex-shrink: 0;
  border-radius: 0.2vw;
}
.vip-benefits-title .text {
  font-size: 4vw;
  color: #d9a57a;
  font-weight: bold;
  white-space: nowrap;
}
.vip-benefits-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  /* 关键：padding 不再过大 */
  padding-bottom: 28vw;
}

.vip-benefits {
  text-align: center;
  font-size: 3vw;
  color: #333;
}
.benefit-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3vw;
}
.benefit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.benefit-icon {
  width: 12vw;
  height: 12vw;
}
.benefit-label {
  margin-top: 1vw;
  font-size: 3vw;
  color: #444;
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 固定按钮 */
.pay-bar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 3vw 4vw 2vw;
  z-index: 10;
  background: #fff;
  text-align: center;
}
.pay-btn {
  width: 100%;
  padding: 4vw;
  background: #ff3b3b;
  border: none;
  color: white;
  font-weight: bold;
  font-size: 4vw;
  border-radius: 2vw;
}
.pay-hint {
  margin-top: 3vw;
  font-size: 3vw;
  color: #999;
}
.online-service {
  color: #ff3b3b;
  font-weight: bold;
  margin-left: 1vw;
}

/* 滚动条隐藏 */
.card-scroll-wrapper {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.card-scroll-wrapper::-webkit-scrollbar {
  display: none;
}
.vip-benefits-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.vip-benefits-scroll::-webkit-scrollbar {
  display: none;
}
/* 滑块轨道 */
.scroll-track {
  position: relative;
  width: 34px;
  height: 4px;
  background: #dfdbdb;
  border-radius: 2px;
  margin: 0 auto;
  margin-top: 10px;
  overflow: hidden;
}

/* 滑块 */
.scroll-thumb {
  width: 15px;
  height: 4px;
  background: #f36;
  border-radius: 2px;
  transition: transform 0.2s;
}

</style>
