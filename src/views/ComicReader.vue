<template>
  <div class="comic-reader-wrapper" :class="{ 'show-controls': showControls }" @click="toggleControls">
    <div class="reader-top-bar">
      <img src="/icons/back1.svg" class="back-icon" @click.stop="goBack" />
      <span class="chapter-title">{{ currentChapterTitle }}</span>
      <img src="/icons/share2.svg" class="share-icon" @click.stop="shareComic" />
    </div>

    <transition name="fade">
      <div v-if="topTipMessage" class="top-tip-message">
        {{ topTipMessage }}
      </div>
    </transition>

    <div
  class="comic-pages-container hide-scrollbar"
  ref="pagesContainer"
  :data-flip-mode="flipMode"
  :style="{
    'scroll-snap-type': flipMode === 'horizontal' ? 'x mandatory' : 'none'
  }"
  @scroll="handleScroll"
>
      <img
  v-for="(image, index) in currentChapterImages"
  :key="index"
  v-lazy="image"
  class="comic-page-img"
  :data-page-index="index"
/>
    </div>
    <div class="chapter-nav-btn prev-chapter-btn" @click.stop="goToPrevChapter">
      <div class="chapter-nav-text prev-text">上一话</div>
      <img src="/icons/prev-chapter.svg" class="chapter-nav-icon" />
    </div>

    <div class="chapter-nav-btn next-chapter-btn" @click.stop="goToNextChapter">
      <div class="chapter-nav-text next-text">下一话</div>
      <img src="/icons/next-chapter.svg" class="chapter-nav-icon" />
    </div>

    <div class="reader-bottom-bar" :class="{ 'show-controls': showControls }">
      <div class="progress-bar-container">
        <span class="page-label">{{ currentPageIndex + 1 }}</span>
        <input
          type="range"
          :min="1"
          :max="totalPages"
          v-model="sliderPage"
          @change="onSliderChange"
        />
        <span class="page-label">{{ totalPages }}</span>
      </div>

      <div class="bottom-buttons">
        <div class="bottom-control-item" @click.stop="isDrawerOpen = true">
          <img src="/icons/catalog.svg" /><span>目录</span>
        </div>
        <div class="bottom-control-item" :class="{ active: flipMode === 'vertical' }" @click.stop="setFlipMode('vertical')">
          <img src="/icons/vertical-flip.svg" /><span>上下翻</span>
        </div>
        <div class="bottom-control-item" :class="{ active: flipMode === 'horizontal' }" @click.stop="setFlipMode('horizontal')">
          <img src="/icons/horizontal-flip.svg" /><span>左右翻</span>
        </div>
        <div class="bottom-control-item" @click.stop="openAutoFlipPanel">
          <img :src="isAutoFlipStarted ? '/icons/pause1.svg' : '/icons/auto-flip.svg'" />
          <span>自动翻</span>
        </div>
      </div>
    </div>

    <ChapterDrawer
      v-model="isDrawerOpen"
      :chapters="comicChapters"
      :comic-id="comicId || ''"
      :comic-title="comicTitle"
      :fullScreen="false"
      :unlocked-list="unlockedList"
      @read-chapter-from-drawer="handleChapterSelect"
    />

    <div class="auto-flip-panel" v-if="showAutoFlipPanel">
      <div class="speed-label">自动翻页速度 {{ autoFlipSpeed }}</div>
      <div class="speed-slider">
        <span>减速</span>
        <input type="range" min="1" max="6" v-model="autoFlipSpeed" />
        <span>加速</span>
      </div>
      <div class="button-group">
        <button class="stop-btn" @click="stopAutoFlip">结束自动翻页</button>
        <button class="start-btn" @click="startAutoFlip">开始</button>
      </div>
    </div>
  </div>
  <van-popup v-model:show="vipPopup" close-on-click-overlay :style="{ maxWidth: '90%', width: '500px', borderRadius: '12px' }">
  <div class="popup-box">
    <h3>温馨提示</h3>
    <p class="popup-text">
      需要会员才可以阅读该章节哦~
    </p>
    <div class="popup-actions">
      <button class="gray-btn" @click="router.push('/promotion-share')">分享得VIP</button>
      <button class="orange-btn" @click="router.push('/vip')">立即开通VIP</button>
    </div>
  </div>
