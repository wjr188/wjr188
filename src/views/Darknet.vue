<template>
  <div class="darknet-wrapper">
    <img class="darknet-bg" src="@/assets/darknet-bg3.webp" alt="背景" />

    <div v-if="!isVip" class="vip-overlay">
      <div class="vip-warning">
        <div class="vip-title">DANGER</div>
        <div class="vip-text">
          暗网有全球禁止流出的极其稀缺的资源<br />
          强奸迷奸、呦呦萝莉、萝莉岛、韩国N号房、人兽杂交、缅北禁地、真实破处、血腥战场、极重口味等等百万罕见稀缺的资源，仅对少量用户开放<br />
          内容过于真实，可能会引起极度不适<br />
          请谨慎进入！禁止分享传播！<br /><br />
          马上开通【暗网卡/至尊卡/帝王卡/王者卡】<br />
          即可获得无限观看暗网视频资格
        </div>
        <button class="vip-btn" @click="openVip">立即开通</button>
        <p class="vip-note">注意：内容会引起生理/心理双重不适 请谨慎观看</p>
      </div>
      <TabBar :darkMode="true" />
    </div>

    <TopNavBar
      v-if="isVip"
      :activeCategory="currentCategory"
      :categories="categories"
      :darkMode="true"
      @categoryChange="onCategoryChange"
      @drawerOpen="drawerVisible = true"
    />
    <SideDrawer
      v-if="isVip"
      :visible="drawerVisible"
      :list="categories"
      :active="currentCategory"
      @close="drawerVisible = false"
      @select="onCategoryChange"
    />

    <swiper
      v-if="isVip"
      ref="swiperRef"
      :initial-slide="currentIndex"
      @swiper="onSwiperReady"
      :onSlideChange="onSlideChange"
      :resistance-ratio="0.1"
      :longSwipes="true"
      :longSwipesRatio="0.3"
      :threshold="30"
      :speed="300"
      :space-between="0"
      :slides-per-view="1"
      class="swiper-container"
    >
      <swiper-slide v-for="(name, i) in categoryNames" :key="name" class="slide-wrapper">
        <div class="slide-content" :ref="el => setSlideRef(el, i)">
          <Banner :key="bannerKey + '-' + name" />
          <NoticeBar />
          <template v-if="name === '暗网推荐'">
            <DarknetRecommend @clickItem="goToPlay" @goToMore="goToListPage" dark />
          </template>
          <template v-else>
            <NormalCategory
              :categoryList="categoryData[name] || []"
              :categoryName="name"
              :dark="true"
              @clickItem="goToPlay"
              @goToMore="goToListPage"
            />
          </template>
        </div>
      </swiper-slide>
    </swiper>

    <TabBar :darkMode="true" class="tabbar-fixed-bottom"/>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, nextTick, type Ref, type ComponentPublicInstance } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

import { darknetCategories } from '../constants/darknetCategories'
import { darknetFileMap } from '../constants/darknetFileMap'
import DarknetRecommend from '../components/DarknetRecommend.vue'
import TopNavBar from '../components/TopNavBar.vue'
import Banner from '../components/Banner.vue'
import NoticeBar from '../components/NoticeBar.vue'
import NormalCategory from '../components/NormalCategory.vue'
import TabBar from '../components/TabBar.vue'
import SideDrawer from '../components/SideDrawer.vue'

// 类型声明
interface Category {
  name: string
  [key: string]: any
}
interface DarknetDataMap {
  [key: string]: any[]
}

// 基础变量
const router = useRouter()
const swiperRef = ref<InstanceType<typeof Swiper> | null>(null)
const swiperInstance = ref<any>(null)
const drawerVisible = ref(false)
const isVip = ref<boolean>(localStorage.getItem('vip') === 'true')

// 会员开通
function openVip() {
  localStorage.setItem('vip', 'true')
  isVip.value = true
}

// 分类数据
const categories: Category[] = darknetCategories
const categoryNames: string[] = categories.map(c => c.name)
const currentCategory = ref<string>(sessionStorage.getItem('dark-category') || '暗网推荐')
const currentIndex = ref<number>(categoryNames.indexOf(currentCategory.value))
const bannerKey = ref(0)
const categoryData = ref<DarknetDataMap>({})
const slideRefs = ref<HTMLElement[]>([])
function setSlideRef(el: Element | ComponentPublicInstance | null, i: number) {
  if (el instanceof HTMLElement) {
    slideRefs.value[i] = el
  }
}
function onSwiperReady(swiper: any) {
  swiperInstance.value = swiper
}

// 恢复、保存滚动
function restoreScroll(name: string) {
  nextTick(() => {
    const idx = categoryNames.indexOf(name)
    const el = slideRefs.value[idx]
    const saved = sessionStorage.getItem(`dark-scroll-${name}`)
    if (el && saved != null) {
      el.scrollTop = parseInt(saved)
    }
  })
}
function saveScroll(name: string) {
  const idx = categoryNames.indexOf(name)
  const el = slideRefs.value[idx]
  if (el) {
    sessionStorage.setItem(`dark-scroll-${name}`, el.scrollTop.toString())
  }
}

// 分类切换
function onCategoryChange(name: string) {
  const newIndex = categoryNames.indexOf(name)
  if (newIndex === -1) return
  saveScroll(currentCategory.value)
  currentCategory.value = name
  currentIndex.value = newIndex
  sessionStorage.setItem('dark-category', name)
  nextTick(() => {
    swiperInstance.value?.slideTo(newIndex)
    setTimeout(() => restoreScroll(name), 80)
  })
  drawerVisible.value = false
}

