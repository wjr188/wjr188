<template>
  <div class="acg-anime-wrapper">
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
          @item-click="goToPlay"
        />
      </div>

      <div v-if="visibleList.length === 0 && !isLoading" class="empty-data-message">
        <p>该分类暂无动漫数据或数据加载失败...</p>
      </div>
      <div v-if="isLoading" class="loading-tip">
        <img src="/icons/loading.svg" alt="加载中..." class="custom-spinner" />
        <div class="loading-text">客官别走，妾身马上就好~</div>
      </div>
      <div v-if="noMore && visibleList.length > 0" class="no-more-text">
        客官，妾身被你弄高潮了，扛不住了~
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

const router = useRouter()

interface AnimeItem {
  id: string | number
  videoUrl: string
  title: string
  cover: string
  tags: string[]
  views: number
}

const props = defineProps<{
  animes: any[]
  categoryTitle: string
  activeTab: '漫画' | '动漫' | '小说' | '有声'
  activeSubCategory: string
  scrollContainerRef: Ref<HTMLElement | null>
  onContentUpdated?: () => void
}>()

// 返回当前路径
function getCurrentFullPath() {
  return window.location.pathname + window.location.search
}

// 跳转播放页
async function goToPlay(item: AnimeItem) {
  // 保存滚动
  if (props.scrollContainerRef?.value) {
    const scrollTop = props.scrollContainerRef.value.scrollTop
    const key = `acg-scroll-${props.activeTab}-${props.activeSubCategory}`
    sessionStorage.setItem(key, scrollTop.toString())
  }

  sessionStorage.setItem('acg-return-from', getCurrentFullPath())
  sessionStorage.setItem('acg-return-tab', props.activeTab || '')
  sessionStorage.setItem('acg-return-sub', props.activeSubCategory || '')

  // 动态加载详情数据
  const module = await import(`@/mock/acg/anime/${item.id}.js`)
  const animeData: AnimeItem = module.default

  router.push({
    name: 'PlayPage',
    query: {
      id: animeData.id,
      src: encodeURIComponent(animeData.videoUrl),
      title: animeData.title,
      cover: animeData.cover,
      tags: JSON.stringify(animeData.tags),
      views: animeData.views
    }
  })
}

// 懒加载数据
const allModules = computed(() => props.animes || [])

const {
  visibleList,
  isLoading,
  noMore,
  sentinel,
  loadUntil
} = useLazyLoad(allModules, {
  batchSize: 2,
  namespace: 'anime-category',
  uniqueProps: {
    tab: props.activeTab || '',
    sub: props.activeSubCategory || ''
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
    })
  }
})
</script>
<style scoped>
.acg-anime-wrapper {
  background: #f8f8f8;
  min-height: calc(100vh - 37.33vw - 16vw); /* 140px+60px */
}

.content-container {
  max-width: 200vw; /* 750px */
  margin: 0 auto;
}

.recommend-module {
  margin-bottom: 0;
}

.loading-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5.33vw 0; /* 20px */
  font-size: 3.73vw; /* 14px */
}

.custom-spinner {
  width: 9.33vw;  /* 35px */
  height: 9.33vw;
  margin-bottom: 2.13vw; /* 8px */
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  margin: 5.33vw 0; /* 20px */
}

.load-more-trigger {
  height: 13.33vw; /* 50px */
  margin-top: 5.33vw; /* 20px */
}

.empty-data-message {
  text-align: center;
  padding: 8vw; /* 30px */
  color: #999;
  font-size: 4.26vw; /* 16px */
}
</style>
