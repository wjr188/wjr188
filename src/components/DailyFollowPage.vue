<template>
  <div class="daily-follow-page">
    <!-- 吸顶：NavBar + Tabs -->
    <div class="sticky-header">
      <van-nav-bar
        title="每日追番"
        left-arrow
        @click-left="onBack"
      />
      <div class="tabs-wrapper">
        <div
          v-for="(day, index) in days"
          :key="index"
          class="tab-item"
          :class="{ active: index === activeTab }"
          @click="onTabChange(index)"
        >
          {{ day.label }}
        </div>
      </div>
    </div>

    <!-- Swiper -->
    <swiper
      class="content-swiper"
      :initial-slide="activeTab"
      @swiper="onSwiperReady"
      @slideChange="onSwiperChange"
    >
      <swiper-slide v-for="(day, index) in days" :key="index">
        <div class="slide-content">
          <AcgCard
            v-for="item in day.items"
            :key="item.id"
            :data="item"
            @item-click="onItemClick"
          />
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper as SwiperClass } from 'swiper/types'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import { showToast } from 'vant'
import AcgCard from '@/components/AcgCard.vue'

// 类型
interface Item {
  id: string
  title: string
  cover: string
  episodeCount: number
  category: string
  views: number
  src: string        // 改为必填
  tags: string[]     // 改为必填
}
interface Day {
  label: string
  items: Item[]
}

const router = useRouter()
const onBack = (): void => router.back()

const activeTab = ref<number>(0)
let swiperInstance: SwiperClass | null = null

const days = ref<Day[]>([
  { label: '周一', items: [] },
  { label: '周二', items: [] },
  { label: '周三', items: [] },
  { label: '周四', items: [] },
  { label: '周五', items: [] },
  { label: '昨日', items: [] },
  { label: '今天', items: [] },
])

// 填充示例数据
days.value.forEach((day, i) => {
  day.items = Array.from({ length: 6 }, (_, j): Item => ({
    id: `${i}-${j}`,
    title: `标题${j + 1}`,
    cover: 'https://via.placeholder.com/300x400?text=封面',
    episodeCount: Math.floor(Math.random() * 200),
    category: '韩漫',
    views: Math.floor(Math.random() * 99999),
    src: '',           // 必须补充
    tags: []           // 必须补充
  }))
})

const onTabChange = (index: number): void => {
  activeTab.value = index
  if (swiperInstance) swiperInstance.slideTo(index)
}

const onSwiperChange = (swiper: SwiperClass): void => {
  activeTab.value = swiper.activeIndex
}

const onSwiperReady = (swiper: SwiperClass): void => {
  swiperInstance = swiper
}

const onItemClick = (item: Item): void => {
  showToast(`点击了 ${item.title}`)
}
</script>

<style scoped>
.daily-follow-page {
  background: #f6f6f6;
  min-height: 100vh;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
}

/* 自定义Tabs */
.tabs-wrapper {
  display: flex;
  justify-content: space-around;
  padding: 2.1vw 0;
  border-bottom: 0.27vw solid #eee;
}
.tab-item {
  font-size: 4vw;
  font-weight: 600;
  color: #a19b9b;
  padding: 1.6vw 2.1vw;
  cursor: pointer;
  flex: 1;
  text-align: center;
}
.tab-item.active {
  color: #000;
}

/* Swiper容器高度 */
.content-swiper {
  height: calc(100vh - 25.6vw);
}

/* 卡片区域 */
.slide-content {
  padding: 2.1vw;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.1vw;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* NavBar 标题 */
::v-deep(.van-nav-bar__title) {
  font-size: 5.1vw !important;
  font-weight: bold !important;
  color: #333 !important;
}

/* 返回箭头 */
::v-deep(.van-icon-arrow-left) {
  font-size: 6.9vw !important;
  color: #333 !important;
}
</style>
