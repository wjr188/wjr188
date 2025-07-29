<template>
  <div class="tiktok-wrapper">
    <div class="swiper-area">
      <swiper
        direction="vertical"
        :slides-per-view="1"
        :space-between="0"
        :resistance-ratio="0.35"
        :threshold="20"
        :observer="true"
        :observe-parents="true"
        class="tiktok-container"
        @slideChange="onSlideChange"
        @swiper="onSwiperReady"
      >
        <swiper-slide v-for="(video, index) in videoList" :key="video.src">
          <div class="video-page">
            <NativePlayer
              v-if="index === currentIndex"
              :ref="el => setPlayerRef(index, el)"
              :key="video.src"
              :src="video.src"
              :cover="video.cover"
              :shouldPlay="shouldPlay"
              @requestPlay="onRequestPlay"
              @timeUpdate="onTimeUpdate"
              @played="onPlayed"
            />
            <img
              v-else-if="Math.abs(index - currentIndex) === 1"
              v-lazy="video.cover"
              class="preview-cover"
            />
          </div>
          <!-- Overlay -->
          <div class="video-overlay">
            <div class="author">
              <span class="name">@{{ video.author }}</span>
              <span class="verified-badge">V</span>
            </div>
            <div class="title">{{ video.title }}</div>
            <div class="tags">
              <span class="tag" v-for="tag in video.tags" :key="tag">#{{ tag }}</span>
            </div>
            <div class="unlock">开通VIP观看完整视频 {{ video.duration }}</div>
          </div>
          <div class="video-actions">
            <img class="avatar" v-lazy="video.avatar" />
            <div class="action-item" @click="toggleLike(index)">
              <img :src="likeStatus[index] ? '/icons/like7.svg' : '/icons/like.svg'" class="action-icon" />
              <div class="count">{{ formatCount(video.likes, likeStatus[index]) }}</div>
            </div>
            <div class="action-item" @click="toggleFav(index)">
              <img :src="favStatus[index] ? '/icons/star7.svg' : '/icons/fav1.svg'" class="action-icon" />
              <div class="count">{{ formatCount(video.favorites, favStatus[index]) }}</div>
            </div>
            <div class="action-item" @click="goToShare">
              <img src="/icons/share1.svg" class="action-icon" />
              <div class="count">分享</div>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </div>
    <!-- 进度条绝对定位 -->
    <VideoProgress
      v-if="videoList[currentIndex]"
      :currentTime="Number(currentTime)"
      :duration="Number(duration)"
      @seek="onSeek"
      @seeking="onSeeking"
      class="video-progress-fixed"
    />
    <!-- Toast -->
<div v-if="toastVisible || toastText"
     class="toast-tip"
     :class="{ show: toastVisible }">
  {{ toastText }}
</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import NativePlayer from '../components/NativePlayer.vue'
import VideoProgress from '../components/VideoProgress.vue'
import { useHistoryStore } from '@/store/useHistoryStore'

interface VideoItem {
  src: string
  cover: string
  author: string
  title: string
  tags: string[]
  duration: string
  avatar: string
  likes: string
  favorites: string
}

const currentIndex = ref(0)
const shouldPlay = ref(false)
const videoList = ref<VideoItem[]>([])
const playerRefs = ref<Record<number, InstanceType<typeof NativePlayer> | null>>({})
const router = useRouter()

const currentTime = ref(0)
const duration = ref(0)
const historyStore = useHistoryStore()

let swiperInstance: SwiperType | null = null
let page = 1

// 点赞和收藏状态（用对象是因为你有懒加载新视频）
const likeStatus = ref<{ [index: number]: boolean }>({})
const favStatus = ref<{ [index: number]: boolean }>({})
const toastText = ref('')
const toastVisible = ref(false)

// 格式化数值 53100 => 53.10k
function formatCount(val: string | number, active = false) {
  let n = typeof val === 'string' ? Number(val.toString().replace(/[^\d.]/g, '')) : val
  // 原始字符串已是 '5.3w' 这种，先全转数字
  if (isNaN(n)) n = 0
  // >1万显示 w，>1000显示k
  if (n >= 10000) return (n / 10000).toFixed(2) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(2) + 'k'
  return n
}
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string, duration = 1500) {
  toastText.value = msg
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
    setTimeout(() => {
      toastText.value = ''
    }, 300)
  }, duration)
}
const loadMoreVideos = () => {
  const newVideos: VideoItem[] = [
    {
      src: `https://zh.977700.com/${page * 2 - 1}/index.m3u8`,
      cover: `https://zh.977700.com/${page * 2 - 1}/cover.webp`,
      author: '甜妹爱自拍',
      title: '小骚妹自慰诱惑，呜呜 啪啪不停！',
      tags: ['少女', '粉嫩', '自慰'],
      duration: '18:47',
      avatar: '/images/666.webp',
      likes: '53000',
      favorites: '3473'
    },
    {
      src: `https://zh.977700.com/${page * 2}/index.m3u8`,
      cover: `https://zh.977700.com/${page * 2}/cover.webp`,
      author: '爆乳小野猫',
      title: '顶到花心了！不要停～',
      tags: ['巨乳', '激情', '呻吟'],
      duration: '12:30',
      avatar: '/images/666.webp',
      likes: '31000',
      favorites: '2201'
    }
  ]
  videoList.value.push(...newVideos)
  page++
}

