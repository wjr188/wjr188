<template>
  <div class="vip-page" ref="pageRef">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <img src="/icons/back.svg" class="back-icon" @click="$router.back()" />
      <div class="nav-center-tabs">
        <span :class="{ active: tab === 'vip' }" @click="tab = 'vip'">会员</span>
        <span :class="{ active: tab === 'coin' }" @click="tab = 'coin'">金币</span>
      </div>
      <span class="record-tab" @click="goToOrderRecord">充值记录</span>
    </div>

    <!-- 跑马灯 -->
    <div class="notice-bar">
      <img src="/icons/horn.svg" class="horn-icon" />
      <div class="notice-text-wrapper">
        <div class="notice-text" :style="{ transform: `translateX(${offset}px)` }">
          {{ marqueeCombined }}
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="tab-content">
      <VipCardView v-if="tab === 'vip'" />
      <CoinView v-else-if="tab === 'coin'" />
      <div v-else class="record-placeholder">充值记录功能开发中...</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VipCardView from '../components/VipCardView.vue'
import CoinView from '../components/CoinView.vue'

const router = useRouter()
const route = useRoute()

type TabType = 'vip' | 'coin' | 'record'
const tab = ref<TabType>('vip')

const pageRef = ref<HTMLElement | null>(null)

// 监听 URL 参数 ?tab=coin 或 ?tab=vip
watch(
  () => route.query.tab,
  (val) => {
    if (val === 'vip' || val === 'coin' || val === 'record') {
      tab.value = val
    }
  },
  { immediate: true }
)

// 跑马灯
const marqueeText = '充值前一定要注册绑定账号，并妥善保管您的账号和密码！只有提供您的账号我们才可协助找回！'
const marqueeCombined = marqueeText + '      ' + marqueeText
const offset = ref<number>(0)
const speed = 0.4

onMounted(() => {
  const interval = setInterval(() => {
    offset.value -= speed
    if (Math.abs(offset.value) > marqueeText.length * 12 + 60) {
      offset.value = 0
    }
  }, 16)

  // 滑动手势
  let startX = 0

  const handleTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX
  }

  const handleTouchEnd = (e: TouchEvent) => {
    const el = e.target as HTMLElement | null
    if (el && el.closest('.card-swipe-area')) return

    const endX = e.changedTouches[0].clientX
    const diffX = endX - startX
    if (diffX > 50 && tab.value !== 'vip') {
      tab.value = 'vip'
    } else if (diffX < -50 && tab.value !== 'coin') {
      tab.value = 'coin'
    }
  }

  const el = pageRef.value
  if (el) {
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  onBeforeUnmount(() => {
    clearInterval(interval)
    if (el) {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  })
})

// 跳转订单记录
const goToOrderRecord = () => {
  router.push({ name: 'OrderRecord' })
}
</script>

<style scoped>
.vip-page {
  background: #fff;
  height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3.73vw 4.26vw 2.13vw; /* 14px 16px 8px */
  position: relative;
}
.back-icon {
  width: 6.4vw;   /* 24px */
  height: 6.4vw;
  margin-right: 3.2vw; /* 12px */
}
.nav-center-tabs {
  display: flex;
  gap: 6.4vw; /* 24px */
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.nav-center-tabs span {
  font-size: 4.8vw; /* 18px */
  font-weight: 500;
  color: #333;
  position: relative;
  padding-bottom: 1.06vw; /* 4px */
}
.nav-center-tabs .active {
  font-weight: bold;
  color: #f14b4b;
  font-size: 5.33vw; /* 20px */
}
.nav-center-tabs .active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  height: 0.53vw; /* 2px */
  width: 100%;
  background-color: #f14b4b;
  border-radius: 0.26vw; /* 1px */
}
.record-tab {
  font-size: 4vw; /* 15px */
  color: #333;
  flex-shrink: 0;
}

/* 跑马灯 */
.notice-bar {
  display: flex;
  align-items: center;
  background: #fef6f6;
  padding: 2.5vw 4vw; /* 高一些 padding */
  margin: 0.1vw 4vw; /* 上下留空 */
  border-radius: 2vw;
  overflow: hidden;
}
.horn-icon {
  width: 5vw; /* 大一点 */
  height: 5vw;
  margin-right: 2vw;
  flex-shrink: 0;
}
.notice-text-wrapper {
  overflow: hidden;
  white-space: nowrap;
  flex: 1;
}
.notice-text {
  display: inline-block;
  white-space: nowrap;
  color: #666;
  font-size: 3.7vw; /* 字体大一些 */
  line-height: 1.4;
}

/* 内容区域 */
.tab-content {
  transition: all 0.3s ease;
}

</style>
