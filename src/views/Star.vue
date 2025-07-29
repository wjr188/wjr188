<template>
  <div class="star-wrapper">
    <!-- 搜索栏 -->
    <div class="search-wrapper">
      <div class="search-bar">
        <img src="/icons/eye.svg" class="search-icon" />
        <input 
          v-model="inputKeyword" 
          type="text" 
          placeholder="搜索博主/关键词"
          @keyup.enter="onSearch"
          @input="handleInputChange"
        />
        <img 
          src="/icons/close.svg" 
          class="clear-icon" 
          @click="onClear" 
          alt="清除"
          v-show="inputKeyword"
        />
      </div>
      <div class="search-button" @click="onSearch">搜索</div>
    </div>

    <!-- 分类 tabs -->
    <div class="category-tabs">
      <div
        v-for="(tab, index) in categories"
        :key="index"
        class="tab"
        :class="{ active: currentCategory === tab }"
        @click="onCategoryChange(tab)"
      >
        {{ tab }}
      </div>
    </div>
<!-- Banner -->
    <div class="banner-container">
      <Banner />
    </div>
    <!-- Swiper 分类切换 -->
    <swiper
      ref="swiperRef"
      :initial-slide="currentIndex"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
      :resistance-ratio="0.2"
      :speed="300"
      :threshold="30"
      :slides-per-view="1"
      class="swiper-container"
    >
      <swiper-slide v-for="(cat, i) in categories" :key="cat">
  <div
    class="slide-content"
    :ref="currentCategory === cat ? setScrollRef(cat) : null"
    @scroll.passive="onScroll(cat)"
  >
    <div class="grid">
      <div
        v-for="item in visibleData[cat]"
        :key="item.id"
        class="card"
        @click="goToDetail(item)"
      >
       <img v-lazy="item.avatar" class="avatar" />
        <div class="info">
          <div class="name">{{ item.name }}</div>
          <div class="title">{{ item.title }}</div>
        </div>
      </div>
    </div>
    <div class="load-more" v-if="loadingMap[cat]">
      <div class="spinner"></div>
      <div class="loading-text">客官别走，妾身马上就好~</div>
    </div>
    <div class="no-more" v-else-if="noMoreMap[cat]">
      客官，妾身被你弄高潮了，扛不住了 ~
    </div>
  </div>
</swiper-slide>

    </swiper>

    <TabBar />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import TabBar from '@/components/TabBar.vue'
import { stars } from '@/mock/star/stars'
import Banner from '@/components/Banner.vue'


// ===================== 基础数据 =====================
const router = useRouter()
const route = useRoute()

const categories = ['onlyfans', '微密圈', '推特twitter'] as const
type Category = typeof categories[number]

const currentCategory = ref<Category>(
  (sessionStorage.getItem('star-category') as Category) || 'onlyfans'
)
const currentIndex = ref<number>(categories.indexOf(currentCategory.value))
const swiperRef = ref<InstanceType<typeof Swiper> | null>(null)
const swiperIns = ref<any>(null)

const inputKeyword = ref('')
const searchKeyword = computed(() => (route.query.keyword as string) || '')
const PAGE_SIZE = 18

const scrollRefs = ref<Record<string, HTMLElement>>({})
const setScrollRef = (cat: Category) => (el: HTMLElement | null) => {
  if (el) scrollRefs.value[cat] = el
}

function onSwiper(swiper: any) {
  swiperIns.value = swiper
}

// ===================== 数据过滤 =====================
const filteredMap = computed(() => {
  const map: Record<Category, typeof stars> = {} as any
  categories.forEach(cat => {
    let data = stars.filter(item => item.type === cat)
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      data = data.filter(item =>
        item.name.toLowerCase().includes(keyword) ||
        item.title?.toLowerCase().includes(keyword)
      )
    }
    map[cat] = data
  })
  return map
})

// ===================== 懒加载控制 =====================
const visibleData = ref<Record<Category, typeof stars>>({} as any)
const loadingMap = ref<Record<Category, boolean>>({} as any)
const noMoreMap = ref<Record<Category, boolean>>({} as any)

function initVisibleData() {
  categories.forEach(cat => {
    const saved = parseInt(sessionStorage.getItem(getLoadedKey(cat)) || '0') || PAGE_SIZE
    visibleData.value[cat] = filteredMap.value[cat].slice(0, saved)
    loadingMap.value[cat] = false
    noMoreMap.value[cat] = visibleData.value[cat].length >= filteredMap.value[cat].length
  })
}

