<template>
  <div class="discover-wrapper">
    <!-- 二级横滑导航 -->
    <div class="category-bar" ref="navBar">
      <div class="category-list" ref="scrollWrap">
        <div
          class="category-item"
          v-for="(cat, i) in categories"
          :key="i"
          :class="{ active: activeCategory === cat }"
          @click="onCategoryClick(i, cat)"
        >
          {{ cat }}
        </div>
      </div>
    </div>

    <!-- 横向 swiper 容器 -->
    <swiper
      ref="swiperRef"
      class="discover-swiper"
      :slides-per-view="1"
      :resistance-ratio="0.3"
      :threshold="20"
      :speed="300"
      :space-between="0"
      @slideChange="onSwiperChange"
      @swiper="onSwiperReady"
    >
      <swiper-slide v-for="(cat, index) in categories" :key="cat">
        <div class="video-grid">
          <VideoCardTiktok
            v-for="(item, itemIndex) in videoMap[cat] || []"
            :key="itemIndex"
            :index="itemIndex"
            :category="cat"
            :cover="item.cover"
            :views="String(item.views)"
            :duration="item.duration"
            :title="item.title"
            :tag="item.tag"
            :tags="item.tags"
            :tagColor="item.tagColor"
          />
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperType } from 'swiper'
import { useRoute, useRouter } from 'vue-router'
import 'swiper/css'
import VideoCardTiktok from '../components/VideoCardTiktok.vue'

interface VideoItem {
  cover: string
  views: number
  duration: string
  title: string
  tag?: string
  tags?: string[]
  tagColor?: string
}

const route = useRoute()
const router = useRouter()

const activeCategory = ref<string>('最新')
const categories = [
  '最新', '最热', '巨乳', '美臀', '学生', '女儿', '乱伦', '白虎', '内射', '调教', '网黄'
]

const swiperRef = ref<InstanceType<typeof Swiper> | null>(null)
let swiperInstance: SwiperType | null = null

const videoMap = ref<Record<string, VideoItem[]>>({})

const categoryFileMap: Record<string, string> = {
  '最新': 'zui_xin',
  '最热': 'zui_re',
  '巨乳': 'ju_ru',
  '美臀': 'mei_tun',
  '学生': 'xue_sheng',
  '女儿': 'nv_er',
  '乱伦': 'luan_lun',
  '白虎': 'bai_hu',
  '内射': 'nei_she',
  '调教': 'tiao_jiao',
  '网黄': 'wang_huang'
}

// 加载分类数据
const loadCategoryData = async (category: string) => {
  if (videoMap.value[category]) return
  const fileKey = categoryFileMap[category]
  try {
    const module = await import(`../mock/tiktok/${fileKey}.js`)
    videoMap.value[category] = module.default as VideoItem[]
  } catch (err) {
    console.error(`加载失败: ${fileKey}.js`, err)
    videoMap.value[category] = []
  }
}

// 点击分类
const onCategoryClick = async (i: number, cat: string) => {
  activeCategory.value = cat
  router.replace({ query: { ...route.query, category: cat } })
  await loadCategoryData(cat)

  if (swiperInstance && swiperInstance.slideTo) {
    swiperInstance.slideTo(i)
  } else {
    console.error('Swiper 实例未初始化')
  }
}

// Swiper滑动时
const onSwiperChange = async (swiper: SwiperType) => {
  const cat = categories[swiper.activeIndex]
  activeCategory.value = cat
  router.replace({ query: { ...route.query, category: cat } })
  await loadCategoryData(cat)
  scrollNavToActive(swiper.activeIndex)
}

// Swiper初始化
const onSwiperReady = (swiper: SwiperType) => {
  swiperInstance = swiper
}

// 自动滚动导航
const scrollNavToActive = (index: number) => {
  const tabEl = document.querySelectorAll<HTMLDivElement>('.category-item')[index]
  const navEl = document.querySelector<HTMLDivElement>('.category-bar')
  if (tabEl && navEl) {
    const left = tabEl.offsetLeft - navEl.offsetWidth / 2 + tabEl.offsetWidth / 2
    navEl.scrollTo({ left, behavior: 'smooth' })
  }
}

// 页面加载时初始化
onMounted(async () => {
  const initialCategory = route.query.category as string | undefined
  if (initialCategory && categories.includes(initialCategory)) {
    activeCategory.value = initialCategory
    await loadCategoryData(initialCategory)
    const index = categories.indexOf(initialCategory)
    if (swiperInstance) {
      swiperInstance.slideTo(index)
    }
    scrollNavToActive(index)
  } else {
    await loadCategoryData(activeCategory.value)
  }
})

// 监听URL改变
watch(
  () => route.query.category,
  async (newCat) => {
    if (typeof newCat === 'string' && categories.includes(newCat)) {
      activeCategory.value = newCat
      const index = categories.indexOf(newCat)
      await loadCategoryData(newCat)
      if (swiperInstance) {
        swiperInstance.slideTo(index)
      }
      scrollNavToActive(index)
    }
  }
)
</script>

<style scoped>
.discover-wrapper {
  background: #000;
  min-height: 100vh;
  color: #fff;
  box-sizing: border-box;
  overflow-y: hidden;
  padding-top: 10.66vw; /* 40px */
}

.category-bar {
  position: fixed;
  top: 13.33vw; /* 50px */
  width: 100%;
  z-index: 98;
  background-color: #000;
  overflow-x: auto;
  white-space: nowrap;
  padding: 1.6vw 0; /* 6px */
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.category-bar::-webkit-scrollbar {
  display: none;
}
.category-list {
  display: inline-flex;
  gap: 2.66vw; /* 10px */
  padding: 0 1.6vw; /* 6px */
  min-width: max-content;
}
.category-item {
  font-size: 3.73vw; /* 14px */
  color: #ccc;
  padding: 1.06vw 3.2vw; /* 4px 12px */
  border-radius: 1.33vw; /* 5px */
  background-color: #2c2c2e;
  white-space: nowrap;
  transition: all 0.2s;
  box-shadow: inset 0 0 0.26vw #3a3a3a;
}
.category-item.active {
  background-color: #ff2c55;
  color: #fff;
  font-weight: bold;
}

.discover-swiper {
  margin-top: 10.66vw; /* 40px */
  min-height: calc(100vh - 34.66vw); /* 130px */
}

.video-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.66vw; /* 10px */
  padding: 2.66vw; /* 10px */
  padding-bottom: 16vw;
  box-sizing: border-box;
}
</style>
