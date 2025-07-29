<template>
  <div
    class="comic-reader-wrapper"
    :class="{ 'show-controls': showControls, dark: isDarkMode }"
    :style="{ filter: `brightness(${brightness})` }"
    @click="toggleControls"
  >
    <ChapterDrawer
  v-model="isDrawerOpen"
  :comicId="comicId"
  :comicTitle="comicTitle"
  :chapters="novelStore.chapterList || []"
  :cover="cover"
  type="novel"
  :fullScreen="false"
  :unlocked-list="unlockedList"  
  @read-chapter-from-drawer="handleChapterSelect"
/>


    <!-- 顶部栏 -->
    <div class="reader-top-bar">
      <img src="/icons/back1.svg" class="back-icon" @click.stop="goBack" />
      <span class="chapter-title">{{ currentChapterTitle }}</span>
      <img src="/icons/share2.svg" class="share-icon" @click.stop="shareComic" />
    </div>

    <!-- 顶部提示 -->
    <transition name="fade">
      <div v-if="topTipMessage" class="top-tip-message">{{ topTipMessage }}</div>
    </transition>

    <!-- 小说内容 -->
    <div
      class="comic-pages-container hide-scrollbar"
      ref="pagesContainer"
      data-flip-mode="vertical"
      :style="{ 'scroll-snap-type': isAutoFlipping ? 'none' : 'y mandatory' }"
      @scroll="handleScroll"
    >
      <div class="novel-text" :style="{ fontSize: fontSize + 'px' }">
        <p v-for="(line, index) in currentChapterContent.split('\n')" :key="index" class="novel-line">
          {{ line }}
        </p>
      </div>
    </div>

    <!-- 上下章 -->
    <div class="chapter-nav-btn prev-chapter-btn" @click.stop="goToPrevChapter">
      <div class="chapter-nav-text prev-text">上一话</div>
      <img src="/icons/prev-chapter.svg" class="chapter-nav-icon" />
    </div>
    <div class="chapter-nav-btn next-chapter-btn" @click.stop="goToNextChapter">
      <div class="chapter-nav-text next-text">下一话</div>
      <img src="/icons/next-chapter.svg" class="chapter-nav-icon" />
    </div>

    <!-- 底部控制栏 -->
    <div class="reader-bottom-bar" :class="{ 'show-controls': showControls }">
      <div class="bottom-buttons">
        <div class="bottom-control-item" @click.stop="openDrawerAndLoadChapters">
  <img src="/icons/catalog.svg" /><span>目录</span>
</div>
        <div class="bottom-control-item" @click.stop="toggleDarkMode">
          <img :src="isDarkMode ? '/icons/sun.svg' : '/icons/moon.svg'" />
          <span>{{ isDarkMode ? '日间' : '夜间' }}</span>
        </div>
        <!-- 自动翻 -->
        <div class="bottom-control-item" @click.stop="openAutoFlipPanel">
          <img :src="isAutoFlipping ? '/icons/pause1.svg' : '/icons/auto-flip.svg'" />
          <span>{{ isAutoFlipping ? '暂停中' : '自动翻' }}</span>
        </div>
        <div class="bottom-control-item" @click.stop="showSettingsPanel = true">
          <img src="/icons/setting3.svg" class="setting-icon" /><span>设置</span>
        </div>
      </div>
    </div>

    <!-- 自动翻页面板 -->
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

    <!-- 阅读设置弹窗 -->
    <transition name="fade">
      <div class="reading-settings-panel" v-if="showSettingsPanel">
        <div class="panel-header">
          <h3 class="panel-title">阅读设置</h3>
          <img src="/icons/close1.svg" class="close-icon" @click="showSettingsPanel = false" />
        </div>
        <div class="panel-section font-size-row">
          <span class="label">文章字号</span>
          <div class="font-size-controls">
            <button class="btn" @click="fontSize--">A-</button>
            <span class="font-value">{{ fontSize }}</span>
            <button class="btn" @click="fontSize++">A+</button>
          </div>
        </div>

        <div class="panel-section brightness-row">
          <span class="label">调整亮度</span>
          <input class="slider" type="range" min="0.5" max="1.2" step="0.01" v-model="brightness" />
        </div>

        <div class="panel-section">
          <span>主题颜色</span>
          <div class="theme-options">
            <div
              v-for="(c, i) in themeList"
              :key="i"
              class="theme-dot"
              :class="{ active: currentTheme === c }"
              :style="{ background: c }"
              @click="applyTheme(c)"
            ></div>
          </div>
        </div>
        <div class="panel-section">
          <span>深色模式</span>
          <img
            :src="isDarkMode ? '/icons/setting-active.svg' : '/icons/setting.svg'"
            class="darkmode-toggle"
            @click="toggleDarkMode"
          />
        </div>
      </div>
    </transition>
  </div>
  <!-- VIP弹窗 -->
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
<!-- 金币不足弹窗 -->
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
<!-- 购买章节ActionSheet -->
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
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ChapterDrawer from '../components/ChapterDrawer.vue';
import { useHistoryStore } from '@/store/useHistoryStore'
import { useNovelCategoryStore } from '@/store/novelStore'
import { useUserStore } from '@/store/user'
import { showToast } from 'vant'