watch(filteredMap, () => initVisibleData())

function loadMore(cat: Category) {
  if (loadingMap.value[cat] || noMoreMap.value[cat]) return
  loadingMap.value[cat] = true

  setTimeout(() => {
    const currentLength = visibleData.value[cat].length
    const fullList = filteredMap.value[cat]
    const more = fullList.slice(currentLength, currentLength + PAGE_SIZE)
    visibleData.value[cat] = [...visibleData.value[cat], ...more]
    loadingMap.value[cat] = false
    sessionStorage.setItem(getLoadedKey(cat), visibleData.value[cat].length.toString())
    if (visibleData.value[cat].length >= fullList.length) {
      noMoreMap.value[cat] = true
    }
  }, 800)
}

function onScroll(cat: Category) {
  const el = scrollRefs.value[cat]
  if (!el) return
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
    loadMore(cat)
  }
}

// ===================== 搜索功能 =====================
function handleInputChange() {
  if (!inputKeyword.value) {
    onClear()
  }
}
function onSearch() {
  if (!inputKeyword.value.trim()) return;
  categories.forEach(cat => sessionStorage.removeItem(getLoadedKey(cat)));
  router.push({
    query: { ...route.query, keyword: inputKeyword.value.trim() }
  });
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function onClear() {
  inputKeyword.value = ''
  router.replace({ query: { ...route.query, keyword: undefined } })
  categories.forEach(cat => sessionStorage.removeItem(getLoadedKey(cat)))
}

// ===================== 分类切换 =====================
function onCategoryChange(name: Category) {
  const newIndex = categories.indexOf(name)
  if (newIndex === -1 || currentIndex.value === newIndex) return
  saveScroll(currentCategory.value)
  currentCategory.value = name
  currentIndex.value = newIndex
  sessionStorage.setItem('star-category', name)
  nextTick(() => {
    swiperIns.value?.slideTo(newIndex, 300)
    restoreScroll(name)
  })
}

onActivated(() => {
  restoreScroll(currentCategory.value)
  nextTick(() => {
    swiperIns.value?.slideTo(currentIndex.value, 0)
  })
})

function onSlideChange(swiper: any) {
  saveScroll(currentCategory.value)
  currentIndex.value = swiper.activeIndex
  currentCategory.value = categories[swiper.activeIndex]
  sessionStorage.setItem('star-category', currentCategory.value)
  restoreScroll(currentCategory.value)
}

// ===================== 详情跳转 =====================
function goToDetail(item: any) {
  saveScroll(currentCategory.value)
  sessionStorage.setItem('star-list-category', currentCategory.value)
  sessionStorage.setItem('star-list-index', currentIndex.value.toString())
  sessionStorage.setItem('star-detail-data', JSON.stringify(item))
  sessionStorage.setItem('star-list-from', '1')
  router.push({
    name: 'StarDetail',
    params: { id: item.id }
  })
}

// ===================== 滚动记录 =====================
function saveScroll(name: Category) {
  const scrollTop = scrollRefs.value[name]?.scrollTop || 0
  sessionStorage.setItem(`star-scroll-${name}`, scrollTop.toString())
}
function restoreScroll(name: Category) {
  const saved = sessionStorage.getItem(`star-scroll-${name}`)
  if (!saved) return
  let retry = 0
  function tryRestore() {
    const el = scrollRefs.value[name]
    if (el && el.scrollHeight > 0) {
      el.scrollTop = parseInt(saved)
    } else if (retry < 20) {
      retry++
      setTimeout(tryRestore, 30)
    } else {
      console.warn(`[restoreScroll] failed for`, name)
    }
  }
  tryRestore()
}

// ===================== 初始化 =====================
onMounted(() => {
  if (route.query.keyword) inputKeyword.value = route.query.keyword as string
  initVisibleData()
  nextTick(() => {
    const lastCat = sessionStorage.getItem('star-list-category') as Category | null
    const lastIdx = Number(sessionStorage.getItem('star-list-index'))
    if (lastCat && categories.includes(lastCat)) {
      currentCategory.value = lastCat
      currentIndex.value = lastIdx
      nextTick(() => {
        swiperIns.value?.slideTo(lastIdx, 0)
        nextTick(() => restoreScroll(currentCategory.value))
      })
    } else {
      swiperIns.value?.slideTo(currentIndex.value, 0)
      nextTick(() => restoreScroll(currentCategory.value))
    }
  })
})

// ===================== 工具 =====================
function getLoadedKey(cat: Category) {
  return `star-loaded-count-${cat}-${inputKeyword.value}`
}
</script>

<style scoped>
.star-wrapper {
  background: #fff;
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: 10vw; /* 70px */
  padding-top: 12vw;       /* 60px */
}
.search-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  background: #fff;
  padding: 2vw;
  border-bottom: none; /* 确保没有分隔线 */
  box-shadow: none;    /* 确保没有阴影 */
}
.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(240, 240, 240, 0.9);
  border-radius: 2vw;
  padding: 2.13vw 3.73vw;  /* 8px 14px */
}

