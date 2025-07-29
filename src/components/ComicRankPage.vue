<template>
  <div class="video-rank-page">
    <!-- 顶部区域 吸顶 -->
    <div class="header-container">
      <div class="top-banner">
        <img src="/static/1234.png" class="bg-img" />
        <img src="/static/manhuabandan.png" class="center-img" />
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" size="25" color="#333" />
        </div>
        <div class="main-tab-row">
          <div
            v-for="(tab, i) in mainTabs"
            :key="tab"
            :class="['main-tab', { active: mainTab === i }]"
            @click="mainTab = i"
          >
            {{ tab }}
            <div v-if="mainTab === i" class="main-tab-indicator"></div>
          </div>
        </div>
      </div>
      <div class="sub-tab-container">
        <div
          v-for="(sub, i) in subTabs"
          :key="sub"
          :class="['sub-tab', { active: subTab === i }]"
          @click="onSubTabClick(i)"
        >
          {{ sub }}
        </div>
      </div>
    </div>

    <!-- 滚动区域 -->
    <div class="scroll-content">
      <van-swipe
        v-model:active="subTab"
        :loop="false"
        :show-indicators="false"
        class="swipe-content"
        @change="onSwipeChange"
      >
        <van-swipe-item v-for="(sub, idx) in subTabs" :key="sub">
          <div>
            <div
              v-for="(item, index) in visibleList"
              :key="item.id"
              class="video-item"
            >
              <div class="thumb">
                <img v-lazy="item.cover" />
                <van-tag
                  :type="getRankType(index)"
                  :style="getRankStyle(index)"
                  class="rank-tag"
                >
                  {{ index + 1 }}
                </van-tag>
              </div>
              <div class="info">
                <div class="title">{{ item.title }}</div>
                <div class="tags">
                 <van-tag
  v-for="tag in item.tags"
  :key="tag"
  color="#FF5BA5"
  :style="{ fontSize: '3.2vw' }"
>
  {{ tag }}
</van-tag>
                </div>
                <div class="meta-bar">
                  <span>阅读: {{ formatViews(item.views) }}</span>
                  <span>点赞: {{ formatViews(item.likes) }}</span>
                </div>
              </div>
            </div>
          </div>
        </van-swipe-item>
      </van-swipe>

      <!-- 懒加载提示和sentinel，放在scroll-content根层 -->
      <div v-if="isLoading" class="loading-tip">
        <img src="/icons/loading.svg" class="spinner" />
        <div class="loading-text">客官别走，妾身马上就好~</div>
      </div>
      <div v-if="noMore" class="no-more-text">
        客官，妾身被你弄高潮了，扛不住了~
      </div>
      <div ref="sentinel" class="load-more-trigger"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLazyLoad } from '@/composables/useLazyLoad'

// 类型
interface VideoItem {
  id: number
  title: string
  cover: string
  tags: string[]
  views: number
  likes: number
}

// Router
const router = useRouter()
const goBack = () => router.back()

// Tabs
const mainTabs = ['人气榜', '点赞榜', '收藏榜']
const subTabs = ['日榜', '周榜', '月榜', '年榜']

const mainTab = ref<number>(0)
const subTab = ref<number>(0)

const onSubTabClick = (i: number) => {
  subTab.value = i
}
const onSwipeChange = (i: number) => {
  subTab.value = i
}

function getRankType(i: number) {
  if (i === 0) return 'primary'
  if (i === 1) return 'success'
  if (i === 2) return 'warning'
  return 'default'
}

function getRankStyle(i: number) {
  if (i === 0) {
    return {
      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
      border: '1px solid #FF8C00',
      color: '#fff'
    }
  }
  if (i === 1) {
    return {
      background: 'linear-gradient(45deg, #C0C0C0, #A9A9A9)',
      border: '1px solid #999',
      color: '#fff'
    }
  }
  if (i === 2) {
    return {
      background: 'linear-gradient(45deg, #CD7F32, #A0522D)',
      border: '1px solid #A0522D',
      color: '#fff'
    }
  }
  return {}
}

