<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // 引入 Vue Router
import { useBannerStore } from '@/store/banner.store'; // 引入广告的 store

const router = useRouter(); // 初始化 Vue Router
const bannerStore = useBannerStore(); // 使用广告 store

// 在组件挂载时调用 store 的方法获取广告数据
onMounted(() => {
  if (!bannerStore.banners.length) {
    bannerStore.getBanners({ page: 1, pageSize: 10 }); // 仅在广告数据为空时调用接口
  }
});

// 使用 store 中的广告数据
const bannersToShow = computed(() => bannerStore.banners);

// 拆分成两行，先加满第一行再加第二行，减优先清空第二行
const maxCol = 5;
const maxRow = 2;

const rows = computed(() => {
  const arr = bannersToShow.value.slice(0, maxCol * maxRow);
  const row1 = arr.slice(0, maxCol);
  const row2 = arr.slice(maxCol);
  return {
    row1,
    row2,
  };
});

// 跳转到广告链接
function handleBannerClick(link: string) {
  if (link.startsWith('http')) {
    window.location.href = link; // 外部链接跳转
  } else {
    router.push(link); // 内部链接跳转
  }
}
</script>

<template>
  <div class="banner-wrapper">
    <div class="banner-table">
      <!-- 第一行 -->
      <div class="banner-row">
        <div
          v-for="(item, idx) in rows.row1"
          :key="'r1-'+idx"
          class="card"
          @click="handleBannerClick(item.link)"
        >
          <div class="image-wrapper">
            <img v-lazy="item.image" class="image" />
          </div>
          <div class="title">{{ item.title }}</div>
        </div>
        <!-- 不足5个补空格 -->
        <div
          v-for="idx in (maxCol - rows.row1.length)"
          :key="'r1-empty-'+idx"
          class="card card-blank"
        />
      </div>
      <!-- 第二行（有就显示） -->
      <div class="banner-row" v-if="rows.row2.length">
        <div
          v-for="(item, idx) in rows.row2"
          :key="'r2-'+idx"
          class="card"
          @click="handleBannerClick(item.link)"
        >
          <div class="image-wrapper">
            <img v-lazy="item.image" class="image" />
          </div>
          <div class="title">{{ item.title }}</div>
        </div>
        <!-- 不足5个补空格 -->
        <div
          v-for="idx in (maxCol - rows.row2.length)"
          :key="'r2-empty-'+idx"
          class="card card-blank"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner-wrapper {
  padding: 0 3.2vw;
  margin: 1vw 0;
}
.banner-table {
  display: flex;
  flex-direction: column;
  gap: 2vw;
}
.banner-row {
  display: flex;
  flex-direction: row;
  gap: 3vw;
  justify-content: flex-start;
}
.card {
  flex: 0 0 auto;
  width: 16.5vw;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card-blank {
  background: none !important;
  pointer-events: none;
  box-shadow: none !important;
  visibility: hidden;
}
.image-wrapper {
  width: 100%;
  aspect-ratio: 1/1;
  background-color: #eee;
  border-radius: 2vw;
  overflow: hidden;
  position: relative;
}
.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.title {
  font-size: 3vw;
  color: #333;
  margin-top: 1vw;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
</style>
