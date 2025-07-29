<template>
  <SafeWrapper>
  <div class="home-wrapper" v-if="pageReady">
    <TopNavBar
      :activeCategory="currentCategory"
      :categories="categories"
      @categoryChange="onCategoryChange"
      @drawerOpen="drawerVisible = true"
    />
    <SideDrawer
      :visible="drawerVisible"
      :list="categories"
      :active="currentCategory"
      @close="drawerVisible = false"
      @select="onCategoryChange"
    />
    <swiper
      ref="swiperRef"
      :initial-slide="currentIndex"
      @swiper="onSwiperReady"
      :onSlideChange="onSlideChange"
      class="swiper-container"
      :resistance-ratio="0.1"
      :longSwipes="true"
      :longSwipesRatio="0.3"
      :threshold="30"
      :speed="300"
      :space-between="0"
      :slides-per-view="1"
      
    >
      <swiper-slide v-for="(name, i) in categoryNames" :key="name">
        <div class="slide-content" :ref="el => setSlideRef(el, i)">
          <Banner :key="bannerKey + '-' + name" />
          <NoticeBar />
          <template v-if="name === '推荐'">
            <QuickEntryBar />
            <Recommend @clickItem="goToPlay" @goToMore="goToListPage" />
          </template>
          <template v-else>
            <NormalCategory
  :categoryList="categoryData[name] || []"
  :videoBasicData="videoBasicData"
  :categoryName="name"
  @clickItem="goToPlay"
  @goToMore="goToListPage"
/>
          </template>
        </div>
      </swiper-slide>
    </swiper>
    <div v-if="loadingMore" class="loading-more">
    <img src="/icons/loading.svg" class="spinner" />
    正在加载更多...
  </div>
  <div v-if="!hasMore && longVideoStore.list.length > 0" class="no-more">
    没有更多内容了
  </div>
    <TabBar />
  </div>
  </SafeWrapper>
</template>
<script setup lang="ts">
import { ref, onMounted, nextTick, watch, type Ref, type ComponentPublicInstance } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperCore } from 'swiper'
import 'swiper/css'
import SafeWrapper from '@/components/SafeWrapper.vue'

import { defaultCategories } from '../constants/categories'
import { categoryFileMap } from '../constants/categoryFileMap'
const videoBasicData = ref<Record<number, { id: number, title: string, cover: string }[]>>({})

async function loadCategory(name: string) {
  const parent = categories.value.find(c => c.name === name);
  if (!parent) return;
  categoryPageMap.value[name] = 1;
  await longVideoStore.loadList({
    parent_id: parent.id,
    page: 1,
    pageSize: 20
  });
  hasMore.value = longVideoStore.cache[parent.id]?.hasMore || false;
  // ...分组逻辑同上
  const allVideos = longVideoStore.list;
  const groupMap: Record<number, { id: number, name: string, sort: number, icon: string }> = {};
  const videoMap: Record<number, any[]> = {};
  allVideos.forEach(item => {
    const cid = item.category_id;
    if (!groupMap[cid]) {
      // 直接使用视频项中的 icon 字段（从视频接口获取）
      groupMap[cid] = {
        id: cid,
        name: item.categoryName,
        sort: item.categorySort,
        icon: item.icon || '' // ✅ 关键修改：使用视频接口返回的图标
      };
      videoMap[cid] = [];
    }
    videoMap[cid].push({
      id: item.id,
      title: item.title,
      cover: item.cover || item.cover_url,
      duration: item.duration,
      play: item.play ?? 0,
      tags: item.tags || [],
      vip: item.vip,
      coin: item.coin,
      sort: item.sort,
    });
  });
 
  categoryData.value = {
    ...categoryData.value,
    [name]: Object.values(groupMap)
  };
  videoBasicData.value = {
    ...videoBasicData.value,
    ...videoMap
  };
}
import TopNavBar from '../components/TopNavBar.vue'
import SideDrawer from '../components/SideDrawer.vue'
import Banner from '../components/Banner.vue'
import NoticeBar from '../components/NoticeBar.vue'
import QuickEntryBar from '../components/QuickEntryBar.vue'
import Recommend from '../components/Recommend.vue'
import NormalCategory from '../components/NormalCategory.vue'
import TabBar from '../components/TabBar.vue'
import { useLongCategoryStore } from "@/store/longCategoryStore";
import { useLongVideoStore } from "@/store/longVideoStore";
import { encode } from '@/utils/base62'
// 类型定义
interface Category {
  name: string
  [key: string]: any
}

const router = useRouter()
const swiperRef = ref<InstanceType<typeof Swiper> | null>(null)
const swiperInstance = ref<SwiperCore | null>(null)
const longVideoStore = useLongVideoStore();
const drawerVisible = ref(false)
const pageReady = ref(false)

