<template>
  <div class="audio-player" v-if="audioData">
    <!-- 顶部 -->
    <div class="header">
      <img src="/icons/back3.svg" class="header-icon" @click="goBack" />
      <span class="title">{{ audioData.title }}</span>
      <img src="/icons/share2.svg" class="header-icon" @click="goPromotion" />
    </div>

    <!-- 中间唱片 -->
    <div class="disc-wrapper">
      <div class="disc" :class="{ spinning: playing }">
        <img class="record" src="/icons/vinyl.png" alt="唱片" />
        <img class="cover" :src="audioData.cover" alt="封面" />
      </div>
      <img src="/icons/needle.png" class="needle" :class="{ active: playing }" />
    </div>

    <!-- 作者信息 -->
    <div class="author">
      作者：{{ audioData.author }}
      <span class="views-chip">
        <img src="/icons/audio.svg" class="audio-icon" />
        {{ formatViews(audioData.views) }}
      </span>
    </div>

    <div class="bottom-section">
      <!-- 操作按钮 -->
      <div class="actions">
        <div @click="toggleLike">
  <img
    :src="liked ? '/icons/like7.svg' : '/icons/like6.svg'"
    class="big-icon"
  />
  <span>{{ formatViews(audioData.views) }}</span>
</div>
<div @click="toggleFavorite">
  <img
    :src="favorited ? '/icons/star7.svg' : '/icons/star6.svg'"
    class="big-icon"
  />
  <span>{{ formatCount(audioData.favorites) }}</span>
</div>

        <div @click="timerSheetVisible = true">
          <img src="/icons/clock.svg" />
          <span>定时</span>
        </div>
        <div @click="handlePurchase">
          <img src="/icons/cart.svg" />
          <span>{{ audioData.type === 'vip' ? '开通VIP' : '单章购买' }}</span>
        </div>
      </div>

      <!-- 播放进度 -->
      <div class="progress">
        <van-slider
          v-model="currentTime"
          :max="duration"
          @change="seek"
          bar-height="2px"
          button-size="14px"
        />
      </div>
      <div class="time-row">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>

      <!-- 播放控制 -->
      <div class="controls">
        <img src="/icons/Table.svg" @click="playlistSheet = true" />
        <img src="/icons/Previous.svg" @click="prev" />
        <img
          :src="playing ? '/icons/pause5.svg' : '/icons/play5.svg'"
          class="play-icon"
          @click="toggle"
        />
        <img src="/icons/Next.svg" @click="next" />
        <img :src="muted ? '/icons/mute.svg' : '/icons/sound.svg'" @click="toggleMute" />
      </div>
    </div>

    <!-- 定时 ActionSheet -->
    <van-action-sheet
      v-model:show="timerSheetVisible"
      title="定时关闭"
      :actions="timerOptions"
      @select="handleTimerSelect"
      close-on-click-action
      closeable
    />

    <!-- 播放列表抽屉 -->
  <van-action-sheet
  v-model:show="playlistSheet"
  closeable
  close-on-click-overlay
  safe-area-inset-bottom
>
  <div class="playlist-sheet">
    <!-- 顶部标题行 -->
    <div class="playlist-header">
  <!-- 左侧排序 -->
  <div class="sort" @click="toggleSort">
    <img
      :src="isAsc ? '/icons/sort-asc.svg' : '/icons/sort-desc.svg'"
      class="sort-icon"
    />
    <span>{{ isAsc ? '正序' : '倒序' }}</span>
  </div>

  <!-- 中间标题 -->
  <div class="title-center">播放列表</div>

  <!-- 右上角关闭 (用vant自带icon) -->
  <van-icon name="cross" size="20" @click="playlistSheet = false" />
</div>

    <!-- 列表 -->
    <div
  v-for="item in sortedList"
  :key="item.id"
  class="playlist-item"
  @click="playItem(item)"