function formatViews(val: number) {
  if (val >= 10000) return (val / 10000).toFixed(2) + 'w'
  if (val >= 1000) return (val / 1000).toFixed(2) + 'k'
  return val.toString()
}
const allVideos = ref<VideoItem[]>([
  {
    id: 1,
    title: '妹妹躲房间干坏事等哈上课',
    cover: 'https://zh.sydneyssong.net/013/7ab52a0.webp',
    tags: ['粉穴', '稍等', '萨尔'],
    views: 12600,
    likes: 61100,
  },
  {
    id: 2,
    title: '全网独家 萌白',
    cover: 'https://xxx.com/2.jpg',
    tags: ['自拍', '丝袜'],
    views: 8350,
    likes: 59400,
  },
  {
    id: 3,
    title: '妹子在家干坏事等哈上课',
    cover: 'https://zh.sydneyssong.net/013/7ab52a0.webp',
    tags: ['粉穴', '撒啊啊', '顺风车撒'],
    views: 12600,
    likes: 61100,
  },
  {
    id: 4,
    title: '全网独家 萌白',
    cover: 'https://xxx.com/2.jpg',
    tags: ['自拍', '丝袜'],
    views: 8350,
    likes: 59400,
  },
  {
    id: 5,
    title: '高清无水印',
    cover: 'https://xxx.com/3.jpg',
    tags: ['高清', '无水印'],
    views: 4500,
    likes: 32000,
  },
  {
    id: 6,
    title: '妹子在家干坏事等哈上课',
    cover: 'https://zh.sydneyssong.net/013/7ab52a0.webp',
    tags: ['粉穴', '萨达', '打算'],
    views: 12600,
    likes: 61100,
  },
  {
    id: 7,
    title: '全网独家 萌白',
    cover: 'https://xxx.com/2.jpg',
    tags: ['自拍', '丝袜'],
    views: 8350,
    likes: 59400,
  },
  {
    id: 8,
    title: '高清无水印',
    cover: 'https://xxx.com/3.jpg',
    tags: ['高清', '无水印'],
    views: 4500,
    likes: 32000,
  },
  {
    id: 9,
    title: '妹子在家干坏事等哈上课',
    cover: 'https://zh.sydneyssong.net/013/7ab52a0.webp',
    tags: ['粉穴', '萨达', '发'],
    views: 12600,
    likes: 61100,
  },
  {
    id: 10,
    title: '全网独家 萌白',
    cover: 'https://xxx.com/2.jpg',
    tags: ['自拍', '丝袜'],
    views: 8350,
    likes: 59400,
  },
  {
    id: 11,
    title: '高清无水印',
    cover: 'https://xxx.com/3.jpg',
    tags: ['高清', '无水印'],
    views: 4500,
    likes: 32000,
  },
  {
    id: 12,
    title: '妹子在家干坏事等哈上课',
    cover: 'https://zh.sydneyssong.net/013/7ab52a0.webp',
    tags: ['粉穴', '萨达', '大萨达'],
    views: 12600,
    likes: 61100,
  },
  {
    id: 13,
    title: '全网独家 萌白',
    cover: 'https://xxx.com/2.jpg',
    tags: ['自拍', '丝袜'],
    views: 8350,
    likes: 59400,
  },
  {
    id: 14,
    title: '高清无水印',
    cover: 'https://xxx.com/3.jpg',
    tags: ['高清', '无水印'],
    views: 4500,
    likes: 32000,
  }
])
const {
  visibleList,
  isLoading,
  noMore,
  sentinel
}: {
  visibleList: Ref<VideoItem[]>,
  isLoading: Ref<boolean>,
  noMore: Ref<boolean>,
  sentinel: Ref<HTMLElement | null>
} = useLazyLoad(allVideos, {
  batchSize: 10
})
</script>>
<style scoped>
.video-rank-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
}
.header-container {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #fff;
}
.scroll-content {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-mask-image: linear-gradient(black 100%, black 100%);
  mask-image: linear-gradient(black 100%, black 100%);
}
.scroll-content::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

.swipe-content {
  min-height: 133vw; /* 原500px */
}

.loading-tip,
.no-more-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 3.7vw; /*14px*/
  padding: 5.3vw 0; /*20px*/
}

.spinner {
  width: 8vw; /*30px*/
  height: 8vw;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.load-more-trigger {
  height: 13.3vw; /*50px*/
}
.top-banner {
  position: relative;
  width: 100%;
}
.bg-img {
  width: 100%;
  display: block;
  height: 20vw;
  object-fit: cover;
}
.center-img {
  position: absolute;
  bottom: 10.7vw; /*40px*/
  left: 50%;
  width: 26vw;
  transform: translateX(-50%);
}
.back-btn {
  position: absolute;
  top: 2.7vw; /*10px*/
  left: 2.7vw;
  background: rgba(255, 255, 255, 0.6);
  padding: 1.6vw; /*6px*/
  border-radius: 50%;
}
.main-tab-row {
  position: absolute;
  bottom: 1.6vw; /*6px*/
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8vw; /*30px*/
}
.main-tab {
  position: relative;
  font-size: 4vw;
  color: #0e0404;
  padding: 1vw 2vw;
}
.main-tab.active {
  font-weight: bold;
}
.main-tab-indicator {
  position: absolute;
  bottom: -0.5vw; /*-2px*/
  left: 50%;
  transform: translateX(-50%);
  width: 4.2vw; /*16px*/
  height: 0.5vw; /*2px*/
  background: #333;
  border-radius: 0.27vw; /*1px*/
}
.sub-tab-container {
  display: flex;
  justify-content: space-around;
  padding: 2.1vw 0; /*8px*/
  background: #454140;
}
.sub-tab {
  font-size: 3.5vw;
  color: #fff;
  padding: 0.13vw 8vw; /*0.5px (约0) -> 0.13vw, 3px->0.8vw改为8vw给留空间*/
  border-radius: 1.1vw; /*4px*/
  background: rgba(255, 255, 255, 0.1);
}
.sub-tab.active {
  background: #fff;
  color: #3a2a26;
}
.swipe-content {
  min-height: 133vw; /*500px*/
}

/* 一行一条横排卡片 */
.video-item {
  display: flex;
  padding: 1.1vw 2.1vw; /*4px 8px*/
  align-items: flex-start;
  min-height: auto;
}
.thumb {
  position: relative;
  width: 25vw;
  height: calc(25vw * 1.4);
  flex-shrink: 0;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1.1vw; /*4px*/
}
.rank-tag {
  position: absolute;
  top: 1.1vw; /*4px*/
  left: 1.1vw;
  font-size: 4vw;
  border-radius: 1.1vw; /*4px*/
  padding: 0 1.6vw; /*0 6px*/
  line-height: 4.8vw; /*18px*/
  font-weight: bold;
}
.info {
  flex: 1;
  margin-left: 2.7vw; /*10px*/
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 34vw;
}
.title {
  font-size: 4vw;
  font-weight: bold;
  margin-bottom: 1.1vw; /*4px*/
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 1.9vw; /*7px*/
  margin-top: 4vw; /*15px*/
  margin-bottom: 0.8vw; /*3px*/
}
.meta-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 3.5vw;
  color: #888;
  padding-top: 0.5vw; /*2px*/
  margin-top: auto;
}
</style>
