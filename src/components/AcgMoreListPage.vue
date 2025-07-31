<template>
  <div class="more-list-wrapper">
    <div class="top-bar">
      <img src="/icons/back3.svg" class="back-icon" @click="goBack" />
      <div class="title-wrapper"><span class="title">{{ pageTitle }}</span></div>
    </div>

    <div class="scroll-content" ref="scrollContent">
      <div class="card-list">
        <AcgCard
          v-for="item in items"
          :key="item.id"
          :data="item"
          @click="goToDetail(item)"
        />
      </div>
      <div v-if="isLoading" class="loading-tip">
        <img src="/icons/loading.svg" alt="加载中..." class="custom-spinner" />
        <div class="loading-text">客官别走，妾身马上就好~</div>
      </div>
      <div v-if="noMore && items.length > 0" class="no-more-text">
        客官，妾身被你弄高潮了，扛不住了 ~
      </div>
      <div v-if="!noMore" ref="sentinel" class="load-more-trigger"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import AcgCard from '@/components/AcgCard.vue'
import { useComicCategoryStore } from '@/store/comicCategoryStore'
import { useNovelCategoryStore } from '@/store/novelStore'

// Store 和 Router 初始化
const comicStore = useComicCategoryStore()
const novelStore = useNovelCategoryStore()
const router = useRouter()

// 数据声明
const pageTitle = ref(sessionStorage.getItem('acg-return-sub') || '推荐')
const groupId = ref<number | null>(
  sessionStorage.getItem('groupId') ? Number(sessionStorage.getItem('groupId')) : null
)
const subCategoryId = ref<number | null>(
  sessionStorage.getItem('subCategoryId') ? Number(sessionStorage.getItem('subCategoryId')) : null
)
const isNovel = ref(sessionStorage.getItem('type') === 'novel')

const items = ref<any[]>([])
const isLoading = ref(false)
const noMore = ref(false)
const page = ref(1)
const total = ref(0)
const sentinel = ref<HTMLDivElement | null>(null)
const scrollContent = ref<HTMLElement | null>(null)

// 数据加载
async function loadMore() {
  if (isLoading.value || noMore.value) return
  isLoading.value = true

  let res
  if (groupId.value && !subCategoryId.value) {
    res = isNovel.value
      ? await novelStore.loadRecommendGroupNovels(groupId.value, { page: page.value, pageSize: 15 })
      : await comicStore.loadRecommendGroupComics(groupId.value, { page: page.value, pageSize: 15 })
  } else if (subCategoryId.value) {
    res = await comicStore.loadSubCategoryComics(subCategoryId.value, { page: page.value, pageSize: 15 })
  } else {
    res = { list: [], total: 0 }
  }

  const list = res?.list || []
  total.value = res?.total || 0
  items.value = page.value === 1 ? list : [...items.value, ...list]
  noMore.value = items.value.length >= total.value || list.length < 15
  page.value++
  isLoading.value = false
}

// 保存滚动位置
function saveScrollPosition() {
  const scrollPosition = scrollContent.value?.scrollTop || window.scrollY
  sessionStorage.setItem('acg-more-scroll-top', scrollPosition.toString())
}

// 恢复滚动位置
async function restoreScrollPosition() {
  await nextTick()
  const savedScroll = sessionStorage.getItem('acg-more-scroll-top')
  if (!savedScroll) return

  requestAnimationFrame(() => {
    const position = parseInt(savedScroll, 10)
    if (scrollContent.value) {
      scrollContent.value.scrollTop = position
    } else {
      window.scrollTo(0, position)
    }
    sessionStorage.removeItem('acg-more-scroll-top')
  })
}

// 跳转详情页
function goToDetail(item: any) {
  const id = item.id || item.comic_id || item.novel_id
  if (!id) {
    alert('数据异常，无法跳转详情')
    return
  }

  saveScrollPosition()
  sessionStorage.setItem('acg-return-from', JSON.stringify({ name: 'AcgMoreListPage' }))
  
  router.push({ 
    name: isNovel.value ? 'NovelDetail' : 'ComicDetail',
    params: { id } 
  })
}

// 返回
function goBack() {
  const entryPath = sessionStorage.getItem('more-entry-path')
  const moreScroll = sessionStorage.getItem('acg-more-scroll-top')
  sessionStorage.removeItem('more-entry-path')
  sessionStorage.removeItem('acg-more-scroll-top')
  
  if (entryPath) {
    router.replace(entryPath).then(() => {
      setTimeout(() => {
        window.scrollTo(0, parseInt(moreScroll || '0', 10))
      }, 0)
    })
  } else {
    router.replace('/')
  }
}

// 初始化 IntersectionObserver
let observer: IntersectionObserver | null = null
function initObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    },
    { root: null, threshold: 0.1 }
  )
  if (sentinel.value) observer.observe(sentinel.value)
}

// 生命周期
onMounted(async () => {
  pageTitle.value = sessionStorage.getItem('moduleTitle') || '默认标题'
  await loadMore()
  await restoreScrollPosition()
  initObserver()
})

onActivated(async () => {
  await restoreScrollPosition()
})

onUnmounted(() => {
  if (observer && sentinel.value) {
    observer.unobserve(sentinel.value)
    observer.disconnect()
  }
})
</script>

<style scoped>
.more-list-wrapper {
  background: #f8f8f8;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.scroll-content {
  flex: 1;
  width: 100%;
  overflow-y: scroll; /* 必须保留scroll而非auto，否则部分浏览器不生效 */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox隐藏滚动条 */
}

/* Chrome/Safari隐藏滚动条 */
.scroll-content::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  background: transparent;
}
.top-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  height: 13.3vw;
  padding: 0 3.2vw;
}

.back-icon {
  position: absolute;
  left: 3.2vw;
  width: 6.9vw;
  height: 6.9vw;
  z-index: 20;
}

.title-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  font-size: 5.3vw;
  font-weight: bold;
  color: #333;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3.2vw;
  padding: 3.2vw;
  width: 100%;
  box-sizing: border-box;
}

.loading-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5.3vw 0;
  font-size: 3.7vw;
}

.custom-spinner {
  width: 9.3vw;
  height: 9.3vw;
  margin-bottom: 2.1vw;
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
  font-size: 3.73vw;
  margin: 5.33vw 0;
}

.load-more-trigger {
  height: 2px;
  margin: 0;
  background: transparent;
}
</style>