interface Chapter {
  id: string | number;
  title: string;
  is_vip?: number;
  coin?: number;
}
interface UserInfo {
  vip_status?: number;
  can_view_vip_video?: number;
  can_watch_coin?: number;
  goldCoins?: number;
}

const props = defineProps<{ comicId: string | number; chapterId: string | number }>();
const router = useRouter();
const novelStore = useNovelCategoryStore()
const userStore = useUserStore()
const { userInfo } = userStore

const comicId = computed(() => props.comicId);
const chapterId = computed(() => props.chapterId);
const comicTitle = ref<string>('');
const cover = ref<string>('');
const currentChapterTitle = ref<string>('');
const currentChapterContent = ref<string>('');

const vipPopup = ref(false)
const coinPopup = ref(false)
const purchaseSheet = ref(false)
const userDiscount = ref(1)
const currentPurchaseChapter = ref<any>(null)
const discountedPrice = computed(() => {
  const coin = currentPurchaseChapter.value?.coin
  if (typeof coin !== 'number') return 0
  return Number((coin * userDiscount.value).toFixed(2))
})
const unlockedList = computed(() => {
  return novelStore.unlockedNovelChaptersMap[String(comicId.value)] || []
})

const showControls = ref(true);
const pagesContainer = ref<HTMLElement | null>(null);
const isDrawerOpen = ref(false);
const sliderPage = ref(1);
const totalPages = ref(1);

const fontSize = ref<number>(17);
const brightness = ref<number>(1);
const isDarkMode = ref(false);
const showSettingsPanel = ref(false);
const themeList = ['#ffffff', '#fef6d8', '#d9f3d6', '#cce5ff', '#ffd6e7', '#f0f0f0'];
const currentTheme = ref<string>(themeList[0]);
const applyTheme = (color: string) => {
  document.documentElement.style.setProperty('--reader-bg', color);
  currentTheme.value = color;
};

const showAutoFlipPanel = ref(false);
const autoFlipSpeed = ref(3);
let autoFlipAnimation: number | null = null;
const isAutoFlipping = ref(false);
const speedMap: Record<number, number> = { 1: 0.5, 2: 1, 3: 1.5, 4: 2, 5: 2.5, 6: 3 };

const chapterScrollPositions = ref<Record<string | number, number>>({});

const topTipMessage = ref('');
let tipTimer: number | null = null;
const ignoreNextToggle = ref(false);

const toggleDarkMode = () => { isDarkMode.value = !isDarkMode.value; };
const toggleControls = () => {
  if (ignoreNextToggle.value) return;
  showControls.value = !showControls.value;
  if (showControls.value) showAutoFlipPanel.value = false;
};

const openAutoFlipPanel = () => { showAutoFlipPanel.value = true; showControls.value = false; };
const stopAutoFlip = () => {
  isAutoFlipping.value = false;
  if (autoFlipAnimation) { cancelAnimationFrame(autoFlipAnimation); autoFlipAnimation = null; }
  showAutoFlipPanel.value = false;
};
const startAutoFlip = () => {
  const container = pagesContainer.value;
  if (!container) return;
  isAutoFlipping.value = true;
  showAutoFlipPanel.value = false;
  const scrollStep = speedMap[autoFlipSpeed.value];
  const animateScroll = () => {
    if (!isAutoFlipping.value) return;
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (container.scrollTop < maxScroll) {
      container.scrollTop += scrollStep;
      autoFlipAnimation = requestAnimationFrame(animateScroll);
    } else {
      stopAutoFlip();
    }
  };
  autoFlipAnimation = requestAnimationFrame(animateScroll);
};

