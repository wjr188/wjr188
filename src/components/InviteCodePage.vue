<template>
  <div class="invite-page">
    <van-nav-bar
      title="填写邀请码"
      left-arrow
      fixed
      safe-area-inset-top
      @click-left="goBack"
    />

    <div class="invite-content">
      <div class="tip-text">
        * 填写邀请你下载用户的邀请码 *
      </div>

      <van-field
        v-model="inputCode"
        placeholder="请输入邀请码"
        :disabled="!!parentInviteCode"
        class="custom-input"
      />

      <van-button
        round
        block
        type="primary"
        class="submit-btn"
        :loading="loading"
        :disabled="!!parentInviteCode"
        @click="submit"
      >
        确定
      </van-button>

      <div v-if="parentInviteCode" class="already-bound">
        您已填写过邀请码：<span>{{ parentInviteCode }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'

const router = useRouter()
function goBack() {
  router.back()
}

const userStore = useUserStore()
const { parentInviteCode, userId } = storeToRefs(userStore)

const inputCode = ref('')
const loading = ref(false)

async function submit() {
  if (!inputCode.value) {
    showToast('请输入邀请码')
    return
  }
  if (parentInviteCode.value) {
    showToast('您已填写过邀请码')
    return
  }

  loading.value = true
  try {
    // 如果有api模块，解注释
    /*
    const res = await api.bindInviteCode({
      userId: userId.value,
      inviteCode: inputCode.value
    })
    if (res.code === 0) {
      showToast('绑定成功')
      userStore.setParentInviteCode(inputCode.value)
    } else {
      showToast(res.msg || '绑定失败')
    }
    */
    // 模拟逻辑
    showToast('模拟绑定成功')
    userStore.setParentInviteCode(inputCode.value)
  } catch (e) {
    showToast('网络错误')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.invite-page {
  background: #f5f6fa;
  min-height: 100vh;
  padding-top: 12.3vw; /* 46px */
  display: flex;
  flex-direction: column;
  align-items: center;
}
.invite-content {
  background: #fff;
  border-radius: 4.3vw; /* 16px */
  box-shadow: 0 0.5vw 3.2vw rgba(0,0,0,0.05); /* 0 2px 12px */
  padding: 6.4vw; /* 24px */
  margin-top: 8vw; /* 30px */
  width: 92%;
  max-width: 112vw; /* 420px */
}
.tip-text {
  font-size: 4vw;
  color: #444;
  text-align: center;
  margin-bottom: 5.3vw;
}
.custom-input .van-field__control {
  border: 0.27vw solid #eee;
  border-radius: 3.2vw;
  padding: 3.2vw;
  background: #fafafa;
}
.submit-btn {
  margin-top: 6.4vw;
  background: #333;
  color: #fff;
  border: none;
  font-weight: 500;
  font-size: 4vw;
}
.already-bound {
  margin-top: 4.3vw;
  font-size: 3.7vw;
  color: #999;
  text-align: center;
}
.already-bound span {
  color: #333;
  font-weight: bold;
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
</style>