</van-popup>
<van-popup v-model:show="coinPopup" close-on-click-overlay :style="{ maxWidth: '90%', width: '500px', borderRadius: '12px' }">
  <div class="popup-box">
    <h3>温馨提示</h3>
    <p class="popup-text">
      您当前没有足够的金币，购买章节需要支付金币。<br />立即充值金币并购买。
    </p>
    <div class="popup-actions">
      <button class="gray-btn" @click="coinPopup = false">取消</button>
      <button class="orange-btn" @click="router.push({ path: '/vip', query: { tab: 'coin' } })">立即充值</button>
    </div>
  </div>
</van-popup>
<van-action-sheet v-model:show="purchaseSheet" closeable safe-area-inset-bottom>
  <div class="purchase-sheet">
    <h3>购买章节</h3>
    <div class="row">
      金币余额：{{ typeof userInfo?.goldCoins === 'number' ? userInfo.goldCoins.toFixed(2) : '0.00' }}
      <van-button
        type="default"
        plain
        size="small"
        @click="goCoinRecharge"
        style="border-color: #333; color: #333; font-size: 13px; border-radius: 6px; padding: 0 8px;"
      >
        立即充值
      </van-button>
    </div>
    <div class="row">
      <span>支付金额</span>
      <span class="red">{{ typeof currentPurchaseChapter?.coin === 'number' ? currentPurchaseChapter.coin : 0 }}金币</span>
    </div>
    <div class="notice">
      <span :class="{ orange: userDiscount >= 1, red: userDiscount < 1 }">
        {{ userDiscount < 1 ? `您享受 ${(userDiscount * 10).toFixed(1)}折优惠` : '您当前不享受折扣优惠' }}
      </span>
      <van-button type="primary" plain size="small" color="#ff69b4" @click="router.push('/vip')">
        购买VIP享受折扣
      </van-button>
    </div>
    <div class="divider"></div>
    <div class="row">
      <span>实际支付</span>
      <span class="red">{{ discountedPrice }}金币</span>
    </div>
    <van-button
      type="primary"
      block
      color="#f60"
      class="buy-btn"
      @click="confirmPurchase"
    >
      立即购买
    </van-button>
  </div>
</van-action-sheet>


</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick, type Ref } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
import ChapterDrawer from '../components/ChapterDrawer.vue'
import { useHistoryStore } from '@/store/useHistoryStore'
import { useComicCategoryStore } from '@/store/comicCategoryStore'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'
import { showToast } from 'vant'
function isChapterUnlocked(chapterId) {
  const unlockedList = comicStore.unlockedChaptersMap[String(comicId.value)] || []
  return unlockedList.includes(String(chapterId))
}


const comicStore = useComicCategoryStore()
const { chapterList, comicDetail } = storeToRefs(comicStore)
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const vipPopup = ref(false)
const coinPopup = ref(false)
const userDiscount = ref(1) // 默认无折扣

// 解锁章节列表
const unlockedList = computed(() => {
  return comicStore.unlockedChaptersMap[String(comicId.value)] || []
})

const discountedPrice = computed(() => {
  const coin = currentPurchaseChapter.value?.coin
  if (typeof coin !== 'number') return 0
  return Number((coin * userDiscount.value).toFixed(2))
})

type FlipMode = 'vertical' | 'horizontal'
interface Chapter {
  id: string | number;
  title: string;
  status?: string | number;
}

interface DetailModule {
  default: {
    chapters: Chapter[]
    title?: string
    cover?: string
  }
}

interface ChapterModule {
  default: {
    images: string[]
  }
}

const route = useRoute() as RouteLocationNormalizedLoaded
const router = useRouter()

function shareComic() {
  router.push('/promotion-share')
}

const comicId = ref<string | null>(null)
const chapterId = ref<string | null>(null)
const comicChapters = ref<Chapter[]>([])
const comicTitle = ref(sessionStorage.getItem('reader-title') || '')
const comicCover = ref('')
const currentChapterImages = ref<string[]>([])
const currentChapterTitle = ref('')
const currentPageIndex = ref(0)
const flipMode = ref<FlipMode>('vertical')
const isDrawerOpen = ref(false)
const showControls = ref(true)
const pagesContainer = ref<HTMLElement | null>(null)
const sliderPage = ref(1)
const totalPages = computed(() => currentChapterImages.value.length)
const showAutoFlipPanel = ref(false)
const autoFlipSpeed = ref(3)
let autoFlipAnimation: number | null = null
const isAutoFlipping = ref(false)
const isAutoFlipStarted = ref(false)
const handleBeforeUnload = (evt: Event) => writeHistory(true);
const currentPurchaseChapter = ref<any>(null)
const purchaseSheetType = ref<'single'|'whole'>('single')
const purchaseSheet = ref(false)

