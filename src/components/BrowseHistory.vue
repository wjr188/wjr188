<template>
  <div class="history-page">
    <!-- NavBar固定在页面上 -->
    <van-nav-bar
      title="浏览记录"
      left-arrow
      fixed
      safe-area-inset-top
      @click-left="$router.back()"
    >
      <template #right>
        <span class="nav-btn" @click="toggleManage">
          {{ isManaging ? '完成' : '管理' }}
        </span>
      </template>
    </van-nav-bar>

    <!-- Tabs sticky offset-top = NavBar高度 -->
   <van-tabs
  v-model:active="activeCategory"
  swipeable
  sticky
  offset-top="46"
  background="#f8f8f8"
  line-width="20px"
  color="#f14b4b"
>
  <!-- nav-bottom插槽 -->
  <template #nav-bottom>
    <div v-if="isManaging" class="select-actions">
      <span @click="toggleSelectAll">{{ isAllSelected ? '取消全选' : '全选' }}</span>
      <span class="delete-batch" @click="removeSelected">删除</span>
    </div>
  </template>

  <van-tab
    v-for="tab in categories"
    :title="tab.label"
    :key="tab.key"
    :name="tab.key"
  >
        <!-- 内容 -->
        <div class="history-list">
          <template v-if="groupedRecords[tab.key]?.length">
            <div
              v-for="item in groupedRecords[tab.key]"
              :key="item.id"
              :class="[getCardClass(item.type), { selected: selectedIds.includes(item.id) }]"
              @click="isManaging ? toggleItemSelect(item.id) : handleItemClick(item)"
            >
              <!-- 你的内容保留不变 -->
              <template v-if="item.type === 'video'">
                <div class="video-card-row">
                  <img :src="item.data?.cover" class="video-thumb-row" />
                  <div class="video-text">
                    <div class="video-title">{{ item.data?.title || '无标题视频' }}</div>
                    <div class="video-meta">浏览时间：{{ formatTime(item.time) }}</div>
                  </div>
                </div>
              </template>
              <template v-else-if="['comic', 'novel'].includes(item.type)">
                <img :src="item.data?.cover" class="grid-thumb" />
                <div class="grid-title">{{ item.data?.title || '无标题' }}</div>
                <div class="grid-meta">
                  共{{ item.data?.episodes || 0 }}话 · 上次看到第{{ item.data?.lastRead || 0 }}话
                </div>
              </template>
              <template v-else>
                <img :src="item.data?.cover" class="grid-thumb" />
                <div class="grid-title">{{ item.data?.title || '无标题' }}</div>
                <div class="grid-meta">浏览时间：{{ formatTime(item.time) }}</div>
              </template>

              <van-icon
                name="cross"
                class="delete-icon"
                v-if="isManaging"
                @click.stop="removeItem(item)"
              />
            </div>
          </template>

          <template v-else>
            <div class="empty-wrapper">
              <van-empty description="暂无浏览记录" image="/icons/empty.webp" />
            </div>
          </template>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useRouter } from 'vue-router'
import type { HistoryItem } from '@/store/useHistoryStore'

const historyStore = useHistoryStore()
const router = useRouter()

onMounted(() => {
  historyStore.loadFromLocal()
})

const activeCategory = ref<string>('video')
const isManaging = ref<boolean>(false)
const selectedIds = ref<string[]>([])

// 切换管理模式
const toggleManage = (): void => {
  isManaging.value = !isManaging.value
  if (!isManaging.value) selectedIds.value = []
}

// 选择/取消选择
const toggleItemSelect = (id: string): void => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(item => item !== id)
  } else {
    selectedIds.value.push(id)
  }
}

// 根据类型分组
const groupedRecords = computed<Record<string, HistoryItem[]>>(() => {
  const groups: Record<string, HistoryItem[]> = {
    video: [],
    douyin: [],
    only_video: [],
    only_img: [],
    comic: [],
    novel: [],
    audio: []
  }
  for (const item of historyStore.records) {
    if (groups[item.type]) {
      groups[item.type].push(item)
    }
  }
  return groups
})

// 是否全选
const isAllSelected = computed<boolean>(() => {
  const currentItems = groupedRecords.value[activeCategory.value] || []
  return currentItems.length > 0 && selectedIds.value.length === currentItems.length
})

// 全选/取消全选
const toggleSelectAll = (): void => {
  const currentItems = groupedRecords.value[activeCategory.value] || []
  const currentIds = currentItems.map(item => item.id)
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = [...currentIds]
  }
}

// 删除已选
const removeSelected = (): void => {
  if (selectedIds.value.length === 0) {
    showToast('请先选择要删除的记录')
    return
  }
  selectedIds.value.forEach(id => {
    const item = historyStore.records.find(r => r.id === id)
    if (item) {
      historyStore.removeRecord(item.id, item.type)
    }
  })
  selectedIds.value = []
  showToast('已批量删除')
}

// 删除单条
const removeItem = (item: HistoryItem): void => {
  historyStore.removeRecord(item.id, item.type)
  selectedIds.value = selectedIds.value.filter(id => id !== item.id)
  showToast('已移除该记录')
}

// 分类
interface Category {
  label: string
  key: string
}
const categories: Category[] = [
  { label: '视频', key: 'video' },
  { label: '抖阴', key: 'douyin' },
  { label: 'Only圈图片', key: 'only_img' },
  { label: '漫画', key: 'comic' },
  { label: '小说', key: 'novel' },
  { label: '有声', key: 'audio' }
]