>
      <div class="left">
        <img src="/icons/list.svg" class="list-icon" />
        <span class="name">{{ item.title }}</span>
        <span class="badge" :class="item.type === 'coin' ? 'coin' : 'vip'">
          {{ item.type === 'coin' ? '金币' : 'VIP' }}
        </span>
      </div>
      <div class="right" @click.stop="handlePurchase">
        <img src="/icons/cart.svg" />
        <span>购买</span>
      </div>
    </div>
  </div>
</van-action-sheet>

    <!-- 金币不足弹窗 -->
    <van-popup
      v-model:show="coinPopup"
      close-on-click-overlay
      :style="{ maxWidth: '90%', width: '500px', borderRadius: '12px' }"
    >
      <div class="popup-box">
        <h3>温馨提示</h3>
        <p class="popup-text">金币余额不足，是否立即充值</p>
        <div class="popup-actions">
          <button class="gray-btn" @click="coinPopup = false">取消</button>
          <button class="orange-btn" @click="goCoinRecharge">立即充值</button>
        </div>
      </div>
    </van-popup>

    <!-- VIP弹窗 -->
    <van-popup
      v-model:show="vipPopup"
      close-on-click-overlay
      :style="{ maxWidth: '90%', width: '500px', borderRadius: '12px' }"
    >
      <div class="popup-box">
        <h3>温馨提示</h3>
        <p class="popup-text">
          有声免费解锁次数已用完，开通VIP可畅享免费解锁<br />邀请好友注册立刻送3天VIP
        </p>
        <div class="popup-actions">
          <button class="gray-btn" @click="goPromotion">分享得VIP</button>
          <button class="orange-btn" @click="goVip">立即开通VIP</button>
        </div>
      </div>
    </van-popup>

    <!-- 购买详情抽屉 -->
    <van-action-sheet
      v-model:show="purchaseSheet"
      closeable
      safe-area-inset-bottom
    >
      <div class="purchase-sheet">
        <h3>购买单章金币有声</h3>
        <div class="row">
          <div>金币余额：{{ userCoin.toFixed(2) }}</div>
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
          <span class="red">{{ audioData.coinPrice.toFixed(2) }}金币</span>
        </div>
        <div class="notice">
          <span :class="{ orange: userDiscount >= 1, red: userDiscount < 1 }">
            {{ userDiscount < 1 ? `您享受 ${(userDiscount * 10).toFixed(1)}折优惠` : '您当前不享受折扣优惠' }}
          </span>
          <van-button type="primary" plain size="small" color="#ff69b4" @click="goVip">
  购买VIP享受折扣
</van-button>
        </div>
        <div class="divider"></div>
        <div class="row">
          <span>实际支付</span>
          <span class="red">{{ discountedPrice.toFixed(2) }}金币</span>
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

    <audio
      ref="audio"
      :src="audioData.audioUrl"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="updateTime"
      @ended="playing = false"
    />
  </div>
  <div v-else class="empty-data-message">
    找不到音频数据~
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

// mock 数据
import { audiodetails } from '@/mock/acg/audio/audiodetail.js'

// 类型声明
interface AudioItem {
  id: string | number
  title: string
  author: string
  cover: string
  audioUrl: string
  views: number
  favorites: number
  coinPrice: number
  type: 'coin' | 'vip'
}

const router = useRouter()
const route = useRoute()

const audioId = computed(() => route.params.id as string | number)
const audioData = ref<AudioItem | null>(null)

const audio = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const muted = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const liked = ref(false)
const favorited = ref(false)

const userCoin = ref(0.0) // 初始余额
const userDiscount = ref(1) // 默认无折扣

const discountedPrice = computed(() => {
  return audioData.value
    ? Number((audioData.value.coinPrice * userDiscount.value).toFixed(2))
    : 0
})

// 排序控制
const isAsc = ref(true)
const playlistSheet = ref(false)
const playlist = ref<AudioItem[]>(Object.values(audiodetails))

const sortedList = computed(() => {
  return isAsc.value ? [...playlist.value] : [...playlist.value].reverse()
})

const timerSheetVisible = ref(false)
const purchaseSheet = ref(false)
const coinPopup = ref(false)
const vipPopup = ref(false)

