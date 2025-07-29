<template>
  <div class="task-tab">
    <!-- 吸顶区域 -->
    <div class="sticky-header">
      <div class="user-card">
        <img class="avatar" :src="avatar || '/icons/avatar-default.svg'" />
        <div class="user-info">
          <div class="username">{{ nickname || '未登录用户' }}</div>
          <div class="user-level">
            <span>
  长视频观看次数：
  {{ longVideoRemain }} / {{ longVideoMax || 0 }}
</span>
<span>
  抖阴观看次数：
  {{ dyVideoRemain }} / {{ dyVideoMax || 0 }}
</span>
          </div>
        </div>
      </div>
      <van-button
  class="vip-btn grey-gradient"
  block
  round
  @click="goVip"
>
  {{ isVIP ? `尊贵的 ${vipCardName || 'VIP'} 会员` : '开通VIP不限次数观看' }}
</van-button>

      <!-- 积分/邀请 -->
      <div class="cyber-cards">
        <div class="cyber-card">
          <van-icon name="friends-o" size="18" color="#0ff" />
          <div class="cyber-text">已邀请 {{ inviteCount }} 人</div>
        </div>
        <div class="cyber-card" @click="goExchange">
  <van-icon name="points" size="18" color="#0ff" />
  <div class="cyber-text">我的积分 {{ userStore.points }}</div>
</div>
      </div>
    </div>

    <!-- 滚动区域 -->
    <div class="scroll-content">
      <!-- 福利任务 -->
      <div class="task-section">
        <div class="task-header">
          福利任务
          <span class="hint">提示:状态未及时更新请刷新页面，积分无法自动兑换时可联系客服兑换~</span>
          <van-button
            size="small"
            class="exchange-btn"
            round
            @click="goExchange"
          >
            兑换VIP
          </van-button>
        </div>
        <van-cell-group>
          <van-cell
            v-for="(task, i) in tasks"
            :key="i"
            :title="task.title"
            :label="task.desc"
          >
            <template #icon>
              <img :src="task.icon" class="task-icon" />
            </template>
            <template #right-icon>
              <van-button
                v-if="task.type === 'daily'"
                size="small"
                round
                :type="task.status === '待领取' ? 'warning' : 'success'"
                :disabled="task.status !== '待领取'"
                @click="handleReceive(task)"
              >
                {{ task.status }}
              </van-button>
              <van-button
                v-else
                size="small"
                round
                type="danger"
                @click="handleLink(task)"
              >
                去完成
              </van-button>
            </template>
          </van-cell>
        </van-cell-group>
      </div>

      <div class="exchange-section">
        <div class="exchange-header">积分兑换</div>
        <div class="neon-card-list">
          <div
            class="neon-card"
            v-for="(item, i) in exchangeList"
            :key="i"
          >
            <van-icon :name="item.icon" size="28" color="#fff" />
            <div class="neon-name">{{ item.name }}</div>
<div class="neon-price">{{ item.desc }}</div>
            <van-button
              size="small"
              type="danger"
              round
              @click="handleExchange(item)"
            >
              兑换
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from "@/store/user";
import { useUserTaskStore } from "@/store/useUserTaskStore";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { showToast } from "vant";

const userStore = useUserStore();
const userTaskStore = useUserTaskStore();
const router = useRouter();

// 🚀 页面加载
onMounted(async () => {
  await userStore.initUser();
  await userTaskStore.fetchTaskStatus();
  await userTaskStore.fetchExchangeList(); // 加载兑换列表
});

// 基础用户信息
const { 
  nickname, 
  avatar, 
  inviteCount, 
  isVIP, 
  vipCardName 
} = storeToRefs(userStore);

const userInfo = storeToRefs(userStore).userInfo;

const longVideoMax = computed(() => userInfo.value.longVideoMax);
const longVideoUsed = computed(() => userInfo.value.longVideoUsed);
const dyVideoMax = computed(() => userInfo.value.dyVideoMax);
const dyVideoUsed = computed(() => userInfo.value.dyVideoUsed);

const longVideoRemain = computed(() => Math.max((longVideoMax.value || 0) - (longVideoUsed.value || 0), 0));
const dyVideoRemain = computed(() => Math.max((dyVideoMax.value || 0) - (dyVideoUsed.value || 0), 0));

// 积分
const myPoints = computed(() => userTaskStore.taskStatus?.my_points || 0);

// 任务列表
const tasks = computed(() => {
  const status = userTaskStore.taskStatus?.status || {};
  const points = userTaskStore.taskStatus?.points || {};

  return [
    {
      key: 'login',
      title: '每日登陆',
      desc: `每日登陆 +${points.login || 0}积分`,
      icon: '/icons/collect.svg',
      score: points.login || 0,
      type: 'daily',
      status: status.login === 'done' ? '已完成' : '待领取'
    },
    {
      key: 'invite',
      title: '邀请好友',
      desc: `邀请好友 +${points.invite || 0}积分`,
      icon: '/icons/profile-active.svg',
      score: points.invite || 0,
      type: 'link'
    },
    {
      key: 'vip',
      title: '购买VIP',
      desc: `购买VIP +${points.vip || 0}积分`,
      icon: '/icons/vip1.svg',
      score: points.vip || 0,
      type: 'link'
    },
    {
      key: 'buy_coin',
      title: '购买金币',
      desc: `购买金币 +${points.buy_coin || 0}积分`,
      icon: '/icons/coin.svg',
      score: points.buy_coin || 0,
      type: 'link'
    },
    {
      key: 'bind_mobile',
      title: '绑定手机号',
      desc: `绑定手机号 +${points.bind_mobile || 0}积分`,
      icon: '/icons/china.svg',
      score: points.bind_mobile || 0,
      type: 'daily',
      status: status.bind_mobile === 'done' ? '已完成' : '待领取'
    },
    {
      key: 'bind_email',
      title: '绑定邮箱',
      desc: `绑定邮箱 +${points.bind_email || 0}积分`,
      icon: '/icons/community-active.svg',
      score: points.bind_email || 0,
      type: 'daily',
      status: status.bind_email === 'done' ? '已完成' : '待领取'
    }
  ];
});

