<template>
  <div class="video-card" @click="goToPlay">
    <div class="cover-wrapper">
      <img v-lazy="cover" class="cover" />
      <div class="info-bar">
        <div class="views">
          <img src="/icons/play4.svg" class="play-icon" alt="播放" />
          {{ views }}
        </div>
        <div class="duration">{{ duration }}</div>
      </div>
    </div>
    <div class="title">{{ title }}</div>
    <div class="tag" :style="{ background: tagColor }">{{ displayTag }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Props {
  index: number
  category: string
  title: string
  cover: string
  views: string
  duration: string
  tag?: string
  tags?: string[]
  tagColor: string
}

const props = defineProps<{
  index: number
  category: string
  title: string
  cover: string
  views: string
  duration: string
  tag?: string
  tags?: string[]
  tagColor?: string  // 👈 注意这里 ? 表示可选
}>()


const displayTag = computed(() => props.tags?.[0] || props.tag || '')

const goToPlay = () => {
  router.push({
    path: '/play-tiktok',
    query: {
      category: props.category,
      index: props.index,
      from: 'discover'
    }
  })
}
</script>

<style scoped>
.video-card {
  background: transparent;
  cursor: pointer;
}

/* 封面区域 */
.cover-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 9 / 16;
  max-height: 66.66vw; /* 250px -> ~66.66vw */
  overflow: hidden;
  border-radius: 2.13vw; /* 8px -> ~2.13vw */
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 播放图标 + 播放量 + 时长 */
.info-bar {
  position: absolute;
  bottom: 1.6vw; /* 6px */
  left: 1.6vw;
  right: 1.6vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 3.2vw; /* 12px */
  color: #fff;
  padding: 0 0.53vw; /* 2px */
  background: none;
}

.views {
  display: flex;
  align-items: center;
}

.play-icon {
  width: 4.26vw; /* 16px */
  height: 4.26vw;
  margin-right: 1.06vw; /* 4px */
  object-fit: contain;
  filter: drop-shadow(0 0 0.53vw #fff); /* 2px */
}

.duration {
  font-size: 3.2vw;
}

/* 标题样式 */
.title {
  font-size: 3.46vw; /* 13px */
  padding-top: 1.6vw; /* 6px */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 标签样式 */
.tag {
  display: inline-block;
  margin-top: 1.06vw; /* 4px */
  font-size: 3.2vw; /* 12px */
  padding: 0.53vw 1.6vw; /* 2px 6px */
  border-radius: 3.2vw; /* 12px */
  color: #fff;
  background-color: #ff2c55;
}
</style>
