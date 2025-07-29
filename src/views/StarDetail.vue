<template>
  <div class="detail-wrapper" ref="detailWrapper" :style="{ backgroundImage: 'url(' + star.avatar + ')' }">
    <!-- 顶部返回 -->
    <div class="back-fixed" @click="goBack">
      <img src="/icons/back3.svg" alt="返回" /> <!-- Placeholder for back icon -->
    </div>

    <div class="overlay">
      <div class="header">
        <img :src="star.avatar" class="avatar" alt="明星头像" />
        <div class="info">
          <h2 class="name">{{ star.name }}</h2>
          <div class="meta-line">
            <span>国家：{{ star.country || '未知' }}</span>
            <span>身高：{{ star.height || '未知' }}</span>
            <span>生日：{{ star.birthday || '未知' }}</span>
          </div>
          <div class="meta-line">
            <span>罩杯：{{ star.cup || '未知' }}</span>
            <span>影片数量：{{ star.videos?.length || 0 }}</span>
            <span>三围：{{ star.size || '未知' }}</span>
          </div>
          <div class="intro-container">
            <span class="intro-label">人物简介：</span>
            <span class="intro-text" :class="{ folded: !showFullIntro }">
              {{ star.intro || 'Hi，我是' + star.name + '，欢迎关注我！' }}
            </span>
            <span class="toggle" @click="showFullIntro = !showFullIntro">
                <img :src="showFullIntro ? '/icons/up.svg' : '/icons/down.svg'" alt="展开/收起简介" />
            </span>
          </div>
        </div>
      </div>

      <div class="stats">
        <div class="stat"><div class="number">{{ formatWk(star.visits) }}</div><div class="label">访客</div></div>
<div class="stat"><div class="number">{{ formatWk(star.likes) }}</div><div class="label">点赞</div></div>
<div class="stat"><div class="number">{{ formatWk(star.fans) }}</div><div class="label">粉丝</div></div>
      </div>
    </div>

    <div class="pure-white-wrapper">
      <div class="tab-wrapper">
        <div class="tab-indicator-bar"></div>
        <div class="tab-switch">
          <div class="tab" :class="{ active: activeTab === 'video' }" @click="switchTab('video')">
            视频 <div class="tab-line" v-if="activeTab === 'video'"></div>
          </div>
          <div class="tab" :class="{ active: activeTab === 'image' }" @click="switchTab('image')">
            图片 <div class="tab-line" v-if="activeTab === 'image'"></div>
          </div>
        </div>
      </div>

      <!-- 重新引入 Swiper 来处理左右滑动 -->
      <div class="swiper-area">
        <swiper
          :slides-per-view="1"
          :space-between="0"
          @swiper="onSwiper"
          @slideChange="onSlideChange"
          class="mySwiper"
          :allowTouchMove="true"
        >
          <!-- 视频页 -->
          <swiper-slide>
            <div class="video-list-content">
              <div class="video-list">
                <div
                  class="video-card"
                  v-for="video in visibleVideos"
                  :key="video.title"
                  @click="goToPlay(video)"
                >
                  <div class="video-thumb">
                    <img v-lazy="video.cover" class="cover" alt="视频封面" />
                   <div class="video-overlay">
  <span class="views">
    <img src="/icons/play4.svg" class="play-icon" />
    {{ formatViews(video.views) }}
  </span>
  <span class="duration">{{ video.duration }}</span>
