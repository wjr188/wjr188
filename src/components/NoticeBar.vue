<template>
  <div v-if="visible" class="notice-bar">
    <img src="/icons/speaker.svg" class="notice-icon" />
    <div class="notice-text-wrapper" ref="wrapperRef">
      <div
        class="notice-track"
        :style="{
          animationDuration: duration + 's',
          '--marquee-width': totalWidth + 'px'
        }"
        ref="trackRef"
      >
        <div class="notice-text">{{ message }}</div>
        <div class="notice-text">{{ message }}</div>
      </div>
    </div>
    <div class="notice-close" @click="visible = false">✕</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'

const visible = ref<boolean>(true)
const message = ref<string>(
  '📢 Holly污视频资源每日极速更新,新人会员卡一折限时发售中，若无法微信支付，建议更换支付宝进行充值，诚邀您的朋友代您充值也可，充值前一定要，切记！切记！充值后联系客服发货！'
)

const wrapperRef = ref<HTMLDivElement | null>(null)
const trackRef = ref<HTMLDivElement | null>(null)
const duration = ref<number>(20)
const totalWidth = ref<number>(1000)

function calcWidth(): void {
  nextTick(() => {
    const track = trackRef.value
    const textEl = track?.querySelector<HTMLDivElement>('.notice-text')
    const wrapper = wrapperRef.value
    if (track && textEl && wrapper) {
      const textWidth = textEl.offsetWidth
      const wrapperWidth = wrapper.offsetWidth
      totalWidth.value = textWidth + wrapperWidth
      duration.value = (textWidth + wrapperWidth) / 45
    }
  })
}

onMounted(() => {
  calcWidth()
  window.addEventListener('resize', calcWidth)
})
onUnmounted(() => {
  window.removeEventListener('resize', calcWidth)
})
</script>

<style scoped>
.notice-bar {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 2.1vw; /* 8px */
  box-shadow: 0 0.5vw 1.6vw rgba(0, 0, 0, 0.1); /* 0 2px 6px */
  padding: 2vw 0;
  margin: 0;
  font-size: 3.7vw; /* 14px */
  color: #333;
  position: relative;
  overflow: hidden;
  width: 100%;
  min-width: 0;
}

.notice-icon {
  width: 4.8vw; /* 18px */
  height: 4.8vw;
  margin: 0 2.1vw 0 3.2vw; /* 8px 12px */
  flex-shrink: 0;
}

.notice-text-wrapper {
  flex: 1 1 auto;
  width: 100%;
  overflow: hidden;
  height: 5.3vw; /* 20px */
  position: relative;
  min-width: 0;
}

.notice-track {
  display: flex;
  white-space: nowrap;
  animation-name: marquee;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.notice-text {
  padding-right: 16vw; /* 60px */
  max-width: none;
}

.notice-close {
  margin: 0 3.2vw 0 2.1vw; /* 12px 8px */
  font-size: 4.3vw; /* 16px */
  cursor: pointer;
  flex-shrink: 0;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-1 * var(--marquee-width)));
  }
}

@media screen and (min-width: 768px) {
  .notice-track {
    animation: none !important;
    transform: translateX(0) !important;
  }
}
</style>
