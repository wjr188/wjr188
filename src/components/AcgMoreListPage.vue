<template>
  <div class="more-list-wrapper">
    <div class="top-bar">
      <img src="/icons/back3.svg" class="back-icon" @click="goBack" />
      <div class="title-wrapper"><span class="title">{{ pageTitle }}</span></div>
    </div>

    <div class="scroll-content">
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
      <!-- 触发分页的锚点，只在还有更多数据时渲染 -->
      <div v-if="!noMore" ref="sentinel" class="load-more-trigger"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AcgCard from '@/components/AcgCard.vue'
import { useComicCategoryStore } from '@/store/comicCategoryStore'
import { useNovelCategoryStore } from '@/store/novelStore'

const comicStore = useComicCategoryStore()
const novelStore = useNovelCategoryStore()
const router = useRouter()

// 从 sessionStorage 获取保存的值
const pageTitle = ref(sessionStorage.getItem('acg-return-sub') || '推荐')
const groupId = ref<number | null>(sessionStorage.getItem('groupId') ? Number(sessionStorage.getItem('groupId')) : null)
const subCategoryId = ref<number | null>(sessionStorage.getItem('subCategoryId') ? Number(sessionStorage.getItem('subCategoryId')) : null)
const isNovel = ref(sessionStorage.getItem('type') === 'novel') // 从 sessionStorage 获取类型


// 其他常规数据
const items = ref<any[]>([])
const isLoading = ref(false)
const noMore = ref(false)
const page = ref(1)
const total = ref(0)
const sentinel = ref<HTMLDivElement | null>(null)

// 加载数据
async function loadMore() {
  if (isLoading.value || noMore.value) return
  isLoading.value = true

  let res
  if (groupId.value && !subCategoryId.value) {
    // 推荐页：只有 groupId 存在时，才加载推荐组数据
    if (isNovel.value) {
      res = await novelStore.loadRecommendGroupNovels(groupId.value, { page: page.value, pageSize: 15 })
    } else {
      res = await comicStore.loadRecommendGroupComics(groupId.value, { page: page.value, pageSize: 15 })
    }
  } else if (subCategoryId.value) {
    // 子分类页：只有 subCategoryId 存在时，加载子分类数据
    res = await comicStore.loadSubCategoryComics(subCategoryId.value, { page: page.value, pageSize: 15 })
  } else {
    res = { list: [], total: 0 }
  }

  const list = res?.list || []
  total.value = res?.total || 0
  if (page.value === 1) items.value = list
  else items.value = items.value.concat(list)
  if (items.value.length >= total.value || list.length < 15) noMore.value = true
  page.value++
  isLoading.value = false
}


let observer: IntersectionObserver | null = null

onMounted(async () => {
  pageTitle.value = sessionStorage.getItem('moduleTitle') || '默认标题';
  await loadMore()
  await nextTick()

  // 恢复滚动位置
  const savedScroll = sessionStorage.getItem('more-scroll-top')
  if (savedScroll) {
    window.scrollTo(0, parseInt(savedScroll))
    sessionStorage.removeItem('more-scroll-top')
  }

  // 初始化 IntersectionObserver 来监听滚动底部
  observer = new window.IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore() // 当触底时，加载更多
      }
    },
    { root: null, threshold: 0.1 } // 设置阈值，10% 进入视口时触发
  )

  if (sentinel.value && observer) {
    observer.observe(sentinel.value)  // 监听 sentinel 元素
  }
})

onUnmounted(() => {
  if (observer && sentinel.value) observer.unobserve(sentinel.value)
  observer = null
})

function goBack() {
  router.back()
}

function goToDetail(item: any) {
  let id = item.id || item.comic_id || item.novel_id
  if (!id) {
    alert('数据异常，无法跳转详情')
    return
  }
  router.push({ name: isNovel.value ? 'NovelDetail' : 'ComicDetail', params: { id } })
}
</script>

<style scoped>
/* 样式不变 */
.more-list-wrapper {
  background: #f8f8f8;
  height: 100vh;
  display: flex;
  flex-direction: column;
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
.scroll-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
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
