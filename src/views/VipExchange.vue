<template>
  <div class="vip-exchange">
    <!-- 吸顶导航 -->
    <div class="header">
      <van-icon name="arrow-left" size="20" @click="goBack" />
      <div class="title">会员兑换</div>
    </div>

    <!-- 当前积分 -->
    <div class="points-header">
      <div class="points-title">当前积分</div>
      <div class="points-value">{{ points }}</div>
    </div>

    <!-- 积分商品 -->
    <div class="exchange-list">
      <div
        class="neon-card"
        v-for="(item, i) in exchangeItems"
        :key="i"
      >
        <van-icon :name="item.icon || 'gift-o'" size="28" color="#0ff" />
        <div class="neon-name">{{ item.name }}</div>
        <div class="neon-price">{{ item.desc }}</div>
        <van-button
          size="small"
          round
          class="exchange-btn"
          @click="handleExchange(item)"
        >
          立即兑换
        </van-button>
      </div>
    </div>

    <!-- 兑换记录 -->
    <div class="record-section">
      <div class="record-title">兑换记录</div>
      <div class="record-list">
        <div
          class="record-item"
          v-for="(record, i) in exchangeRecords"
          :key="i"
        >
          <div class="record-name">{{ record.name }}</div>
          <div class="record-time">{{ record.time }}</div>
          <div class="record-status">{{ record.cost }}</div>

        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from '@/store/user'
import { useUserTaskStore } from '@/store/useUserTaskStore'

const router = useRouter()
const goBack = () => router.back()

const userStore = useUserStore()
const userTaskStore = useUserTaskStore()

// 页面加载，拉取积分、商品、兑换记录
onMounted(async () => {
  await userStore.initUser()
  await userTaskStore.fetchExchangeList()
  await userTaskStore.fetchExchangeRecords({ page: 1, pageSize: 10 }) // 拉前10条
})

// 当前积分
const points = computed(() => userStore.points)

// 商品列表
const exchangeItems = computed(() => {
  return userTaskStore.exchangeList.map(item => ({
    ...item,
    desc: item.description || `花费${item.cost}积分`,
    icon: item.icon || 'gift-o',
  }))
})

// 兑换记录（真实数据，已倒序返回）
const exchangeRecords = computed(() => {
  return (userTaskStore.recordList || []).map(record => ({
    name: record.exchange_name || record.name,           // 商品名称
    time: record.create_time,
    cost: record.cost ? `消耗${record.cost}积分` : "",    // 积分消耗
  }))
})

// 兑换
const handleExchange = async (item: any) => {
  if (userStore.points < item.cost) {
    showToast('积分不足')
    return
  }

  try {
    await showConfirmDialog({
      title: '兑换确认',
      message: `确定要消耗${item.cost}积分兑换「${item.name}」吗？`
    })

    await userTaskStore.exchange(item.id)
    // userStore.consumePoints(item.cost) // 已自动同步
    await userTaskStore.fetchExchangeRecords({ page: 1, pageSize: 10 })

    showToast('兑换成功！')
  } catch {
    // 用户取消，不处理
  }
}
</script>

<style scoped>
/* 样式保持不变 */
.vip-exchange {
  padding: 3.2vw;
  background: #0f2027;
  min-height: 100vh;
  color: #fff;
}
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  padding: 3.2vw 0;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  box-shadow: 0 0 2.66vw rgba(0,255,255,0.5), 0 0 5.33vw rgba(0,255,255,0.3);
}
.header .title {
  flex: 1;
  text-align: center;
  font-size: 4.8vw;
  font-weight: bold;
}
.points-header {
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  border-radius: 3.2vw;
  padding: 4.26vw;
  text-align: center;
  color: #0ff;
  box-shadow: 0 0 2.66vw rgba(0,255,255,0.5), 0 0 5.33vw rgba(0,255,255,0.3);
  margin: 3.2vw 0 4.26vw;
}
.points-title {
  font-size: 3.73vw;
  opacity: 0.8;
}
.points-value {
  font-size: 7.46vw;
  font-weight: bold;
}
.exchange-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3.2vw;
}
.neon-card {
  border-radius: 2.66vw;
  padding: 4.26vw;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  box-shadow: 0 0 2.66vw rgba(0,255,255,0.5), 0 0 5.33vw rgba(0,255,255,0.3);
  color: #fff;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.neon-name {
  font-weight: bold;
  margin-top: 1.06vw;
  color: #0ff;
}
.neon-price {
  font-size: 3.46vw;
  margin: 1.06vw 0;
  color: #0ff;
}
.exchange-btn {
  background: rgba(0,0,0,0.4);
  border: 0.2667vw solid #0ff;
  color: #0ff;
  font-weight: 500;
  min-width: 18.13vw;
  font-size: 3.2vw;
  box-shadow: 0 0 2.13vw rgba(0,255,255,0.4);
}
.record-section {
  margin-top: 5.33vw;
}
.record-title {
  font-weight: bold;
  margin-bottom: 2.13vw;
  font-size: 4.26vw;
  color: #0ff;
}
.record-list {
  display: flex;
  flex-direction: column;
  gap: 2.13vw;
}
.record-item {
  background: rgba(255,255,255,0.05);
  border-radius: 2.13vw;
  padding: 2.66vw 3.2vw;
  box-shadow: 0 0 2.13vw rgba(0,255,255,0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.record-name {
  font-weight: 500;
}
.record-time {
  font-size: 3.2vw;
  color: #aaa;
}
.record-status {
  font-size: 3.2vw;
  color: #0ff;
}
</style>
