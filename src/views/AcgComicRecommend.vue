<template>
  <div class="acg-comic-recommend-wrapper">
    <div class="content-container">
      <div class="quick-entry-bar swiper-no-swiping">
        <AcgQuickEntryBar />
      </div>

      <div
        v-for="(module, index) in visibleList"
        :key="module.id || index"
        class="recommend-module"
      >
        <div class="module-title">
          <div class="left-title">
            <img
              v-if="module.icon"
              :src="`/icons/${module.icon}`"
              class="icon"
              alt=""
            />
            {{ module.moduleTitle }}
            <img
              v-if="index === 0"
              src="/icons/recommend.svg"
              class="hand-icon"
              alt="推荐"
            />
          </div>
          <div class="more-btn" @click="goMore(module)">
            <span>更多</span>
            <img src="/icons/more-arrow.svg" class="arrow-icon" alt="箭头" />
          </div>
        </div>
        <AcgSection
          :layoutType="module.layoutType"
          :data="module.items"
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
        客官，妾身被你弄高潮了，扛不住了 ~
      </div>
      <div ref="sentinel" class="load-more-trigger"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AcgComicRecommend'
})
import { ref, computed, onMounted, onDeactivated, nextTick, onActivated, Ref } from 'vue'
import { useRouter } from 'vue-router'
import AcgQuickEntryBar from '@/components/AcgQuickEntryBar.vue'
import AcgSection from '@/components/AcgSection.vue'
import { useComicCategoryStore } from '@/store/comicCategoryStore'
import { useLazyLoad } from '@/composables/useLazyLoad'

// 接收 scrollContainerRef 作为 props
const props = defineProps<{ scrollContainerRef: Ref<HTMLElement | null> }>()

const comicStore = useComicCategoryStore()
const router = useRouter()

onMounted(async () => {
  await comicStore.loadAllRecommendGroupsWithComics()
})

const recommendModules = computed(() => {
  return comicStore.allRecommendGroups.map(group => ({
    id: group.id,
    moduleTitle: group.name,
    layoutType: group.layout_type || 'type1',
    icon: group.icon || '',
    items: (group.comics || []).slice(0, 15),
    comicsCount: (group.comics || []).length
  }))
})

const {
  visibleList,
  isLoading,
  noMore,
  sentinel,
} = useLazyLoad(recommendModules, {
  batchSize: 2,
  // customScrollRoot: scrollRef, // 如果你的useLazyLoad支持，建议传
})

// 滚动位置保存 & 恢复
const scrollKey = 'acg-scroll-comic-recommend'
function saveScrollTop() {
  const el = props.scrollContainerRef?.value;
  if (el) {
    const scrollTop = Math.max(0, el.scrollTop); // 确保非负
    if (scrollTop > 0) { // 只保存有效滚动位置
      sessionStorage.setItem(scrollKey, scrollTop.toString());
    }
  }
}
// 滚动恢复逻辑
function restoreScrollTop() {
  const el = props.scrollContainerRef?.value;
  const saved = sessionStorage.getItem(scrollKey);
  
  if (el && saved) {
    const targetPos = parseInt(saved);
    if (targetPos > 0 && el.scrollHeight > el.clientHeight) {
      
      const restoreAttempt = (attempt = 0) => {
        if (attempt >= 5) return; // 最大尝试5次
        
        el.scrollTop = targetPos;
        const currentPos = el.scrollTop;
        
        if (Math.abs(currentPos - targetPos) > 2) {
          setTimeout(() => restoreAttempt(attempt + 1), 50 * (attempt + 1));
        }
      };
      
      // 首次延迟100ms确保内容加载
      setTimeout(() => {
        if (el.scrollHeight > el.clientHeight) {
          restoreAttempt();
        }
      }, 100);
    }
  }
}
onActivated(() => {
  restoreScrollTop()
})

onDeactivated(() => {
  saveScrollTop()
})
function getCurrentFullPath(): string {
  return window.location.pathname + window.location.search
}

function emitSaveScroll() {
  saveScrollTop()
}

function goToDetail(item: any) {
  emitSaveScroll()
  saveScrollTop(); // 确保在跳转前保存
  sessionStorage.setItem('acg-return-from', getCurrentFullPath())
  sessionStorage.setItem('acg-return-tab', '漫画')
  sessionStorage.setItem('acg-return-sub', '推荐')
  router.push({
    name: 'ComicDetail',
    params: { id: item.id },
    query: { type: 'comic' }
  })
}
function goMore(module: any) {
  emitSaveScroll(); // 保存滚动位置
  saveScrollTop(); // 确保在跳转前保存
  // 存储相关参数到 sessionStorage
  sessionStorage.setItem('acg-return-from', getCurrentFullPath());
  sessionStorage.setItem('acg-return-tab', '漫画');
  sessionStorage.setItem('acg-return-sub', module.moduleTitle);
  sessionStorage.setItem('moduleTitle', module.moduleTitle);  // 存储模块标题
  sessionStorage.setItem(`scroll-pos-${module.moduleTitle}`, props.scrollContainerRef?.value?.scrollTop?.toString() || '0');  // 存储滚动位置

  // 存储 groupId，漫画推荐页只使用 groupId
  if (module.id) {
    sessionStorage.setItem('groupId', module.id.toString());  // 存储推荐组ID
    sessionStorage.removeItem('subCategoryId'); // 清除 subCategoryId
  }
// 💥 关键：明确标记类型是 comic
  sessionStorage.setItem('type', 'comic')
  // 跳转到 AcgMoreListPage 页面，不带 query 参数
  router.push({
    name: 'AcgMoreListPage', // 路由名称
  });
}

</script>

<style scoped>
.acg-comic-wrapper {
  background: #f8f8f8;
  height: calc(100vh - 140px - 60px); /* 改为固定高度 */
  overflow-y: auto; /* 关键：启用垂直滚动 */
  position: relative; /* 为子元素定位参考 */
}

.content-container {
  width: 100%; /* 改为100%宽度 */
  min-height: 100%; /* 确保内容撑满 */
  padding-bottom: 20px; /* 留出底部空间 */
}
.quick-entry-bar {
  margin-bottom: 3.2vw;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
.hand-icon {
  width: 28px;
  height: 28px;
  margin-left: 8px;
  vertical-align: middle;
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
.more-btn span {
  font-size: 3.2vw;
  line-height: 1;
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
