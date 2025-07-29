<template>
  <div class="promotion-share-page">
    <!-- 吸顶标题栏 -->
    <van-nav-bar title="分享推广" fixed placeholder left-arrow @click-left="$router.back()" />

    <!-- 滚动容器 -->
    <div class="scroll-container">
      <div class="ticket-card">
        <!-- 卡片上半部分 -->
        <div class="ticket-top">
          <div class="style1-title">{{ title }}</div>
          <div class="style1-subtitle">想看的片搜不到咋办，在这里一搜即有</div>
        </div>
        <!-- 虚线分割线 -->
        <div class="ticket-dashed-line">
          <div class="notch left"></div>
          <div class="dashed"></div>
          <div class="notch right"></div>
        </div>

        <!-- 卡片下半部分 -->
        <div class="ticket-bottom">
          <div class="invite-count">累计邀请 <span class="highlight">{{ inviteCount }}人</span></div>

          <div class="qrcode-wrapper">
            <qrcode-vue
  :value="qrLink || 'https://555.icu'"
  :size="180"
  :level="'H'"
  render-as="canvas"
  class="qrcode"
/>
          </div>

          <div class="invite-code">
            我的邀请码 <span class="code">{{ inviteCode }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="button-group">
        <van-button round type="primary" class="action-button gradient" @click="saveImage">保存图片</van-button>
        <van-button round type="primary" class="action-button gradient" @click="copyLink">复制链接</van-button>
      </div>

      <!-- 规则说明 -->
      <div class="rule-section">
        <div class="rule-title">规则说明</div>
        <div class="rule-text">1. 邀请1名好友成功注册即可获得3天VIP</div>
        <div class="rule-text">2. 邀请好友产生充值可获最高充值70%返利收益</div>
        <div class="rule-text">
          如：邀请好友A，A充值100元年卡VIP，即可获得70元收益，可提现！
        </div>
        <div class="rule-text">
          3. 邀请说明：点击【保存二维码】或【复制推广链接】，获取专属推广链接，推荐分享给他人下载即可
        </div>

        <!-- 邀请步骤 -->
        <div class="step-section">
          <div class="step-title">邀请步骤</div>

          <div class="step-block">
            <div class="step-number">1</div>
            <div class="step-content">
              <div class="step-subtitle">第一步</div>
              <div class="step-text">点击【保存图片】或【复制链接】</div>
            </div>
          </div>

          <div class="step-block">
            <div class="step-number">2</div>
            <div class="step-content">
              <div class="step-subtitle">第二步</div>
              <div class="step-text">将图片或者链接通过各种渠道发出去</div>
              <div class="icon-row">
                <img src="/icons/wechat.svg" class="icon" />
                <img src="/icons/qq.svg" class="icon" />
                <img src="/icons/weibo.svg" class="icon" />
                <img src="/icons/tiktok-active.svg" class="icon" />
                <img src="/icons/momo.svg" class="icon" />
                <img src="/icons/tantan.svg" class="icon" />
                <img src="/icons/qianshou.svg" class="icon" />
                <img src="/icons/zhihu.svg" class="icon" />
                <img src="/icons/tieba.svg" class="icon" />
                <img src="/icons/soul.svg" class="icon" />
              </div>
              <div class="step-text">如常用社交软件</div>
              <div class="icon-row">
                <img src="/icons/lol.svg" class="icon" />
                <img src="/icons/wangzhe.svg" class="icon" />
                <img src="/icons/cf.svg" class="icon" />
                <img src="/icons/dnf.svg" class="icon" />
                <img src="/icons/menghuan.svg" class="icon" />
                <img src="/icons/heping.svg" class="icon" />
              </div>
              <div class="step-text">如常用游戏软件</div>
            </div>
          </div>

          <div class="step-block">
            <div class="step-number">3</div>
            <div class="step-content">
              <div class="step-subtitle">第三步</div>
              <div class="step-text">
                被邀请人下载进入 app 即可自动绑定，被邀请人充值立马可获得奖励哦
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { showToast } from 'vant'
import { fetchPopupConfig } from '@/api/popupConfig.api'
import QrcodeVue from 'qrcode.vue'

// 从用户 store 获取数据
const userStore = useUserStore()
const { inviteCode, inviteCount, uuid } = storeToRefs(userStore)

// 域名和标题
const domain = ref('')
const title = ref('')

// 拼接好的链接
const qrLink = computed(() => {
  if (!domain.value) return ''
  if (domain.value.includes('?')) {
    return `${domain.value}&uid=${uuid.value}&invite=${inviteCode.value}`
  } else {
    return `${domain.value}?uid=${uuid.value}&invite=${inviteCode.value}`
  }
})

// 初始化
onMounted(async () => {
  try {
    const res = await fetchPopupConfig('mine')

    if (Array.isArray(res) && res.length > 0) {
      const firstItem = res[0]

      let parsedValue: { domain?: string, title?: string } = {}

      if (typeof firstItem.value === 'string') {
        try {
          parsedValue = JSON.parse(firstItem.value || '{}')
        } catch (e) {
          console.error('value解析失败', e)
        }
      } else if (typeof firstItem.value === 'object') {
        parsedValue = firstItem.value || {}
      } else {
        console.warn('【未知value类型】', firstItem.value)
      }

      domain.value = parsedValue.domain || ''
      title.value = parsedValue.title || '分享推广'
    } else {
      console.warn('【res为空或无数据】', res)
    }
  } catch (err) {
    console.error('获取二维码配置失败', err)
  }
})

// 保存图片
function saveImage(): void {
  nextTick(() => {
    showToast({
      message: '请自行截图保存分享哦~',
      duration: 1000,
      className: 'global-toast'
    })
  })
}

// 复制链接
function copyLink(): void {
  if (!qrLink.value) {
    showToast('链接为空')
    return
  }
  navigator.clipboard.writeText(qrLink.value)
  nextTick(() => {
    showToast({
      message: '复制成功',
      duration: 600,
      className: 'global-toast'
    })
  })
}
</script>

<style scoped>
.promotion-share-page {
  background: #ffffff;
  min-height: 100vh;
}

.scroll-container {
  padding: 4.3vw;
  overflow: visible;
}

.ticket-card {
  position: relative;
  background: #f1efef;
  border-radius: 4.3vw;
  box-shadow: 0 1.1vw 3.2vw rgba(0, 0, 0, 0.06);
  overflow: visible;
}

.ticket-top {
  text-align: center;
  padding: 6.4vw 4.3vw 2.1vw;
}

.ticket-dashed-line {
  position: relative;
  height: 6.4vw;
  background: transparent;
}
.dashed {
  position: absolute;
  top: 50%;
  left: 4.3vw;
  right: 4.3vw;
  height: 0.3vw;
  background-image: repeating-linear-gradient(
    to right,
    #080808,
    #8c4242 2.1vw,
    transparent 2.1vw,
    transparent 4.3vw
  );
  transform: translateY(-50%);
}

.notch {
  position: absolute;
  top: 50%;
  width: 11.2vw;
  height: 13.9vw;
  background: #fff;
  border-radius: 50%;
  transform: translateY(-50%);
  z-index: 2;
}
.notch.left {
  left: -5.3vw;
}
.notch.right {
  right: -5.3vw;
}

.ticket-bottom {
  text-align: center;
  padding: 4.3vw 4.3vw 6.4vw;
}
.invite-count {
  font-size: 4vw;
  color: #333;
  margin-bottom: 3.2vw;
}
.highlight {
  color: #e02433;
  font-weight: bold;
}
.qrcode-wrapper {
  margin: 3.2vw auto;
  width: 42.7vw;          /* 宽度控制大小 */
  padding: 0;             /* 不要padding */
  border-radius: 3.2vw;
  background: white;
  box-shadow: 0 0.5vw 1.6vw rgba(0,0,0,0.08);
  display: flex;          /* 用flex让内容居中 */
  justify-content: center;
  align-items: center;
}
.qrcode-wrapper canvas {
  width: 100%;
  height: auto;
  display: block;
}
.invite-code {
  font-size: 4vw;
  margin-top: 3.2vw;
  color: #333;
}
.code {
  font-weight: bold;
  color: #e02433;
  margin-left: 1.6vw;
}

.button-group {
  display: flex;
  justify-content: space-around;
  margin: 5.3vw 4.3vw 4.8vw;
  gap: 3.2vw;
}

.gradient {
  padding: 0 7.5vw;
  height: 11.7vw;
  border-radius: 13.3vw;
  background: #111;
  color: #fff;
  font-size: 4vw;
  font-weight: 600;
  border: 0.27vw solid #ff4d4f;
  box-shadow: inset 0 0 2.7vw #ff4d4f, 0 0 3.2vw rgba(255, 77, 79, 0.3);
  text-shadow: 0 0 0.8vw #ff4d4f;
  transition: 0.3s ease;
}
.gradient:active {
  transform: scale(0.96);
  box-shadow: inset 0 0 1.6vw #ff4d4f, 0 0 2.1vw rgba(255, 77, 79, 0.2);
}

::v-deep(.van-nav-bar__title) {
  font-size: 5.1vw !important;
  font-weight: bold !important;
  color: #333 !important;
}
::v-deep(.van-icon-arrow-left) {
  font-size: 6.9vw !important;
  color: #333 !important;
}

.style1-title {
  font-size: 6.9vw;
  font-weight: 800;
  color: #222;
  text-align: center;
}
.style1-subtitle {
  font-size: 3.7vw;
  color: #565555;
  text-align: center;
  margin-top: 1.6vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rule-section {
  margin: 0 4.3vw 6.4vw;
  text-align: left;
  color: #333;
  font-size: 3.7vw;
  line-height: 1.6;
}
.rule-title {
  font-weight: bold;
  font-size: 4.3vw;
  margin-bottom: 1.6vw;
}
.rule-text {
  margin-bottom: 1.1vw;
}

.step-section {
  padding: 4.3vw;
  color: #333;
}
.step-title {
  font-size: 5.3vw;
  font-weight: bold;
  text-align: center;
  margin-bottom: 3.2vw;
}
.step-block {
  display: flex;
  margin-bottom: 4.8vw;
}
.step-number {
  font-size: 6.4vw;
  font-weight: bold;
  color: #e02433;
  margin-right: 2.1vw;
  width: 7.5vw;
}
.step-content {
  flex: 1;
}
.step-subtitle {
  font-weight: bold;
  font-size: 4.3vw;
  color: #e02433;
}
.step-text {
  font-size: 3.7vw;
  margin: 1.1vw 0 1.6vw;
}
.icon-row {
  display: flex;
  flex-wrap: wrap;
  gap: 2.1vw;
  margin: 2.1vw 0;
}
.icon {
  width: 9.1vw;
  height: 9.1vw;
  border-radius: 2.1vw;
  background: #fff;
}

</style>
