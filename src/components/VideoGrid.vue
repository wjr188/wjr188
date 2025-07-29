<template>
  <div class="video-grid-grouped">
    <template v-for="(group, gIdx) in groupedVideos" :key="gIdx">
      <div class="video-card-group">
        <!-- 第一张大图 -->
        <div class="video-big" v-if="group[0]" @click="goToDetail(group[0])">
          <img
            :src="group[0].cover"
            class="thumb thumb-big"
            @error="setPlaceholder"
          />
          <div class="meta">
            <span class="title">{{ group[0].title }}</span>
            <span class="time">{{ group[0].duration }}</span>
          </div>
        </div>

        <!-- 4 张小图 -->
        <div class="video-grid">
          <div
            class="video-small"
            v-for="(video, i) in group.slice(1)"
            :key="i"
            @click="goToDetail(video)"
          >
            <img
              :src="video.cover"
              class="thumb thumb-small"
              @error="setPlaceholder"
            />
            <div class="meta">
              <span class="title">{{ video.title }}</span>
              <span class="time">{{ video.duration }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue'
import { useRouter } from 'vue-router'

interface Video {
  id: string | number
  title: string
  cover: string
  duration: string
}

const props = defineProps<{
  videos: Video[]
}>()

const router = useRouter()

const goToDetail = (video: Video) => {
  router.push({
    path: '/play',
    query: {
      id: String(video.id),
      title: video.title,
      cover: video.cover
    }
  })
}

const setPlaceholder = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = '/static/placeholder.webp'
}

const groupedVideos = computed(() => {
  const groups: Video[][] = []
  for (let i = 0; i < props.videos.length; i += 5) {
    groups.push(props.videos.slice(i, i + 5))
  }
  return groups
})
</script>

<style scoped>
.video-grid-grouped {
  padding: 2.66vw;
}

.video-card-group {
  padding: 3.2vw;
  background: #fff;
  border-radius: 2.66vw;
  margin-bottom: 3.73vw;
  box-shadow: 0 0.26vw 1.06vw rgba(0, 0, 0, 0.05);
}

.video-big {
  position: relative;
  margin-bottom: 2.66vw;
  cursor: pointer;
}

.thumb {
  display: block;
  width: 100%;
  object-fit: cover;
  border-radius: 2.13vw;
  background: #f2f2f2;
}

.thumb-big {
  aspect-ratio: 16 / 9;
}

.thumb-small {
  aspect-ratio: 16 / 9;
  height: auto;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.66vw;
}

.video-small {
  cursor: pointer;
}

.meta {
  font-size: 3.2vw;
  margin-top: 1.06vw;
  color: #333;
  line-height: 1.3;
}

.title {
  font-weight: 500;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.time {
  color: #999;
  font-size: 3.2vw;
}
</style>
