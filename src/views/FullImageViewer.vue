<template>
  <div class="full-image-viewer">
    <!-- 顶部标题栏 -->
    <div class="top-bar">
      <img src="/icons/back.svg" class="back-icon" @click="goBack" />
      <div class="title">{{ album.title }}</div>
    </div>

    <!-- 图片滑动区域 -->
    <div class="image-swiper" @scroll.passive="onScroll" ref="scrollContainer">
      <div
  v-for="(img, index) in visibleImages"
  :key="index"
  class="image-wrapper"
  :class="{ locked: index > 1 }"
>
  <img v-lazy="img" class="full-image" />
  <div class="lock-overlay" v-if="index > 1">
    <div class="vip-button" @click.stop="showModal = true">开通VIP观看完整图集</div>
  </div>
</div>
      <!-- loading部分 -->
      <div class="loading-tip" v-if="loading">
        <img src="/icons/loading.svg" class="loading-icon" />
        客官别走，妾身马上就好~
      </div>

      <div class="end-tip" v-if="!loading && noMore">
        客官，妾身被你弄高潮了，扛不住了 ~
      </div>
    </div>

    <!-- 弹窗 -->
    <div v-if="showModal" class="modal-mask" @click.self="showModal = false">
      <div class="modal-box">
        <div class="modal-title">温馨提示</div>
        <div class="modal-text">开通VIP可无限观看色图<br />邀请好友注册立刻送3天VIP</div>
        <div class="modal-actions">
          <button class="btn orange" @click="goToPromotionShare">邀请好友</button>
          <button class="btn red" @click="goToVip">开通会员</button>
        </div>
      </div>
    </div>

    <!-- 底部栏 -->
    <div class="bottom-bar">
      <div class="icon-btn">
        <img src="/icons/like1.svg" />
        <span>{{ likeCount }}</span>
      </div>
      <div class="icon-btn">
        <img src="/icons/star.svg" />
        <span>{{ starCount }}</span>
      </div>
      <div class="icon-btn" @click="goToPromotionShare">
        <img src="/icons/share2.svg" />
        <span>分享</span>
      </div>

      <div class="index-text">{{ currentIndex + 1 }}/{{ album.images.length }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, onMounted, type Ref } from 'vue'

const route = useRoute()
const router = useRouter()

interface Album {
  title?: string
  images: string[]
}
interface Data {
  album: Album
  likes?: number
  favs?: number
  initialIndex?: number
}

const data = computed<Data>(() => {
  try {
    return route.params.data ? JSON.parse(decodeURIComponent(route.params.data as string)) : { album: { images: [] } }
  } catch (error) {
    console.error('Error parsing data:', error)
    return { album: { images: [] } }
  }
})

const album = computed<Album>(() => data.value.album || { images: [] })
const likeCount = computed<number>(() => data.value.likes || 0)
const starCount = computed<number>(() => data.value.favs || 0)

const scrollContainer = ref<HTMLDivElement | null>(null)
const showModal = ref(false)
const loading = ref(false)
const noMore = ref(false)
const pageSize = Math.ceil(window.innerHeight / 130 * 3 / 2)
const loadedCount = ref(0)
const visibleImages = ref<string[]>([])
const currentIndex = ref<number>(data.value.initialIndex || 0)

function loadMore() {
  if (loading.value || noMore.value) return
  loading.value = true

  setTimeout(() => {
    const total = album.value.images.length
    const next = loadedCount.value + pageSize
    visibleImages.value = album.value.images.slice(0, Math.min(next, total))
    loadedCount.value = next
    if (loadedCount.value >= total) noMore.value = true
    loading.value = false
  }, 800)
}

