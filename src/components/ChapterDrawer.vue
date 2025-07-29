<template>
  <div class="drawer-overlay" v-show="visible" @click.self="startClose">
    <div :class="['drawer-wrapper', { active: active }]" :style="{ width: fullScreen ? '100%' : '80%' }">
      <div class="header-bar">
        <img src="/icons/back3.svg" class="back-icon" @click="startClose" />
        <div class="title">{{ comicTitle }}</div>
        <img :src="isAscending ? '/icons/sort-desc.svg' : '/icons/sort-asc.svg'" class="sort-icon" @click="toggleSort" />
      </div>

      <div class="chapter-list">
        <div
          class="chapter-item"
          v-for="chapter in sortedChapters"
          :key="chapter.id"
          @click="readChapter(Number(chapter.id))"
        >
         <img v-lazy="getChapterCover(chapter)" class="chapter-cover-new" />
          <div class="chapter-info">
            <div class="chapter-title">{{ chapter.title }}</div>
          </div>
          <button
  class="read-btn"
  :class="{ unlocked: isUnlocked(chapter.id), last: lastReadChapterId === chapter.id }"
>
  {{ lastReadChapterId === chapter.id ? '上次' : getChapterStatusText(chapter) }}
</button>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Chapter {
  id: string | number
  title: string
  cover?: string
  is_vip?: number | string
  coin?: number | string
  status?: string | number
  price?: number
}

const props = withDefaults(
  defineProps<{
    chapters?: Chapter[]
    comicId: string | number
    novelId?: string | number;
    comicTitle?: string
    modelValue?: boolean
    fullScreen?: boolean
    type?: string
    cover?: string
    unlockedList?: (string | number)[]
  }>(), {
    chapters: () => []
  }
)

const id = computed(() => props.novelId || props.comicId);
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:modelValue', value: boolean): void
  (e: 'read-chapter-from-drawer', chapterId: number): void
}>()

const isAscending = ref<boolean>(true)
const toggleSort = (): void => { isAscending.value = !isAscending.value }

// 只做翻转，不再用 id 排序
const sortedChapters = computed<Chapter[]>(() => {
  return isAscending.value ? [...props.chapters] : [...props.chapters].reverse()
})

const lastReadChapterId = ref<number | null>(null)

const readChapter = (chapterId: number): void => {
  lastReadChapterId.value = chapterId
  localStorage.setItem(`lastReadChapter_${props.comicId}`, chapterId.toString())
  emit('read-chapter-from-drawer', chapterId)
  startClose()
}

const getChapterStatusText = (chapter: Chapter): string => {
  if (isUnlocked(chapter.id)) {
    return '已解锁'
  }
  if (chapter.coin && Number(chapter.coin) > 0) {
    return `${chapter.coin}金币`
  }
  if (chapter.is_vip && Number(chapter.is_vip) === 1) {
    return 'VIP'
  }
  return '免费'
}


const visible = ref<boolean>(false)
const active = ref<boolean>(false)
let closeTimeoutId: ReturnType<typeof setTimeout> | null = null

const startClose = (): void => {
  emit('close')
  emit('update:modelValue', false)
}

onMounted(() => {
  const stored = Number(localStorage.getItem(`lastReadChapter_${props.comicId}`))
  if (!isNaN(stored)) lastReadChapterId.value = stored
})

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      console.log('[Drawer组件] props.chapters变化：', val)
      const stored = Number(localStorage.getItem(`lastReadChapter_${props.comicId}`))
      if (!isNaN(stored)) lastReadChapterId.value = stored
      visible.value = true
      if (closeTimeoutId) clearTimeout(closeTimeoutId)
      setTimeout(() => { active.value = true }, 10)
    } else {
      active.value = false
      closeTimeoutId = setTimeout(() => { visible.value = false }, 300)
    }
  },
  { immediate: true }
)
function isUnlocked(chapterId: string | number) {
  // unlockedList 可能没传，做个兼容
  return (props.unlockedList || []).map(String).includes(String(chapterId))
}
function getChapterCover(chapter: Chapter) {
  // 优先章节自己的封面，没有就用父级传进来的 cover
  return chapter.cover && chapter.cover.trim() !== '' ? chapter.cover : (props.cover || '/images/lanjiazai1.webp')
}

</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

.drawer-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  transform: translateX(100%);
}
.drawer-wrapper.active {
  transform: translateX(0);
}

.header-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  height: 32vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4.3vw;
}

.back-icon, .sort-icon {
  width: 5.9vw;
  height: 5.9vw;
}

.title {
  font-weight: bold;
  font-size: 5.3vw;
  color: #333;
  flex: 1;
  text-align: center;
  margin: 0 2.7vw;
}

.chapter-list {
  padding: 4.3vw;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.chapter-list::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

.chapter-item {
  background: #fff;
  border-radius: 2.1vw;
  margin-bottom: 2.7vw;
  padding: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.chapter-cover-new {
  width: 32vw;
  height: 18.7vw;
  border-radius: 1.1vw;
  margin-right: 3.2vw;
  object-fit: cover;
  flex-shrink: 0;
}

.chapter-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 2.7vw;
}

.chapter-title {
  font-size: 3.2vw;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
  word-break: break-word;
}

.read-btn {
  background: #ff7e00;
  color: #fff;
  border: none;
  padding: 2.1vw 3vw;
  border-radius: 266vw;
  font-size: 3vw;
  white-space: nowrap;
  flex-shrink: 0;
}
.read-btn.unlocked {
  background: #eee;
  color: #999;
  border: 1px solid #ccc;
}
.read-btn.last {
  background: #0dbd75;
  color: #fff;
  border: none;
}

</style>