// exchangeList: 后端拉取+合并配置
const exchangeList = computed(() => {
  return userTaskStore.exchangeList.map(item => {
    return {
      ...item,
      desc: item.description ?? `花费${item.cost}积分`,
      icon: item.icon || 'gift-o',
      bg: 'linear-gradient(90deg, #43C6AC, #F8FFAE)', //统一背景
    };
  });
});


// 领取任务
async function handleReceive(task) {
  if (task.type !== 'daily' || task.status !== '待领取') return;
  try {
    await userTaskStore.claim(task.key);
    showToast(`领取成功 +${task.score}积分`);
  } catch (e: any) {
    showToast(e?.message || '领取失败');
  }
}

// 积分兑换
async function handleExchange(item: any) {
  try {
    await userTaskStore.exchange(item.id);
    showToast(`兑换成功，已消耗${item.cost}积分`);
  } catch (e: any) {
    showToast(e?.message || '积分不足');
  }
}

// 跳转逻辑
function handleLink(task) {
  if (task.key === 'invite') {
    router.push('/promotion-share');
  } else if (task.key === 'vip') {
    router.push('/vip');
  } else if (task.key === 'buy_coin') {
    router.push('/vip?tab=coin');
  } else if (task.key === 'bind_mobile') {
    router.push('/profile-setting');
  } else if (task.key === 'bind_email') {
    router.push('/profile-setting');
  }
}

function goExchange() {
  router.push('/vip-exchange');
}

function goVip() {
  router.push('/vip');
}
</script>


<style scoped>
.task-tab {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* 吸顶区域 */
.sticky-header {
  background: #f8f8f8;
  padding: 3.2vw;
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 滚动区域 */
.scroll-content {
  flex: 1;
  overflow-y: auto;
  padding: 3.2vw;
  -webkit-overflow-scrolling: touch;
}

/* 用户卡片 */
.user-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 2.1vw;
  padding: 3.2vw;
  margin-bottom: 3.2vw;
}
.avatar {
  width: 13.3vw;
  height: 13.3vw;
  border-radius: 2.1vw;
  margin-right: 3.2vw;
  object-fit: cover;
}
.user-info .username {
  font-weight: bold;
  font-size: 4.3vw;
}
.user-info .user-level span {
  background: #f5f5f5;
  padding: 0.8vw 2.1vw;
  border-radius: 1.1vw;
  font-weight: 500;
  color: #333;
  box-shadow: 0 0.27vw 0.8vw rgba(0,0,0,0.1);
}

/* VIP按钮 */
.vip-btn {
  margin: 0;
}

/* 福利任务 */
.task-section {
  background: rgba(30,30,30,0.8);
  border-radius: 3.2vw;
  padding: 0;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 1.1vw 5.3vw rgba(0,0,0,0.4);
  margin-bottom: 4.3vw;
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4.3vw;
  font-weight: bold;
  color: #fff;
}

.task-header .hint {
  font-size: 3.2vw;
  color: #aaa;
}

.van-cell {
  background: rgba(255,255,255,0.05) !important;
  border-bottom: 0.27vw solid rgba(255,255,255,0.1);
}

.van-cell__title {
  font-weight: 500;
  color: #fff;
}

.van-cell__label {
  font-size: 3.2vw;
  color: #ccc;
}

.task-icon {
  width: 7.5vw;
  height: 7.5vw;
  margin-right: 2.1vw;
}

.van-button--small {
  font-size: 3.2vw;
}

/* 积分兑换 */
.exchange-section {
  margin-top: 4.3vw;
}
.exchange-header {
  font-weight: bold;
  font-size: 4.3vw;
  margin-bottom: 3.2vw;
}
.neon-card-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3.2vw;
}
.neon-card {
  border-radius: 2.7vw;
  padding: 4.3vw;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  box-shadow: 0 0 2.7vw rgba(0,255,255,0.5), 0 0 5.3vw rgba(0,255,255,0.3);
  color: #fff;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.neon-name {
  font-weight: bold;
  margin-top: 1.1vw;
  color: #0ff;
}
.neon-price {
  font-size: 3.2vw;
  margin: 1.1vw 0;
  color: #0ff;
}

.grey-gradient {
  background: linear-gradient(90deg, #333, #555);
  color: #fff;
  border: none;
  font-weight: bold;
  box-shadow: 0 0 2.1vw rgba(0,0,0,0.4);
}

/* 兑换VIP按钮高级风格 */
.exchange-btn {
  background: rgba(0,0,0,0.4);
  border: 0.27vw solid #0ff;
  color: #0ff;
  font-weight: 500;
  min-width: 18vw;
  height: 7.5vw;
  font-size: 3.2vw;
  box-shadow: 0 0 2.1vw rgba(0,255,255,0.4);
}

/* 积分卡片 */
.cyber-cards {
  display: flex;
  gap: 2.1vw;
  margin-top: 2.1vw;
  cursor: pointer;
}
.cyber-card {
  flex: 1;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  border-radius: 2.1vw;
  padding: 2.1vw 2.7vw;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.6vw;
  box-shadow: 0 0 2.7vw rgba(0,255,255,0.4), 0 0 5.3vw rgba(0,255,255,0.2);
}
.cyber-text {
  font-size: 3.2vw;
  font-weight: 500;
  color: #0ff;
}
</style>
