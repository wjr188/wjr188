<template>
  <div class="category-page-content">
    <!-- 模拟数据展示 -->
    <div class="section-title">{{ category.name }} 推荐模块</div>

    <div class="video-list">
      <div class="video-card" v-for="i in 6" :key="i">
        {{ category.name }} 视频 {{ i }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Category {
  name: string
  [key: string]: any
}

const props = defineProps<{
  category: Category
}>()
</script>

<style scoped>
.category-page-content {
  padding: 4.26vw; /* 16px */
}

.section-title {
  font-weight: bold;
  font-size: 4.8vw; /* 18px */
  margin-bottom: 2.66vw; /* 10px */
}

.video-list {
  display: flex;
  flex-wrap: wrap;
  gap: 2.66vw; /* 10px */
}

.video-card {
  width: 48%;
  height: 26.6vw; /* 100px */
  background: #eee;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
