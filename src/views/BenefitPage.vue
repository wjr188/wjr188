<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BenefitTask from '@/components/BenefitTask.vue'
import BenefitRecommend from '@/components/BenefitRecommend.vue'

const router = useRouter()
const route = useRoute()

const activeTab = ref<'task' | 'recommend'>('task')

onMounted(() => {
  const tab = route.query.tab
  if (typeof tab === 'string' && tab === 'recommend') {
    activeTab.value = 'recommend'
  }
})

function goBack() {
  router.back()
}

/**
 * 切换Tab时主动移除焦点，避免aria-hidden冲突
 */
function onTabChange() {
  nextTick(() => {
    const el = document.activeElement as HTMLElement | null
    if (el && typeof el.blur === 'function') {
      el.blur()
    }
  })
}
</script>

<template>
  <div class="benefit-page">
    <!-- 顶部NavBar -->
    <van-nav-bar
      title="福利中心"
      left-arrow
      @click-left="goBack"
      fixed
      safe-area-inset-top
    />

    <!-- Tabs -->
    <van-tabs
      v-model:active="activeTab"
      @change="onTabChange"
      swipeable
      background="#fff"
      color="#555"
      title-active-color="#555"
      title-inactive-color="#999"
      line-width="5vw"
    >
      <van-tab title="福利任务" name="task">
        <BenefitTask />
      </van-tab>

      <van-tab title="福利推荐" name="recommend">
        <BenefitRecommend />
      </van-tab>
    </van-tabs>
  </div>
</template>

<style scoped>
.benefit-page {
  background: #f8f8f8;
  min-height: 100vh;
  padding-top: 12.8vw; /* 46px ≈ 12.8vw */
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
