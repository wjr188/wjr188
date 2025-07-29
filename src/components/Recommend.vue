<template>
  <div class="recommend-page" ref="scrollContainer" @scroll.passive="recordScroll">
    <CategoryBlock
      v-for="(item, index) in visibleList"
      :key="index"
      :category="item"
      @clickItem="emitClickItem"
      @goToMore="emitGoToMore"
    />

    <div v-if="isLoading" class="loading-tip">
      <img src="/icons/loading.svg" alt="加载中..." class="custom-spinner" />
      <div class="loading-text">客官别走，妾身马上就好~</div>
    </div>

    <div v-if="noMore" class="no-more-text">
      客官，妾身被你弄高潮了，扛不住了 ~
    </div>

    <div ref="sentinel" class="load-more-trigger"></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onActivated, nextTick } from 'vue'
import CategoryBlock from './CategoryBlock.vue'
import { useLazyLoad } from '../composables/useLazyLoad'

// ✅ 定义类型
interface SubImage {
  id: number;
  cover: string
  src: string
  title: string
  tag: string
}
interface CategoryItem {
  name: string
  mainId: number   // ✅ 增加 mainId
  mainImage: string
  mainTitle: string
  mainTag: string
  src: string
  subImages: SubImage[]
}

// ✅ emits
const emit = defineEmits<{
  (e: 'clickItem', payload: SubImage): void
  (e: 'goToMore', payload: string): void
}>()

const emitClickItem = (video: SubImage) => emit('clickItem', video)
const emitGoToMore = (categoryName: string) => emit('goToMore', categoryName)

const scrollContainer = ref<HTMLElement | null>(null)
const allList = ref<CategoryItem[]>([
  {
    name: '子分类1',
    mainId: 1, // ✅ 加上
    mainImage: 'https://zh.sydneyssong.net/013/dda436db0c32d2580657ef273fe6ea71/2024042311024817431.webp',
    mainTitle: 'Sexy Sluts Gina, Cindy & Karlee Love Getting Banged By Rich Guy - SCAM ANGELS',
    mainTag: '标签',
    src: 'https://zh.977700.com/1/index.m3u8',
    subImages: [
      { id: 101, cover: 'https://zh.sydneyssong.net/001/000b33569db500b85b83ceb1a82f33fc/2021083100342215629.webp', src: 'https://zh.977700.com/2/index.m3u8', title: '标题1', tag: '标签1' },
      { id: 102, cover: 'https://zh.sydneyssong.net/001/001676424127571863652d41a8c64556/2021113001245014937.webp', src: 'https://zh.977700.com/3/index.m3u8', title: '标题2', tag: '标签2' },
      { id: 103, cover: 'https://zh.sydneyssong.net/001/01edd4c4e921f36770a7c27a9714ea40/2020062413594339811.webp', src: 'https://zh.977700.com/4/index.m3u8', title: '标题3', tag: '标签3' },
      { id: 104, cover: 'https://zh.sydneyssong.net/002/02b131be0441d6c7c60b8170c3dad887/2021120909453178306.webp', src: 'https://zh.977700.com/5/index.m3u8', title: '标题4', tag: '标签4' }
    ]
  },
  {
    name: '官方原创',
    mainId: 2, // ✅ 加上
    mainImage: 'https://zh.sydneyssong.net/002/028b7e6f16015485e199cd6bc9e7bf61/2021072422082566144.webp',
    mainTitle: '标题5',
    mainTag: '标签5',
    src: 'https://zh.977700.com/002/index.m3u8',
    subImages: [
      { id: 201, cover: 'https://zh.sydneyssong.net/015/00969e66a6d39628270dd3f5e5620ff1/2021031021345321006.webp', src: 'https://zh.977700.com/006/index.m3u8', title: '标题6', tag: '标签6' },
      { id: 202, cover: 'https://zh.sydneyssong.net/015/001425c4bcb81687e4c54d851918d875/2021111600384173132.webp', src: 'https://zh.977700.com/007/index.m3u8', title: '标题7', tag: '标签7' },
      { id: 203, cover: 'https://zh.sydneyssong.net/015/08606858fbbf9ff69185f13e8de5c3db/2021101722373843114.webp', src: 'https://zh.977700.com/008/index.m3u8', title: '标题8', tag: '标签8' },
      { id: 204, cover: 'https://zh.sydneyssong.net/015/012230c9b99c105b13f96edae4e0d033/2021100512424782382.webp', src: 'https://zh.977700.com/009/index.m3u8', title: '标题9', tag: '标签9' }
    ]
  },
]);

// ✅ useLazyLoad
const { visibleList, isLoading, noMore, sentinel, loadUntil } = useLazyLoad(allList, {
  batchSize: 2,
  scrollOffset: 200,
  uniqueProps: { page: 'recommend-page' },
  namespace: 'recommend',
})

// ✅ 生成 scroll 存储 key
const getScrollKey = () => `recommend-scroll`

// ✅ 记录滚动
function recordScroll() {
  if (scrollContainer.value) {
    const top = scrollContainer.value.scrollTop
    sessionStorage.setItem(getScrollKey(), top.toString())
  }
}

// ✅ 恢复滚动
function restoreScroll() {
  const saved = sessionStorage.getItem(getScrollKey())
  if (saved && scrollContainer.value) {
    const wantScroll = parseInt(saved)
    let tryCount = 0
    let lastHeight = 0
    function tryRestore() {
      if (!scrollContainer.value) return
      const nowH = scrollContainer.value.scrollHeight
      if (nowH !== lastHeight && nowH > 0) {
        scrollContainer.value.scrollTop = wantScroll
        lastHeight = nowH
      }
      tryCount++
      if (tryCount < 20) setTimeout(tryRestore, 40)
    }
    tryRestore()
  }
}

// ✅ 激活时恢复
onActivated(async () => {
  await loadUntil(0)
  await nextTick()
  restoreScroll()
})
</script>


<style scoped>
.recommend-page {
  padding: 0 3.2vw;
  box-sizing: border-box;
}
.load-more-trigger {
  height: 13.3vw;
  margin-top: 5.3vw;
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
  font-size: 3.7vw;
  margin: 5.3vw 0;
}
</style>