.search-icon {
  width: 4.27vw;   /* 16px */
  height: 4.27vw;
  margin-right: 2.13vw;  /* 8px */
  opacity: 0.5;
}

.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #333;
  font-size: 4.27vw; /* 16px */
  touch-action: manipulation;
}
.banner-container {
  margin: 3.2vw 0;
}
.clear-icon {
  width: 5.86vw;   /* 22px */
  height: 5.86vw;
  margin-left: 2.13vw; /* 8px */
  cursor: pointer;
  opacity: 0.8;
}

.search-button {
  margin-left: 2.13vw; /* 8px */
  padding: 1.6vw 3.73vw; /* 6px 14px */
  background: #f12c2c;
  color: white;
  border-radius: 5.33vw; /* 20px */
  font-size: 3.73vw; /* 14px */
  font-weight: bold;
  white-space: nowrap;
}
.category-tabs {
  display: flex;
  flex-wrap: nowrap;      /* 不换行 */
  justify-content: center;
  overflow-x: auto;       /* 允许横向滚动 */
  gap: 3.2vw;
  padding: 0 3vw;
  background: #fcfbfb;
  position: sticky;
  top: calc(10vw + 2vw * 2); 
  z-index: 9;
  border-bottom: 5px solid #fcfbfb;
  -webkit-overflow-scrolling: touch; /* 提高iOS滚动体验 */
  scrollbar-width: none;
}
.category-tabs::-webkit-scrollbar {
  display: none;
}
.tab {
  white-space: nowrap;     /* 防止文字换行 */
  flex: 0 0 auto;          /* 宽度自适应内容，不收缩不扩展 */
  padding: 1.6vw 3.73vw;
  font-size: 3.73vw;
  border-radius: 2vw;
  background: #f0f0f0;
  color: #333;
}
.tab.active {
  background: #f12c2c;
  color: #fff;
}

.swiper-container {
  height: calc(100vh - 42.66vw); /* 160px */
}

.slide-content {
  overflow-y: auto;
  height: 100%;
  background: #fff;
  padding: 0 3.2vw; /* 12px */
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  -webkit-mask-image: linear-gradient(black 100%, black 100%);
  mask-image: linear-gradient(black 100%, black 100%);
}

.slide-content::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3.2vw; /* 12px */
  margin-top: 1vw;
}

.card {
  background: rgba(235, 233, 233, 0.9);
  border-radius: 2vw; /* 12px */
  overflow: hidden;
  text-align: center;
  padding: 0.5vw 1.6vw; /* 10px 6px */
}

.avatar {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 2.13vw; /* 8px */
}

.info {
  margin-top: 1.6vw; /* 6px */
}

.name {
  font-size: 3.46vw; /* 13px */
  font-weight: bold;
  color: #333;
}

.title {
  font-size: 3.2vw; /* 12px */
  color: #666;
  margin-top: 0.53vw; /* 2px */
}

.load-more {
  text-align: center;
  padding: 5.33vw 0; /* 20px */
  color: #999;
}

.spinner {
  border: 0.8vw solid #eee;         /* 3px */
  border-top: 0.8vw solid #f12c2c;
  border-radius: 50%;
  width: 6.93vw;    /* 26px */
  height: 6.93vw;
  animation: spin 1s linear infinite;
  margin: 0 auto 2.66vw; /* 10px */
}

@keyframes spin {
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}

.no-more {
  text-align: center;
  padding: 4.8vw 0; /* 18px */
  color: #999;
  font-size: 3.73vw; /* 14px */
}

</style>