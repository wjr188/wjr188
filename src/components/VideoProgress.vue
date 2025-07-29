<template>
  <div class="progress-bar-container" :class="{ dragging: isDragging }" @click="onClick">
    <div class="bg-bar"></div>
    <div class="buffered-bar" :style="{ width: bufferedPercent + '%' }"></div>
    <div class="played-bar" :style="{ width: progressPercent + '%' }"></div>
    <input
      class="progress-bar"
      type="range"
      :max="duration"
      step="0.1"
      v-model="localTime"
      @mousedown="isDragging = true"
      @mouseup="onSeekEnd"
      @input="onSeeking"
      @touchstart="isDragging = true"
      @touchend="onSeekEnd"
    />
    <div v-if="isDragging" class="time-text">
      {{ formatTime(localTime) }} / {{ formatTime(duration) }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue'

// ✅ Props类型
interface Props {
  currentTime: number
  duration: number
}

const props = defineProps<Props>()

// ✅ Emits类型
const emit = defineEmits<{
  (e: 'seek', time: number): void
  (e: 'seeking', time: number): void
}>()

const isDragging = ref(false)
const localTime = ref(props.currentTime)
const bufferedPercent = ref(0) // 如果你以后有缓冲进度用它

// ✅ ✨补上这个函数，解决报错✨
const onClick = () => {
  // 如果你未来要处理点击，写逻辑在这里
}

watch(
  () => props.currentTime,
  (val) => {
    if (!isDragging.value) {
      localTime.value = val
    }
  }
)

const onSeeking = () => {
  emit('seeking', localTime.value)
}

const onSeekEnd = () => {
  emit('seek', localTime.value)
  isDragging.value = false
}

const formatTime = (s: number) => {
  const m = String(Math.floor(s / 60)).padStart(2, '0')
  const sec = String(Math.floor(s % 60)).padStart(2, '0')
  return `${m}:${sec}`
}

const progressPercent = computed(() => {
  return props.duration ? (localTime.value / props.duration) * 100 : 0
})
</script>

<style scoped>
.progress-bar-container {
  position: fixed;
  bottom: 60px;
  left: 0;
  width: 100%;
  height: 10px;
  z-index: 9999;
  transition: all 0.3s ease;
}
.bg-bar,
.buffered-bar,
.played-bar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  border-radius: 2px;
  transition: height 0.2s ease;
}
.bg-bar {
  background: #444;
  width: 100%;
}
.buffered-bar {
  background: #666;
  z-index: 2;
}
.played-bar {
  background: #f54;
  z-index: 3;
}
.progress-bar-container.dragging .bg-bar,
.progress-bar-container.dragging .buffered-bar,
.progress-bar-container.dragging .played-bar {
  height: 10px;
}
.progress-bar {
  appearance: none;
  background: transparent;
  outline: none;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 4;
}
.progress-bar::-webkit-slider-thumb {
  appearance: none;
  background: #ccc;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: -4px;
}
.time-text {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 14px;
  font-weight: bold;
  z-index: 10000;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
}
</style>
