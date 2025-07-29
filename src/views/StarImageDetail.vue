<template>
  <div class="image-detail-wrapper">
    <!-- ✅ 顶部固定 -->
    <div class="top-bar">
      <div class="left">
        <img src="/icons/back.svg" class="back-icon" @click="goBack" />
        <img v-lazy="star.avatar" class="avatar" />
        <div class="name">{{ star.name }}</div>
      </div>
    </div>

    <!-- ✅ 滚动主体部分 -->
    <div class="scroll-content" ref="scrollRef" @scroll="onScroll">
      <!-- 图集标题 -->
      <div class="album-title">{{ album.title }}</div>

      <!-- 图集内容 -->
      <div class="image-grid">
        <img
  v-for="(img, index) in visibleImages"
  :key="index"
  v-lazy="img"
  class="image"
  @click="goToFullView(index)"
/>
      </div>

      <!-- 加载状态 -->
      <div class="loading-tip" v-if="loading">
        <img src="/icons/loading.svg" class="loading-icon" />
        <span>客官别走，妾身马上就好~</span>
      </div>

      <div class="no-more-tip" v-if="noMore">
        客官，妾身被你弄高潮了，扛不住了~
      </div>
    </div>

    <!-- ✅ 底部按钮 -->
    <div class="bottom-bar">
      <div class="icon-btn" @click="toggleLike">
  <img :src="liked ? '/icons/dianzan5.svg' : '/icons/like1.svg'" />
  <span>{{ likeCount }}</span>
</div>
<div class="icon-btn" @click="toggleCollect">
  <img :src="collected ? '/icons/star7.svg' : '/icons/star.svg'" />
  <span>{{ starCount }}</span>
</div>
      <div class="icon-btn" @click="goToPromotionShare">
        <img src="/icons/share2.svg" />
        <span>分享</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, onMounted, nextTick, Ref } from 'vue'
import { useHistoryStore } from '@/store/useHistoryStore'
import { showToast } from 'vant'

interface Album {
  id?: string | number
  title?: string
  cover?: string
  images?: string[]
}

interface Star {
  id?: string | number
  name?: string
  avatar?: string
}

interface HistoryRecord {
  id: string | number
  type: string
  time: string
  data: any
}

const route = useRoute()
const router = useRouter()
const historyStore = useHistoryStore()

// 解析数据
const data = computed<{ album?: Album; star?: Star; likes?: number; favs?: number }>(() => {
  const encodedData = route.params.data as string | undefined

  if (encodedData) {
    try {
      const decodedData = decodeURIComponent(encodedData)
      return JSON.parse(decodedData)
    } catch (e) {
      console.error('Failed to parse JSON from route:', e)
    }
  }

  if (route.query.fromHistory === '1' && route.query.fullData) {
    try {
      return JSON.parse(decodeURIComponent(String(route.query.fullData)))
    } catch (e) {
      console.error('Failed to parse JSON from query:', e)
    }
  }

  return {}
})

// 状态
const liked = ref(false)
const collected = ref(false)
const likeCount = ref<number>(data.value.likes || 0)
const starCount = ref<number>(data.value.favs || 0)

const star = computed<Star>(() => data.value.star || {})
const album = computed<Album>(() => data.value.album || { images: [] })

const allImages = computed<string[]>(() => album.value.images || [])

// 分页
const pageSize = 18
const visibleImages = ref<string[]>([])
const loading = ref(false)
const noMore = ref(false)
const scrollRef = ref<HTMLElement | null>(null)

// 加载更多
function loadMore() {
  if (loading.value || noMore.value) return
  loading.value = true

  setTimeout(() => {
    const next = visibleImages.value.length + pageSize
    visibleImages.value = allImages.value.slice(0, next)

    if (visibleImages.value.length >= allImages.value.length) {
      noMore.value = true
    }
    loading.value = false
  }, 500)
}