</div>
                  </div>
                  <div class="video-title">{{ video.title }}</div>
                  <div class="tag">AV</div>
                </div>
              </div>
              <div class="loading-tip" v-if="isLoadingVideo">
                <img src="/icons/loading.svg" class="loading-icon" />
                <span>客官别走，妾身马上就好~</span>
              </div>
              <div class="no-more-tip" v-if="noMoreVideo">
                客官，妾身被你弄高潮了，扛不住了~
              </div>
              <div ref="videoSentinel" class="sentinel"></div>
            </div>
          </swiper-slide>

          <!-- 图片页 -->
          <swiper-slide>
            <div class="image-list-content">
              <div class="image-grid">
                <div
                  class="image-card"
                  v-for="(img, index) in visibleImages"
                  :key="index"
                  @click="goToImageDetail(img)"
                >
                  <div class="image-thumb">
  <img v-lazy="img.src" class="image" alt="图片封面" />
  <!-- 右上角小图标 -->
  <div class="corner-label">
    <img src="/icons/tupian.svg" class="corner-icon" />
    <span>图片</span>
  </div>
  <!-- 底部覆盖区域 -->
  <div class="image-overlay">
    <span class="views">
      <img src="/icons/view1.svg" class="play-icon" />
      {{ formatViews(img.views) }}
    </span>
    <span class="count">
      <img src="/icons/tupian1.svg" class="play-icon" />
      {{ img.count }}
    </span>
  </div>
</div>
                  <div class="image-title">{{ img.title }}</div>
                </div>
              </div>
              <div class="loading-tip" v-if="isLoadingImage">
                <img src="/icons/loading.svg" class="loading-icon" />
                <span>客官别走，妾身马上就好~</span>
              </div>
              <div class="no-more-tip" v-if="noMoreImage">
                客官，妾身被你弄高潮了，扛不住了~
              </div>
              <div ref="imageSentinel" class="sentinel"></div>
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, Ref, onMounted, nextTick, onActivated, watch, onUnmounted, shallowRef } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/swiper.min.css'
import type { Swiper as SwiperClass } from 'swiper'

// =========================
// 数据类型
// =========================

interface Star {
  id: string | number
  name: string
  avatar: string
  country?: string
  height?: string
  birthday?: string
  cup?: string
  size?: string
  visits?: number | string
  likes?: number | string
  fans?: number | string
  intro?: string
  videos?: VideoItem[]
  images?: ImageItem[]
}

interface VideoItem {
  src: string
  cover: string
  title: string
  duration?: string
  views?: number
  tag?: string
}

interface ImageItem {
  src: string
  title: string
  views?: number
  count?: number
}

// =========================
// 懒加载组合式函数
// =========================
function useLazyLoad<T>(
  allListRef: Ref<T[]>,
  options: { batchSize?: number; root?: Ref<HTMLElement | null> }
) {
  const { batchSize = 10, root = null } = options
  const visibleList = shallowRef<T[]>([])

  const isLoading = ref(false)
  const noMore = ref(false)
  const currentIndex = ref(0)
  const sentinel = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  const loadMore = () => {
    if (isLoading.value || noMore.value) return
    isLoading.value = true
    const start = currentIndex.value
    const end = start + batchSize
    const newItems = allListRef.value.slice(start, end)
    if (newItems.length > 0) {
      visibleList.value.push(...newItems)
      currentIndex.value = end
      if (currentIndex.value >= allListRef.value.length) {
        noMore.value = true
      }
    } else {
      noMore.value = true
    }
    isLoading.value = false
  }

  const loadUntil = async (count: number) => {
    const target = Math.min(count, allListRef.value.length)
    visibleList.value = allListRef.value.slice(0, target)
    currentIndex.value = target
    if (target >= allListRef.value.length) noMore.value = true
    await nextTick()
  }

  watch(
    allListRef,
    () => {
      visibleList.value = []
      currentIndex.value = 0
      noMore.value = false
      nextTick(() => loadMore())
    },
    { immediate: true }
  )

  onMounted(() => {
    nextTick(() => {
      if (sentinel.value) {
        observer = new IntersectionObserver(
          entries => {
            if (entries[0].isIntersecting && !isLoading.value && !noMore.value) {
              loadMore()
            }
          },
          {
            root: root ? root.value : null,
            threshold: 0.1
          }
        )
        observer.observe(sentinel.value)
      }
    })
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })

  return { visibleList, isLoading, noMore, sentinel, loadUntil }
}

// =========================
// 主逻辑
// =========================
const route = useRoute()
const router = useRouter()

const activeTab = ref<'video' | 'image'>('video')
const showFullIntro = ref(false)
const star = ref<Star>({} as Star)
const detailWrapper = ref<HTMLElement | null>(null)
const swiperInstance = ref<SwiperClass | null>(null)

