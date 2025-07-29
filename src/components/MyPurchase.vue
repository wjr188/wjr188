<template>
  <div class="purchase-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="我的购买" left-arrow @click-left="$router.back()" />

    <!-- 分类横滑标签 -->
    <van-tabs
      v-model:active="activeCategory"
      swipeable
      sticky
      background="#f8f8f8"
      line-width="20px"
      color="#f14b4b"
    >
      <van-tab
        v-for="tab in categories"
        :title="tab.label"
        :key="tab.key"
        :name="tab.key"
      >
        <div class="purchase-list">
          <template v-if="mockData[tab.key] && mockData[tab.key].length > 0">
            <div
              v-for="item in mockData[tab.key]"
              :key="item.id"
              class="purchase-card"
            >
              <div class="card-header">
                <div class="text-box">
                  <div class="title">{{ item.title }}</div>
                  <div class="meta">购买时间：{{ item.time }}</div>
                  <div class="meta">金币消耗：{{ item.coins }} 枚</div>
                </div>
                <van-tag type="danger" v-if="item.paid">已购买</van-tag>
              </div>
            </div>
          </template>

          <!-- 空状态 -->
          <template v-else>
            <van-empty
              description="暂无购买记录"
              image="/icons/empty.webp"
            />
          </template>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface PurchaseItem {
  id: number
  title: string
  time: string
  coins: number
  paid: boolean
}

interface Category {
  label: string
  key: string
}

const activeCategory = ref<string>('video')

const categories: Category[] = [
  { label: '视频', key: 'video' },
  { label: '抖阴', key: 'douyin' },
  { label: 'Only圈视频', key: 'only_video' },
  { label: 'Only圈图片', key: 'only_img' },
  { label: '漫画', key: 'comic' },
  { label: '小说', key: 'novel' },
  { label: '有声', key: 'audio' }
]

const mockData: Record<string, PurchaseItem[]> = {
  video: [
    { id: 1, title: '极品女神在线诱惑', time: '2025-06-01 12:00', coins: 88, paid: true },
    { id: 2, title: '超火热舞合集', time: '2025-06-03 10:30', coins: 66, paid: true }
  ],
  douyin: [],
  only_video: [],
  only_img: [],
  comic: [],
  novel: [],
  audio: []
}
</script>

<style scoped>
.purchase-page {
  background: #f8f8f8;
  min-height: 100vh;
}

.purchase-list {
  padding: 3.7vw; /* 14px */
}

.purchase-card {
  background: #fff;
  border-radius: 3.2vw; /* 12px */
  border: 0.27vw solid #e0c99b; /* 1px */
  padding: 3.7vw; /* 14px */
  margin-bottom: 3.7vw; /* 14px */
  box-shadow: 0 1.07vw 3.2vw rgba(212, 167, 95, 0.2); /* 4px 12px */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.purchase-card:active {
  background-color: #fdf7ed;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2.7vw; /* 10px */
}

.text-box {
  flex: 1;
}

.title {
  font-weight: bold;
  font-size: 4.3vw; /* 16px */
  color: #333;
}

.meta {
  font-size: 3.5vw; /* 13px */
  color: #666;
  margin-top: 1.07vw; /* 4px */
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

::v-deep(.van-tab--active .van-tab__text) {
  font-weight: bold !important;
  font-size: 4.3vw !important; /* 16px */
  color: #f14b4b !important;
}
</style>