const topTipMessage = ref('')
let tipTimer: ReturnType<typeof setTimeout> | null = null
const ignoreNextToggle = ref(false)
const props = defineProps<{
  comicId?: string | number
  chapterId?: string | number
}>()

// 章节阅读进度记忆
const chapterProgress = ref<Record<string, number>>({})

const speedMap: Record<number, number> = {
  1: 0.5,
  2: 1,
  3: 1.5,
  4: 2,
  5: 2.5,
  6: 3
}

const toggleControls = (): void => {
  if (ignoreNextToggle.value) return
  showControls.value = !showControls.value
  if (showControls.value) showAutoFlipPanel.value = false
}

const openAutoFlipPanel = (): void => {
  showAutoFlipPanel.value = true
  showControls.value = false
}

const startAutoFlip = (): void => {
  showAutoFlipPanel.value = false
  isAutoFlipStarted.value = true
  isAutoFlipping.value = true
  const container = pagesContainer.value
  if (!container) return
  const scrollStep = speedMap[autoFlipSpeed.value]

  const animateScroll = () => {
    if (!isAutoFlipping.value) {
      if (autoFlipAnimation) cancelAnimationFrame(autoFlipAnimation)
      return
    }

    let currentScroll: number, maxScroll: number, containerSize: number
    if (flipMode.value === 'vertical') {
      currentScroll = container.scrollTop
      maxScroll = container.scrollHeight - container.clientHeight
      containerSize = container.clientHeight
    } else {
      currentScroll = container.scrollLeft
      maxScroll = container.scrollWidth - container.clientWidth
      containerSize = container.clientWidth
    }

    if (currentScroll < maxScroll) {
      if (flipMode.value === 'vertical') {
        container.scrollTop += scrollStep
        if (container.scrollTop > maxScroll) container.scrollTop = maxScroll
        currentScroll = container.scrollTop
      } else {
        container.scrollLeft += scrollStep
        if (container.scrollLeft > maxScroll) container.scrollLeft = maxScroll
        currentScroll = container.scrollLeft
      }

      let newPageIndex = 0
      if (totalPages.value > 0) {
        if (flipMode.value === 'vertical') {
          let accumulatedHeight = 0
          const images = container.querySelectorAll<HTMLImageElement>('.comic-page-img')
          for (let i = 0; i < images.length; i++) {
            const imgHeight = images[i].offsetHeight
            if (currentScroll >= accumulatedHeight && currentScroll < (accumulatedHeight + imgHeight)) {
              newPageIndex = i
              break
            }
            accumulatedHeight += imgHeight
          }
        } else {
          const doubleIndex = Math.round(currentScroll / containerSize)
          newPageIndex = Math.min(doubleIndex * 2, totalPages.value - 1)
        }
        newPageIndex = Math.max(0, newPageIndex)
        if (currentPageIndex.value !== newPageIndex) {
          currentPageIndex.value = newPageIndex
          sliderPage.value = newPageIndex + 1
        }
      }

      autoFlipAnimation = requestAnimationFrame(animateScroll)
    } else {
      stopAutoFlip()
      if (totalPages.value > 0) {
        currentPageIndex.value = totalPages.value - 1
        sliderPage.value = totalPages.value
      }
    }
  }

  autoFlipAnimation = requestAnimationFrame(animateScroll)
}

const stopAutoFlip = (): void => {
  isAutoFlipping.value = false
  isAutoFlipStarted.value = false
  if (autoFlipAnimation) {
    cancelAnimationFrame(autoFlipAnimation)
    autoFlipAnimation = null
  }
  showAutoFlipPanel.value = false
  if (pagesContainer.value) {
    pagesContainer.value.style.scrollSnapType = flipMode.value === 'vertical' ? 'y mandatory' : 'x mandatory'
  }
}

