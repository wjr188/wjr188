<template>
  <div class="all-categories">
    <!-- 顶部返回栏 -->
    <van-nav-bar
      title="所有分类"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    >
      <template #right>
        <div class="topbar-more" @click="showAllTags = true">
          标签
          <van-icon name="arrow-down" />
        </div>
      </template>
    </van-nav-bar>

    <!-- 筛选栏容器 吸顶 -->
    <van-sticky>
      <div class="filter-container">
        <div class="filter-row">
          <span class="filter-label">标签</span>
          <div class="filter-scroll">
            <div
              class="filter-item"
              v-for="(tag, index) in hotTags"
              :key="index"
              :class="{ active: activeTag === tag }"
              @click="activeTag = tag"
            >
              {{ tag }}
            </div>
          </div>
        </div>
        <div class="filter-row">
          <span class="filter-label">排序</span>
          <div class="filter-scroll">
            <div
              class="filter-item"
              v-for="(order, index) in orders"
              :key="index"
              :class="{ active: activeOrder === order }"
              @click="activeOrder = order"
            >
              {{ order }}
            </div>
          </div>
        </div>
        <div class="filter-row">
          <span class="filter-label">价格</span>
          <div class="filter-scroll">
            <div
              class="filter-item"
              v-for="(price, index) in prices"
              :key="index"
              :class="{ active: activePrice === price }"
              @click="activePrice = price"
            >
              {{ price }}
            </div>
          </div>
        </div>
      </div>
    </van-sticky>

    <!-- 卡片区域 -->
    <div class="card-list">
      <div
        class="video-card"
        v-for="(video, index) in visibleList"
        :key="index"
      >
        <div class="cover-wrapper">
          <img :src="video.cover" class="card-img" />
          <div class="meta">
            <div class="views">
              <img src="/icons/play4.svg" class="play-icon" />
              {{ (video.views / 10000).toFixed(1) }}w
            </div>
            <div class="duration">{{ video.duration || '00:00' }}</div>
          </div>
        </div>
        <div class="card-title">{{ video.title }}</div>
        <div class="card-tag">{{ video.tag }}</div>
      </div>
    </div>

    <!-- 懒加载提示 -->
    <div v-if="isLoading" class="loading-tip">
      <img src="/icons/loading.svg" alt="加载中..." class="custom-spinner" />
      <div class="loading-text">客官别走，妾身马上就好~</div>
    </div>
    <div v-if="noMore && visibleList.length > 0" class="no-more-text">
      客官，妾身被你弄高潮了，扛不住了 ~
    </div>
    <div ref="sentinel" class="load-more-trigger"></div>

    <!-- 所有标签弹窗 -->
    <van-popup v-model:show="showAllTags" position="bottom" round>
      <div class="popup-content">
        <div class="popup-title">全部标签</div>
        <div class="popup-tags">
          <div
            class="popup-tag"
            v-for="tag in tags"
            :key="tag"
            :class="{ active: activeTag === tag }"
            @click="selectTag(tag)"
          >
            {{ tag }}
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLazyLoad } from '@/composables/useLazyLoad'

// ✅ 类型定义
interface VideoItem {
  cover: string
  title: string
  views: number
  duration: string
  collects: number
  time: string
  tag: string
  priceType?: string
}

// 所有标签
const tags = ref<string[]>([
  '全部标签', '女优', '欧美', '国产', '日韩', '另类', '制服', '剧情', '剧情向', '清纯', '激情', '调教', '萝莉', '人妻', '巨乳', '高跟', '黑丝'
])

const hotTags = computed(() => tags.value.slice(0, 8))

const orders = ref<string[]>(['最多观看', '最多收藏', '最新上架'])
const prices = ref<string[]>(['全部类型', '免费', 'VIP', '金币'])

const activeTag = ref<string>('全部标签')
const activeOrder = ref<string>('最多观看')
const activePrice = ref<string>('全部类型')

const showAllTags = ref<boolean>(false)

const videos = ref<VideoItem[]>([
  {
    cover: 'https://zh.sydneyssong.net/015/08606858fbbf9ff69185f13e8de5c3db/2021101722373843114.webp',
    title: '极品网红少女...',
    views: 347000,
    duration: '10:23',
    collects: 1000,
    time: '2024-06-01',
    tag: '剧情'
  },
  {
    cover: "https://zh.sydneyssong.net/015/08606858fbbf9ff69185f13e8de5c3db/2021101722373843114.webp",
    title: '5/5高中少女...',
    views: 959000,
    duration: '08:45',
    collects: 500,
    time: '2024-06-10',
    tag: '国产'
  },
  {
    cover: '/upload/cover3.jpg',
    title: '日韩剧情大片...',
    views: 123000,
    duration: '12:15',
    collects: 2000,
    time: '2024-06-15',
    tag: '日韩'
  }
])