const showTip = (msg: string) => {
  topTipMessage.value = msg;
  if (tipTimer) clearTimeout(tipTimer);
  tipTimer = window.setTimeout(() => (topTipMessage.value = ''), 2000);
};

const goBack = (): void => {
  if (comicId.value) {
    router.replace({ name: 'NovelDetail', params: { id: comicId.value } })
  } else {
    router.replace('/')
  }
}


// ========= 章节跳转统一，只负责路由，内容全由 watch 拉 ==========
function goReadChapter(chapId: string | number) {
  stopAutoFlip()
  if (String(chapId) !== String(chapterId.value)) {
    router.push({ name: 'NovelReader', params: { comicId: comicId.value, chapterId: chapId } });
  }
}

// 目录点击
// 目录点击
const handleChapterSelect = (selectedChapterId: string | number) => {
  isDrawerOpen.value = false;
  stopAutoFlip();
  // 找出章节对象
  const chapter = (novelStore.chapterList || []).find(c => String(c.id) === String(selectedChapterId));
  if (chapter) checkPermissionAndRead(chapter);
}

// 上一章/下一章
const goToPrevChapter = () => {
  const arr = novelStore.chapterList || [];
  const idx = arr.findIndex(chap => String(chap.id) === String(chapterId.value));
  if (idx > 0) checkPermissionAndRead(arr[idx - 1])
  else showTip('这是第一话哦~');
}
const goToNextChapter = () => {
  const arr = novelStore.chapterList || [];
  const idx = arr.findIndex(chap => String(chap.id) === String(chapterId.value));
  if (idx < arr.length - 1) checkPermissionAndRead(arr[idx + 1])
  else showTip('这是最后一话哦~');
}

// 目录按钮
const openDrawerAndLoadChapters = async () => {
  await novelStore.fetchNovelAllChapters(comicId.value)
  await nextTick()
  isDrawerOpen.value = true
}

// =============== 权限判断只做购买弹窗，不做跳转 ===============
function isChapterUnlocked(chapterId: string | number) {
  return unlockedList.value.includes(String(chapterId));
}
async function checkPermissionAndRead(chapter: any) {
  await userStore.fetchUserInfo();
  const info = (userInfo || {}) as UserInfo
  userDiscount.value = (info.vip_status === 1 ? 0.8 : 1)

  // 1. 已解锁
  if (isChapterUnlocked(chapter.id)) {
    goReadChapter(chapter.id)
    return
  }
  // 2. VIP章节
  if (chapter.is_vip == 1) {
    if (info.can_view_vip_video == 1) goReadChapter(chapter.id)
    else vipPopup.value = true
    return
  }
  // 3. 金币章节
  if (chapter.coin > 0) {
    if (info.can_watch_coin == 1) goReadChapter(chapter.id)
    else {
      currentPurchaseChapter.value = chapter
      purchaseSheet.value = true
    }
    return
  }
  // 4. 免费章节直接进
  goReadChapter(chapter.id)
}

const handleScroll = () => {
  if (pagesContainer.value) chapterScrollPositions.value[String(chapterId.value ?? '')] = pagesContainer.value.scrollTop;
};

// 购买流程
// 购买流程
async function confirmPurchase() {
  try {
    await novelStore.buyNovelChapter(currentPurchaseChapter.value.id)
    // 解锁章节信息已经通过 purchase 成功更新，不需要再次拉取
    showToast('购买成功并解锁')
    purchaseSheet.value = false
    await userStore.fetchUserInfo()
    // 直接跳转到章节，不需要再加载解锁章节
    goReadChapter(currentPurchaseChapter.value.id)
  } catch (e: any) {
    purchaseSheet.value = false
    showToast(e?.msg || '购买失败')
    setTimeout(() => { coinPopup.value = true }, 300)
  }
}