const showTip = (message: string): void => {
  topTipMessage.value = message
  if (tipTimer) clearTimeout(tipTimer)
  tipTimer = setTimeout(() => (topTipMessage.value = ''), 2000)
}

const loadChapterData = async (cId: string | null, chapId: string | null) => {
  try {
    if (!cId || !chapId) return
    currentChapterImages.value = await comicStore.loadChapterImages(Number(chapId))

    // 重置滚动
    if (pagesContainer.value) {
      pagesContainer.value.scrollTop = 0
      pagesContainer.value.scrollLeft = 0
    }

    // 恢复进度
    const savedPosition = chapterProgress.value[chapId]
    if (savedPosition !== undefined) {
      setTimeout(() => {
        scrollToPage(savedPosition)
      }, 100)
    } else {
      currentPageIndex.value = 0
      sliderPage.value = 1
    }
  } catch (e) {
    currentChapterImages.value = []
    currentChapterTitle.value = ''
  }
}

const scrollToPage = (pageIndex: number) => {
  currentPageIndex.value = pageIndex
  sliderPage.value = pageIndex + 1

  nextTick(() => {
    const imgs = pagesContainer.value?.querySelectorAll<HTMLImageElement>('.comic-page-img')
    if (imgs && imgs[pageIndex]) {
      imgs[pageIndex].scrollIntoView({
        behavior: 'auto',
        block: flipMode.value === 'vertical' ? 'start' : undefined,
        inline: flipMode.value === 'horizontal' ? 'start' : undefined
      })
    }
  })
}

const goBack = (): void => {
  if (comicId.value) {
    router.replace({ name: 'ComicDetail', params: { id: comicId.value } })
  } else {
    router.replace('/')
  }
}

const goToPrevChapter = async (): Promise<void> => {
  const idx = comicChapters.value.findIndex(chap => String(chap.id) === String(chapterId.value))
  if (idx > 0) {
    stopAutoFlip()
    chapterProgress.value[String(chapterId.value)] = currentPageIndex.value
    const prevChapter = comicChapters.value[idx - 1]
    await checkPermissionAndRead(prevChapter)
  } else {
    showTip('这是第一话哦~')
  }
}

const goToNextChapter = async (): Promise<void> => {
  const idx = comicChapters.value.findIndex(chap => String(chap.id) === String(chapterId.value))
  if (idx < comicChapters.value.length - 1) {
    stopAutoFlip()
    chapterProgress.value[String(chapterId.value)] = currentPageIndex.value
    const nextChapter = comicChapters.value[idx + 1]
    await checkPermissionAndRead(nextChapter)
  } else {
    showTip('这是最后一话哦~')
  }
}

const handleChapterSelect = async (selectedChapterId: string | number) => {
  isDrawerOpen.value = false
  stopAutoFlip()
  ignoreNextToggle.value = true

  chapterProgress.value[String(chapterId.value)] = currentPageIndex.value

  // 取出章节
  const chapter = comicChapters.value.find(c => String(c.id) === String(selectedChapterId))
  if (chapter) {
    await checkPermissionAndRead(chapter)
  }
  setTimeout(() => { ignoreNextToggle.value = false }, 200)
}


const setFlipMode = (mode: FlipMode) => {
  flipMode.value = mode
  stopAutoFlip()

  chapterProgress.value[String(chapterId.value)] = currentPageIndex.value

  nextTick(() => {
    requestAnimationFrame(() => {
      if (pagesContainer.value) {
        const img = pagesContainer.value.querySelector<HTMLImageElement>(`img[data-page-index="${currentPageIndex.value}"]`)
        if (img) {
          if (mode === 'vertical') img.scrollIntoView({ behavior: 'instant', block: 'start' })
          else img.scrollIntoView({ behavior: 'instant', inline: 'start' })
        }
      }
    })
  })
}

