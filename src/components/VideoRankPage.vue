<template>
  <div class="video-rank-page">
    <div class="header-container">
      <!-- 顶部背景 -->
      <div class="top-banner">
        <img src="/static/1234.png" class="bg-img" />
        <img src="/static/shipinbandan.png" class="center-img" />
        <div class="back-btn" @click="goBack">
          <van-icon name="arrow-left" size="25" color="#333" />
        </div>
        <!-- 一级Tab -->
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

      <!-- 二级Tab -->
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

    <!-- 内容横滑 -->
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
              <div class="footer-bar">
                <div class="views">
                  <img src="/icons/play4.svg" class="play-icon" />
                  {{ formatViews(item.views) }}
                </div>
                <div class="duration">{{ item.duration }}</div>
              </div>
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
                  color="#ff4b4b"
                  :style="{ fontSize: '3.2vw' }"
                >
                  {{ tag }}
                </van-tag>
              </div>
              <div class="meta-bar">
                <span class="date">{{ item.date }}</span>
                <span class="likes">点赞量: {{ formatViews(item.likes) }}</span>
              </div>
            </div>
          </div>
        </div>
      </van-swipe-item>
    </van-swipe>

    <!-- 懒加载提示 -->
    <div v-if="isLoading" class="loading-tip">
      <img src="/icons/loading.svg" class="spinner" />
      <div class="loading-text">客官别走，妾身马上就好~</div>
    </div>
    <div v-if="noMore" class="no-more-text">
      客官，妾身被你弄高潮了，扛不住了~
    </div>
    <div ref="sentinel" class="load-more-trigger"></div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLazyLoad } from '@/composables/useLazyLoad'

// 一级、二级Tab内容
const mainTabs = ['人气榜', '点赞榜', '收藏榜']
const subTabs = ['日榜', '周榜', '月榜', '年榜']

// 当前选中的tab
const mainTab = ref<number>(0)
const subTab = ref<number>(0)

// 路由
const router = useRouter()
const goBack = (): void => router.back()

// 二级Tab点击
const onSubTabClick = (i: number): void => {
  subTab.value = i
}

// swipe切换
const onSwipeChange = (i: number): void => {
  subTab.value = i
}

// 排行榜样式
function getRankType(i: number): 'default' | 'primary' | 'success' | 'danger' | 'warning' {
  if (i === 0) return 'primary'
  if (i === 1) return 'success'
  if (i === 2) return 'warning'
  return 'default'
}


function getRankStyle(i: number): Record<string, string> {
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

// 格式化数字
function formatViews(val: number): string {
  if (val >= 10000) return (val / 10000).toFixed(2) + 'w'
  if (val >= 1000) return (val / 1000).toFixed(2) + 'k'
  return val.toString()
}

// 视频项类型
interface VideoItem {
  id: number
  title: string
  cover: string
  duration: string
  tags: string[]
  views: number
  likes: number
  date: string
}

// 所有视频
const allVideos = ref<VideoItem[]>([
  // 这里14条示例
  {
    id: 1,
    title: '妹妹躲房间干坏事等哈上课',
    cover: 'https://zh.sydneyssong.net/013/7ab52a0.webp',
    duration: '16:00',
    tags: ['粉穴', '潮喷', '萝莉'],
    views: 12600,
    likes: 61100,
    date: '2025-01-23'
  },
  {
    id: 2,
    title: '全网独家 萌白',
    cover: 'https://xxx.com/2.jpg',
    duration: '25:25',
    tags: ['自拍', '丝袜'],
    views: 8350,
    likes: 59400,
    date: '2024-04-17'
  },
  // ...继续补足到14条，跟你原来的数据保持一致
  {
    id: 3,
    title: '高清无水印',
    cover: 'https://xxx.com/3.jpg',
    duration: '12:45',
    tags: ['高清', '无水印'],
    views: 4500,
    likes: 32000,
    date: '2024-04-20'
  },
  {
    id: 4,
    title: '最新爆款视频',
    cover: 'https://xxx.com/4.jpg',
    duration: '18:30',
    tags: ['爆款', '热播'],
    views: 9800,
    likes: 75000,
    date: '2024-04-22'
  },
  {
    id: 5,
    title: '超清画质新片',
    cover: 'https://xxx.com/5.jpg',
    duration: '22:10',
    tags: ['超清', '新片'],
    views: 12000,
    likes: 89000,
    date: '2024-04-25'
  },
  {
    id: 6,
    title: '搞笑合集：让你笑到停不下来',
    cover: 'https://xxx.com/6.jpg',
    duration: '15:15',
    tags: ['搞笑', '合集'],
    views: 11000,
    likes: 75000,
    date: '2024-04-28'
  },
  {
    id: 7,
    title: '感人故事：催人泪下的瞬间',
    cover: 'https://xxx.com/7.jpg',
    duration: '20:05',
    tags: ['感人', '故事'],
    views: 13000,
    likes: 90000,
    date: '2024-04-30'
  },
  {
    id: 8,
    title: '旅行日志：探索世界的美好',
    cover: 'https://xxx.com/8.jpg',
    duration: '30:00',
    tags: ['旅行', '日志'],
    views: 15000,
    likes: 102000,
    date: '2024-05-02'
  },
  {
    id: 9,
    title: '音乐精选：心灵的旋律',
    cover: 'https://xxx.com/9.jpg',
    duration: '28:45',
    tags: ['音乐', '精选'],
    views: 12500,
    likes: 72000,
    date: '2024-05-05'
  },
  {
    id: 10,
    title: '科技前沿：未来已来',
    cover: 'https://xxx.com/10.jpg',
    duration: '35:20',
    tags: ['科技', '前沿'],
    views: 14000,
    likes: 85000,
    date: '2024-05-07'
  },
  {
    id: 11,
    title: '新片11',
    cover: 'https://xxx.com/11.jpg',
    duration: '10:00',
    tags: ['剧情'],
    views: 9000,
    likes: 54000,
    date: '2024-05-08'
  },
  {
    id: 12,
    title: '新片12',
    cover: 'https://xxx.com/12.jpg',
    duration: '14:30',
    tags: ['动作'],
    views: 8700,
    likes: 47000,
    date: '2024-05-09'
  },
  {
    id: 13,
    title: '新片13',
    cover: 'https://xxx.com/13.jpg',
    duration: '22:15',
    tags: ['冒险'],
    views: 9100,
    likes: 60000,
    date: '2024-05-10'
  },
  {
    id: 14,
    title: '新片14',
    cover: 'https://xxx.com/14.jpg',
    duration: '19:50',
    tags: ['悬疑'],
    views: 8200,
    likes: 51000,
    date: '2024-05-11'
  }
])
const {
  visibleList,
  isLoading,
  noMore,
  sentinel
} = useLazyLoad<VideoItem>(allVideos, {
  batchSize: 10
})
</script>

<style scoped>
.header-container {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #fff;
}

.video-rank-page {
  background: #fff;
  min-height: 100vh;
}
/* 加载中提示 */
.loading-tip,
.no-more-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  padding: 20px 0;
}

