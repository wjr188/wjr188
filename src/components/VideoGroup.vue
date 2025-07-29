<template>
  <div class="video-grid-grouped">
    <div
      v-for="(group, gIdx) in groupedVideos"
      :key="gIdx"
      class="video-card-group"
    >
      <!-- 大图 -->
      <div
        v-if="group[0]"
        class="video-big"
        @click="goToDetail(group[0].id)"
      >
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

      <!-- 小图 -->
      <div class="video-grid">
        <div
          class="video-small"
          v-for="(video, i) in group.slice(1)"
          :key="i"
          @click="goToDetail(video.id)"
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  videos: {
    type: Array,
    required: true
  }
})

const router = useRouter()
const goToDetail = (id) => {
  if (id) router.push(`/play/${id}`)
}

const setPlaceholder = (e) => {
  e.target.src = '/static/placeholder.webp'
}

const groupedVideos = computed(() => {
  const groups = []
  for (let i = 0; i < props.videos.length; i += 5) {
    groups.push(props.videos.slice(i, i + 5))
  }
  return groups
})
</script>

<style scoped>
.video-grid-grouped {
  padding: 10px;
}

.video-card-group {
  padding: 12px;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.video-big {
  position: relative;
  margin-bottom: 10px;
  cursor: pointer;
}

.thumb {
  display: block;
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
  background: #f2f2f2;
}

.thumb-big {
  aspect-ratio: 16 / 9;
}

.thumb-small {
  aspect-ratio: 16 / 9;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.video-small {
  cursor: pointer;
}

.meta {
  font-size: 12px;
  margin-top: 4px;
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
  font-size: 11px;
}
</style>
