<template>
  <nav :class="['tab-bar', { 'darknet-tab-bar': darkMode }]">
    <router-link
      v-for="item in tabs"
      :key="item.path"
      :to="item.path"
      class="tab-bar-item"
    >
      <img
        :src="isActive(item.path) ? item.iconActive : item.icon"
        class="tab-icon"
        alt="icon"
      />
      <span :class="{ active: isActive(item.path) }">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

// ✅ 改成可选并带默认值
const props = withDefaults(
  defineProps<{
    darkMode?: boolean
  }>(),
  {
    darkMode: false
  }
)

const route = useRoute()

interface TabItem {
  path: string
  label: string
  icon: string
  iconActive: string
}

const tabs: TabItem[] = [
  {
    path: '/',
    label: '首页',
    icon: '/icons/home.svg',
    iconActive: '/icons/home-active.svg'
  },
  {
    path: '/tiktokIndex',
    label: '抖阴',
    icon: '/icons/tiktok.svg',
    iconActive: '/icons/tiktok-active.svg'
  },
  {
    path: '/darknet',
    label: '暗网',
    icon: '/icons/darknet.svg',
    iconActive: '/icons/darknet-active.svg'
  },
  {
    path: '/star',
    label: 'only圈',
    icon: '/icons/star5.svg',
    iconActive: '/icons/star-active.svg'
  },
  {
    path: '/acg',
    label: 'ACG',
    icon: '/icons/acg.svg',
    iconActive: '/icons/acg-active.svg'
  },
  {
    path: '/profile',
    label: '我的',
    icon: '/icons/profile.svg',
    iconActive: '/icons/profile-active.svg'
  }
]

const isActive = (path: string): boolean => route.path === path
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 16vw; /* TabBar 本身高度 */
  background-color: #fff;
  border-top: 0.26vw solid #eee;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 999;
  /* 关键代码 ↓↓↓ */
  padding-bottom: env(safe-area-inset-bottom, 0);
  box-sizing: content-box;
}

.darknet-tab-bar {
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2.66vw); /* 10px -> 2.66vw */
  -webkit-backdrop-filter: blur(2.66vw);
  border-top: none;
}

.tab-bar-item {
  flex: 1;
  text-align: center;
  text-decoration: none;
  color: #999;
  font-size: 3.2vw; /* 12px -> 3.2vw */
}

.tab-icon {
  width: 5.86vw;  /* 22px -> 5.86vw */
  height: 5.86vw;
  margin: 0 auto 0.53vw; /* 2px -> 0.53vw */
  display: block;
}

.tab-bar-item span.active {
  color: #f12c2c;
  font-weight: bold;
}
</style>