interface TimerOption {
  name: string
}
const timerOptions: TimerOption[] = [
  { name: '不启用' },
  { name: '播放完当前声音' },
  { name: '10分钟' },
  { name: '20分钟' },
  { name: '30分钟' },
  { name: '40分钟' },
  { name: '60分钟' }
]

let timer: ReturnType<typeof setTimeout> | null = null

function toggleSort() {
  isAsc.value = !isAsc.value
}

function handleTimerSelect(item: TimerOption) {
  if (timer) clearTimeout(timer)
  if (item.name === '不启用') {
    showToast('定时关闭已取消')
  } else if (item.name === '播放完当前声音') {
    showToast('将在当前音频结束后关闭')
    audio.value?.addEventListener('ended', stopPlaybackOnce, { once: true })
  } else {
    const minutes = parseInt(item.name)
    if (!isNaN(minutes)) {
      const ms = minutes * 60 * 1000
      timer = setTimeout(() => {
        audio.value?.pause()
        showToast('已自动停止播放')
      }, ms)
      showToast(`将在 ${minutes} 分钟后关闭`)
    }
  }
}
function stopPlaybackOnce() {
  audio.value?.pause()
  showToast('已自动停止播放')
}

function toggleLike() {
  liked.value = !liked.value
  showToast(liked.value ? '点赞成功' : '取消点赞')
}

function toggleFavorite() {
  favorited.value = !favorited.value
  showToast(favorited.value ? '收藏成功' : '取消收藏')
}

function handlePurchase() {
  if (audioData.value?.type === 'coin') {
    purchaseSheet.value = true
  } else {
    vipPopup.value = true
  }
}

function confirmPurchase() {
  if (audioData.value && userCoin.value >= discountedPrice.value) {
    userCoin.value -= discountedPrice.value
    purchaseSheet.value = false
    showToast('购买成功并解锁')
  } else {
    purchaseSheet.value = false
    coinPopup.value = true
  }
}

function toggle() {
  if (!audio.value) return
  if (playing.value) {
    audio.value.pause()
  } else {
    audio.value.play()
  }
  playing.value = !playing.value
}

function toggleMute() {
  if (audio.value) {
    muted.value = !muted.value
    audio.value.muted = muted.value
  }
}

function updateTime() {
  if (audio.value) {
    currentTime.value = Math.floor(audio.value.currentTime)
    duration.value = Math.floor(audio.value.duration)
  }
}

function seek(val: number) {
  if (audio.value) {
    audio.value.currentTime = val
  }
}

