import { defineStore } from 'pinia'
import { fetchPopupConfig } from '@/api/popupConfig.api'

export const usePopupConfigStore = defineStore('popupConfig', {
  state: () => ({
    configs: [] as any[],
    loading: false,
    error: '' as string | null,
    initedTypes: new Set<string>() // 记录已经加载过的类型
  }),
  actions: {
    async loadPopupConfig(type: string) {
      if (this.initedTypes.has(type)) {
        return
      }
      this.loading = true
      this.error = ''
      try {
        const res = await fetchPopupConfig(type)

        const list = Array.isArray(res) ? res : []

        this.configs = list.map(item => {
  let parsedValue = {}
  if (typeof item.value === 'string') {
    try {
      parsedValue = JSON.parse(item.value || '{}')
    } catch (e) {
      console.error('【value解析失败】', e, item.value)
    }
  } else if (typeof item.value === 'object' && item.value !== null) {
    parsedValue = item.value
  } else {
    parsedValue = {}
  }
  return {
    ...item,
    parsedValue
  }
})

        this.initedTypes.add(type)
      } catch (e: any) {
        this.error = e?.msg || e?.message || '请求失败'
        this.configs = []
      } finally {
        this.loading = false
      }
    },
    getFirstConfig() {
      return this.configs.length > 0 ? this.configs[0] : null
    }
  }
})
