<template>
  <div class="acg-section-wrapper">
    <!-- 横滑模式 -->
    <div v-if="layoutType === 'type1'" class="horizontal-swiper swiper-no-swiping">
      <swiper
        :slides-per-view="2.5"
        :space-between="10"
        :slides-offset-before="2"
        :touchStartPreventDefault="false"
        :nested="true"
        :no-swiping="false"
      >
        <swiper-slide v-for="item in limitedData" :key="item.id">
          <AcgCard
            :id="item.id"
            :cover="item.cover"
            :title="item.name"
            :episodeCount="item.chapter_count"            
            :isSerializing="item.is_serializing"
            :activeTab="activeTab"
            :data="item"
            @item-click="() => handleClick(item)"
          />
        </swiper-slide>
      </swiper>
    </div>

    <!-- 榜单 list -->
    <div v-else-if="layoutType === 'list'" class="novel-list-mode">
      <div v-for="item in limitedData" :key="item.id">
        <AcgCard
          :id="item.id"
          :cover="item.cover"
          :title="item.name"
          :intro="item.description || item.intro"
          :views="item.views"
          :count="item.chapter_count"
          :isSerializing="item.serialization_status"
          :activeTab="activeTab"
          type="list"
          :data="item"
          @item-click="() => handleClick(item)"
        />
      </div>
    </div>

    <!-- 不限制数量 -->
    <div v-else-if="layoutType === 'type5'" class="grid type2">
      <div v-for="item in data" :key="item.id">
        <AcgCard
          :id="item.id"
          :cover="item.cover"
          :title="item.name"
          :episodeCount="item.chapter_count"
          :isSerializing="item.is_serializing"
          :activeTab="activeTab"
          :data="item"
          @item-click="() => handleClick(item)"
        />
      </div>
    </div>

    <!-- 横图视频卡片 -->
    <div v-else-if="layoutType === 'videocard'" class="grid type3">
      <div v-for="item in data" :key="item.id">
        <AcgCard
          :id="item.id"
          :cover="item.cover"
          :title="item.name"
          :views="item.views"
          :duration="item.duration"
          :data="item"
          type="videoGrid"
          @item-click="() => handleClick(item)"
        />
      </div>
    </div>

    <!-- 其他网格 -->
    <div v-else :class="['grid', layoutType]">
      <div v-for="item in limitedData" :key="item.id">
        <AcgCard
          :id="item.id"
          :cover="item.cover"
          :title="item.name"
          :episodeCount="item.chapter_count"
          :isSerializing="item.is_serializing"
          :activeTab="activeTab"
          :data="item"
          @item-click="() => handleClick(item)"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import AcgCard from './AcgCard.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'

interface DataItem {
  id: string | number
  title: string
  name?: string
  cover: string
  is_serializing?: number 
  views?: number
  fav?: number
  episodeCount?: number
  chapter_count?: number
  description?: string
  intro?: string
  duration?: string
  [key: string]: any
}

const props = defineProps<{
  layoutType: string
  data: DataItem[]
  activeTab?: string
}>()

const emit = defineEmits<{
  (e: 'item-click', payload: DataItem): void
}>()

function handleClick(item: DataItem) {
  emit('item-click', item)
}

function formatViews(val: number | string): string {
  const n = Number(val)
  if (isNaN(n)) return String(val)
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

const limitedData = computed<DataItem[]>(() => {
  const limits: Record<string, number> = {
    type1: 10,
    type2: 6,
    type3: 6,
    type4: 9,
    list: 6
  }
  const limit = limits[props.layoutType] ?? props.data.length
  return props.data.slice(0, limit)
})
</script>

<style scoped>
.acg-section-wrapper {
  margin-bottom: 1vw;
  padding: 0 3.2vw;
}

.horizontal-swiper {
  margin: 0;
  padding: 3.2vw 0;
}

.grid {
  display: grid;
  gap: 2.66vw;
}

.novel-list-mode {
  display: flex;
  flex-direction: column;
  gap: 3.2vw;
}

.type2 {
  grid-template-columns: repeat(3, 1fr);
}
.type3 {
  grid-template-columns: repeat(2, 1fr);
}
.type4 {
  grid-template-columns: repeat(3, 1fr);
}
</style>