// 判断卡片样式
const getCardClass = (type: string): string => {
  return type === 'video' ? 'history-card' : 'grid-card'
}

// 格式化时间
function formatTime(isoString: string): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 点击跳转
function handleItemClick(item: HistoryItem): void {
  switch (item.type) {
    case 'video':
      router.push({
        path: '/play',
        query: {
          src: encodeURIComponent(item.id),
          title: item.data?.title || '',
          cover: item.data?.cover || ''
        }
      })
      break
    case 'douyin':
      router.push({
        path: '/play-tiktok',
        query: {
          index: '0', // 注意：query要求string
          category: '最新'
        }
      })
      break
    case 'only_img':
      router.push({
        path: `/star-image-detail/${encodeURIComponent(item.id)}`
      })
      break
    case 'comic':
      router.push({
        path: `/comic/${item.id}`
      })
      break
    case 'novel':
      router.push({
        path: `/novel/${item.id}`
      })
      break
    case 'audio':
      router.push({
        path: '/audioDetail',
        query: { id: item.id }
      })
      break
    default:
      showToast('不支持跳转')
  }
}
</script>
<style scoped>
.history-page {
  background: #f8f8f8;
  min-height: 100vh;
  padding-top: 12.3vw; /* 46px */
}
.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 3.2vw;
}
.select-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2.7vw;
  padding-right: 2.7vw;
  font-size: 3.7vw;
  font-weight: bold;
}

.select-actions span {
  color: #f14b4b;
  cursor: pointer;
  margin-left: 3.2vw;
}

/* 视频：一排一个 */
.history-card {
  flex: 1 1 100%;
  background: linear-gradient(135deg, #ffffff, #f8f6f3);
  border-radius: 4.3vw;
  border: 0.27vw solid rgba(220, 220, 220, 0.6);
  padding: 3.2vw;
  box-shadow:
    0 1.1vw 2.1vw rgba(0, 0, 0, 0.05),
    0 0.5vw 1.1vw rgba(0, 0, 0, 0.04);
  position: relative;
}

.history-card.selected {
  border-color: #f14b4b;
  box-shadow: 0 0 0 0.53vw rgba(241, 75, 75, 0.2);
}
.video-card-row {
  display: flex;
  gap: 3.2vw;
  align-items: flex-start;
}
.video-thumb-row {
  width: 53.3vw; /* 200px */
  height: 29.9vw; /* 112px */
  object-fit: cover;
  border-radius: 1.6vw;
}
.video-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.video-title {
  font-weight: bold;
  font-size: 4.3vw;
  color: #333;
  margin-bottom: 1.6vw;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  overflow: hidden;
}

.video-meta {
  font-size: 3.2vw;
  color: #888;
  margin-top: 1.1vw;
}

/* 其他：一排两个 */
.grid-card {
  width: calc(50% - 1.6vw);
  background: linear-gradient(135deg, #ffffff, #f3f2ef);
  border-radius: 3.7vw;
  border: 0.27vw solid rgba(220, 220, 220, 0.6);
  padding: 2.1vw;
  box-sizing: border-box;
  box-shadow:
    0 0.5vw 1.6vw rgba(0, 0, 0, 0.05),
    0 1.1vw 2.7vw rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.grid-card.selected {
  border-color: #f14b4b;
  box-shadow: 0 0 0 0.53vw rgba(241, 75, 75, 0.2);
}
.grid-thumb {
  width: 100%;
  height: 58.7vw; /* 220px */
  object-fit: cover;
  border-radius: 1.6vw;
}
.grid-title {
  font-weight: bold;
  font-size: 3.7vw;
  color: #333;
  margin-top: 1.6vw;
  text-align: center;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.grid-meta {
  font-size: 3.2vw;
  color: #888;
  margin-top: 0.5vw;
  text-align: center;
}

.thumb {
  width: 100%;
  height: 53.3vw; /* 200px */
  object-fit: cover;
  border-radius: 1.6vw;
}

.info .title {
  font-weight: bold;
  font-size: 4vw;
  color: #333;
  text-align: center;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.info .meta {
  font-size: 3.2vw;
  color: #888;
  margin-top: 1.1vw;
}

.delete-icon {
  position: absolute;
  top: 2.1vw;
  right: 2.1vw;
  font-size: 4.8vw;
  color: #f14b4b;
  cursor: pointer;
}
.empty-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* NavBar标题 */
::v-deep(.van-nav-bar__title) {
  font-size: 5.1vw !important;
  font-weight: bold !important;
  color: #333 !important;
  z-index: 999 !important;
}

/* 返回按钮 */
::v-deep(.van-icon-arrow-left) {
  font-size: 6.9vw !important;
  color: #333 !important;
}

/* 标签 */
::v-deep(.van-tab__text) {
  font-weight: 500;
  font-size: 4vw;
}
::v-deep(.van-tab--active .van-tab__text) {
  color: #f14b4b !important;
  font-size: 4.3vw !important;
  font-weight: bold !important;
}

/* select-actions固定高度 */
.select-actions {
  background: #fff;
  padding: 2.1vw 3.2vw;
  border-bottom: 0.27vw solid #eee;
  min-height: 10.7vw; /* 40px */
  box-sizing: border-box;
}

/* 吸顶后撑高度 */
.van-tabs--sticky .van-tabs__wrap::after {
  content: "";
  display: block;
  height: 10.7vw; /* 同上 */
}
</style>