const allVideos = ref<VideoItem[]>([])
const allImages = ref<ImageItem[]>([])

const {
  visibleList: visibleVideos,
  isLoading: isLoadingVideo,
  noMore: noMoreVideo,
  sentinel: videoSentinel,
  loadUntil: loadVideosUntil
} = useLazyLoad<VideoItem>(allVideos, {
  batchSize: 20,
  root: detailWrapper
})

const {
  visibleList: visibleImages,
  isLoading: isLoadingImage,
  noMore: noMoreImage,
  sentinel: imageSentinel,
  loadUntil: loadImagesUntil
} = useLazyLoad<ImageItem>(allImages, {
  batchSize: 20,
  root: detailWrapper
})

// =========================
// 工具函数
// =========================
function formatWk(num: number | string | undefined) {
  if (typeof num === 'string' && /[wkWk]$/.test(num)) return num
  const n = Number(num)
  if (isNaN(n) || n === 0) return '0.0'
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toFixed(1)
}

function formatViews(num: number | string | undefined) {
  if (!num) return '0'
  const n = Number(num)
  if (n >= 10000) return (n / 10000).toFixed(2) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(2) + 'k'
  return n.toString()
}

function getScrollKey(type: string) {
  return `star-scroll-${type}-${star.value.name}`
}

// =========================
// 滚动恢复
// =========================
function saveScroll(type: string) {
  if (detailWrapper.value) {
    sessionStorage.setItem(getScrollKey(type), detailWrapper.value.scrollTop.toString())
  }
}

function restoreScroll(type: string) {
  const saved = sessionStorage.getItem(getScrollKey(type))
  if (saved && detailWrapper.value) {
    const targetScroll = parseInt(saved)
    const tryRestore = () => {
      if (!detailWrapper.value) return
      const realHeight = detailWrapper.value.scrollHeight
      if (realHeight < targetScroll + 100) {
        requestAnimationFrame(tryRestore)
      } else {
        detailWrapper.value!.scrollTop = targetScroll
      }
    }
    tryRestore()
  }
}

// =========================
// 生命周期
// =========================
onMounted(() => {
  const stored = sessionStorage.getItem('star-detail-data')
  if (stored) {
    const data = JSON.parse(stored) as Star
    star.value = data
    allVideos.value = data.videos || []
    allImages.value = data.images || []

    const savedTab = sessionStorage.getItem('star-detail-tab')
    if (savedTab === 'video' || savedTab === 'image') {
      activeTab.value = savedTab
    }

    nextTick(() => {
      swiperInstance.value?.slideTo(activeTab.value === 'video' ? 0 : 1, 0)
      restoreScroll(activeTab.value)
    })
  }
})

onActivated(async () => {
  const savedTab = sessionStorage.getItem('star-detail-tab')
  if (savedTab === 'video' || savedTab === 'image') activeTab.value = savedTab

  await nextTick()
  swiperInstance.value?.slideTo(activeTab.value === 'video' ? 0 : 1, 0)

  const scrollKey = getScrollKey(activeTab.value)
  const saved = sessionStorage.getItem(scrollKey)
  if (saved && +saved > 100) {
    if (activeTab.value === 'image') {
      await loadImagesUntil(allImages.value.length)
    } else {
      await loadVideosUntil(allVideos.value.length)
    }
  }
  await nextTick()
  restoreScroll(activeTab.value)
})

// =========================
// 交互逻辑
// =========================
function switchTab(tab: 'video' | 'image') {
  const lastTab = activeTab.value
  saveScroll(lastTab)
  activeTab.value = tab
  sessionStorage.setItem('star-detail-tab', tab)
  swiperInstance.value?.slideTo(tab === 'video' ? 0 : 1)
  nextTick(() => restoreScroll(tab))
}

function onSwiper(swiper: SwiperClass) {
  swiperInstance.value = swiper
}

function onSlideChange(swiper: SwiperClass) {
  const lastTab = activeTab.value
  const newTab = swiper.activeIndex === 0 ? 'video' : 'image'
  if (lastTab !== newTab) {
    saveScroll(lastTab)
  }
  activeTab.value = newTab
  sessionStorage.setItem('star-detail-tab', activeTab.value)
  nextTick(() => restoreScroll(activeTab.value))
}

