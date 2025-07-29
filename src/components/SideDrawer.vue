<template>
  <teleport to="body">
    <div v-if="visible" class="drawer-mask" @click.self="close">
      <div class="drawer-panel">
        <h3 class="title">导航列表</h3>
        <div class="category-grid">
          <div
            v-for="(item, index) in list"
            :key="index"
            class="category-btn"
            :class="{ active: item.name === active }"
            @click="handleClick(item.name)"
          >
            <template v-if="item.icon">
              <span>{{ item.name }}</span>
              <img :src="`/icons/${item.icon}`" class="btn-icon" />
            </template>
            <template v-else>
              {{ item.name }}
            </template>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
<script setup lang="ts">
import { PropType } from 'vue'

interface CategoryItem {
  name: string
  icon?: string
}

const props = defineProps<{
  visible: boolean
  list: CategoryItem[]
  active: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', name: string): void
}>()

const close = () => emit('close')
const handleClick = (name: string) => {
  emit('select', name)
  emit('close')
}
</script>

<style scoped>
.drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;

  /* ✅ 背景遮罩渐变 + 毛玻璃 */
  background: linear-gradient(to right, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.drawer-panel {
  width: 70vw;
  max-width: 75vw;
  height: 100vh;
  padding: 5vw;
  color: #fff;
  overflow-y: auto;

  /* ✅ 半透明毛玻璃抽屉面板 */
  background: rgba(28, 28, 30, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 1vw 0 4vw rgba(0, 0, 0, 0.3);
  border-right: 0.3vw solid rgba(255, 255, 255, 0.05);

  transform: translateX(0);
  transition: transform 0.3s ease;
}

.title {
  font-size: 4.2vw;
  font-weight: bold;
  margin-bottom: 4vw;
  border-left: 1vw solid #f12c2c;
  padding-left: 2vw;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5vw;
}

.category-btn {
  padding: 2.5vw;
  border-radius: 2.5vw;

  /* ✅ 按钮也加透明感 */
  background: rgba(42, 42, 46, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);

  color: #eee;
  font-size: 3.5vw;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5vw;
  cursor: pointer;
  transition: background 0.3s;
  width: 100%;
  box-sizing: border-box;
  min-height: 10vw;
}

.category-btn.active {
  background: #f12c2c;
  color: #fff;
}

.btn-icon {
  width: 4vw;
  height: 4vw;
}

</style>
