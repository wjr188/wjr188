<template>
  <div class="acg-audio-wrapper">
    <div class="content-container">
      <!-- 懒加载分页模块 -->
      <div
        v-for="module in visibleList"
        :key="module.id"
        class="recommend-module"
      >
        <AcgSection
          :layoutType="module.layoutType"
          :data="module.items"
          :activeTab="activeTab"
          @item-click="goToDetail"
          @content-updated="onContentUpdated?.()"
        />
      </div>

      <div v-if="visibleList.length === 0 && !isLoading" class="empty-data-message">
        <p>该分类暂无有声数据或数据加载失败...</p>
      </div>
      <div v-if="isLoading" class="loading-tip">
        <img src="/icons/loading.svg" alt="加载中..." class="custom-spinner" />
        <div class="loading-text">客官别走，妾身马上就好~</div>
      </div>
      <div v-if="noMore && visibleList.length > 0" class="no-more-text">
        客官，妾身被你看光了，扛不住了~
      </div>
      <div ref="sentinel" class="load-more-trigger"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import AcgSection from '@/components/AcgSection.vue'
import { useLazyLoad } from '@/composables/useLazyLoad'

// 音频项类型
interface AudioItem {
  id: string | number
  [key: string]: any
}

// 模块类型
interface AudioModule {
  id?: string | number
  moduleTitle: string
  layoutType: number
  items: AudioItem[]
}

// Props类型
const props = defineProps<{
  audios: AudioModule[]
  categoryTitle: string
  activeTab: '漫画' | '动漫' | '小说' | '有声'
  activeSubCategory: string
scrollContainerRef: Ref<HTMLElement | null>
  onContentUpdated?: () => void
}>()

const router = useRouter()

function getCurrentFullPath() {
  return window.location.pathname + window.location.search
}

function saveScrollTop() {
  if (props.scrollContainerRef?.value) {
    const scrollTop = props.scrollContainerRef.value.scrollTop
    const key = `acg-scroll-${props.activeTab}-${props.activeSubCategory}`
    sessionStorage.setItem(key, scrollTop.toString())
  }
}

function goToDetail(item: AudioItem) {
  saveScrollTop()
  sessionStorage.setItem('acg-return-from', getCurrentFullPath())
  sessionStorage.setItem('acg-return-tab', props.activeTab)
  sessionStorage.setItem('acg-return-sub', props.activeSubCategory)
  router.push({
    name: 'AudioPlayer',
    params: { id: item.id }
  })
}

const allModules = computed(() => props.audios || [])

const { visibleList, isLoading, noMore, sentinel } = useLazyLoad(allModules, {
  batchSize: 2,
  namespace: 'audio-category',
  uniqueProps: {
    tab: props.activeTab,
    sub: props.activeSubCategory
  },
  customScrollRoot: props.scrollContainerRef
})

// 恢复滚动
onActivated(() => {
  const scrollKey = `acg-scroll-${props.activeTab}-${props.activeSubCategory}`
  const savedScrollTop = sessionStorage.getItem(scrollKey)
  if (props.scrollContainerRef?.value && savedScrollTop) {
    requestAnimationFrame(() => {
      props.scrollContainerRef!.value!.scrollTop = parseInt(savedScrollTop, 10)
      console.log('[恢复滚动]', scrollKey, savedScrollTop)
    })
  }
})
</script>

<style scoped>
.acg-audio-wrapper {
  background: #f8f8f8;
  min-height: calc(100vh - 37.3vw - 16vw); /* 140 + 60 = 200px */
}
.content-container {
  max-width: 200vw; /* 750px≈200vw */
  margin: 0 auto;
}
.recommend-module {
  margin-bottom: 0;
}
.loading-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5.3vw 0; /* 20px */
  font-size: 3.73vw; /* 14px */
}
.custom-spinner {
  width: 9.3vw;   /* 35px */
  height: 9.3vw;
  margin-bottom: 2.1vw; /* 8px */
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
  font-weight: bold;
  font-size: 3.73vw; /* 14px */
  margin: 5.3vw 0;   /* 20px */
}
.load-more-trigger {
  height: 13.3vw;    /* 50px */
  margin-top: 5.3vw; /* 20px */
}
.empty-data-message {
  text-align: center;
  padding: 8vw;        /* 30px */
  color: #999;
  font-size: 4.26vw;   /* 16px */
}
</style>
