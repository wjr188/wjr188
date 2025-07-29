<template>
  <div class="profile-setting-wrapper">
    <!-- 顶部栏 -->
    <div class="header-bar">
      <img src="/icons/back3.svg" class="back-icon" @click="goBack" />
      <span class="title">个人设置</span>
    </div>

    <!-- 头像区域 -->
    <div class="avatar-block">
      <img class="avatar-img" :src="avatar" />
      <div class="edit-avatar" @click="changeAvatar">
        <img src="/icons/camera.svg" />
      </div>
      <div class="avatar-text">修改头像</div>
    </div>

    <!-- 信息列表 -->
    <div class="info-list">
      <div class="info-item">
  <img src="/icons/profile.svg" class="info-icon" />
  <span class="label">用户ID</span>
  <div class="value-wrap">
    <span class="value">{{ userId }}</span>
    <button class="copy-btn" @click="copyUserId">复制</button>
  </div>
</div>

      <div class="info-item">
  <img src="/icons/profile-active.svg" class="info-icon" />
  <span class="label">昵称</span>
  <span class="value">{{ nickname }}</span>
  <img src="/icons/more-arrow.svg" class="arrow" />
</div>
<div class="info-item" v-if="isLoggedIn && boundUsername">
  <img src="/icons/profile.svg" class="info-icon" />
  <span class="label">账号绑定</span>
  <span class="value">{{ boundUsername }}</span>
</div>

      <!-- 清理缓存 -->
<div class="info-item" @click="clearCache">
  <img src="/icons/close.svg" class="info-icon" />
  <span class="label">清理缓存</span>
  <span class="value">{{ cacheSizeText }}</span>
  <img src="/icons/more-arrow.svg" class="arrow" />
</div>

      <div class="info-item">
        <img src="/icons/invite.svg" class="info-icon" />
        <span class="label">版本更新</span>
        <span class="value">v2.4.1</span>
      </div>
    </div>

   <div class="bottom-btns-fixed">
  <button v-if="!isLoggedIn" class="main-btn" @click="openBindForm('login')">登录</button>
  <button v-if="!isLoggedIn" class="main-btn" @click="openBindForm('register')">注册绑定</button>
  <button v-if="isLoggedIn" class="main-btn" @click="logout">退出登录</button>
</div>


    <!-- 缓存清理提示 -->
    <div class="toast-mask" :class="{ show: showToast }">{{ showToastText }}</div>

    <!-- 绑定表单 -->
    <div class="bind-form-mask" v-if="showBindForm">
      <div class="bind-form-container">
        <div class="form-header">
          <img src="/icons/back3.svg" class="back-icon" @click="showBindForm = false" />
          <span class="form-title">{{ bindMode === 'login' ? '登录' : '绑定' }}</span>
        </div>
<form class="form-body" @submit.prevent="submitBind">
  <div class="input-item">
    <img src="/icons/profile.svg" class="input-icon" />
    <input
      type="text"
      placeholder="请输入账号"
      v-model="form.username"
      autocomplete="username"
    />
  </div>
  <div class="input-item">
    <img src="/icons/lock.svg" class="input-icon" />
    <input
      type="password"
      placeholder="请输入你的密码"
      v-model="form.password"
      :autocomplete="bindMode === 'register' ? 'new-password' : 'current-password'"
    />
  </div>
  <div class="input-item" v-if="bindMode === 'register'">
    <img src="/icons/lock.svg" class="input-icon" />
    <input
      type="password"
      placeholder="请再次输入你的密码"
      v-model="form.confirmPassword"
      autocomplete="new-password"
    />
  </div>
</form>

        <div class="form-fixed-footer">
          <button class="main-btn" @click="submitBind">
  {{ bindMode === 'login' ? '登录' : '绑定' }}
</button>

        </div>
        <!-- 登录绑定专属遮罩 -->
        <div class="form-toast-mask" :class="{ show: formToast }">{{ formToastText }}</div>
      </div>
    </div>
      <!-- ✅ 全局提示遮罩（复制ID 等场景） -->
  <div class="form-toast-mask" :class="{ show: formToast }">{{ formToastText }}</div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'

// =================== Store ===================
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 登录状态、绑定账号等
const isLoggedIn = computed(() => !!userInfo.value?.account)
const userId = computed(() => userInfo.value?.uuid || '')
const nickname = computed(() => userInfo.value?.nickname || '')
const avatar = computed(() => userInfo.value?.avatar || '')
const boundUsername = computed(() => userInfo.value?.account || '')
const isVIP = computed(() => !!userInfo.value?.isVIP || !!userInfo.value?.is_vip || !!userInfo.value?.vip_status)

// =================== State ===================
const showToast = ref(false)
const showToastText = ref('')
const formToast = ref(false)
const formToastText = ref('')
const showBindForm = ref(false)
const bindMode = ref<'login' | 'register'>('register')
const cacheSizeText = ref('0B')

interface BindForm {
  username: string
  password: string
  confirmPassword: string
}
const form = ref<BindForm>({
  username: '',
  password: '',
  confirmPassword: ''
})

