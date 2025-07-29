<template>
  <div class="safe-wrapper" @contextmenu.prevent>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // 禁止双击缩放
  let lastTouchEnd = 0
  document.addEventListener(
    'touchend',
    (e: TouchEvent) => {
      const now = Date.now()
      if (e.cancelable && now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    },
    { passive: false }
  )

  // 禁止多指缩放
  document.addEventListener(
    'touchstart',
    (e: TouchEvent) => {
      if (e.cancelable && e.touches.length > 1) e.preventDefault()
    },
    { passive: false }
  )

  // 禁止手势事件
  ;(['gesturestart', 'gesturechange', 'gestureend'] as const).forEach(evt => {
    document.addEventListener(
      evt,
      (e: Event) => {
        if ('cancelable' in e && e.cancelable) e.preventDefault()
      },
      { passive: false }
    )
  })

  // 禁止Ctrl+滚轮缩放
  window.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      if (e.ctrlKey && e.cancelable) e.preventDefault()
    },
    { passive: false }
  )

  // 禁止快捷键缩放
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (
      e.key === 'F11' ||
      (e.ctrlKey && ['+', '-', '=', '0', 'Add', 'Subtract'].includes(e.key))
    ) {
      e.preventDefault()
    }
  })

  // 禁止拖拽
  document.addEventListener('dragstart', (e: DragEvent) => e.preventDefault())

  // 禁止左右滑动
  let startX = 0
  document.addEventListener(
    'touchstart',
    (e: TouchEvent) => {
      startX = e.touches[0].clientX
    },
    { passive: false }
  )

  document.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      const deltaX = e.touches[0].clientX - startX
      if (startX < 10 && deltaX > 10 && e.cancelable) {
        e.preventDefault()
      }
    },
    { passive: false }
  )

  // 禁止文本选择和复制
  document.addEventListener('selectstart', (e: Event) => e.preventDefault())

  // 禁止长按菜单
  document.addEventListener('contextmenu', (e: Event) => e.preventDefault())

  // 修复输入框聚焦时页面自动缩放问题
  document.addEventListener('focusin', (e: FocusEvent) => {
    const target = e.target as HTMLElement
    if (target && target.matches('input, textarea, [contenteditable]')) {
      document.documentElement.style.zoom = '1'
      document.documentElement.style.maxHeight = '100%'
      document.documentElement.style.overflow = 'hidden'
    }
  })

  document.addEventListener('focusout', (e: FocusEvent) => {
    const target = e.target as HTMLElement
    if (target && target.matches('input, textarea, [contenteditable]')) {
      document.documentElement.style.zoom = ''
      document.documentElement.style.maxHeight = ''
      document.documentElement.style.overflow = ''
    }
  })
})
</script>

<style>
.safe-wrapper,
.safe-wrapper * {
  user-select: none !important;
  -webkit-touch-callout: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  overscroll-behavior-x: none !important;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-text-size-adjust: none !important;
  touch-action: manipulation !important;
}

/* 确保可点击元素正常工作 */
button,
a,
.clickable {
  pointer-events: auto !important;
}

/* 图标允许点击 */
.icon,
[class*="icon-"],
.btn-icon,
.arrow {
  pointer-events: auto !important;
}

/* 禁止文本选择时的背景色 */
::selection {
  background: transparent;
}
::-moz-selection {
  background: transparent;
}

/* 修复输入框缩放 */
input,
textarea,
[contenteditable] {
  font-size: 16px !important;
  touch-action: auto !important;
  -webkit-user-select: text !important;
  user-select: text !important;
  max-height: 100% !important;
}

/* 输入框选中文本背景色 */
input::selection,
textarea::selection {
  background: #b3d4fc !important;
}
</style>
