<template>
  <div class="tiktok-play-wrapper">
    <div class="back-button" @click="goBack">
      <img src="/icons/back1.svg" alt="返回" />
    </div>

    <swiper
      ref="swiperRef"
      direction="vertical"
      :slides-per-view="1"
      :resistance-ratio="0.3"
      :threshold="20"
      :initial-slide="startIndex"
      class="tiktok-swiper"
      @slideChange="onSlideChange"
      @swiper="onSwiperReady"
    >
      <swiper-slide
        v-for="(video, index) in videoList"
        :key="video.src"
        class="video-slide"
      >
        <div class="video-page">
         <NativePlayer
  v-if="index === currentIndex"
  :ref="el => setPlayerRef(index, el)"
  :src="video.src"
  :cover="video.cover"
  :shouldPlay="shouldPlay"
  @requestPlay="onRequestPlay"
  @timeUpdate="onTimeUpdate"
  @played="onPlayed"
/>

          <img v-else-if="Math.abs(index - currentIndex) === 1" :src="video.cover" class="preview-cover" />

          <div class="video-overlay">
            <div class="nickname-line">
              <span class="nickname">@{{ video.author }}</span>
            </div>
            <div class="title">{{ video.title }}</div>
            <div class="tags">
              <span class="tag" v-for="(tag, tagIndex) in video.tags" :key="tagIndex">#{{ tag }}</span>
            </div>
            <div class="unlock">开通 VIP 观看完整视频 {{ video.duration }}</div>
          </div>

          <div class="video-actions">
            <div class="action-item">
              <img :src="video.avatar" alt="博主头像" class="avatar" />
              <img src="/icons/like.svg" alt="点赞" class="action-icon" />
              <span class="count">{{ video.likes }}</span>
            </div>
            <div class="action-item">
              <img src="/icons/fav1.svg" alt="收藏" class="action-icon" />
              <span class="count">{{ video.favorites }}</span>
            </div>
            <div class="action-item">
              <img src="/icons/share1.svg" alt="分享" class="action-icon" />
              <span class="count">分享</span>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>

    <VideoProgress
      v-if="videoList[currentIndex]"
      :currentTime="Number(currentTime)"
      :duration="Number(duration)"
      @seek="onSeek"
      @seeking="onSeeking"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Swiper as SwiperClass } from 'swiper/types'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import NativePlayer from '../components/NativePlayer.vue'
import VideoProgress from '../components/VideoProgress.vue'
import { useHistoryStore } from '@/store/useHistoryStore'

const router = useRouter()
const route = useRoute()
const historyStore = useHistoryStore()

// 类型声明
interface VideoItem {
  id?: string | number
  src: string
  cover: string
  title: string
  author: string
  avatar: string
  likes: number | string
  favorites: number | string
  tags: string[]
  duration?: string
}

// Swiper 类型
const swiperRef = ref<SwiperClass | null>(null)
const playerRef = ref<any>(null)
const videoList = ref<VideoItem[]>([])

const startIndex = Number(route.query.index || 0)
const category = (route.query.category as string) || '巨乳'
const currentIndex = ref<number>(startIndex)
const shouldPlay = ref<boolean>(true)
const currentTime = ref<number>(0)
const duration = ref<number>(0)

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

const loadCategoryData = async () => {
  try {
    const mod = await import(`../mock/tiktok/${categoryFileMap[category]}.js`)
    videoList.value = (mod.default || []) as VideoItem[]
  } catch (e) {
    console.error('加载视频失败', e)
  }
}

const onSlideChange = (swiper: SwiperClass) => {
  currentIndex.value = swiper.realIndex
  shouldPlay.value = false
}

const onSwiperReady = (swiper: SwiperClass) => {
  swiperRef.value = swiper

  requestAnimationFrame(() => {
    if (typeof swiper.slideTo === 'function') {
      swiper.slideTo(startIndex, 0, false)
    }
  })
}

const onRequestPlay = () => {
  shouldPlay.value = true
}

const onTimeUpdate = ({ currentTime: ct, duration: dur }: { currentTime: number, duration: number }) => {
  currentTime.value = Number(ct)
  duration.value = Number(dur)
}

const onSeek = (time: number) => {
  if (playerRef.value?.seekTo) {
    playerRef.value.seekTo(time)
    shouldPlay.value = true
  }
}
const onSeeking = (time: number) => {
  currentTime.value = time
}

const setPlayerRef = (index: number, el: any) => {
  if (index === currentIndex.value && el) {
    playerRef.value = el
  }
}

const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  loadCategoryData()
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

const onPlayed = () => {
  const video = videoList.value[currentIndex.value]
  if (video) {
    historyStore.addRecord({
  id: String(video.id ?? video.src), // 👈 一律转成字符串
  type: 'douyin',
  time: new Date().toISOString(),
  data: {
    title: video.title || '短视频',
    cover: video.cover || '',
    author: video.author || '',
    tags: video.tags || []
  }
})

  }
}
</script>
<style scoped>
.tiktok-play-wrapper {
  background: #000;
  height: 100vh;
  overflow: hidden;
}
.tiktok-swiper,
.video-page {
  width: 100vw;
  height: 100vh;
  position: relative;
  background: #000;
}

.video-slide {
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-cover {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  left: 4vw;
  bottom: 16vw;
  color: white;
  z-index: 5;
  width: 66vw;
}

.nickname-line {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 4vw;
  margin-bottom: 1vw;
}

.nickname {
  margin-right: 1vw;
}

.welfare-icon {
  width: 4vw;
  height: 4vw;
}

.title {
  font-size: 3.8vw;
  line-height: 1.4;
  max-height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 2vw;
}

.tags {
  display: flex;
  gap: 1vw;
  flex-wrap: wrap;
  margin-bottom: 2vw;
}

.tag {
  background: rgba(120, 120, 120, 0.3);
  color: #ffcc00;
  font-size: 2.7vw;
  padding: 1vw 2.5vw;
  border-radius: 1.5vw;
}

.unlock {
  font-size: 2.6vw;
  color: #fff;
  background: linear-gradient(to right, #ff5b99, #ff3c5f);
  padding: 1.5vw 3vw;
  border-radius: 20vw;
  display: inline-block;
  width: auto;
  max-width: 100%;
  white-space: nowrap;
}

.video-actions {
  position: absolute;
  right: 4vw;
  bottom: 24vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6vw;
  color: white;
  z-index: 5;
}

.avatar {
  width: 14vw;
  height: 14vw;
  border-radius: 50%;
  margin-bottom: 5vw;
  border: 0.5vw solid #fff;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vw;
}

.action-icon {
  width: 9vw;
  height: 9vw;
}

.count {
  font-size: 2.7vw;
}

.back-button {
  position: fixed;
  top: 4vw;
  left: 4vw;
  z-index: 9999;
  width: 8vw;
  height: 8vw;
  cursor: pointer;
}

.back-button img {
  width: 100%;
  height: 100%;
}
</style>