// =================== Lifecycle ===================
onMounted(async () => {
  // 只有有 token 时才拉用户信息
  if (userStore.token) {
    try {
      await userStore.fetchUserInfo()
    } catch (e) {
      // token失效，只清账号即可，userInfo保留基础信息，不要清 uuid
      userStore.logout()
    }
  }
  updateCacheSize()
})
// =================== 头像上传 ===================
const changeAvatar = () => {
  if (!isVIP.value) {
    showToastText.value = '充值会员才可以修改资料~'
    showToast.value = true
    setTimeout(() => (showToast.value = false), 2000)
    return
  }
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    if (file.size > 1024 * 1024) {
      showToastText.value = '头像不能超过1MB~'
      showToast.value = true
      setTimeout(() => (showToast.value = false), 2000)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      // userStore.updateAvatar(reader.result as string)
      showToastText.value = '请接入头像上传接口'
      showToast.value = true
      setTimeout(() => (showToast.value = false), 2000)
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

// =================== 缓存计算 ===================
const updateCacheSize = () => {
  let total = 0
  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    const value = localStorage.getItem(key)
    const size = key.length + (value ? value.length : 0)
    total += size
  })
  cacheSizeText.value = formatBytes(total)
}
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  return value.toFixed(2) + sizes[i]
}

// =================== 导航返回 ===================
const goBack = () => window.history.back()

// =================== 清理缓存 ===================
const clearCache = () => {
  const keysToKeep = ['token', 'user']
  const allKeys = Object.keys(localStorage)

  allKeys.forEach((key) => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key)
    }
  })

  updateCacheSize()
  showToastText.value = '缓存清理成功~'
  showToast.value = true
  setTimeout(() => (showToast.value = false), 1500)
}

// =================== 绑定表单（含uuid已绑定提示） ===================
const openBindForm = (mode: 'login' | 'register') => {
  // 注册绑定时：如果uuid已绑定账号，则弹遮罩，不再弹出绑定表单
  if (mode === 'register' && userInfo.value?.account) {
    formToastText.value = '当前用户已绑定账号，不能重复绑定！'
    formToast.value = true
    setTimeout(() => (formToast.value = false), 1800)
    return
  }
  bindMode.value = mode
  form.value.username = ''
  form.value.password = ''
  form.value.confirmPassword = ''
  showBindForm.value = true
}

// =================== 复制ID ===================
const copyUserId = async () => {
  try {
    const id = userId.value
    if (!id) {
      formToastText.value = '用户ID为空，无法复制'
      formToast.value = true
      setTimeout(() => (formToast.value = false), 1500)
      return
    }
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(id)
    } else {
      const input = document.createElement('textarea')
      input.value = id
      input.style.position = 'absolute'
      input.style.left = '-9999px'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    formToastText.value = '用户ID已复制~'
    formToast.value = true
    setTimeout(() => (formToast.value = false), 1500)
  } catch (err) {
    console.error('复制失败:', err)
    formToastText.value = '复制失败，请手动复制'
    formToast.value = true
    setTimeout(() => (formToast.value = false), 1500)
  }
}
// =================== 登录/注册绑定提交 ===================
const submitBind = async () => {
  if (!form.value.username || !form.value.password) {
    formToastText.value = '请填写账号和密码'
    formToast.value = true
    setTimeout(() => (formToast.value = false), 1500)
    return
  }

  // 账号规则校验
  const usernamePattern = /^[a-zA-Z0-9_.\-@]{6,}$/
  if (!usernamePattern.test(form.value.username)) {
    formToastText.value = '账号必须6位及以上，仅限字母、数字、_ . - @'
    formToast.value = true
    setTimeout(() => (formToast.value = false), 1800)
    return
  }

  // 密码规则校验
  const passwordPattern = /^[a-zA-Z0-9_.\-@]{6,}$/
  if (!passwordPattern.test(form.value.password)) {
    formToastText.value = '密码必须6位及以上，仅限字母、数字、_ . - @'
    formToast.value = true
    setTimeout(() => (formToast.value = false), 1800)
    return
  }

  if (bindMode.value === 'register' && form.value.password !== form.value.confirmPassword) {
    formToastText.value = '两次密码输入不一致'
    formToast.value = true
    setTimeout(() => (formToast.value = false), 1500)
    return
  }
  try {
    if (bindMode.value === 'login') {
      // 登录
      await userStore.login(form.value.username, form.value.password)
      await userStore.fetchUserInfo()
      formToastText.value = '登录成功'
    } else {
      // 注册绑定（带uuid参数，后端自动和游客绑定）
      await userStore.register(form.value.username, form.value.password)
      await userStore.fetchUserInfo()
      formToastText.value = '绑定成功'
    }
    formToast.value = true
    setTimeout(() => {
      formToast.value = false
      showBindForm.value = false
    }, 1000)
  } catch (err: any) {
    formToastText.value = (err?.msg || err?.message || '操作失败，请重试')
    formToast.value = true
    setTimeout(() => (formToast.value = false), 1500)
  }
}

// =================== 退出登录 ===================
const logout = () => {
  userStore.logout()
}
</script>

