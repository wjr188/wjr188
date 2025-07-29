<template>
  <div class="entry-bar">
    <div
      class="entry-list"
      ref="scrollRef"
      @scroll="handleScroll"
      @touchstart.stop
      @touchmove.stop
    >
      <div
        class="entry-item"
        v-for="(item, index) in entries"
        :key="index"
        @click="handleClick(item)"
      >
        <img :src="item.icon" class="entry-icon" />
        <div class="entry-label">{{ item.label }}</div>
      </div>
    </div>
    <div class="scroll-track">
      <div
        class="scroll-thumb"
        :style="{ transform: `translateX(${thumbOffset}px)` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Entry {
  icon: string
  label: string
  route: string
}

const entries: Entry[] = [
  { icon: '/icons/paihangbang.png', label: '排行榜', route: '/video-rank' },
  { icon: '/icons/bozhu.png', label: '博主', route: '/star' },
  { icon: '/icons/xianmian.png', label: '限免', route: '/limited-free' },
  { icon: '/icons/qiandao.png', label: '签到', route: '/benefit-page' },
  { icon: '/icons/vip.png', label: '会员', route: '/vip?tab=vip' },
  { icon: '/icons/jinbi.png', label: '金币', route: '/vip?tab=coin' }
]

const scrollRef = ref<HTMLDivElement | null>(null)
const thumbOffset = ref(0)

const trackWidth = 9.1 // 34px ≈ 9.1vw
const thumbWidth = 4   // 15px ≈ 4vw

function handleScroll() {
  const el = scrollRef.value
  if (!el) return

  const maxScroll = el.scrollWidth - el.clientWidth
  const percent = maxScroll > 0 ? el.scrollLeft / maxScroll : 0

  const maxThumbMove = (trackWidth * (window.innerWidth / 100)) - (thumbWidth * (window.innerWidth / 100))
  thumbOffset.value = percent * maxThumbMove
}

function handleClick(item: Entry) {
  if (item.route) {
    router.push(item.route)
  }
}

onMounted(() => {
  nextTick(() => {
    handleScroll()
  })
})
</script>

<style scoped>
.entry-bar {
  padding: 0 3.2vw;
  margin-bottom: 3.2vw;
  position: relative;
}
.entry-list {
  display: flex;
  overflow-x: auto;
  gap: 4.3vw;
  padding: 2.1vw 0;
  scroll-behavior: smooth;
  touch-action: auto;
}
.entry-list::-webkit-scrollbar {
  display: none;
}
.entry-item {
  flex-shrink: 0;
  width: 15vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
}
.entry-icon {
  width: 12.8vw;
  height: 12.8vw;
  border-radius: 2.6vw;
  object-fit: cover;
  margin-bottom: 1vw;
}
.entry-label {
  font-size: 3.5vw;
  color: #333;
  white-space: nowrap;
  font-weight: 500;
  line-height: 1.1;
}

/* 滑块轨道 */
.scroll-track {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 9.1vw;
  height: 1vw;
  background: #dfdbdb;
  border-radius: 0.5vw;
  overflow: hidden;
}
/* 滑块 */
.scroll-thumb {
  width: 4vw;
  height: 1vw;
  background: #f36;
  border-radius: 0.5vw;
  transition: transform 0.2s;
}
</style>
