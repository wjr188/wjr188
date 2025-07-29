<template>
 <div class="video-wrapper" ref="wrapperRef">
    <video
      ref="videoRef"
      class="native-player"
      :poster="cover"
      playsinline
      webkit-playsinline
      x5-video-player-type="h5"
      x5-video-player-fullscreen="true"
      preload="auto"
      muted
      :controls="forceUseNativeControls"
    ></video>

    <div v-if="showPlayIcon && !forceUseNativeControls" class="center-icon icon-play">
      <img src="/icons/play1.svg" />
    </div>
    <div v-if="showPauseIcon && !forceUseNativeControls" class="center-icon icon-pause">
      <img src="/icons/pause.svg" />
    </div>

    <!-- ✅ iOS 限制提示 -->
    <div v-if="showIosBrowserTip" class="tip-mask">
      <div class="tip-box">
        <div class="tip-text">
          当前浏览器限制播放体验<br />
          请使用 <span class="highlight">Safari</span> 或 <span class="highlight">Chrome</span> 打开观看
        </div>
        <div class="close-btn" @click.stop="showIosBrowserTip = false">✕</div>
      </div>
    </div>

    <!-- ✅ Android QQ / 360 浏览器提示 -->
    <div v-if="showAndroidBrowserTip" class="tip-mask">
      <div class="tip-box">
        <div class="tip-text">
          当前浏览器限制播放体验<br />
          请使用其他浏览器打开
        </div>
        <div class="close-btn" @click.stop="showAndroidBrowserTip = false">✕</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, defineExpose } from 'vue'
import Hls from 'hls.js'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { showConfirmDialog } from 'vant'

// Store
const userStore = useUserStore()
const router = useRouter()

// Props
const props = defineProps<{
  src: string
  cover: string
  shouldPlay: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'requestPlay'): void
  (e: 'timeUpdate', payload: { currentTime: number; duration: number; buffered: TimeRanges }): void
  (e: 'played'): void
}>()

// Refs
const videoRef = ref<HTMLVideoElement | null>(null)
const wrapperRef = ref<HTMLDivElement | null>(null)

const isPlaying = ref(false)
const showPlayIcon = ref(true)
const showPauseIcon = ref(false)

let isFirstClick = false
let hls: Hls | null = null

// ✅ 环境判断
const ua = navigator.userAgent
const isAndroid = /Android/i.test(ua)
const isIOS = /iP(hone|od|ad)/i.test(ua)
const isIOSRestricted = /UCBrowser|Quark|Baidu|QQBrowser/i.test(ua)
const isAndroidRestricted = isAndroid && /QQBrowser|360/i.test(ua)

// ✅ 控制原生控件
const forceUseNativeControls = isIOS && isIOSRestricted

// ✅ 提示弹窗
const showIosBrowserTip = ref(forceUseNativeControls)
const showAndroidBrowserTip = ref(isAndroidRestricted)

// ✅ 判断是否支持原生HLS
const canPlayHLSNatively = (): boolean => {
  const testVideo = document.createElement('video')
  return testVideo.canPlayType('application/vnd.apple.mpegurl') !== ''
}
const useNativeHLS = isIOS && canPlayHLSNatively()

// ✅ 播放进度 raf
let rafId: number | null = null

const updateProgress = () => {
  const video = videoRef.value
  if (video && !video.paused) {
    emit('timeUpdate', {
      currentTime: video.currentTime,
      duration: video.duration,
      buffered: video.buffered
    })
    rafId = requestAnimationFrame(updateProgress)
  }
}
const stopProgress = () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