<style scoped>
.profile-setting-wrapper {
  background: #fff;
  min-height: 100vh;
  padding-bottom: 30vw;
  color: #222;
  box-sizing: border-box;
}

.header-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 13vw;
  font-size: 5.5vw;
  font-weight: bold;
  position: relative;
  color: #222;
  background: #fff;
  border-bottom: 0.3vw solid #f1f1f1;
}
.back-icon {
  position: absolute;
  left: 4vw;
  top: 3.5vw;
  width: 7vw;
  cursor: pointer;
}

.avatar-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 4vw 0 3vw;
}
.avatar-img {
  width: 22vw;
  height: 22vw;
  border-radius: 50%;
  object-fit: cover;
  border: 0.5vw solid #eee;
}
.edit-avatar {
  width: 8.5vw;
  height: 8.5vw;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  left: 12vw;
  top: -9.5vw;
  box-shadow: 0 0.5vw 2vw rgba(0, 0, 0, 0.1);
  border: 0.5vw solid #eee;
  cursor: pointer;
}
.avatar-text {
  margin-top: -4.5vw;
  font-weight: bold;
  font-size: 4.2vw;
  color: #333;
}

.info-list {
  background: #f8f8f8;
  border-radius: 2.5vw;
  margin: 0 5vw;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 4.5vw 0 4.5vw 5vw;
  border-bottom: 0.3vw solid #ebebeb;
  font-size: 4vw;
  color: #222;
  position: relative;
}
.info-item:last-child {
  border-bottom: none;
}
.info-icon {
  width: 5vw;
  margin-right: 4.5vw;
  opacity: 0.85;
}
.label {
  min-width: 17vw;
}
.value {
  flex: 1;
  text-align: right;
  color: #111;
  font-weight: 600;
}
.arrow {
  width: 4.5vw;
  margin-left: 3vw;
  opacity: 0.6;
}

.bottom-btns-fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 3vw 5vw 5vw;
  display: flex;
  justify-content: space-between;
  background: #fff;
  z-index: 999;
  box-shadow: 0 -0.5vw 2.5vw rgba(0, 0, 0, 0.05);
}
.main-btn {
  flex: 1;
  background: #ff3b5c;
  color: #fff;
  border-radius: 2.5vw;
  border: none;
  font-size: 4.5vw;
  padding: 3vw 0;
  margin: 0 1.5vw;
  font-weight: bold;
  letter-spacing: 0.5vw;
  cursor: pointer;
}
.main-btn:active {
  background: #ff1a47;
}
.toast-mask,
.form-toast-mask {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(50, 50, 50, 0.9);
  color: #fff;
  padding: 3vw 5vw;
  border-radius: 2.5vw;
  font-size: 3.8vw;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.toast-mask.show,
.form-toast-mask.show {
  opacity: 1;
  pointer-events: auto;
}
@keyframes fadeinout {
  0% { opacity: 0; transform: translate(-50%, -60%); }
  10%, 90% { opacity: 1; transform: translate(-50%, -50%); }
  100% { opacity: 0; transform: translate(-50%, -40%); }
}

.bind-form-mask {
  position: fixed;
  inset: 0;
  background: #fff;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.bind-form-container {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding-bottom: 7vw;
  box-sizing: border-box;
}
@supports not (height: 100dvh) {
  .bind-form-container {
    height: 100vh;
  }
}

.form-header {
  position: relative;
  height: 13vw;
  display: flex;
  align-items: center;
  justify-content: center;
}
.form-header .back-icon {
  position: absolute;
  left: 2.5vw;
  top: 50%;
  transform: translateY(-50%);
  width: 6vw;
  height: 6vw;
  cursor: pointer;
}
.form-title {
  font-size: 5.8vw;
  font-weight: bold;
  color: #111;
  text-align: center;
  line-height: 4vw;
  position: absolute;
  transform: translateX(-50%) translateX(7.5vw);
}

.form-body {
  padding: 5vw;
  margin-top: 5vw;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.input-item {
  display: flex;
  align-items: center;
  background: #f2f2f2;
  border: 0.3vw solid #ccc;
  border-radius: 3vw;
  padding: 0 4vw;
  height: 15vw;
  margin-bottom: 5.5vw;
  box-sizing: border-box;
}
.input-icon {
  width: 5.5vw;
  height: 5.5vw;
  margin-right: 3vw;
}
.input-item input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 4.2vw;
  color: #333;
  outline: none;
}

.form-fixed-footer {
  margin-top: auto;
  padding: 5vw;
  background: #fff;
  box-sizing: border-box;
}
.form-fixed-footer .main-btn {
  width: 100%;
  padding: 3.5vw 0;
  font-size: 4.3vw;
  border-radius: 2.5vw;
  background: #ff3b5c;
  color: white;
  font-weight: bold;
  border: none;
}

.copy-btn {
  margin-left: 3vw;
  background: #e60012;
  color: #fff;
  padding: 1vw 3vw;
  font-size: 3.5vw;
  border-radius: 5vw;
  border: none;
  cursor: pointer;
}
.value-wrap {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