function onScroll() {
  const container = scrollContainer.value
  if (!container) return
  const bottom = container.scrollTop + container.clientHeight
  if (bottom + 100 >= container.scrollHeight) {
    loadMore()
  }

  // 滑动时同步 currentIndex
  const total = album.value.images.length
  if (total > 0) {
    const perImgHeight = container.scrollHeight / total
    const newIndex = Math.floor(container.scrollTop / perImgHeight)
    if (currentIndex.value !== newIndex) {
      currentIndex.value = newIndex
    }
  }
}

function goBack() {
  router.back()
}
function goToVip() {
  router.push({ name: 'Vip' })
}
function goToPromotionShare() {
  router.push({ name: 'PromotionShare' })
}

onMounted(() => {
  loadMore()
  loadMore() // 首屏多加载一屏
})
</script>
<style scoped>
.full-image-viewer {
  background: #fff;
  color: #fff;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  font-size: 4vw;
}
.top-bar {
  display: flex;
  align-items: center;
  background: #fff;
  color: #000;
  height: 13vw;
  padding: 0 3vw;
  position: sticky;
  top: 0;
  z-index: 10;
  font-size: 4vw;
  font-weight: bold;
}
.back-icon {
  width: 5vw;
  height: 5vw;
  margin-right: 2vw;
}
.title {
  flex: 1;
  text-align: center;
  font-size: 4.3vw;
  font-weight: bold;
  margin-right: 8vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-swiper {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-mask-image: linear-gradient(black 100%, black 100%);
  mask-image: linear-gradient(black 100%, black 100%);
  padding-bottom: 3vw;
}
.image-swiper::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

.image-wrapper {
  position: relative;
}
.full-image {
  width: 100vw;
  display: block;
  object-fit: contain;
}
.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(2vw);
  display: flex;
  justify-content: center;
  align-items: center;
}
.vip-button {
  background: #d80000;
  color: #fff;
  padding: 2vw 6vw;
  border-radius: 10vw;
  font-size: 3.7vw;
  font-weight: bold;
  box-shadow: 0 0.8vw 2.4vw rgba(0,0,0,0.16);
}

.bottom-bar {
  height: 13vw;
  background: #fff;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: #333;
  font-size: 3vw;
  border-top: 0.3vw solid #eee;
  padding-left: 5vw;
  gap: 8vw;
}
.icon-btn {
  display: flex;
  align-items: center;
  gap: 2vw;
}
.icon-btn img {
  width: 4.5vw;
  height: 4.5vw;
}
.index-text {
  margin-left: auto;
  margin-right: 4vw;
  color: #999;
  font-size: 3.5vw;
}

.loading-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 3.2vw;
  margin: 5vw 0;
}
.loading-icon {
  width: 7vw;
  height: 7vw;
  margin-bottom: 2vw;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}

.end-tip {
  text-align: center;
  color: #888;
  font-size: 3.4vw;
  margin: 7vw 0 12vw;
}

/* 弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.modal-box {
  background: #fff;
  border-radius: 4vw;
  padding: 5vw 0;
  width: 82vw;
  max-width: 92vw;
  text-align: center;
  box-shadow: 0 2vw 4vw rgba(0,0,0,0.15);
}
.modal-title {
  font-size: 5vw;
  font-weight: bold;
  color: #333;
  margin-bottom: 3vw;
}
.modal-text {
  font-size: 4vw;
  color: #333;
  margin-bottom: 5vw;
  line-height: 1.6;
  font-weight: normal;
  white-space: pre-line;
  text-align: center;
}
.modal-actions {
  display: flex;
  justify-content: space-around;
  gap: 3vw;
}
.btn {
  padding: 2vw 6vw;
  font-size: 4vw;
  border: none;
  border-radius: 2vw;
  cursor: pointer;
  transition: background 0.3s;
}
.orange {
  background-color: #FFA500;
  color: white;
}
.orange:hover {
  background-color: #FF7F00;
}
.red {
  background: linear-gradient(45deg, #FF416C, #FF4B2B);
  color: white;
}
.red:hover {
  background: linear-gradient(45deg, #FF5E6C, #FF5733);
}
</style>