const handleScroll = (): void => {
  const container = pagesContainer.value
  if (!container || totalPages.value === 0) return

  const images = container.querySelectorAll<HTMLImageElement>('.comic-page-img')

  if (flipMode.value === 'vertical') {
    const scrollTop = container.scrollTop
    let accumulatedHeight = 0
    for (let i = 0; i < images.length; i++) {
      const imgHeight = images[i].offsetHeight
      if (scrollTop >= accumulatedHeight && scrollTop < accumulatedHeight + imgHeight) {
        currentPageIndex.value = i
        sliderPage.value = i + 1
        chapterProgress.value[String(chapterId.value)] = i
        break
      }
      accumulatedHeight += imgHeight
    }
  } else {
    const scrollLeft = container.scrollLeft
    const containerWidth = container.clientWidth
    const doubleIndex = Math.round(scrollLeft / containerWidth)
    const correctedIndex = Math.min(doubleIndex * 2, totalPages.value - 1)
    currentPageIndex.value = correctedIndex
    sliderPage.value = correctedIndex + 1
    chapterProgress.value[String(chapterId.value)] = correctedIndex
  }
}

const onSliderChange = (): void => {
  currentPageIndex.value = Number(sliderPage.value) - 1
  chapterProgress.value[String(chapterId.value)] = currentPageIndex.value

  nextTick(() => {
    const imgs = pagesContainer.value?.querySelectorAll<HTMLImageElement>('.comic-page-img')
    if (imgs && imgs[currentPageIndex.value]) {
      imgs[currentPageIndex.value].scrollIntoView({
        behavior: 'auto',
        block: flipMode.value === 'vertical' ? 'start' : undefined,
        inline: flipMode.value === 'horizontal' ? 'start' : undefined
      })
    }
  })
}

// 历史记录写入
let lastHistoryWriteTime = 0
function writeHistory(force: boolean = false): void {
  const now = Date.now()
  if (!force && now - lastHistoryWriteTime < 60 * 1000) {
    return
  }
  lastHistoryWriteTime = now

  if (comicId.value) {
    const historyStore = useHistoryStore()
    const lastChapterIndex = comicChapters.value.findIndex(
      (c) => String(c.id) === String(chapterId.value)
    )

    historyStore.addRecord({
      id: comicId.value,
      type: 'comic',
      time: new Date().toISOString(),
      data: {
        title: comicTitle.value || '未命名漫画',
        cover: comicCover.value || '',
        episodes: comicChapters.value.length || 0,
        lastRead: lastChapterIndex >= 0 ? lastChapterIndex + 1 : 1
      }
    })
  }
}

onMounted(async () => {
  comicId.value = route.params.comicId as string
  chapterId.value = route.params.chapterId as string
  await userStore.fetchUserInfo()

  // 拉全部章节目录
  await comicStore.loadAllChapters(comicId.value)
  comicChapters.value = chapterList.value || []

  // 拉章节图片
  if (chapterId.value) {
    currentChapterImages.value = await comicStore.loadChapterImages(Number(chapterId.value))
    // 找标题
    const matched = comicChapters.value.find(chap => String(chap.id) === String(chapterId.value))
    currentChapterTitle.value = matched ? matched.title : ''
  }

  // 拉详情
  await comicStore.loadComicDetail(comicId.value)
  comicTitle.value = sessionStorage.getItem('reader-title') || ''
  comicCover.value = comicDetail.value.cover || ''
  writeHistory()
})
watch(
  () => route.params.chapterId,
  async (newVal, oldVal) => {
    if (newVal !== oldVal) {
      chapterId.value = newVal as string
      currentChapterImages.value = await comicStore.loadChapterImages(Number(newVal))
      // 找标题
      const matched = comicChapters.value.find(chap => String(chap.id) === String(newVal))
      currentChapterTitle.value = matched ? matched.title : ''
      writeHistory()
    }
  }
)

onUnmounted(() => {
  stopAutoFlip()
  if (tipTimer) clearTimeout(tipTimer)
  writeHistory()
  if (typeof window !== 'undefined') {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
})
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', handleBeforeUnload)
}
interface UserInfo {
  vip_status?: number;
  can_view_vip_video?: number;
  can_watch_coin?: number;
  goldCoins?: number;
}
async function checkPermissionAndRead(chapter: any) {
  // 1. 先判定是否已解锁
  if (isChapterUnlocked(chapter.id)) {
    goReadChapter(chapter.id)
    return
  }

  const info = (userInfo.value || {}) as UserInfo
  userDiscount.value = (info.vip_status === 1 ? 0.8 : 1)

  // 2. 未解锁才判断 VIP
  if (chapter.is_vip === 1) {
    if (info.can_view_vip_video == 1) {
      goReadChapter(chapter.id)
    } else {
      vipPopup.value = true
    }
    return
  }
  // 3. 金币章节
  if (chapter.coin > 0) {
    if (info.can_watch_coin == 1) {
      goReadChapter(chapter.id)
    } else {
      currentPurchaseChapter.value = chapter
      purchaseSheetType.value = 'single'
      purchaseSheet.value = true
    }
    return
  }

  // 4. 免费章节直接进
  goReadChapter(chapter.id)
}

