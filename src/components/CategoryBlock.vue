<template>
  <div class="category-block" :class="{ 'dark-mode': props.dark }" data-stop-swipe>
    <!-- 子分类标题 + 右箭头 -->
    <div class="block-title-row" data-stop-swipe>
      <div class="block-title">{{ category.name }}</div>
      <div class="block-more" @click="goToMore" data-stop-swipe>➤</div>
    </div>

   <!-- 主图卡片 -->
<div
  class="main-card"
  @click="emitMainClick"
  data-stop-swipe
>

  <div class="cover-wrapper" data-stop-swipe>
    <img v-lazy="category.mainImage" class="main-image" alt="主图" />
    <div class="meta">
      <div class="views">
        <img src="/icons/play4.svg" class="play-icon" />
        {{ (category.mainViews / 10000).toFixed(1) }}w
      </div>
      <div class="duration">{{ category.mainDuration || '00:00' }}</div>
    </div>
  </div>
  <div class="title">{{ category.mainTitle }}</div>
  <div class="tag">{{ category.mainTag }}</div>
</div>

    <!-- 子图卡片（2x2） -->
    <div class="sub-images">
      <div
  v-for="(item, index) in shuffledSubImages"
  :key="item.id"
  class="sub-card"
  @click="emitClick(item)"
  data-stop-swipe
>


        <div class="cover-wrapper">
  <img v-lazy="item.cover" class="sub-image" alt="子图" />
  <div class="meta">
    <div class="views">
      <img src="/icons/play4.svg" class="play-icon" />
      {{ (item.views / 10000).toFixed(1) }}w
    </div>
    <div class="duration">{{ item.duration || '00:00' }}</div>
  </div>
</div>
<div class="title">{{ item.title }}</div>
<div class="tag">{{ item.tag }}</div>
      </div>
    </div>

    <!-- 查看更多 + 更换一批 -->
    <div class="action-buttons" data-stop-swipe>
      <button class="btn outline" @click="goToMore" data-stop-swipe>
        <img src="/static/more1.png" class="btn-icon" alt="更多" loading="lazy" />
        查看更多
      </button>
      <button class="btn outline" @click="shuffleSubImages" data-stop-swipe>
        <img src="/static/refresh1.png" class="btn-icon" alt="刷新" loading="lazy" />
        更换一批
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'

// 类型定义
interface SubImage {
  id: number
  cover: string
  title: string
  tag: string
  src: string
  views: number
  duration?: string
}
interface Category {
  name: string
  mainId: number
  mainImage: string
  mainTitle: string
  mainTag: string
  mainViews: number
  mainDuration?: string
  src: string
  subImages: SubImage[]
}

// emits
const emit = defineEmits<{
  (e: 'clickItem', payload: SubImage): void
  (e: 'goToMore', categoryName: string): void
}>()

// props
const props = defineProps<{
  category: Category
  dark?: boolean
}>()

// 子图列表
const shuffledSubImages = ref<SubImage[]>([])

// 初始化/监听更新
watch(
  () => props.category.subImages,
  () => shuffleSubImages(),
  { immediate: true }
)

function shuffleSubImages() {
  shuffledSubImages.value = [...props.category.subImages]
    .map(v => ({ ...v }))
    .sort(() => Math.random() - 0.5)
}

// 主图点击
function emitMainClick(): void {
  emit('clickItem', {
    id: props.category.mainId,
    cover: props.category.mainImage,
    title: props.category.mainTitle,
    tag: props.category.mainTag,
    src: props.category.src,
    views: props.category.mainViews,
    duration: props.category.mainDuration
  })
}

// 子图点击
function emitClick(item: SubImage): void {
  emit('clickItem', item)
}

// 更多
function goToMore(): void {
  emit('goToMore', props.category.name)
}
</script>

<style scoped>
.category-block {
  margin-bottom: 7.5vw; /* 28px */
  box-sizing: border-box;
}

.block-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2.7vw 1.1vw; /* 10px 4px */
}
.block-title {
  font-size: 4.3vw; /* 16px */
  font-weight: 600;
  color: #222;
}
.block-more {
  font-size: 4.3vw;
  color: #999;
  cursor: pointer;
  padding: 0.5vw 1.6vw;
  user-select: none;
  transition: color 0.2s;
}
.block-more:hover {
  color: #f12c2c;
}

.main-card {
  margin-bottom: 3.2vw; /* 12px */
}
.main-image {
  width: 100%;
  border-radius: 2.1vw; /* 8px */
  object-fit: cover;
  display: block;
  aspect-ratio: 16 / 9;
  max-height: 53.3vw; /* 200px */
}

.sub-images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.7vw; /* 10px */
}
.sub-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  user-select: none;
}
.sub-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 1.6vw; /* 6px */
}
.title {
  margin-top: 1.6vw; /* 6px */
  font-size: 3.7vw; /* 14px */
  color: #222;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tag {
  font-size: 3.2vw; /* 12px */
  color: #fff;
  background-color: #f12c2c;
  border-radius: 2.7vw; /* 10px */
  padding: 0.3vw 2.1vw; /* 1px 8px */
  display: inline-block;
  margin-top: 1.1vw; /* 4px */
  align-self: flex-start;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 3.2vw; /* 12px */
  padding: 0 1.1vw; /* 4px */
  gap: 2.7vw; /* 10px */
}
.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.6vw; /* 6px */
  font-size: 3.7vw; /* 14px */
  padding: 2.1vw 0; /* 8px 0 */
  border-radius: 5.3vw; /* 20px */
  cursor: pointer;
  border: none;
  user-select: none;
}
.btn.outline {
  background-color: #fff;
  color: #444;
  border: 0.27vw solid #ccc; /* 1px */
  transition: all 0.3s;
}
.btn.outline:hover {
  border-color: #999;
  color: #000;
}
.btn-icon {
  width: 4.3vw; /* 16px */
  height: 4.3vw;
  object-fit: contain;
}

/* ✅ 暗网模式样式 */
.dark-mode .block-title,
.dark-mode .title {
  color: white;
}
.cover-wrapper {
  position: relative;
}
.meta {
  position: absolute;
  bottom: 0.5vw; /* 2px */
  left: 1.3vw; /* 5px */
  right: 2.1vw; /* 8px */
  display: flex;
  justify-content: space-between;
  font-size: 2.9vw; /* 11px */
  color: #fff;
  text-shadow: 0 0 1.1vw rgba(0,0,0,0.7);
}
.views,
.duration {
  display: flex;
  align-items: center;
  gap: 1.1vw; /* 4px */
}
.play-icon {
  width: 4.3vw; /* 16px */
  height: 4.3vw;
}
</style>