const categoryStore = useLongCategoryStore();
const categories = ref<Category[]>([]);
const categoryNames = ref<string[]>([]);

const currentCategory = ref<string>('推荐')
const currentIndex = ref<number>(0)
const bannerKey = ref(0)
const categoryData = ref<Record<string, any[]>>({})
const slideRefs = ref<(HTMLElement | null)[]>([])
const categoryPageMap = ref<Record<string, number>>({});
const loadingMore = ref(false);
const hasMore = ref(false);

function setSlideRef(el: Element | ComponentPublicInstance | null, i: number) {
  // 只收集 DOM 元素
  if (el instanceof HTMLElement) {
    slideRefs.value[i] = el
  } else if (el && (el as any).$el instanceof HTMLElement) {
    slideRefs.value[i] = (el as any).$el
  } else {
    slideRefs.value[i] = null
  }
}
function onSwiperReady(swiper: SwiperCore) {
  swiperInstance.value = swiper
  
}

function saveScroll(name: string) {
  const idx = categoryNames.value.indexOf(name)
  const el = slideRefs.value[idx]
  if (el) {
    sessionStorage.setItem(`scroll-${name}`, el.scrollTop.toString())
  }
}

function restoreScroll(name: string, targetScroll: number | null = null) {
  const idx = categoryNames.value.indexOf(name)
  const el = slideRefs.value[idx]

  const scrollTo = targetScroll !== null ? targetScroll : parseInt(sessionStorage.getItem(`scroll-${name}`) || '0')

  if (!el) {
    // console.warn(`Element for category ${name} (index ${idx}) not found for scrolling.`); // 调试用
    return
  }

  let attempts = 0
  const maxAttempts = 60
  const tolerance = 5

  const tryScroll = () => {
    
    if (el) {
      el.scrollTop = scrollTo
      if (Math.abs(el.scrollTop - scrollTo) < tolerance || attempts >= maxAttempts) {
        return
      }
    }
    attempts++
    requestAnimationFrame(tryScroll)
  }

  requestAnimationFrame(tryScroll)
}

function onCategoryChange(name: string) {
  const newIndex = categoryNames.value.indexOf(name)
  if (newIndex === -1) return

  saveScroll(currentCategory.value)

  currentCategory.value = name
  currentIndex.value = newIndex
  sessionStorage.setItem('home-last-category', name)

  nextTick(() => {
    // 让 swiper 跳到对应 slide
    swiperInstance.value?.slideTo(newIndex)
    setupScrollListener();
    // ❌ 不要在这里调用 loadCategory(name)
  });
  drawerVisible.value = false
}

function onSlideChange(swiper: SwiperCore) {
  saveScroll(currentCategory.value)

  currentIndex.value = swiper.activeIndex
  currentCategory.value = categoryNames.value[currentIndex.value]
  sessionStorage.setItem('home-last-category', currentCategory.value)

  setTimeout(() => restoreScroll(currentCategory.value), 80)
  nextTick(() => {
    setupScrollListener();
    loadCategory(currentCategory.value); // 只在这里拉接口
  });
}

function goToPlay(item: any) {
  

  if (!item || !item.id) {
    console.error("goToPlay: 缺少 id!", item);
    return;
  }

  // 保存当前位置滚动，方便返回时恢复
  const idx = categoryNames.value.indexOf(currentCategory.value)
  const el = slideRefs.value[idx]
  const scrollTop = el?.scrollTop ?? 0

  saveScroll(currentCategory.value)
  sessionStorage.setItem('return-from', 'home-category')
  sessionStorage.setItem('return-category', currentCategory.value)
  sessionStorage.setItem('return-scroll', scrollTop.toString())

  // ✅ 直接传真实 id，不用 encode
  router.push({
    path: `/play/${item.id}`,
  })
}

function goToListPage(cat: string) {
  const idx = categoryNames.value.indexOf(currentCategory.value)
  const el = slideRefs.value[idx]
  const scrollTop = el?.scrollTop ?? 0

  saveScroll(currentCategory.value)
  sessionStorage.setItem('return-from', 'home-category')
  sessionStorage.setItem('return-category', currentCategory.value)
  sessionStorage.setItem('return-scroll', scrollTop.toString())

  // 找到当前分类下的 categoryId
  const group = (categoryData.value[currentCategory.value] || []).find((g: any) => g.name === cat)
  const categoryId = group?.id

  router.push({ name: 'ListPage', query: { cat, categoryId } })
}