function goReadChapter(chapterId: string | number) {
  stopAutoFlip()
  chapterProgress.value[String(chapterId)] = 0
  router.push({
    name: 'ComicReader',
    params: {
      comicId: comicId.value,
      chapterId,
    },
  })
}
function goCoinRecharge() {
  purchaseSheet.value = false
  // 跳转到VIP页的金币充值 tab
  router.push({ path: '/vip', query: { tab: 'coin' } })
}
async function confirmPurchase() {
  try {
    await comicStore.buyComicChapter(currentPurchaseChapter.value.id)
    // 购买后立即刷 unlock 状态
    await comicStore.loadUnlockedChapters(comicId.value)
    showToast('购买成功并解锁')
    purchaseSheet.value = false
    await userStore.fetchUserInfo()
    goReadChapter(currentPurchaseChapter.value.id)
  } catch (e: any) {
    purchaseSheet.value = false
    showToast(e?.msg || '购买失败')
    setTimeout(() => {
      coinPopup.value = true
    }, 300)
  }
}

</script>

<style scoped>
.comic-reader-wrapper {
  background: #000;
  color: #fff;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.reader-top-bar,
.reader-bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: transform 0.3s ease;
}

.reader-top-bar {
  top: 0;
  justify-content: space-between;
  height: 13.3vw; /* 50px */
  flex-direction: row;
  padding: 0 4vw; /* 15px */
  transform: translateY(-100%);
}

.reader-bottom-bar {
  bottom: 0;
  transform: translateY(100%);
}

.comic-reader-wrapper.show-controls .reader-top-bar { transform: translateY(0); }
.comic-reader-wrapper.show-controls .reader-bottom-bar { transform: translateY(0); }

.reader-top-bar .back-icon,
.reader-top-bar .share-icon {
  width: 6.4vw;  /* 24px */
  height: 6.4vw;
  margin-top: 3.5vw;  /* 13px */
}

.chapter-title {
  font-size: 5.9vw; /* 22px */
  font-weight: bold;
  flex: 1;
  text-align: center;
  margin: 0 2.1vw; /* 8px */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2.7vw; /* 10px */
}

.comic-pages-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
}
.comic-pages-container[data-flip-mode="vertical"] {
  overflow-y: auto;
  flex-direction: column;
}
.comic-pages-container[data-flip-mode="vertical"] .comic-page-img {
  width: 100vw;
  height: auto;
  object-fit: contain;
  /* scroll-snap-align: start; */
}

.comic-pages-container[data-flip-mode="horizontal"] {
  overflow-x: auto;
  flex-direction: row;
  scroll-snap-type: x mandatory;
}
.comic-pages-container[data-flip-mode="horizontal"] .comic-page-img {
  height: 100vh;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
  scroll-snap-align: start;
}
.chapter-nav-btn {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(3px);
  width: 16vw; /* 60px */
  height: 29.3vw; /* 110px */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 90;
  transition: transform 0.3s ease;
  box-shadow: 0 0 2.7vw rgba(0,0,0,0.3); /* 10px */
}
.prev-chapter-btn {
  left: 0;
  border-top-right-radius: 16vw;   /* 60px */
  border-bottom-right-radius: 16vw;
  transform: translate(-100%, -50%);
}
.next-chapter-btn {
  right: 0;
  border-top-left-radius: 16vw;
  border-bottom-left-radius: 16vw;
  transform: translate(100%, -50%);
}
.comic-reader-wrapper.show-controls .prev-chapter-btn { transform: translate(0, -50%); }
.comic-reader-wrapper.show-controls .next-chapter-btn { transform: translate(0, -50%); }

.prev-text,
.next-text {
  writing-mode: vertical-rl;
  font-size: 3.5vw; /* 13px */
  margin-bottom: 1.6vw; /* 6px */
}
.prev-text { transform: translate(-1.6vw, 1.3vw); } /* -6px, 5px */
.next-text { transform: translate(1.6vw, 1.3vw); }