function formatTime(t: number) {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function formatViews(v: number) {
  return v >= 10000 ? (v / 10000).toFixed(1) + 'w' : v.toString()
}

function formatCount(num: number) {
  if (num >= 10000) return (num / 10000).toFixed(2) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(2) + 'k'
  return num.toString()
}

function goBack() {
  window.history.back()
}
function goPromotion() {
  router.push('/promotion-share')
}
function goVip() {
  router.push('/vip')
}
function goCoinRecharge() {
  router.push('/vip?tab=coin')
}
function prev() {
  if (audio.value) {
    audio.value.currentTime = 0
  }
}
function next() {
  if (audio.value) {
    audio.value.currentTime = duration.value
  }
}
function onLoadedMetadata() {
  if (audio.value) {
    duration.value = Math.floor(audio.value.duration)
  }
}

function playItem(item: AudioItem) {
  audioData.value = item
  if (audio.value) {
    audio.value.src = item.audioUrl
    currentTime.value = 0
    playing.value = false
  }
  playlistSheet.value = false
}

watch(
  () => route.params.id,
  (newId) => {
    if (newId && typeof newId === 'string') {
      audioData.value = audiodetails[newId]
    } else {
      audioData.value = null
    }
  },
  { immediate: true }
)
</script>
<style scoped>
.audio-player {
  width: 100%;
  margin: 0 auto;
  padding: 2.66vw;
  text-align: center;
  overflow: hidden;
  box-sizing: border-box;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 0.27vw solid #ddd;
  padding: 2.66vw 0;
}
.header-icon {
  width: 6.4vw;
  height: 6.4vw;
}
.title {
  font-weight: bold;
  font-size: 5vw;
}
.disc-wrapper {
  position: relative;
  width: 80%;
  padding-top: 80%;
  margin: 10vh auto 2.66vw;
}
.disc {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.record {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.cover {
  position: absolute;
  top: 25%;
  left: 25%;
  width: 50%;
  height: 50%;
  border-radius: 50%;
}
.disc.spinning {
  animation: spin 5s linear infinite;
}
.needle {
  position: absolute;
  top: -12%;
  right: -7%;
  width: 28%;
  height: auto;
  transform-origin: top center;
  transform: rotate(-30deg);
  transition: transform 0.4s ease;
}
.needle.active {
  transform: rotate(0deg);
}
.author {
  margin: 2.66vw 0;
  font-size: 3.73vw;
}
.audio-icon {
  width: 3.73vw;
  vertical-align: middle;
}
.views {
  margin-left: 2.13vw;
  font-size: 3.2vw;
  color: #999;
}
.bottom-section {
  position: fixed;
  bottom: 10.66vw;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 2.66vw 0;
}
.actions {
  display: flex;
  justify-content: space-between;
  padding: 0 5.33vw;
  margin: 4vw 0;
}
.actions div {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 3.2vw;
}
.actions img {
  width: 6.93vw;
  height: 6.93vw;
}
.actions img.big-icon {
  width: 8vw;
  height: 8vw;
}
.progress {
  display: flex;
  align-items: center;
  gap: 1.6vw;
  margin: 3.2vw 0 1.06vw;
  padding: 0 4.26vw;
}
.controls {
  display: flex;
  justify-content: space-around;
  margin-top: 3.2vw;
}
.controls img {
  width: 6.93vw;
  height: 6.93vw;
}
.controls .play-icon {
  width: 8vw;
  height: 8vw;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
.empty-data-message {
  text-align: center;
  padding: 16vw;
  font-size: 4.26vw;
  color: #999;
}
.time-row {
  display: flex;
  justify-content: space-between;
  padding: 0.53vw 4.26vw 0;
  font-size: 3.2vw;
  color: #999;
}
.views-chip {
  display: inline-flex;
  align-items: center;
  background: #eee;
  color: #666;
  border-radius: 3.2vw;
  padding: 0.53vw 1.6vw;
  font-size: 3.2vw;
  margin-left: 2.13vw;
}
.views-chip .audio-icon {
  width: 3.73vw;
  margin-right: 0.8vw;
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
.playlist-sheet {
  padding: 0;
}
.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3.2vw 4.26vw;
  border-bottom: 0.27vw solid #eee;
}
.playlist-header .sort {
  display: flex;
  align-items: center;
  font-size: 3.73vw;
  color: #333;
  cursor: pointer;
}
.playlist-header .sort-icon {
  width: 4.26vw;
  height: 4.26vw;
  margin-right: 1.06vw;
}
.playlist-header .title-center {
  font-size: 4.26vw;
  font-weight: bold;
}
.playlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.66vw 4.26vw;
  border-bottom: 0.27vw solid #eee;
}
.playlist-item .left {
  display: flex;
  align-items: center;
  flex: 1;
  overflow: hidden;
}
.playlist-item .list-icon {
  width: 4.26vw;
  height: 4.26vw;
  margin-right: 1.6vw;
}
.playlist-item .name {
  font-size: 3.73vw;
  color: #ff6699;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 1.6vw;
}
.badge {
  display: inline-block;
  padding: 0.53vw 1.6vw;
  border-radius: 3.2vw;
  font-size: 3.2vw;
  color: #fff;
}
.badge.coin {
  background: #8000ff;
}
.badge.vip {
  background: #ff69b4;
}
.right {
  display: flex;
  align-items: center;
  font-size: 3.2vw;
  color: #666;
  cursor: pointer;
}
.right img {
  width: 4.26vw;
  height: 4.26vw;
  margin-right: 1.06vw;
}
</style>