const filteredVideos = ref<VideoItem[]>([])

watch(
  [activeTag, activeOrder, activePrice],
  () => {
    let list = videos.value.slice()

    if (activeTag.value !== '全部标签') {
      list = list.filter(v => v.tag === activeTag.value)
    }

    if (activePrice.value !== '全部类型') {
      list = list.filter(v => v.priceType === activePrice.value)
    }

    if (activeOrder.value === '最多观看') {
      list.sort((a, b) => b.views - a.views)
    } else if (activeOrder.value === '最多收藏') {
      list.sort((a, b) => b.collects - a.collects)
    } else if (activeOrder.value === '最新上架') {
      list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    }

    filteredVideos.value = list
  },
  { immediate: true }
)

// 懒加载
const { visibleList, isLoading, noMore, sentinel } = useLazyLoad(filteredVideos, {
  batchSize: 12
})

function selectTag(tag: string) {
  activeTag.value = tag
  showAllTags.value = false
}
</script>
<style scoped>
.all-categories {
  background: #f5f5f5;
}
.filter-container {
  background: #fff;
  border-bottom: 0.26vw solid #eee;
}
.filter-row {
  display: flex;
  align-items: center;
  padding: 2.1vw 3.2vw;
}
.filter-label {
  flex: 0 0 auto;
  font-weight: bold;
  margin-right: 2.1vw;
}
.filter-scroll {
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
}
.filter-scroll::-webkit-scrollbar {
  display: none;
}
.filter-item {
  flex: 0 0 auto;
  padding: 1vw 2.6vw;
  background: #eee;
  border-radius: 3.2vw;
  margin-right: 2.1vw;
  white-space: nowrap;
  cursor: pointer;
  transition: 0.2s;
  font-size: 3.2vw;
}
.filter-item.active {
  background: #f12c2c;
  color: white;
}
.topbar-more {
  padding: 1vw 2.6vw;
  background: #eee;
  border-radius: 3.2vw;
  font-size: 3.2vw;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.topbar-more .van-icon {
  font-size: 3.2vw;
  margin-left: 1vw;
}

/* 卡片 */
.card-list {
  display: flex;
  flex-wrap: wrap;
  padding: 2.1vw;
}
.video-card {
  width: 48%;
  background: #fff;
  margin: 1%;
  border-radius: 1.6vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.cover-wrapper {
  position: relative;
}
.card-img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  display: block;
  background: #f2f2f2;
}
.meta {
  position: absolute;
  bottom: 0.5vw;
  left: 1vw;
  right: 2vw;
  display: flex;
  justify-content: space-between;
  font-size: 2.8vw;
  color: #fff;
  text-shadow: 0 0 0.8vw rgba(0,0,0,0.7);
}

.views,
.duration {
  display: flex;
  align-items: center;
  gap: 1vw;
  font-size: 2.8vw;
}

.play-icon {
  width: 4vw;
  height: 4vw;
}

.card-title {
  font-size: 3.6vw;
  font-weight: bold;
  margin: 1vw 0 0 0;
  padding: 0 1vw;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}
.card-tag {
  font-size: 3.2vw;
  color: #fff;
  background: #f12c2c;
  border-radius: 5vw;
  padding: 0.5vw 2.6vw;
  margin: 1vw 0 1vw 1vw;
  align-self: flex-start;
}

/* 懒加载提示 */
.loading-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5.3vw 0;
  font-size: 3.6vw;
}
.custom-spinner {
  width: 9.3vw;
  height: 9.3vw;
  margin-bottom: 2vw;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-text {
  color: #ff5f5f;
  font-weight: 500;
}
.no-more-text {
  text-align: center;
  color: #999;
  font-size: 3.6vw;
  margin: 5.3vw 0;
}
.load-more-trigger {
  height: 13vw;
  margin-top: 5.3vw;
}

/* 弹窗 */
.popup-content {
  padding: 4.3vw;
}
.popup-title {
  font-weight: bold;
  margin-bottom: 3.2vw;
  text-align: center;
  font-size: 4vw;
}
.popup-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 2.1vw;
}
.popup-tag {
  padding: 1.5vw 3.2vw;
  background: #eee;
  border-radius: 5vw;
  cursor: pointer;
  font-size: 3.6vw;
}
.popup-tag.active {
  background: #f12c2c;
  color: #fff;
}

/* 顶部bar样式 */
::v-deep(.van-nav-bar__title) {
  font-size: 5vw !important;
  font-weight: bold !important;
  color: #333 !important;
}
::v-deep(.van-icon-arrow-left) {
  font-size: 6.9vw !important;
  color: #333 !important;
}
</style>
