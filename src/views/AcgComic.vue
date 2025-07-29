<template>
  <div class="acg-comic-wrapper">
    <div class="content-container">
      <div v-for="module in allModules" :key="module.id" class="recommend-module">
  <div class="module-title">
   <div class="left-title">
  <!-- 用 module.icon 字段自动渲染 -->
  <img
    v-if="module.icon"
    :src="`/icons/${module.icon}`"
    class="icon"
    :alt="module.moduleTitle"
    @error="e => (e.target.style.display='none')" 
  />
  {{ module.moduleTitle }}
</div>

    <div class="more-btn" @click="goMore(module)">
      <span>更多</span>
      <img src="/icons/more-arrow.svg" class="arrow-icon" />
    </div>
  </div>
  <AcgSection
    :layoutType="module.layoutType"
    :data="module.items"
    @item-click="goToDetail"
  />
</div>

<!-- 判空逻辑修改： -->
<div v-if="allModules.length === 0 && !isLoading" class="empty-data-message">
  <p>该分类暂无漫画数据或数据加载失败...</p>
</div>

      <div v-if="isLoading" class="loading-tip">
        <img src="/icons/loading.svg" alt="加载中..." class="custom-spinner" />
        <div class="loading-text">客官别走，妾身马上就好~</div>
      </div>
      <div v-if="noMore && visibleList.length > 0" class="no-more-text">
        客官，妾身被你弄高潮了，扛不住了 ~
      </div>
      <div ref="sentinel" class="load-more-trigger"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onActivated, onDeactivated, nextTick, Ref } from 'vue'
import { useComicCategoryStore } from '@/store/comicCategoryStore'
import AcgSection from '@/components/AcgSection.vue'
import { useRouter } from 'vue-router'
import { useLazyLoad } from '@/composables/useLazyLoad'

interface ComicItem {
  id: string | number;
  [key: string]: any;
}
interface ComicModule {
  id?: string | number;
  moduleTitle: string;
  layoutType: number;
  items: ComicItem[];
}
interface Props {
  categoryTitle: string
  activeTab: string
  activeSubCategory: string
  scrollContainerRef: Ref<HTMLElement | null>
  parentCategoryId: number
}
const props = defineProps<Props>()
const router = useRouter()
const categoryStore = useComicCategoryStore()

const mainCategory = computed(() =>
  categoryStore.mainCategories.find(c => c.name === props.categoryTitle)
)

// ====== 关键修改点（subCategoriesMap用法）======
const allModules = computed(() => {
  if (!mainCategory.value) return []
  const subCategories = categoryStore.getSubCategories(mainCategory.value.id)
  return subCategories.map(sub => ({
    id: sub.id,
    moduleTitle: sub.name,
    layoutType: sub.layout_type || 'type1',
    icon: sub.icon || '',         // <<--- 加这一行
    items: sub.comics || []
  }))
})


// ====== ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

// 如果用 useLazyLoad（分页滚动），可以这样写：
const { visibleList, isLoading, noMore, sentinel } = useLazyLoad(allModules, {
  batchSize: 2,
  customScrollRoot: props.scrollContainerRef
})

function getCurrentFullPath(): string {
  return window.location.pathname + window.location.search;
}
function saveScrollTop() {
  if (props.scrollContainerRef?.value) {
    const scrollTop = props.scrollContainerRef.value.scrollTop
    const key = `acg-scroll-comic-${props.categoryTitle}`
    sessionStorage.setItem(key, scrollTop.toString())
  }
}

function goToDetail(item: ComicItem) {
  saveScrollTop();
  sessionStorage.setItem('acg-return-from', getCurrentFullPath());
  sessionStorage.setItem('acg-return-tab', props.activeTab);
  sessionStorage.setItem('acg-return-sub', props.activeSubCategory);
  router.push({
    name: 'ComicDetail',
    params: { id: item.id, source: props.categoryTitle }
  });
}
function goMore(module: ComicModule) {
  // 有内容才允许跳转
  if (module.items && module.items.length > 0) {
    saveScrollTop(); // 保存滚动位置
    // 存储相关参数到 sessionStorage
    sessionStorage.setItem('acg-return-from', getCurrentFullPath());
    sessionStorage.setItem('acg-return-tab', props.activeTab);
    sessionStorage.setItem('acg-return-sub', props.activeSubCategory);
    sessionStorage.setItem('moduleTitle', module.moduleTitle);  // 存储模块标题
    sessionStorage.setItem('subCategoryId', module.id.toString());   // 存储模块ID
    sessionStorage.setItem(`scroll-pos-${module.moduleTitle}`, props.scrollContainerRef?.value?.scrollTop?.toString() || '0');  // 存储滚动位置
// 💥 关键：明确标记类型是 comic
  sessionStorage.setItem('type', 'comic')
    // 跳转到 AcgMoreListPage 页面，不带 query 参数
    router.push({
      name: 'AcgMoreListPage', // 路由名称
    });
  } else {
    console.warn(`模块 ${module.moduleTitle} 没有更多内容或数据为空.`);
  }
}

onActivated(() => {
  const scrollKey = `acg-scroll-comic-${props.categoryTitle}`;
  const savedScrollTop = sessionStorage.getItem(scrollKey);
  if (props.scrollContainerRef?.value && savedScrollTop) {
    let tryCount = 0;
    let lastHeight = 0;
    function tryRestore() {
      if (!props.scrollContainerRef?.value) return;
      const el = props.scrollContainerRef.value;
      if (el.scrollHeight !== lastHeight && el.scrollHeight > 0) {
        el.scrollTop = parseInt(savedScrollTop, 10);
        lastHeight = el.scrollHeight;
      }
      tryCount++;
      if (tryCount < 20) setTimeout(tryRestore, 40);
    }
    tryRestore();
  }
});
onDeactivated(() => {})

</script>




<style scoped>
.acg-comic-wrapper {
  background: #f8f8f8;
}
.content-container {
  max-width: 200vw;
  margin: 0 auto;
  padding-bottom: 5.33vw;
}
.left-title {
  display: flex;
  align-items: center;
}
.icon {
  width: 5.33vw;
  height: 5.33vw;
  margin-right: 1.6vw;
}
.recommend-module {
  margin-bottom: 0;
}
.module-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 1.33vw 2.13vw;
  font-size: 4.26vw;
  font-weight: bold;
  color: #333;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.more-btn {
  font-size: 3.2vw;
  color: #ff6699;
  padding: 0.8vw 1.33vw;
  border: 0.53vw solid #ff6699;
  border-radius: 1.33vw;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 1.06vw;
  transition: 0.3s;
  background: #fff;
  font-weight: 600;
  box-shadow: 0 0.53vw 1.06vw rgba(0,0,0,0.1);
  margin-right: 2.66vw;
  white-space: nowrap;
  max-width: 19.2vw;
  overflow: hidden;
}
.more-btn:hover {
  background: #ff6699;
  color: #fff;
}
.arrow-icon {
  width: 2.66vw;
  height: 2.66vw;
}
.empty-data-message {
  text-align: center;
  padding: 13.3vw;
  color: #999;
  font-size: 4.26vw;
}
.loading-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5.33vw 0;
  font-size: 3.73vw;
}
.custom-spinner {
  width: 9.33vw;
  height: 9.33vw;
  margin-bottom: 2.13vw;
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
  height: 13.3vw;
  margin-top: 5.33vw;
}
</style>
