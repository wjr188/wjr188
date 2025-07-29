<template>
  <div class="favorites-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
      title="我的收藏"
      left-arrow
      @click-left="$router.back()"
    >
      <template #right>
        <span class="nav-btn" @click="toggleManage">
          {{ isManaging ? '完成' : '管理' }}
        </span>
      </template>
    </van-nav-bar>

    <!-- 分类横滑标签 -->
    <van-tabs
      v-model:active="activeCategory"
      swipeable
      sticky
      background="#f8f8f8"
      line-width="20px"
      color="#f14b4b"
    >
      <van-tab v-for="tab in categories" :title="tab.label" :key="tab.key" :name="tab.key">
        <div class="favorites-list">
          <!-- 管理状态下显示全选按钮 -->
          <div v-if="isManaging" class="select-actions">
            <span @click="toggleSelectAll">{{ isAllSelected ? '取消全选' : '全选' }}</span>
          </div>

          <!-- 卡片列表 -->
          <template v-if="favorites[tab.key] && favorites[tab.key].length > 0">
            <div
              v-for="item in favorites[tab.key]"
              :key="item.id"
              class="favorite-card"
              :class="{ selected: selectedIds.includes(item.id) }"
              @click="isManaging && toggleItemSelect(item.id)"
            >
              <div class="card-header">
                <div class="title">{{ item.title }}</div>
                <van-icon
                  name="cross"
                  class="delete-icon"
                  v-if="isManaging"
                  @click.stop="removeItem(tab.key, item.id)"
                />
              </div>
              <div class="meta">收藏时间：{{ item.time }}</div>
            </div>
          </template>

          <!-- 空状态 -->
          <template v-else>
            <van-empty
              description="暂无收藏记录"
              image="/icons/empty.webp"
            />
          </template>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { showToast } from 'vant'

/** 分类类型 */
interface Category {
  label: string
  key: string
}

/** 收藏项类型 */
interface FavoriteItem {
  id: number
  title: string
  time: string
}

/** 收藏数据结构 */
type FavoritesMap = Record<string, FavoriteItem[]>

const activeCategory = ref<string>('video')
const isManaging = ref<boolean>(false)
const selectedIds = ref<number[]>([])

const categories: Category[] = [
  { label: '视频', key: 'video' },
  { label: '抖阴', key: 'douyin' },
  { label: 'Only圈视频', key: 'only_video' },
  { label: 'Only圈图片', key: 'only_img' },
  { label: '漫画', key: 'comic' },
  { label: '小说', key: 'novel' },
  { label: '有声', key: 'audio' }
]

const favorites = ref<FavoritesMap>({
  video: [
    { id: 1, title: '性感女神特辑', time: '2025-06-02 15:00' },
    { id: 2, title: 'AI美少女精选', time: '2025-06-04 10:20' }
  ],
  douyin: [],
  only_video: [],
  only_img: [],
  comic: [],
  novel: [],
  audio: []
})

function toggleManage(): void {
  isManaging.value = !isManaging.value
  if (!isManaging.value) {
    selectedIds.value = []
  }
}

function toggleItemSelect(id: number): void {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(item => item !== id)
  } else {
    selectedIds.value.push(id)
  }
}

const isAllSelected = computed<boolean>(() => {
  const currentItems = favorites.value[activeCategory.value] || []
  return currentItems.length > 0 && selectedIds.value.length === currentItems.length
})

function toggleSelectAll(): void {
  const currentItems = favorites.value[activeCategory.value] || []
  const currentIds = currentItems.map(item => item.id)
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = [...currentIds]
  }
}

function removeItem(type: string, id: number): void {
  favorites.value[type] = favorites.value[type].filter(item => item.id !== id)
  selectedIds.value = selectedIds.value.filter(itemId => itemId !== id)
  showToast('已移除该收藏')
}
</script>
<style scoped>
.favorites-page {
  background: #f8f8f8;
  min-height: 100vh;
}

.favorites-list {
  padding: 3.7vw; /* 14px */
}

.select-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2.7vw; /* 10px */
  padding-right: 2.7vw; /* 10px */
  font-size: 3.7vw; /* 14px */
  color: #f14b4b;
  font-weight: bold;
  cursor: pointer;
}

.favorite-card {
  background: #fff;
  border-radius: 3.2vw; /* 12px */
  border: 0.27vw solid #d2a96a; /* 1px */
  padding: 3.7vw; /* 14px */
  margin-bottom: 3.7vw; /* 14px */
  box-shadow: 0 0.53vw 1.6vw rgba(212, 167, 95, 0.1); /* 0 2px 6px */
  position: relative;
}

.favorite-card.selected {
  border-color: #f14b4b;
  box-shadow: 0 0 0 0.53vw rgba(241, 75, 75, 0.2); /* 0 0 0 2px */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.1vw; /* 8px */
}

.title {
  font-weight: bold;
  font-size: 4.3vw; /* 16px */
  color: #333;
}

.meta {
  font-size: 3.5vw; /* 13px */
  color: #666;
  margin-top: 1.1vw; /* 4px */
}

.delete-icon {
  font-size: 4.8vw; /* 18px */
  color: #f14b4b;
  cursor: pointer;
}

::v-deep(.van-nav-bar__title) {
  font-size: 5.1vw !important; /* 19px */
  font-weight: bold !important;
  color: #333 !important;
}

::v-deep(.van-icon-arrow-left) {
  font-size: 6.9vw !important; /* 26px */
  color: #333 !important;
}

::v-deep(.van-tab__text) {
  font-weight: 500;
  font-size: 4vw; /* 15px */
}

::v-deep(.van-tab--active .van-tab__text) {
  color: #f14b4b !important;
  font-size: 4.3vw !important; /* 16px */
  font-weight: bold !important;
}
</style>
