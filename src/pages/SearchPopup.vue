<template>
  <div class="search-popup">
    <!-- 顶部搜索 + 返回栏 -->
    <div class="top-bar">
      <img src="/static/back.png" alt="返回" class="back-icon" @click="router.back()" />
      <div class="title-section">
        <img src="/static/menu.png" alt="菜单" class="menu-icon" />
        <span class="menu-text">片库</span>
        <span class="divider">|</span>
      </div>
      <input 
        v-model="keyword" 
        type="text" 
        placeholder="请输入关键词" 
        @keyup.enter="onSearch" 
        class="search-input"
      />
      <span class="search-btn" @click="onSearch">搜索</span>
    </div>

    <!-- 历史记录 + 热门标签 -->
    <div class="tags-section">
      <div v-if="history.length" class="section-row">
        <span class="section-title">历史记录</span>
        <img src="/static/delete.png" class="action-icon" @click="clearHistory" />
      </div>
      <div v-if="history.length" class="tag-list">
        <div class="tag" v-for="item in history" :key="item" @click="applyKeyword(item)">
          {{ item }}
        </div>
      </div>

      <div class="section-row">
        <span class="section-title">热门标签</span>
        <img src="/static/refresh.png" class="action-icon" @click="refreshTags" />
      </div>
      <div class="tag-list">
        <div
          class="tag"
          v-for="tag in tags"
          :key="tag"
          :class="{ active: activeTag === tag }"
          @click="activeTag = tag"
        >
          {{ tag }}
        </div>
      </div>

      <!-- 分类Tab -->
      <div class="sort-tab">
        <span
          v-for="(tab, i) in tabs"
          :key="i"
          :class="{ active: currentTab === i }"
          @click="currentTab = i"
        >
          {{ tab }}
        </span>
      </div>
    </div>

    <!-- 视频宫格列表 -->
    <div class="video-list">
      <div
        v-for="video in videos"
        :key="video.id"
        class="video-item"
        @click="goToPlay(video)"
      >
        <img :src="video.cover" class="thumb" />
        <div class="info">
          <div class="title">{{ video.title }}</div>
          <div class="meta">
            <span class="views">👁️ {{ video.views }}</span>
            <span class="duration">⏱️ {{ formatDuration(video.duration) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 路由
const router = useRouter()

// 搜索关键词
const keyword = ref<string>('')

// 历史记录
const history = ref<string[]>(['巨乳', '搜索', '贫乳'])

// 热门标签
const tags = ref<string[]>(['粉嫩', '清纯', '贫乳', '瘦小', '破处', '双马尾', '童颜', '巨乳'])

// 当前激活标签
const activeTag = ref<string>('')

// 当前tab索引
const currentTab = ref<number>(0)

// Tab列表
const tabs = ['本周最热', '本月最热', '上月最热']

// 视频项类型
interface VideoItem {
  id: number
  title: string
  cover: string
  views: string
  duration: number
}

// 视频列表
const videos = ref<VideoItem[]>([
  {
    id: 1,
    title: '极品白虎女仆',
    cover: 'https://dummyimage.com/300x180/333/fff.png&text=1',
    views: '1.2m',
    duration: 1043
  },
  {
    id: 2,
    title: '诱惑少女酥胸上垒',
    cover: 'https://dummyimage.com/300x180/666/fff.png&text=2',
    views: '893k',
    duration: 962
  },
  {
    id: 3,
    title: '清纯萝莉初体验',
    cover: 'https://dummyimage.com/300x180/999/fff.png&text=3',
    views: '712k',
    duration: 1120
  }
])

// 格式化时长
function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec < 10 ? '0' + sec : sec}`
}

// 清空历史记录
function clearHistory(): void {
  history.value = []
}

// 刷新标签
function refreshTags(): void {
  tags.value = [...tags.value.sort(() => Math.random() - 0.5)]
}

// 应用历史关键词
function applyKeyword(item: string): void {
  keyword.value = item
  onSearch()
}

// 搜索
function onSearch(): void {
  if (keyword.value && !history.value.includes(keyword.value)) {
    history.value.unshift(keyword.value)
    if (history.value.length > 10) history.value.pop()
  }
}

// 跳转播放
function goToPlay(video: VideoItem): void {
  router.push({
    path: '/play',
    query: {
      id: video.id.toString(),
      title: video.title,
      cover: video.cover
    }
  })
}
</script>

<style scoped>
.search-popup {
  background: #fff;
  min-height: 100vh;
  padding-bottom: 16vw; /* 60px */
}

/* 优化顶部栏布局 */
.top-bar {
  display: flex;
  align-items: center;
  padding: 2.66vw 4.26vw; /* 10px 16px */
  border-bottom: 0.27vw solid #eee; /* 1px */
  gap: 2.13vw; /* 8px */
  flex-wrap: nowrap;
  overflow: hidden;
}

.back-icon {
  width: 5.86vw; /* 22px */
  height: 5.86vw;
  cursor: pointer;
  flex-shrink: 0;
  margin-right: 0;
}

.title-section {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  max-width: 30%;
}

.menu-icon {
  width: 5.33vw; /* 20px */
  height: 5.33vw;
  margin-right: 1.6vw; /* 6px */
  flex-shrink: 0;
}

.menu-text {
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.divider {
  margin: 0 1.6vw; /* 6px */
  color: #ccc;
  flex-shrink: 0;
}

.search-input {
  flex: 1 1 auto;
  min-width: 13.3vw; /* 50px */
  background: #f5f5f5;
  border-radius: 5.33vw; /* 20px */
  border: none;
  padding: 1.6vw 3.2vw; /* 6px 12px */
  font-size: 3.73vw; /* 14px */
  outline: none;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-btn {
  font-size: 4vw; /* 15px */
  color: #333;
  flex-shrink: 0;
  white-space: nowrap;
  min-width: max-content;
}

/* 响应式调整 */
@media (max-width: 360px) {
  .divider {
    display: none;
  }
  .title-section {
    max-width: 25%;
  }
}

@media (max-width: 320px) {
  .menu-text {
    display: none;
  }
  .divider {
    display: none;
  }
  .title-section {
    max-width: 10.6vw; /* 40px */
  }
}

/* 历史记录和标签区域 */
.tags-section {
  padding: 4.26vw; /* 16px */
}

.section-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3.2vw; /* 12px */
  padding: 0 1.06vw; /* 4px */
}

.section-title {
  font-weight: bold;
  font-size: 4vw; /* 15px */
  color: #333;
  padding-left: 1.06vw; /* 4px */
}

.action-icon {
  width: 4.8vw; /* 18px */
  height: 4.8vw;
  opacity: 0.6;
  cursor: pointer;
  margin-right: 1.06vw; /* 4px */
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 2.66vw; /* 10px */
  margin-bottom: 4.8vw; /* 18px */
  padding: 0 1.06vw;
}

.tag {
  background: #f0f0f0;
  padding: 1vw 2vw; /* 6px 14px */
  border-radius: 2vw; /* 20px */
  font-size: 3.73vw; /* 14px */
  color: #333;
  cursor: pointer;
}

.tag.active {
  background: #f12c2c;
  color: #fff;
}

/* 分类标签 */
.sort-tab {
  display: flex;
  justify-content: space-between;
  padding: 3.2vw 4.26vw; /* 12px 16px */
  background: #fff;
  border-top: 0.27vw solid #eee; /* 1px */
  border-bottom: 0.27vw solid #eee;
  color: #333;
  font-size: 4vw; /* 15px */
  font-weight: 500;
  margin: 0 0 4.26vw; /* 16px */
}

.sort-tab span {
  flex: 1;
  text-align: center;
}

.sort-tab .active {
  color: #f12c2c;
  font-weight: bold;
  position: relative;
}

.sort-tab .active::after {
  content: '';
  position: absolute;
  bottom: -1.6vw; /* -6px */
  left: 50%;
  transform: translateX(-50%);
  width: 16vw; /* 60% of parent - 60%*50vw=30vw - 这里简化用了固定16vw */
  height: 0.8vw; /* 3px */
  background-color: #f12c2c;
  border-radius: 0.53vw; /* 2px */
}

/* 视频列表 */
.video-list {
  display: flex;
  flex-wrap: wrap;
  gap: 3.2vw; /* 12px */
  padding: 0 4.26vw; /* 16px */
}

.video-item {
  width: calc(50% - 1.6vw); /* 6px */
  background: #fff;
  cursor: pointer;
}

.thumb {
  width: 100%;
  border-radius: 2.13vw; /* 8px */
}

.info {
  padding: 2.13vw 1.06vw; /* 8px 4px */
}

.title {
  font-size: 3.73vw; /* 14px */
  font-weight: 500;
  color: #333;
  margin-bottom: 1.6vw; /* 6px */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 10.66vw; /* 40px */
  line-height: 5.33vw; /* 20px */
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 3.2vw; /* 12px */
  color: #999;
  padding: 0 1.06vw; /* 4px */
}

</style>