function goCoinRecharge() {
  purchaseSheet.value = false
  router.push({ path: '/vip', query: { tab: 'coin' } })
}

// 章节内容加载（watch 路由拉）
const loadChapterData = async (novelId, chapId) => {
  await novelStore.fetchNovelAllChapters(novelId)
  const arr = novelStore.chapterList || []
  const res = await novelStore.fetchChapterDetail(chapId)
  currentChapterContent.value = res?.content || ''
  const matched = arr.find((chap) => String(chap.id) === String(chapId))
  currentChapterTitle.value = matched ? matched.title : ''
  nextTick(() => {
    sliderPage.value = 1;
    totalPages.value = 1;
    if (chapterScrollPositions.value[String(chapId)] !== undefined && pagesContainer.value) {
      pagesContainer.value.scrollTop = chapterScrollPositions.value[String(chapId)];
    } else if (pagesContainer.value) {
      pagesContainer.value.scrollTop = 0;
    }
  });
}

// 历史记录
let lastHistoryWriteTime = 0;
function writeHistory(force = false) {
  const now = Date.now();
  if (!force && now - lastHistoryWriteTime < 60 * 1000) return;
  lastHistoryWriteTime = now;
  if (comicId.value) {
    const historyStore = useHistoryStore();
    const arr = novelStore.chapterList || [];
    const lastChapterIndex = arr.findIndex(
      (c) => String(c.id) === String(chapterId.value)
    );
    historyStore.addRecord({
      id: String(comicId.value),
      type: 'novel',
      time: new Date().toISOString(),
      data: {
        title: comicTitle.value || '未命名小说',
        cover: cover.value || '',
        author: '佚名',
        episodes: arr.length || 0,
        lastRead: lastChapterIndex >= 0 ? lastChapterIndex + 1 : 1
      }
    });
  }
}

const shareComic = () => {
  router.push({ name: 'PromotionShare' });
}

// 生命周期
onMounted(async () => {
  cover.value = sessionStorage.getItem('reader-cover') || '/images/lanjiazai1.webp';
  await novelStore.loadUnlockedNovelChapters(comicId.value)
  await loadChapterData(comicId.value, chapterId.value)
  comicTitle.value = sessionStorage.getItem('reader-title') || ''
  writeHistory()
  sessionStorage.removeItem('novel-reader-back-from');
});

watch(
  () => props.chapterId,
  async (newVal, oldVal) => {
    if (newVal !== oldVal) {
      await loadChapterData(comicId.value, newVal)
      writeHistory();
    }
  }
);
onUnmounted(() => {
  stopAutoFlip();
  if (tipTimer) clearTimeout(tipTimer);
  writeHistory(true);
  if (typeof window !== 'undefined') {
    window.removeEventListener('beforeunload', writeHistory as any);
  }
});

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => writeHistory(true));
}
</script>