/* 加载中动画 */
.spinner {
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 加载中文字 */
.loading-text {
  margin-top: 6px;
  color: #ff5f5f;
  font-weight: 500;
}

/* 没有更多 */
.no-more-text {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin: 20px 0;
}

/* 懒加载触发器（占位元素） */
.load-more-trigger {
  height: 50px;
  margin-top: 10px;
}

.top-banner {
  position: relative;
  width: 100%;
}
.bg-img {
  width: 100%;
  display: block;
  height: 20vw; /* 原80px大概相当20vw */
  object-fit: cover;
}
.center-img {
  position: absolute;
  bottom: 40px;
  left: 50%;
  width: 26vw; /* 原100px大概26vw */
  transform: translateX(-50%);
}

.back-btn {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.6);
  padding: 6px;
  border-radius: 50%;
}

/* 一级Tab放在背景图中 */
.main-tab-row {
  position: absolute;
  bottom: 6px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 30px;
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
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  background: #333;
  border-radius: 1px;
}

/* 二级Tab容器 */
.sub-tab-container {
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  background: #454140;
}
.sub-tab {
  font-size: 3.5vw;
  color: #fff;
  padding: 0.5vw 3vw;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}
.sub-tab.active {
  background: #fff;
  color: #3a2a26;
}

.swipe-content {
  min-height: 500px;
}

.video-item {
  display: flex;
  padding: 4px;
  align-items: flex-start;
}

.thumb {
  position: relative;
  width: 46vw; /* 宽度变为屏幕46%，看起来一样大 */
  height: calc(46vw * 0.6); /* 高度按比例缩放 */
  flex-shrink: 0;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}
.footer-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 2px 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.1);
  border-radius: 0 0 6px 6px;
}
.views {
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 11px;
}
.play-icon {
  width: 14px !important;
  height: 14px !important;
  max-width: none !important;
  flex-shrink: 0;
  object-fit: contain;
}
.duration {
  color: #fff;
  font-size: 11px;
}
.rank-tag {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 11px;
  border-radius: 4px;
  padding: 0 6px;
  line-height: 18px;
  font-weight: bold;
}

.info {
  flex: 1;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 27vw; /* 或根据你需要调整比例 */
}

.title {
  font-size: 4vw;
  font-weight: bold;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tags {
  display: flex;
  font-size: 3vw !important;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}
.meta-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #888;
  padding-top: 4px;
  margin-top: auto; /* 关键: 永远贴底 */
}

</style>