function onScroll() {
  const el = scrollRef.value
  if (!el) return

  const scrollBottom = el.scrollTop + el.clientHeight
  if (scrollBottom + 50 >= el.scrollHeight && !loading.value && !noMore.value) {
    loadMore()
  }
}
onMounted(() => {
  visibleImages.value = allImages.value.slice(0, pageSize)

  historyStore.addRecord({
    id: String(album.value.id ?? album.value.title ?? 'unknown'),
    type: 'only_img',
    time: new Date().toISOString(),
    data: {
      album: album.value,
      star: star.value,
      cover: album.value.cover || allImages.value[0],
      title: album.value.title || '无标题',
      likes: likeCount.value,
      favs: starCount.value,
      index: 0
    }
  })
})

// 操作
function toggleLike() {
  liked.value = !liked.value
  if (liked.value) {
    likeCount.value++
    showToast('点赞成功')
  } else {
    likeCount.value--
    showToast('取消点赞')
  }
}

function toggleCollect() {
  collected.value = !collected.value
  if (collected.value) {
    starCount.value++
    showToast('收藏成功')
  } else {
    starCount.value--
    showToast('取消收藏')
  }
}

function goBack() {
  router.back()
}

function goToFullView(index: number) {
  const payload = {
    album: album.value,
    star: star.value,
    likes: likeCount.value,
    favs: starCount.value,
    index
  }

  router.push({
    name: 'FullImageViewer',
    params: { data: encodeURIComponent(JSON.stringify(payload)) }
  })
}

function goToPromotionShare() {
  router.push({ name: 'PromotionShare' })
}
</script>
<style scoped>
.image-detail-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
}

.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 13.33vw; /* 50px */
  display: flex;
  align-items: center;
  background: #fff;
  padding: 3.2vw; /* 12px */
  z-index: 999;
}

.left {
  display: flex;
  align-items: center;
}

.back-icon {
  width: 5.86vw; /* 22px */
  height: 5.86vw;
  margin-right: 2.66vw; /* 10px */
}

.avatar {
  width: 10.66vw; /* 40px */
  height: 10.66vw;
  border-radius: 50%;
  object-fit: cover;
  margin-left: 3.2vw; /* 12px */
}

.name {
  margin-left: 4.8vw; /* 18px */
  font-weight: bold;
  font-size: 5.06vw; /* 19px */
  color: #000000a9;
}

.scroll-content {
  flex: 1;
  overflow-y: auto;
  margin-top: 13.33vw; /* 50px */
  padding-bottom: 16vw; /* 60px */

  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-mask-image: linear-gradient(black 100%, black 100%);
  mask-image: linear-gradient(black 100%, black 100%);
  -webkit-overflow-scrolling: touch;
}

.scroll-content::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

.album-title {
  font-weight: bold;
  font-size: 4.8vw; /* 18px */
  margin: 1.6vw 4.26vw 0;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-grid {
  padding: 2.66vw; /* 10px */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.6vw; /* 6px */
}

.image {
  width: 100%;
  height: 30vw; /* 130px */
  object-fit: cover;
  border-radius: 1.6vw; /* 6px */
  cursor: pointer;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 13.86vw; /* 52px */
  background: #fff;
  border-top: 0.27vw solid #eee; /* 1px */
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 3.2vw; /* 12px */
  color: #333;
}

.icon-btn img {
  width: 5.33vw; /* 20px */
  height: 5.33vw;
  margin-bottom: 1.06vw; /* 4px */
}

.loading-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 3.73vw; /* 14px */
  margin: 5.33vw 0; /* 20px */
}

.loading-icon {
  width: 7.46vw; /* 28px */
  height: 7.46vw;
  margin-bottom: 2.13vw; /* 8px */
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-more-tip {
  text-align: center;
  color: #999;
  font-size: 3.73vw; /* 14px */
  margin: 5.33vw 0;
}
</style>