<style scoped>
.comic-reader-wrapper {
  background: var(--reader-bg, #f5f5f5);
  color: #333;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.reader-top-bar, .reader-bottom-bar {
  position: fixed; left: 0; right: 0;
  background: rgba(0,0,0,0.4);
  display: flex; flex-direction: column;
  z-index: 100;
  transition: transform 0.3s ease;
}
.reader-top-bar {
  top: 0;
  justify-content: space-between;
  height: 13vw;      /* 原50px → 13vw */
  flex-direction: row;
  padding: 0 4vw;    /* 原15px → 4vw */
  transform: translateY(-100%);
}
.reader-bottom-bar {
  bottom: 0;
  transform: translateY(100%);
  height: 16vw;      /* 原60px → 16vw */
  padding-top: 1vw;
}
.comic-reader-wrapper.show-controls .reader-top-bar { transform: translateY(0); }
.comic-reader-wrapper.show-controls .reader-bottom-bar { transform: translateY(0); }
.reader-top-bar .back-icon, .reader-top-bar .share-icon {
  width: 6vw; height: 6vw;         /* 24px → 6vw */
  margin-top: 3vw;                 /* 13px → 3vw */
}
.chapter-title {
  font-size: 5.7vw;                /* 22px → 5.7vw */
  font-weight: bold;
  flex: 1;
  text-align: center;
  margin: 0 2vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2.7vw;               /* 10px → 2.7vw */
  color: #fff;
}

.comic-pages-container {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; align-items: center;
}
.comic-pages-container[data-flip-mode="vertical"] {
  overflow-y: auto;
  flex-direction: column;
}

.chapter-nav-btn {
  position: fixed; top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.5); backdrop-filter: blur(0.8vw);
  width: 16vw; height: 29vw;    /* 60x110px → 16vw x 29vw */
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  z-index: 90;
  transition: transform 0.3s ease;
  box-shadow: 0 0 2.6vw rgba(0,0,0,0.3);
}
.prev-chapter-btn { left: 0; border-top-right-radius: 16vw; border-bottom-right-radius: 16vw; transform: translate(-100%, -50%);}
.next-chapter-btn { right: 0; border-top-left-radius: 16vw; border-bottom-left-radius: 16vw; transform: translate(100%, -50%);}
.comic-reader-wrapper.show-controls .prev-chapter-btn { transform: translate(0, -50%);}
.comic-reader-wrapper.show-controls .next-chapter-btn { transform: translate(0, -50%);}
.prev-text, .next-text {
  writing-mode: vertical-rl;
  font-size: 3.5vw; margin-bottom: 1.6vw;
}
.prev-text { transform: translate(-1.6vw, 1.4vw);}
.next-text { transform: translate(1.6vw, 1.4vw);}
.prev-chapter-btn .chapter-nav-icon { width: 4.8vw; height: 4.8vw; margin-top: 1.3vw; margin-right: 3.2vw; }
.next-chapter-btn .chapter-nav-icon { width: 4.8vw; height: 4.8vw; margin-top: 1.3vw; margin-left: 3.2vw; }