function goToPlay(video: VideoItem) {
  saveScroll(activeTab.value)
  sessionStorage.setItem('return-from', 'star')
  sessionStorage.setItem('star-detail-data', JSON.stringify(star.value))
  router.push({
    name: 'PlayPage',
    query: {
      src: video.src,
      cover: video.cover,
      title: video.title,
      tag: video.tag || ''
    }
  })
}

function goToImageDetail(img: ImageItem) {
  saveScroll(activeTab.value)
  sessionStorage.setItem('return-from', 'star')
  sessionStorage.setItem('last-star', JSON.stringify(star.value))
  sessionStorage.setItem('star-detail-tab', 'image')

  const payload = {
    star: { id: star.value.id, name: star.value.name, avatar: star.value.avatar },
    album: img
  }

  router.push({
    name: 'StarImageDetail',
    params: { data: encodeURIComponent(JSON.stringify(payload)) }
  })
}

function goBack() {
  saveScroll(activeTab.value)
  sessionStorage.removeItem('star-detail-scrollTop')
  router.back()
}

onBeforeRouteLeave(() => {
  saveScroll(activeTab.value)
  sessionStorage.removeItem('star-detail-scrollTop')
})
</script>

<style scoped>
.detail-wrapper {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;

  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-mask-image: linear-gradient(black 100%, black 100%);
  mask-image: linear-gradient(black 100%, black 100%);
}
.detail-wrapper::-webkit-scrollbar {
  display: none !important;
}