// swiper 切换
function onSlideChange(swiper: any) {
  saveScroll(currentCategory.value)
  currentIndex.value = swiper.activeIndex
  currentCategory.value = categoryNames[currentIndex.value]
  sessionStorage.setItem('dark-category', currentCategory.value)
  setTimeout(() => restoreScroll(currentCategory.value), 80)
}

// 分类内容异步加载
async function loadCategory(name: string) {
  if (name === '暗网推荐' || categoryData.value[name]) return
  const fileName = darknetFileMap[name]
  if (!fileName) return
  try {
    const mod = await import(`../mock/darknet/${fileName}.js`)
    categoryData.value[name] = mod.default
  } catch {
    categoryData.value[name] = []
  }
}

// 跳转到播放页
function goToPlay(payload: { src: string; cover: string; title: string; tag?: string }) {
  saveScroll(currentCategory.value)
  sessionStorage.setItem('return-from', 'darknet')
  sessionStorage.setItem('return-scroll', slideRefs.value[currentIndex.value]?.scrollTop?.toString() || '0')
  sessionStorage.setItem('return-category', currentCategory.value)
  router.push({ name: 'PlayPage', query: { src: payload.src, title: payload.title, cover: payload.cover, tag: payload.tag } })
}

// 跳转到更多列表
function goToListPage(cat: string) {
  saveScroll(currentCategory.value)
  sessionStorage.setItem('dark-return-from', currentCategory.value)
  sessionStorage.setItem('dark-return-scroll', slideRefs.value[currentIndex.value]?.scrollTop?.toString() || '0')
  router.push({ name: 'ListPage', query: { cat } })
}

// 初始化
onMounted(async () => {
  const from = sessionStorage.getItem('return-from') === 'darknet'
    ? sessionStorage.getItem('return-category')
    : sessionStorage.getItem('dark-return-from')
  const scroll = sessionStorage.getItem('return-from') === 'darknet'
    ? sessionStorage.getItem('return-scroll')
    : sessionStorage.getItem('dark-return-scroll')

  if (from && scroll) {
    currentCategory.value = from
    currentIndex.value = categoryNames.indexOf(from)
    sessionStorage.setItem('dark-category', from)
    await nextTick()
    swiperInstance.value?.slideTo(currentIndex.value)

    let attempts = 0
    const maxAttempts = 30
    const tryScroll = () => {
      const idx = categoryNames.indexOf(from)
      const el = slideRefs.value[idx]
      if (el) {
        el.scrollTop = parseInt(scroll)
        if (Math.abs(el.scrollTop - parseInt(scroll)) < 2 || attempts > maxAttempts) return
      }
      attempts++
      requestAnimationFrame(tryScroll)
    }
    requestAnimationFrame(tryScroll)

    sessionStorage.removeItem('dark-return-from')
    sessionStorage.removeItem('dark-return-scroll')
    sessionStorage.removeItem('return-from')
    sessionStorage.removeItem('return-scroll')
    sessionStorage.removeItem('return-category')
    bannerKey.value++
  } else {
    setTimeout(() => restoreScroll(currentCategory.value), 80)
  }
  categoryNames.forEach(loadCategory)
})

watch(currentCategory, loadCategory)
</script>

<style scoped>
.darknet-wrapper {
  position: relative;
  height: 100vh;
  overflow: visible;
  font-size: 4vw;
  background: #101010;
}

.swiper-container {
  height: calc(100vh - 13vw);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.slide-wrapper {
  height: 100%;
}

.darknet-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
  filter: blur(0.4vw) brightness(0.8);
}

.slide-content {
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  z-index: 1;
  background-color: transparent;
  backdrop-filter: blur(0.8vw);

  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-mask-image: linear-gradient(black 100%, black 100%);
  mask-image: linear-gradient(black 100%, black 100%);
}

.slide-content::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

.vip-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2.4vw);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  padding: max(env(safe-area-inset-top), 6vw) 4vw max(env(safe-area-inset-bottom), 2vw);
  box-sizing: border-box;

  height: 100dvh;
  height: 100svh;
  height: 100vh;
  max-height: 100vh;
  text-align: center;
  font-size: 4vw;
  overflow-y: auto;
}

.vip-warning {
  max-width: 90vw;
  width: 100%;
  padding: 0 2vw;
  padding-bottom: 14vw;
  margin-top: 20vw;
  box-sizing: border-box;
  flex-shrink: 0;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.vip-title {
  display: inline-block;
  background: #f00;
  color: #fff;
  font-weight: bold;
  font-size: 5.5vw;
  padding: 3vw 6vw;
  margin: 0 auto 4vw;
  border-radius: 2vw;
  box-shadow: 0 0.8vw 2.4vw rgba(0, 0, 0, 0.3);
  max-width: 90%;
  white-space: nowrap;
}

.vip-text {
  color: #ff4c8b;
  font-size: 5vw;
  line-height: 1.4;
  word-break: break-word;
}

.vip-btn {
  background: #f12c2c;
  color: #fff;
  font-size: 3.5vw;
  font-weight: bold;
  padding: 2.5vw 0;
  margin: 3vw auto 1.5vw;
  border: none;
  border-radius: 2vw;
  cursor: pointer;
  display: block;
  width: 100%;
  max-width: 26vw;
  box-sizing: border-box;
}

.vip-btn:hover {
  background: #d01010;
}

.vip-note {
  font-size: 3vw;
  color: #ccc;
  margin-bottom: env(safe-area-inset-bottom, 1vw);
}

.tabbar-fixed-bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  z-index: 10001;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-shadow: 0 -0.2vw 1.6vw rgba(0,0,0,0.04);
}

</style>