.prev-chapter-btn .chapter-nav-icon {
  width: 4.8vw;  /* 18px */
  height: 4.8vw;
  margin-top: 1.3vw; /* 5px */
  margin-right: 3.2vw; /* 12px */
}
.next-chapter-btn .chapter-nav-icon {
  width: 4.8vw;
  height: 4.8vw;
  margin-top: 1.3vw;
  margin-left: 3.2vw;
}

.bottom-buttons {
  display: flex;
  justify-content: space-around;
  padding: 1.3vw 0; /* 5px */
}
.bottom-control-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 3.2vw; /* 12px */
  transition: 0.3s;
}
.bottom-control-item img {
  width: 6.4vw;  /* 24px */
  height: 6.4vw;
  margin-bottom: 1.1vw; /* 4px */
}
.bottom-control-item.active img,
.bottom-control-item.active span {
  filter: brightness(150%);
  color: #fff;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.3vw 2.7vw; /* 5px 10px */
}
.page-label {
  font-size: 3.5vw; /* 13px */
  width: 7.5vw;  /* 28px */
  text-align: center;
}
.progress-bar-container input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 1.1vw; /* 4px */
  border-radius: 1.1vw;
  background: #fff;
  flex: 0 0 40vw; /* 150px */
  margin: 0 2.7vw; /* 10px */
}
.progress-bar-container input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 3.7vw; /* 14px */
  width: 3.7vw;
  border-radius: 50%;
  background: #4e2502;
  margin-top: 0;
}

.auto-flip-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  background: rgba(255,255,255,0.95);
  width: 100vw;
  padding: 5.3vw; /* 20px */
  z-index: 9999;
  box-shadow: 0 -0.5vw 2.7vw rgba(0,0,0,0.2); /* 0 -2px 10px */
  color: #333;
}
.speed-label {
  text-align: center;
  font-weight: bold;
  font-size: 4.3vw; /* 16px */
  margin-bottom: 2.7vw; /* 10px */
}
.speed-slider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5.3vw; /* 20px */
}
.speed-slider input[type="range"] {
  margin: 0 2.7vw;
  width: 60%;
}
.button-group {
  display: flex;
  justify-content: space-around;
}
.stop-btn {
  background: #ddd;
  border: none;
  padding: 2.7vw 5.3vw; /* 10px 20px */
  border-radius: 8vw; /* 30px */
  font-weight: bold;
}
.start-btn {
  background: #ff6699;
  color: #fff;
  border: none;
  padding: 2.7vw 6.7vw; /* 10px 25px */
  border-radius: 8vw; /* 30px */
  font-weight: bold;
}

.top-tip-message {
  position: fixed;
  top: 13.3vw; /* 50px */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2.1vw 4vw; /* 8px 15px */
  border-radius: 1.3vw; /* 5px */
  font-size: 3.7vw; /* 14px */
  z-index: 101;
  white-space: nowrap;
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}
.popup-box {
  padding: 5.33vw;
  text-align: center;
}
.popup-box h3 {
  margin: 0;
  font-size: 4.26vw;
  font-weight: bold;
}
.popup-text {
  font-size: 3.73vw;
  color: #333;
  margin: 3.2vw 0 5.33vw;
}
.popup-actions {
  display: flex;
  gap: 3.2vw;
}
.popup-actions button {
  flex: 1;
  border: none;
  border-radius: 1.06vw;
  padding: 2.66vw 0;
  font-size: 3.73vw;
  cursor: pointer;
}
.gray-btn {
  background: #999;
  color: #fff;
}
.orange-btn {
  background: #f60;
  color: #fff;
}
.purchase-sheet {
  padding: 4.26vw;
}
.purchase-sheet h3 {
  text-align: center;
  font-weight: bold;
  font-size: 4.26vw;
  margin-bottom: 3.2vw;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2.13vw 0;
  font-size: 4vw;
}
.notice {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 3.46vw;
  margin: 2.66vw 0;
}
.divider {
  height: 0.27vw;
  background: #eee;
  margin: 2.66vw 0;
}
.red {
  color: #f56c6c;
}
.orange {
  color: #f60;
}
.buy-btn {
  margin-top: 4.26vw;
  border-radius: 2.13vw;
}
</style>