async function initPage() {
  const returnFrom = sessionStorage.getItem('return-from')
  const returnCategory = sessionStorage.getItem('return-category')
  const returnScroll = sessionStorage.getItem('return-scroll')
  const lastVisitedCategory = sessionStorage.getItem('home-last-category') || '推荐'

  let targetCategory = lastVisitedCategory
  let targetScroll = 0

  if (returnFrom === 'home-category' && returnCategory) {
    targetCategory = returnCategory
    targetScroll = parseInt(returnScroll || '0')
    sessionStorage.removeItem('return-from')
    sessionStorage.removeItem('return-category')
    sessionStorage.removeItem('return-scroll')
  }

  currentCategory.value = targetCategory
  currentIndex.value = categoryNames.value.indexOf(targetCategory)
  if (currentIndex.value === -1) {
    currentCategory.value = '推荐'
    currentIndex.value = categoryNames.value.indexOf('推荐')
  }
  sessionStorage.setItem('home-last-category', currentCategory.value)

  await nextTick()
  swiperInstance.value?.slideTo(currentIndex.value, 0)
  setTimeout(() => restoreScroll(currentCategory.value, targetScroll), 80)

  bannerKey.value++
  
  pageReady.value = true
}



onMounted(async () => {
  await categoryStore.loadCategories();
 
  categories.value = [{ name: "推荐", id: 0 }, ...categoryStore.categories.filter(c => c.parent_id === 0)];
  categoryNames.value = categories.value.map(c => c.name);
 
 
  await initPage();
});

function setupScrollListener() {
  const slideContainer = slideRefs.value[currentIndex.value];
  if (!slideContainer) return;
  slideContainer.removeEventListener('scroll', handleScroll); // 防止重复绑定
  slideContainer.addEventListener('scroll', handleScroll);
}

function handleScroll(event: Event) {
  const el = event.target as HTMLElement;
  if (!el) return;
  const bottomOffset = el.scrollHeight - el.scrollTop - el.clientHeight;
  if (bottomOffset < 200 && !loadingMore.value && hasMore.value) {
    loadMore();
  }
}

async function loadMore() {
  const currentCat = currentCategory.value;
  const parent = categories.value.find(c => c.name === currentCat);
  if (!parent) return;
  const nextPage = (categoryPageMap.value[currentCat] || 1) + 1;
  categoryPageMap.value[currentCat] = nextPage;
  loadingMore.value = true;
  try {
    await longVideoStore.loadList({
      parent_id: parent.id,
      page: nextPage,
      pageSize: 20
    });
    hasMore.value = longVideoStore.cache[parent.id]?.hasMore || false;
    // 这里你可以追加新数据到 videoBasicData.value
    // ...分组逻辑同 loadCategory
    const allVideos = longVideoStore.list;
    const groupMap: Record<number, { id: number, name: string, sort: number, icon: string }> = {};
    const videoMap: Record<number, any[]> = {};
    allVideos.forEach(item => {
      const cid = item.category_id;
      if (!groupMap[cid]) {
        groupMap[cid] = {
          id: cid,
          name: item.categoryName,
          sort: item.categorySort,
          icon: item.icon || '' // ✅ 同样使用视频接口的图标
        };
        videoMap[cid] = [];
      }
      videoMap[cid].push({
        id: item.id,
        title: item.title,
        cover: item.cover || item.cover_url,
        duration: item.duration,
        play: item.play ?? 0,
        tags: item.tags || [],
        vip: item.vip,         // 必须加
        coin: item.coin,       // 必须加
      });
    });
    categoryData.value = {
      ...categoryData.value,
      [currentCat]: Object.values(groupMap)
    };
    videoBasicData.value = {
      ...videoBasicData.value,
      ...videoMap
    };
  } finally {
    loadingMore.value = false;
  }
}
</script>
<style scoped>
.home-wrapper {
  background: #fff;
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* Home 页面整体不滚动，由 Swiper 内部的 slide-content 滚动 */
  position: relative;
}

.swiper-container {
  /* 假设 TopNavBar 高度是 13vw (如iPhone 375px下约48px) */
  height: calc(100vh - 13vw);
}

.slide-content {
  height: 100%;
  overflow-y: auto;
  padding-bottom: 18vw; /* 底部TabBar和内容安全区适配，按设计稿自己微调 */
  background-color: #fff;
  -webkit-overflow-scrolling: touch;

  /* ✅ 跨平台隐藏滚动条 */
  scrollbar-width: none;            /* Firefox */
  -ms-overflow-style: none;         /* IE/Edge */
  -webkit-mask-image: linear-gradient(black 100%, black 100%);
  mask-image: linear-gradient(black 100%, black 100%);
}

/* ✅ 隐藏 Webkit 系滚动条 */
.slide-content::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

.loading-more, .no-more {
  text-align: center;
  padding: 10px 0;
  font-size: 14px;
  color: #999;
}
.spinner {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  vertical-align: middle;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