.bottom-buttons { display: flex; justify-content: space-around; padding: 1.3vw 0; }
.bottom-control-item {
  display: flex; flex-direction: column; align-items: center;
  font-size: 3vw; transition: 0.3s;
}
.bottom-control-item img { width: 6vw; height: 6vw; margin-bottom: 1vw; }
.bottom-control-item.active img, .bottom-control-item.active span { filter: brightness(150%); color: #fff; }
.bottom-control-item span { color: #fff; }

.auto-flip-panel {
  position: fixed; bottom: 0; left: 0;
  background: rgba(255,255,255,0.95);
  width: 100%; padding: 5vw;
  z-index: 9999; box-shadow: 0 -0.5vw 2.7vw rgba(0,0,0,0.2);
  color: #333;
}
.speed-label {
  text-align: center;
  font-weight: bold;
  font-size: 4.3vw;
  margin-bottom: 2.7vw;
}
.speed-slider {
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 5.3vw;
}
.speed-slider input[type="range"] { margin: 0 2.6vw; width: 60%; }
.button-group { display: flex; justify-content: space-around; }
.stop-btn {
  background: #ddd; border: none;
  padding: 2.7vw 5.3vw; border-radius: 8vw; font-weight: bold;
}
.start-btn {
  background: #ff6699; color: #fff; border: none;
  padding: 2.7vw 6.7vw; border-radius: 8vw; font-weight: bold;
}

.top-tip-message {
  position: fixed;
  top: 13vw; left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2vw 4vw;
  border-radius: 1.3vw;
  font-size: 3.7vw;
  z-index: 101;
  white-space: nowrap;
  pointer-events: none;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.novel-text {
  padding: 5vw;
  line-height: 2;
  color: #333;
  font-size: 4.5vw;  /* 17px ≈ 4.5vw */
  white-space: pre-wrap;
  word-break: break-word;
}
.novel-line { margin-bottom: 3vw; }

.bottom-control-item img[src*="setting3"],
.bottom-control-item img[src*="sun"],
.bottom-control-item img[src*="moon"] {
  width: 6vw; height: 6vw;
  background: #fff;
  border-radius: 2vw;
  padding: 1vw;
  box-sizing: border-box;
}

.chapter-nav-text { color: #fff; }

.comic-reader-wrapper.dark { background: #1c1c1e !important; color: #e0e0e0 !important; }
.comic-reader-wrapper.dark .novel-text { background: #1c1c1e; color: #e0e0e0; }
.comic-reader-wrapper.dark .chapter-nav-text, .comic-reader-wrapper.dark .bottom-control-item span { color: #fff; }

.reading-settings-panel {
  position: fixed; bottom: 0; left: 0; width: 100%;
  background: #fff; color: #333;
  padding: 4vw 5vw 2.7vw;
  box-shadow: 0 -0.5vw 2.7vw rgba(0, 0, 0, 0.2);
  z-index: 9999; font-size: 4vw;
  border-top-left-radius: 2.7vw; border-top-right-radius: 2.7vw;
}
.reading-settings-panel .panel-title {
  text-align: center; font-weight: bold;
  margin-bottom: 4vw;
}
.panel-section {
  display: flex; align-items: center; justify-content: space-between;
  margin: 2.7vw 0;
}
.theme-options { display: flex; gap: 2.1vw; }
.close-btn {
  width: 100%; margin-top: 5vw; padding: 2vw;
  background: #f44; color: #fff; border: none; border-radius: 1.3vw;
}
.panel-header {
  display: flex; justify-content: center; align-items: center;
  position: relative; margin-bottom: 2.7vw;
}
.close-icon {
  position: absolute; right: 0; top: 0;
  width: 5.9vw; height: 5.9vw; cursor: pointer;
}
.darkmode-toggle {
  width: 7.5vw; height: 7.5vw; border-radius: 50%;
  background: #eee; padding: 1vw;
  box-shadow: 0 0 0.5vw rgba(0,0,0,0.2);
}
.panel-section.horizontal { display: flex; align-items: center; justify-content: space-between; }
.label { flex-shrink: 0; width: 24vw; }
.range-control { display: flex; align-items: center; gap: 2.7vw; }
.full-slider { width: 100%; max-width: 67vw; }
.theme-dot {
  width: 6.4vw; height: 6.4vw; border-radius: 50%;
  cursor: pointer; border: 0.53vw solid #999;
  transition: border 0.3s;
}
.theme-dot.active { border-color: #f44; }
.brightness-row { display: flex; align-items: center; gap: 3.2vw; }
.brightness-row .label { width: 24vw; flex-shrink: 0; }
.brightness-row .slider { flex: 1; max-width: 51vw; }
.font-size-row { display: flex; align-items: center; gap: 3.2vw; }
.font-size-row .label { width: 24vw; flex-shrink: 0; }
.font-size-controls { display: flex; align-items: center; gap: 14.7vw; }
.font-size-controls .btn {
  padding: 1vw 2vw; font-size: 3.7vw; border: none;
  background: #eee; border-radius: 1.3vw; cursor: pointer;
}
.font-size-controls .font-value { min-width: 8vw; text-align: center; }
/* 隐藏滚动条样式不变 */
.hide-scrollbar {
  scrollbar-width: none; -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none !important; width: 0 !important; height: 0 !important; background: transparent !important;
}
.setting-icon {
  width: 6vw;
  height: 6vw;
  background: #fff;
  border-radius: 2vw;
  padding: 1vw;
  box-sizing: border-box;
  /* 如样式还不生效，加上下面一行 */
  /* display: block; */
}
.popup-box {
  padding: 5vw;
  text-align: center;
}
.popup-box h3 {
  margin: 0;
  font-size: 4vw;
  font-weight: bold;
}
.popup-text {
  font-size: 3.5vw;
  color: #333;
  margin: 3vw 0 5vw;
}
.popup-actions {
  display: flex;
  gap: 3vw;
}
.popup-actions button {
  flex: 1;
  border: none;
  border-radius: 1vw;
  padding: 2vw 0;
  font-size: 3.5vw;
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
  padding: 4vw;
}
.purchase-sheet h3 {
  text-align: center;
  font-weight: bold;
  font-size: 4vw;
  margin-bottom: 3vw;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2vw 0;
  font-size: 4vw;
}
.notice {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 3vw;
  margin: 2vw 0;
}
.divider {
  height: 0.27vw;
  background: #eee;
  margin: 2vw 0;
}
.red {
  color: #f56c6c;
}
.orange {
  color: #f60;
}
.buy-btn {
  margin-top: 4vw;
  border-radius: 2vw;
}

</style>