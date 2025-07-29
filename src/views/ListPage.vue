<template>
  <div class="list-page">
    <!-- 吸顶顶部栏 -->
    <van-sticky>
      <div class="page-header">
        <img src="/static/back-arrow.png" class="back-icon" @click="goBack" />
        <span class="cat-title">{{ currentCategory }}</span>
      </div>
      <!-- 横滑Tab -->
      <div class="tob-bar">
        <div
          v-for="(tab, idx) in tabs"
          :key="tab"
          class="tab-item"
          :class="{ active: activeTab === idx }"
          @click="onTabClick(idx)"
        >
          {{ tab }}
        </div>
      </div>
    </van-sticky>

    <!-- 内容区域 -->
    <van-swipe
      ref="swipeRef"
      class="swipe-content"
      :loop="false"
      :show-indicators="false"
      v-model:active="activeTab"
      @change="onSwipeChange"
      touchable
    >
      <van-swipe-item v-for="(tab, tabIndex) in tabs" :key="tab">
        <div class="video-list">
          <div
            class="video-card"
            v-for="item in sortedVideoList"
            :key="item.id"
            @click="goToPlay(item)"
          >
            <div class="thumb-wrap">
              <img :src="item.cover" class="cover" />
              <div class="video-info-bar">
                <span class="views">
                  <svg width="3.7vw" height="3.7vw" style="vertical-align:-0.5vw;"><use xlink:href="#icon-play" /></svg>
                  {{ item.views || '62.6w' }}
                </span>
                <span class="duration">{{ item.duration || '11:59' }}</span>
              </div>
            </div>
            <div class="desc-box">
              <div class="video-title">{{ item.title }}</div>
              <div class="card-bottom">
                <span class="tag" v-if="item.tag">{{ item.tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </van-swipe-item>
    </van-swipe>

    <!-- SVG icons，建议抽成全局组件或引入iconfont，下面写法仅演示！ -->
    <svg style="display:none">
      <symbol id="icon-play" viewBox="0 0 1024 1024"><path fill="#fff" d="M512 0C229.23 0 0 229.23 0 512s229.23 512 512 512 512-229.23 512-512S794.77 0 512 0zm208.94 524.09L418.15 692.65c-16.4 11.3-38.15-0.13-38.15-20.56V351.91c0-20.43 21.75-31.86 38.15-20.56l302.79 168.56c16.4 11.3 16.4 29.83 0 40.18z"/></symbol>
      <symbol id="icon-comment" viewBox="0 0 1024 1024"><path fill="#bbb" d="M512 80c-238.8 0-432 150.3-432 336 0 70.5 32.5 135.7 87.5 188-11.6 53.8-37.2 117.4-60.8 153.8-4.3 6.5 1.3 15.2 9.1 13.3C181.2 753.7 252.7 737.7 286.9 730.2c65.8 31.1 145.2 49.8 233.1 49.8 238.8 0 432-150.3 432-336S750.8 80 512 80z"/></symbol>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchLongVideoByCategory } from '@/api/longVideo.api'
import 'vant/lib/index.css'

const route = useRoute()
const router = useRouter()
const swipeRef = ref()
const currentCategory = computed(() => route.query.cat || '栏目名')
const tabs = ['最多收藏', '最多观看', '最新上架']
const activeTab = ref<number>(0)
const videoList = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const categoryId = Number(route.query.categoryId)
const cacheKey = `list-data-${categoryId}`

// 1. 页面加载时优先读缓存
onMounted(async () => {
  // 滚动恢复
  const from = sessionStorage.getItem('return-from')
  const scroll = sessionStorage.getItem('return-scroll')
  if (from === 'list' && scroll) {
    setTimeout(() => { window.scrollTo({ top: parseInt(scroll), behavior: 'auto' }) }, 50)
    sessionStorage.removeItem('return-from')
    sessionStorage.removeItem('return-scroll')
    sessionStorage.removeItem('return-cat')
  }

  // 强制清理缓存
  sessionStorage.removeItem(`list-data-${categoryId}`)

  if (categoryId) {
    const res = await fetchLongVideoByCategory(categoryId, { page: page.value, pageSize })
    videoList.value = (res.list || []).map(item => ({
      ...item,
      cover: item.cover || item.cover_url
    }))
    sessionStorage.setItem(cacheKey, JSON.stringify(videoList.value))
  }
})

// 2. 分页加载更多时
async function loadMore() {
  page.value += 1
  const res = await fetchLongVideoByCategory(categoryId, { page: page.value, pageSize })
  const newList = (res.list || []).map(item => ({
    ...item,
    cover: item.cover || item.cover_url
  }))
  videoList.value = [...videoList.value, ...newList]
  sessionStorage.setItem(`list-data-${categoryId}`, JSON.stringify(videoList.value))
}

function onTabClick(i: number) {
  activeTab.value = i
  swipeRef.value?.swipeTo(i)
}
function onSwipeChange(i: number) { activeTab.value = i }

const goToPlay = (item: any) => {
  sessionStorage.setItem('return-from', 'list')
  sessionStorage.setItem('return-scroll', window.scrollY.toString())
  sessionStorage.setItem('return-cat', String(currentCategory.value))
  router.push({
    path: `/play/${item.id}`,
    // 如需带参数可加 query
    // query: { title: item.title, cover: item.cover }
  })
}
function goBack() {
  if (window.history.length <= 1) router.push('/')
  else router.back()
}

const sortedVideoList = computed(() => {
  let list = [...videoList.value]
  if (activeTab.value === 0) {
    // 最多收藏
    return list.sort((a, b) => (b.collect ?? 0) - (a.collect ?? 0))
  } else if (activeTab.value === 1) {
    // 最多观看
    return list.sort((a, b) => (b.play ?? 0) - (a.play ?? 0))
  } else if (activeTab.value === 2) {
    // 最新上架（用id倒序）
    return list.sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
  }
  return list
})
</script>

<style scoped>
.list-page {
  background: #fff;
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: 0;
}

/* 顶部标题栏样式 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 13vw;
  border-bottom: 1px solid #f3f1f1;
  background: #fff;
}
.cat-title {
  font-size: 5vw;
  font-weight: 800;
  color: #232323;
  text-align: center;
  letter-spacing: 0.2vw;
  max-width: 80vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1;
  margin: 0 auto;
  flex: 1;
}
.back-icon {
  position: absolute;
  left: 3vw;
  top: 50%;
  transform: translateY(-50%);
  width: 5vw;
  height: 5vw;
  cursor: pointer;
  z-index: 2;
}

/* 横滑tab */
.tob-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 8vw;
  padding: 0;
  background: #f7f6f6;
}
.tab-item {
  flex: 1;
  text-align: center;
  font-size: 4vw;
  color: #888;
  font-weight: 500;
  position: relative;
  cursor: pointer;
  padding-bottom: 1vw;
  padding-top: 1vw;
  transition: color .15s;
  letter-spacing: 0.1vw;
}
.tab-item.active {
  color: #e23d41;
  font-weight: bold;
}
.tab-item.active::after {
  content: "";
  position: absolute;
  left: 50%; bottom: -0.5vw;
  transform: translateX(-50%);
  width: 11vw;
  height: 0.7vw;
  background: #e23d41;
  border-radius: 1vw;
}

