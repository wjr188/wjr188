<template>
  <div class="acg-anime-recommend-wrapper">
    <div class="content-container">
      <!-- 模块列表 -->
      <div
        v-for="(module, index) in visibleList"
        :key="module.id || index"
        class="recommend-module"
      >
        <div class="module-title">
          <div class="left-title">
            <img v-if="getModuleIcon(module.id)" :src="getModuleIcon(module.id)" class="icon" alt="" />
            {{ module.moduleTitle }}
            <img v-if="index === 0" src="/icons/recommend.svg" class="recommend-icon" alt="推荐标志" />
          </div>
          <div class="more-btn" @click="goMore(module)">
            <span>更多</span>
            <img src="/icons/more-arrow.svg" class="arrow-icon" alt="箭头" />
          </div>
        </div>
        <AcgSection
          :layoutType="module.layoutType"
          :data="module.items"
          :activeTab="'动漫'"
          @item-click="goToDetail"
        />
      </div>

      <div v-if="visibleList.length === 0 && !isLoading" class="empty-data-message">
        推荐内容正在加载或暂无数据...
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

// 类型：动漫数据项
interface AnimeItem {
  id: number | string
  title?: string
  cover?: string
  videoUrl?: string
  tags?: string[]
  views?: number
}

// 类型：模块
interface Module {
  id?: number
  moduleTitle: string
  layoutType: number
  items: AnimeItem[]
}

// Props
const props = defineProps<{
  animes: Module[]
  categoryTitle: string
  activeTab: '漫画' | '动漫' | '小说' | '有声'
  activeSubCategory: string
  scrollContainerRef: Ref<HTMLElement | null>
  onContentUpdated?: () => void
}>()

const router = useRouter()

// 懒加载
const allModules = computed(() => props.animes || [])

const { visibleList, isLoading, noMore, sentinel } = useLazyLoad(allModules, {
  batchSize: 2,
  namespace: 'anime-recommend',
  customScrollRoot: props.scrollContainerRef,
  uniqueProps: {
    tab: props.activeTab,
    sub: props.activeSubCategory
  }
})

// 模块图标映射
const iconMap: Record<number, string> = {
  1: '/icons/new.svg',
  2: '/icons/hot1.svg',
  3: '/icons/collect.svg',
  4: '/icons/dianzan.svg'
}
function getModuleIcon(moduleId?: number) {
  return moduleId ? iconMap[moduleId] || null : null
}

// 当前路径
function getCurrentFullPath() {
  return window.location.pathname + window.location.search
}

// 保存滚动
function saveScrollTop() {
  if (props.scrollContainerRef?.value) {
    const scrollTop = props.scrollContainerRef.value.scrollTop
    const key = `acg-scroll-${props.activeTab}-${props.activeSubCategory}`
    sessionStorage.setItem(key, scrollTop.toString())
  }
}
function emitSaveScroll() {
  saveScrollTop()
  window.dispatchEvent(new CustomEvent('acg-save-scroll'))
}

// 跳转播放页
async function goToDetail(item: AnimeItem) {
  emitSaveScroll()

  sessionStorage.setItem('acg-return-from', getCurrentFullPath())
  sessionStorage.setItem('acg-return-tab', props.activeTab)
  sessionStorage.setItem('acg-return-sub', props.activeSubCategory)

  const module = await import(`@/mock/acg/anime/${item.id}.js`)
  const animeData = module.default as AnimeItem

  router.push({
    name: 'PlayPage',
    query: {
      id: animeData.id,
      src: encodeURIComponent(animeData.videoUrl || ''),
      title: animeData.title,
      cover: animeData.cover,
      tags: JSON.stringify(animeData.tags || []),
      views: animeData.views?.toString() || '0'
    }
  })
}

// 跳转更多
function goMore(module: Module) {
  if (module.items && module.items.length > 0) {
    emitSaveScroll()
    sessionStorage.setItem('acg-return-from', getCurrentFullPath())
    sessionStorage.setItem('acg-return-tab', props.activeTab)
    sessionStorage.setItem('acg-return-sub', props.activeSubCategory)
    const itemsStr = encodeURIComponent(JSON.stringify(module.items))
    router.push({
      name: 'AcgMoreListPage',
      query: {
        title: module.moduleTitle,
        activeTab: props.activeTab,
        activeSubCategory: props.activeSubCategory,
        items: itemsStr,
        from: getCurrentFullPath()
      }
    })
  } else {
    console.warn(`模块 ${module.moduleTitle} 没有更多内容.`)
  }
}

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
.acg-anime-recommend-wrapper {
  background: #f8f8f8;
  min-height: calc(100vh - 37.33vw - 16vw); /* 140px + 60px -> vw */
}
.content-container {
  max-width: 200vw; /* 如果想最大宽度750px，改为200vw或更小 */
  margin: 0 auto;
}
.recommend-module {
  margin-bottom: 0;
}
.module-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 1.33vw 2.13vw; /* 5px 8px */
  font-size: 4.26vw; /* 16px */
  font-weight: bold;
  color: #333;
}
.left-title {
  display: flex;
  align-items: center;
}
.icon {
  width: 5.33vw;  /* 20px */
  height: 5.33vw;
  margin-right: 1.6vw; /* 6px */
}
.recommend-icon {
  width: 5.33vw;
  height: 5.33vw;
  margin-left: 1.6vw;
}
.more-btn {
  font-size: 3.2vw; /* 12px */
  color: #ff6699;
  padding: 0.8vw 1.33vw; /* 3px 5px */
  border: 0.53vw solid #ff6699; /* 2px */
  border-radius: 1.33vw; /* 5px */
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 1.06vw; /* 4px */
  transition: 0.3s;
  background: #fff;
  font-weight: 600;
  box-shadow: 0 0.53vw 1.06vw rgba(0,0,0,0.1); /* 2px 4px */
  margin-right: 2.66vw; /* 10px */
  white-space: nowrap;
  max-width: 19.2vw; /* 72px */
  overflow: hidden;
}
.more-btn:hover {
  background: #ff6699;
  color: #fff;
}
.arrow-icon {
  width: 2.66vw; /* 10px */
  height: 2.66vw;
}
.empty-data-message {
  text-align: center;
  padding: 8vw; /* 30px */
  color: #999;
  font-size: 4.26vw; /* 16px */
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
  margin: 5.33vw 0; /* 20px */
}
.load-more-trigger {
  height: 13.33vw; /* 50px */
  margin-top: 5.33vw; /* 20px */
}
</style>