.overlay {
  background: rgba(0, 0, 0, 0.45);
  padding: 4.26vw; /* 16px */
  color: #fff;
  position: relative;
  flex-shrink: 0;
}
.pure-white-wrapper {
  background: #fff;
  border-radius: 5.33vw 5.33vw 0 0; /* 20px */
  margin-top: 2.66vw; /* 10px */
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.back-fixed {
  position: fixed;
  top: 1.6vw; /* 6px */
  left: 3.2vw; /* 12px */
  z-index: 9999;
  cursor: pointer;
  padding: 1.33vw; /* 5px */
}
.back-fixed img {
  width: 6.4vw; /* 24px */
  height: 6.4vw;
}
.header {
  display: flex;
  gap: 3.2vw; /* 12px */
  margin-bottom: 3.2vw;
  align-items: center;
}
.avatar {
  width: 18.66vw; /* 70px */
  height: 18.66vw;
  border-radius: 2.13vw; /* 8px */
  object-fit: cover;
}
.info {
  flex: 1;
}
.name {
  font-size: 4.53vw; /* 17px */
  font-weight: bold;
  margin: 0 0 1.6vw;
}
.meta-line {
  font-size: 3.2vw; /* 12px */
  opacity: 0.9;
  margin-bottom: 1.06vw;
}
.meta-line span {
  margin-right: 3.2vw;
}
.intro-container {
  margin: 2.13vw 0;
  padding: 2.13vw 3.2vw;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 1.6vw;
  display: flex;
  align-items: center;
  font-size: 3.46vw; /* 13px */
  color: #fff;
  width: 100%;
  box-sizing: border-box;
}
.intro-text {
  flex: 1;
  line-height: 1.4;
  min-width: 0;
}
.intro-text.folded {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.toggle {
  margin-left: 1.6vw;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.toggle img {
  width: 4.26vw; /* 16px */
  height: 4.26vw;
  opacity: 0.9;
}
.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 2.66vw;
  padding-top: 2.66vw;
  border-top: 0.27vw solid rgba(255, 255, 255, 0.1);
}
.stat {
  text-align: center;
}
.stat .number {
  font-size: 4.26vw; /* 16px */
  font-weight: bold;
  color: #fff;
}
.stat .label {
  font-size: 3.2vw; /* 12px */
  color: #ccc;
}

.tab-wrapper {
  position: sticky;
  top: 0;
  z-index: 10;
  overflow: hidden;
  flex-shrink: 0;
  background: #fff;
  border-radius: 5.33vw 5.33vw 0 0;
  margin-top: -3.2vw;
  padding-top: 1.6vw;
}
.tab-switch {
  display: flex;
  justify-content: space-around;
  background: #fff;
  position: relative;
}
.tab-switch .tab {
  font-size: 4vw; /* 15px */
  font-weight: bold;
  color: #999;
  position: relative;
  padding: 2.66vw 0 2.13vw;
  cursor: pointer;
}
.tab-switch .tab.active {
  color: #f12c2c;
}
.tab-line {
  position: absolute;
  bottom: -0.26vw;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 1.6vw solid transparent;
  border-right: 1.6vw solid transparent;
  border-top: 1.6vw solid #f12c2c;
}
.tab-indicator-bar {
  height: 2.13vw;
  background: #000;
  border-radius: 2.66vw 2.66vw 0 0;
  width: 21.33vw;
  margin: 1.6vw auto -0.53vw;
}

.swiper-area {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.mySwiper {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.swiper-slide {
  height: auto;
  display: flex;
  flex-direction: column;
  padding: 0 2.66vw;
  box-sizing: border-box;
}

.video-list-content,
.image-list-content {
  flex: 1;
}

.video-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.66vw;
}
.video-card {
  background: rgba(240, 240, 240, 0.9);
  border-radius: 1.6vw;
  overflow: hidden;
  position: relative;
  height: 49.33vw;
}
.video-thumb {
  position: relative;
  height: 29.33vw;
  overflow: hidden;
}
.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1.06vw;
}
.video-overlay {
  position: absolute;
  bottom: 1.06vw;
  left: 1.06vw;
  right: 1.06vw;
  display: flex;
  justify-content: space-between;
  font-size: 3.2vw;
  color: #fff;
  text-shadow: 0 0 0.8vw black;
}
.video-title {
  font-size: 3.73vw;
  color: #333;
  font-weight: normal;
  line-height: 1.4;
  margin-top: 1.6vw;
  padding-left: 1.06vw;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tag {
  font-size: 2.93vw;
  color: #fff;
  background: #f12c2c;
  display: inline-block;
  padding: 0.53vw 1.6vw;
  border-radius: 1.06vw;
  margin: 1.06vw 1.6vw 0;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.66vw;
}
.image-card {
  background: rgba(240, 240, 240, 0.9);
  border-radius: 1.6vw;
  overflow: hidden;
  height: 80vw;
}
.image-thumb {
  height: 66.66vw;
  position: relative;
}
.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1.06vw;
}
.image-overlay {
  position: absolute;
  bottom: 1.06vw;
  left: 1.06vw;
  right: 1.06vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 3.2vw;
  color: #fff;
  text-shadow: 0 0 0.8vw black;
  padding: 0 1.06vw;
}
.image-title {
  font-size: 3.73vw;
  color: #333;
  font-weight: normal;
  line-height: 1.4;
  margin-top: 1.6vw;
  padding-left: 1.06vw;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.loading-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 3.73vw;
  margin: 5.33vw 0;
}
.loading-icon {
  width: 7.46vw;
  height: 7.46vw;
  margin-bottom: 2.13vw;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.no-more-tip {
  text-align: center;
  color: #999;
  font-size: 3.73vw;
  margin: 5.33vw 0;
}
.sentinel {
  height: 0.27vw;
  width: 100%;
}
.views {
  display: flex;
  align-items: center;
  gap: 1.06vw;
}
.play-icon {
  width: 4vw;
  height: 4vw;
  filter: drop-shadow(0 0 0.53vw #000a);
}
.corner-label {
  position: absolute;
  top: 1.06vw;
  right: 1.06vw;
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.5);
  padding: 0.53vw 1.06vw;
  border-radius: 1.06vw;
  font-size: 3.2vw;
  color: #fff;
}
.corner-icon {
  width: 3.73vw;
  height: 3.73vw;
  margin-right: 0.53vw;
}
.image-overlay .views,
.image-overlay .count {
  display: flex;
  align-items: center;
  gap: 1.06vw;
}

</style>