/* 内容区卡片列表 */
.swipe-content {
  width: 100vw;
  background: #fff;
  min-height: 50vw;
}
.video-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3vw 2vw;
  padding: 4vw 2vw 0 2vw;
}
.video-card {
  background: #f5f4f4;
  border-radius: 2vw;
  box-shadow: 0 0.4vw 2vw rgba(160,160,160,0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 44vw;
  height: 40vw;     /* 固定高度 */
  min-height: 42vw;
  max-height: 54vw;
  position: relative;
}

/* 封面16:9 */
.thumb-wrap {
  width: 100%;
  aspect-ratio: 16/9;
  background: #e8e8e8;
  border-radius: 2vw 2vw 0 0;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}
.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 2vw 2vw 0 0;
  background: #e8e8e8;
}
.video-info-bar {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 3vw;
  color: #fff;
  padding: 0 2vw 1vw 2vw;
  background: linear-gradient(0deg,rgba(34,34,34,0.80),rgba(34,34,34,0.10) 85%);
  border-radius: 0 0 2vw 2vw;
}

/* 标题和标签布局 */
.desc-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5vw 2vw 1vw 2vw;    /* 上下都留空间，标题上移 */
  min-height: 12vw;              /* 自行调整紧凑度 */
}

.video-title {
  font-size: 3.3vw;
  color: #303030;
  font-weight: 550;
  line-height: 1.25;
  margin-bottom: 0;        /* 不要额外下间距 */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 8vw;        /* 两行高度 */
  max-height: 8vw;
  /* 可以加点padding-top让标题更靠上，比如： */
  /* padding-top: 0.3vw; */
}

.card-bottom {
  display: flex;
  align-items: center;
  gap: 2vw;
  margin-top: 2vw;           /* 紧贴标题下方 */
  padding-bottom: 0.3vw;   /* 让标签和评论不贴底 */
}

.tag {
  background: #e23d41;
  color: #fff;
  font-size: 3vw;
  border-radius: 0.7vw;
  padding: 0.4vw 2vw 1vw 2vw;
  margin-right: 1vw;
  font-weight: 500;
  display: inline-block;
  line-height: 1;
}
</style>
