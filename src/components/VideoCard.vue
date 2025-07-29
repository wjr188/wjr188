<template>
  <div class="video-card" @click="play">
    <img :src="cover" :alt="title" />
    <div class="info">
      <span class="title">{{ title }}</span>
      <span class="duration">{{ duration }} 秒</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  cover: string
  duration: number
  id: string
}

const props = defineProps<Props>()

const play = () => {
  window.location.href = `/#/play/${props.id}`
}
</script>

<style scoped>
.video-card {
  background: #1a1a1a;
  border-radius: 3.2vw; /* 12px -> 3.2vw */
  overflow: hidden;
  position: relative;
  transition: transform 0.2s;
}
.video-card:hover {
  transform: scale(1.02);
}
.video-card img {
  width: 100%;
  display: block;
  border-radius: 3.2vw 3.2vw 0 0;
}
.info {
  padding: 2.13vw; /* 8px -> 2.13vw */
  display: flex;
  justify-content: space-between;
  color: #ccc;
  font-size: 3.2vw; /* 12px -> 3.2vw */
}
.info .title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