const onSlideChange = (swiper: SwiperType) => {
  currentIndex.value = swiper.activeIndex
  shouldPlay.value = false
  if (currentIndex.value >= videoList.value.length - 2) {
    loadMoreVideos()
  }
}

const onSwiperReady = (swiper: SwiperType) => {
  swiperInstance = swiper
}

const onRequestPlay = () => {
  shouldPlay.value = true
}

const onTimeUpdate = (payload: { currentTime: number; duration: number }) => {
  currentTime.value = payload.currentTime
  duration.value = payload.duration
}

const onSeeking = (time: number) => {
  currentTime.value = time
}

const onPlayed = () => {
  const item = videoList.value[currentIndex.value]
  if (!item) return
  historyStore.addRecord({
    id: item.src,
    type: 'douyin',
    time: new Date().toISOString(),
    data: item
  })
}

const onSeek = (time: number) => {
  const player = playerRefs.value[currentIndex.value]
  if (player?.seekTo) {
    player.seekTo(time)
    shouldPlay.value = true
  }
}

const setPlayerRef = (
  index: number,
  el: any
) => {
  playerRefs.value[index] = el
}

const goToShare = () => {
  router.push('/promotion-share')
}

// 点赞切换
function toggleLike(index: number) {
  likeStatus.value[index] = !likeStatus.value[index]
  showToast(likeStatus.value[index] ? '点赞成功' : '取消点赞')
}
// 收藏切换
function toggleFav(index: number) {
  favStatus.value[index] = !favStatus.value[index]
  showToast(favStatus.value[index] ? '收藏成功' : '取消收藏')
}

onMounted(() => {
  loadMoreVideos()
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.tiktok-wrapper {
  width: 100vw;
  background: #000;
  position: relative;
  overflow: hidden;
  min-height: 100vh; /* 兼容极端情况，必要时可加 */
}
.swiper-area {
  position: absolute;
  left: 0;
  right: 0;
  top: 14.93vw; /* 顶部栏高度 */
  bottom: calc(16vw + env(safe-area-inset-bottom, 0)); /* TabBar高度+安全区 */
  background: #000;
  z-index: 2;
  overflow-y: auto;
  height: auto !important;
  min-height: 0 !important;
  /* 这里不要height: 100%; 只要top/bottom撑住 */
}
.tiktok-container,
.swiper,
.swiper-slide,
.video-page {
  width: 100vw;
  height: 100%;
  min-height: 0;
  background: #000;
  position: relative;
  box-sizing: border-box;
}

.video-progress-fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 15.5vw;
  z-index: 20;
  pointer-events: auto;
}
.preview-cover {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
}
.video-overlay {
  position: absolute;
  left: 4.26vw;
  bottom: 6vw;
  color: white;
  z-index: 5;
  width: 66%;
}
.author {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 4.53vw;
  margin-bottom: 1.6vw;
}
.verified-badge {
  font-size: 3.73vw;
  background-color: #ff4466;
  color: #fff;
  border-radius: 50%;
  padding: 0.8vw 1.86vw;
}
.title {
  font-size: 4vw;
  line-height: 1.4;
  max-height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 2.66vw;
}
.tags {
  display: flex;
  gap: 1.06vw;
  flex-wrap: wrap;
  margin-bottom: 2.66vw;
}
.tag {
  background: rgba(120, 120, 120, 0.3);
  color: #ffcc00;
  font-size: 3.2vw;
  padding: 0.8vw 2.66vw;
  border-radius: 1.6vw;
}
.unlock {
  font-size: 3.2vw;
  color: #fff;
  background: linear-gradient(to right, #ff5b99, #ff3c5f);
  padding: 1.6vw 3.2vw;
  border-radius: 99vw;
  display: inline-block;
  width: auto;
  max-width: 100%;
  white-space: nowrap;
}
.video-actions {
  position: absolute;
  right: 4.26vw;
  bottom: 8vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6.4vw;
  color: white;
  z-index: 5;
}
.avatar {
  width: 14.93vw;
  height: 14.93vw;
  border-radius: 50%;
  margin-bottom: 5.33vw;
  border: 0.53vw solid #fff;
}
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.06vw;
  cursor: pointer;
}
.action-icon {
  width: 9.6vw;
  height: 9.6vw;
}
.count {
  font-size: 3.2vw;
}
.toast-tip {
  position: fixed;
  left: 50%;
  bottom: 50vh;
  transform: translateX(-50%) translateY(0);
  background: rgba(32,32,32,0.92);
  color: #fff;
  font-size: 4vw;
  border-radius: 2vw;
  padding: 2.8vw 7vw;
  min-width: 36vw;
  max-width: 72vw;
  box-shadow: 0 4px 16px 0 rgba(0,0,0,0.17);
  text-align: center;
  pointer-events: none;
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(.4,0,.2,1), transform 0.3s cubic-bezier(.4,0,.2,1);
  backdrop-filter: blur(8px);
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Helvetica Neue', Arial, 'Microsoft Yahei', sans-serif;
}
.toast-tip.show {
  opacity: 1;
  transform: translateX(-50%) translateY(-1vw) scale(1.04);
}
</style>
<style>
body.ios-browser .swiper-area {
  bottom: calc(40.5vw + env(safe-area-inset-bottom, 0)) !important;
}
</style>
