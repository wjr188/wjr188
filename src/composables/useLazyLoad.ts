import { Ref, ComputedRef, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

export function useLazyLoad<T>(
  allDataList: Ref<T[]> | ComputedRef<T[]>,
  options: {
    batchSize?: number
    scrollOffset?: number
    namespace?: string
    uniqueProps?: Record<string, any>
  } = {}
) {
  const {
    batchSize = 2,
    scrollOffset = 200,
    namespace = '',
    uniqueProps = {}
  } = options

  const visibleList: Ref<T[]> = ref([])
  const isLoading = ref(false)
  const noMore = ref(false)
  const sentinel = ref<HTMLElement | null>(null)

  const _loadedCount = ref(0)
  const _restoredFromSession = ref(false)

  let observer: IntersectionObserver | null = null

  const getStorageKey = () => {
    let key = `lazyLoad_${window.location.pathname}`
    if (namespace) key += `_${namespace}`
    if (uniqueProps && Object.keys(uniqueProps).length > 0) {
      for (const [k, v] of Object.entries(uniqueProps)) {
        key += `_${k}:${v}`
      }
    }
    return key
  }

  function findScrollRoot(el: HTMLElement | null): HTMLElement | null {
    if (!el) return null
    let parent = el.parentElement
    while (parent) {
      if (
        (parent.classList?.contains('swiper-slide-active') ||
          parent.classList?.contains('slide-content')) &&
        parent.scrollHeight > parent.clientHeight
      ) {
        return parent
      }
      parent = parent.parentElement
    }
    return document.documentElement
  }

  function calculateDynamicBatchSize() {
    const vh = window.innerHeight
    const estimatedItems = Math.ceil(vh / 400)
    return Math.max(batchSize, estimatedItems * 1.5)
  }

  async function loadNextBatch() {
    if (isLoading.value || noMore.value) return
    isLoading.value = true

    await new Promise(resolve => setTimeout(resolve, 200))

   const currentBatchSize = batchSize
    const start = visibleList.value.length
    const next = allDataList.value.slice(start, start + currentBatchSize)

    if (next.length === 0) {
      noMore.value = true
      isLoading.value = false
      destroyObserver()
      return
    }

    visibleList.value.push(...next)
    _loadedCount.value = visibleList.value.length
    isLoading.value = false

    if (_loadedCount.value >= allDataList.value.length) {
      noMore.value = true
      destroyObserver()
      return
    }

    observer?.unobserve(sentinel.value!)
    observer?.observe(sentinel.value!)
  }

  async function loadUntil(count: number) {
    const target = Math.min(count, allDataList.value.length)
    if (visibleList.value.length < target) {
      visibleList.value = allDataList.value.slice(0, target)
      _loadedCount.value = visibleList.value.length
      if (_loadedCount.value >= allDataList.value.length) {
        noMore.value = true
        destroyObserver()
      }
      await nextTick()
      initObserver()
      observer?.unobserve(sentinel.value!)
      observer?.observe(sentinel.value!)
    } else if (visibleList.value.length >= allDataList.value.length) {
      noMore.value = true
      destroyObserver()
    }
  }

  function initObserver() {
    if (!sentinel.value || noMore.value) {
      destroyObserver()
      return
    }
    nextTick(() => {
      destroyObserver()
      const rootEl = findScrollRoot(sentinel.value)
      if (!sentinel.value || !rootEl) return
      observer = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            loadNextBatch()
          }
        },
        { root: rootEl, rootMargin: `${scrollOffset}px` }
      )
      observer.observe(sentinel.value)
    })
  }

  function destroyObserver() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  onMounted(async () => {
    const storageKey = getStorageKey()
    const savedCount = sessionStorage.getItem(`${storageKey}_loadedCount`)
    const savedScroll = sessionStorage.getItem(`${storageKey}_scrollTop`)

    if (savedCount) {
      _loadedCount.value = parseInt(savedCount, 10)
      visibleList.value = allDataList.value.slice(0, _loadedCount.value)
      _restoredFromSession.value = true
      if (_loadedCount.value >= allDataList.value.length) {
        noMore.value = true
      }
      // 延迟到渲染完恢复滚动
      await nextTick()
      requestAnimationFrame(() => {
        if (savedScroll) {
          window.scrollTo(0, parseInt(savedScroll, 10))
        }
      })
    } else {
      loadNextBatch()
    }
    initObserver()
  })

  onUnmounted(() => {
    const storageKey = getStorageKey()
    if (!noMore.value) {
      sessionStorage.setItem(`${storageKey}_loadedCount`, _loadedCount.value.toString())
    } else {
      sessionStorage.removeItem(`${storageKey}_loadedCount`)
    }
    // 保存滚动位置
    sessionStorage.setItem(`${storageKey}_scrollTop`, window.scrollY.toString())
    destroyObserver()
  })

  watch(
    allDataList,
    (newVal, oldVal) => {
      if (newVal !== oldVal) {
        if (_restoredFromSession.value) {
          _restoredFromSession.value = false
          return
        }
        visibleList.value = []
        _loadedCount.value = 0
        noMore.value = false
        isLoading.value = false
        if (newVal.length > 0) {
          nextTick(() => {
            initObserver()
            loadNextBatch()
          })
        } else {
          destroyObserver()
          noMore.value = true
          visibleList.value = []
        }
      }
    },
    { deep: false }
  )

  return {
    visibleList: visibleList as Ref<T[]>,
    isLoading,
    noMore,
    sentinel,
    loadNextBatch,
    loadUntil,
    destroyObserver
  }
}
