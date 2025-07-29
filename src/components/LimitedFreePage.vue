<template>
  <div class="limited-free-page">
    <!-- 吸顶导航 -->
    <van-nav-bar
      fixed
      safe-area-inset-top
      title="限免专区"
      left-arrow
      @click-left="onBack"
    />

    <!-- 卡片列表 -->
    <div class="card-list">
      <div
        class="video-card"
        v-for="item in videoList"
        :key="item.id"
      >
        <div class="thumb">
          <img v-lazy="item.cover" alt="" />
          <div class="footer-bar">
            <div class="views">
              <img src="/icons/play4.svg" class="play-icon" />
              {{ formatViews(item.views) }}
            </div>
            <div class="duration">{{ item.duration }}</div>
          </div>
        </div>
        <div class="title">{{ item.title }}</div>
        <van-tag color="#ee0a24">{{ item.category }}</van-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface VideoItem {
  id: number
  cover: string
  title: string
  views: number
  duration: string
  category: string
}

const router = useRouter()
function onBack(): void {
  router.back()
}

function formatViews(val: number): string {
  if (val >= 10000) return (val / 10000).toFixed(2) + 'w'
  if (val >= 1000) return (val / 1000).toFixed(2) + 'k'
  return val.toString()
}

const videoList = ref<VideoItem[]>([
  {
    id: 1,
    cover: 'https://example.com/cover1.jpg',
    title: '家庭团聚互动集锦',
    views: 36500,
    duration: '12:34',
    category: '家庭'
  },
  {
    id: 2,
    cover: 'https://example.com/cover2.jpg',
    title: '母子和谐生活片段',
    views: 14800,
    duration: '08:20',
    category: '亲情'
  },
  {
    id: 3,
    cover: 'https://example.com/cover3.jpg',
    title: '兄妹欢乐日常',
    views: 4250,
    duration: '05:00',
    category: '亲情'
  },
])
</script>

<style scoped>
.limited-free-page {
  padding-top: 12.3vw; /* 46px */
  background: #f7f8fa;
  min-height: 100vh;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.1vw; /* 8px */
  padding: 2.1vw;
}

.video-card {
  background: #f3f1f1;
  border-radius: 1.6vw; /* 6px */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden; /* 防止溢出 */
}

.thumb img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.footer-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5vw 1.6vw; /* 2px 6px */
  color: #fff;
  font-size: 3.2vw; /* 12px */
}
.views {
  display: flex;
  align-items: center;
  gap: 0.5vw; /* 2px */
}
.views .play-icon {
  width: 3.7vw; /* 14px */
  height: 3.7vw;
  flex-shrink: 0;
  object-fit: contain;
}
.duration {
  flex-shrink: 0;
}

.title {
  font-size: 3.7vw; /* 14px */
  color: #000;
  line-height: 1.4;
  padding: 1vw 1.6vw; /* 4px 6px */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.van-tag {
  margin: 0 1.6vw 1.6vw; /* 0 6px 6px */
  align-self: flex-start;
}

::v-deep(.van-nav-bar__title) {
  font-size: 5.1vw !important; /* 19px */
  font-weight: bold !important;
  color: #333 !important;
}
::v-deep(.van-icon-arrow-left) {
  font-size: 6.9vw !important; /* 26px */
  color: #333 !important;
}
</style>