const togglePlay = async () => {
  const video = videoRef.value
  if (!video || forceUseNativeControls) return

  if (!isFirstClick) {
    isFirstClick = true

    if (!userStore.isVIP) {
      if (!userStore.canWatchDyVideo()) {
        await showConfirmDialog({
          title: '温馨提示',
          message: '抖阴观看次数已用完，请开通VIP',
          confirmButtonText: '立即开通',
          cancelButtonText: '取消',
          className: 'vip-dialog',
          closeOnClickOverlay: true
        })
          .then(() => {
            router.push('/VIP')
          })
          .catch(() => {
          })
        return
      }
      userStore.consumeDyVideo()
    }

    video.muted = false
    try {
      await video.play()
      isPlaying.value = true
      showPlayIcon.value = true
      setTimeout(() => (showPlayIcon.value = false), 800)
      updateProgress()
      emit('played')
    } catch (e) {
      console.warn('第一次播放失败', e)
    }
    return
  }

  if (video.paused) {
    try {
      await video.play()
      isPlaying.value = true
      showPlayIcon.value = true
      setTimeout(() => (showPlayIcon.value = false), 800)
      updateProgress()
    } catch (e) {
      console.warn('播放失败', e)
    }
  } else {
    video.pause()
    isPlaying.value = false
    showPauseIcon.value = true
    setTimeout(() => (showPauseIcon.value = false), 800)
    stopProgress()
  }
}

watch(
  () => props.shouldPlay,
  async (val) => {
    const video = videoRef.value
    if (
      val &&
      isFirstClick &&
      video &&
      !video.ended &&
      !video.seeking &&
      video.paused &&
      !forceUseNativeControls
    ) {
      try {
        await video.play()
        isPlaying.value = true
        showPlayIcon.value = false
        updateProgress()
        emit('played')
      } catch (e) {
        console.warn('自动播放失败', e)
      }
    }
  }
)

watch(
  () => props.src,
  (newSrc) => {
    loadVideo(newSrc)
  }
)

const loadVideo = (source: string) => {
  const video = videoRef.value
  if (!video || !source) return

  stopProgress()

  if (hls) {
    hls.destroy()
    hls = null
  }

  video.removeEventListener('loadeddata', onLoadedData)
  video.removeEventListener('error', onError)

  if (
    Hls.isSupported() &&
    source.trim().endsWith('.m3u8') &&
    !useNativeHLS &&
    !forceUseNativeControls
  ) {
    hls = new Hls()
    hls.loadSource(source.trim())
    hls.attachMedia(video)
  } else {
    video.src = source.trim()
  }

  video.addEventListener('loadeddata', onLoadedData)
  video.addEventListener('error', onError)
}

function onLoadedData() {
}

function onError() {
  console.error('视频加载失败')
}

onMounted(() => {
  loadVideo(props.src)
  if (wrapperRef.value) {
    wrapperRef.value.addEventListener('click', togglePlay)
  }
})

onBeforeUnmount(() => {
  const video = videoRef.value
  if (video) {
    video.pause()
    stopProgress()
    video.removeEventListener('loadeddata', onLoadedData)
    video.removeEventListener('error', onError)
    video.removeAttribute('src')
    video.load()
  }
  if (hls) {
    hls.destroy()
    hls = null
  }
})

defineExpose({
  seekTo(time: number) {
    const video = videoRef.value
    if (video) {
      video.currentTime = time
      if (video.paused) {
        video.play().catch(() => {})
        isPlaying.value = true
        updateProgress()
      }
    }
  }
})
</script>
<style scoped>
.video-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

/* 视频全屏适配 */
.native-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: black;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
}

/* 中心播放/暂停按钮 */
.center-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 19.2vw; /* 72px */
  height: 19.2vw;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  pointer-events: none;
}
.center-icon img {
  width: 7.5vw; /* 28px */
  height: 7.5vw;
}

/* 提示遮罩 */
.tip-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tip-box {
  background: white;
  padding: 6.4vw 8.5vw; /* 24px 32px */
  border-radius: 4.3vw; /* 16px */
  position: relative;
  max-width: 80%;
  text-align: center;
  font-size: 4.3vw; /* 16px */
  color: #333;
  box-shadow: 0 2.1vw 6.4vw rgba(0, 0, 0, 0.2); /* 8px 24px */
}
.tip-text {
  line-height: 1.6;
}
.tip-text .highlight {
  color: #ff4d4f;
  font-weight: bold;
}
.close-btn {
  position: absolute;
  top: 2.1vw; /* 8px */
  right: 3.2vw; /* 12px */
  font-size: 5.3vw; /* 20px */
  color: #999;
  cursor: pointer;
}
</style>
