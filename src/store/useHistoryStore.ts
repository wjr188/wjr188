import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface HistoryItem {
  id: string
  type: 'video' | 'douyin' | 'only_video' | 'only_img' | 'comic' | 'novel' | 'audio'
  data: {
    cover?: string
    title?: string
    episodes?: number
    lastRead?: number
    [key: string]: any
  }
  time: string
}

export const useHistoryStore = defineStore('history', () => {
  const records = ref<HistoryItem[]>([])

  function addRecord(record: HistoryItem) {
    cleanup()

    // 🟢 only_img 类型：把需要的字段放入id
    if (record.type === 'only_img') {
      const payload = {
        album: record.data.album,
        star: record.data.star,
        likes: record.data.likes ?? 0,
        favs: record.data.favs ?? 0,
        index: record.data.index ?? 0
      }
      record.id = encodeURIComponent(JSON.stringify(payload))
    }

    if (record.type === 'comic' || record.type === 'novel') {
      record.data.episodes ??= 0
      record.data.lastRead ??= 0

      const baseId = record.id.split('_')[0]
      records.value = records.value.filter(r => {
        if (r.type === record.type) {
          return r.id.split('_')[0] !== baseId
        }
        return true
      })

      records.value.unshift(record)
    } else {
      // 其他类型
      records.value = records.value.filter(r => !(r.id === record.id && r.type === record.type))
      records.value.unshift(record)
    }

    saveToLocal()
  }

  function updateLastRead(id: string, lastRead: number) {
    const record = records.value.find(r => r.id === id && (r.type === 'comic' || r.type === 'novel'))
    if (record) {
      record.data.lastRead = lastRead
      saveToLocal()
    }
  }

  function removeRecord(id: string, type: HistoryItem['type']) {
    records.value = records.value.filter(r => !(r.id === id && r.type === type))
    saveToLocal()
  }

  function clearAll() {
    records.value = []
    saveToLocal()
  }

  function getRecordsByType(type: HistoryItem['type']) {
    return records.value.filter(r => r.type === type)
  }

  function saveToLocal() {
    try {
      localStorage.setItem('historyRecords', JSON.stringify(records.value))
    } catch (e) {
      console.warn('保存浏览记录失败:', e)
    }
  }

  function loadFromLocal() {
    const saved = localStorage.getItem('historyRecords')
    if (saved) {
      try {
        const parsed: HistoryItem[] = JSON.parse(saved)
        const now = Date.now()
        const mergedMap = new Map<string, HistoryItem>()

        for (const item of [...parsed, ...records.value]) {
          const key = `${item.id}_${item.type}`
          if (now - new Date(item.time).getTime() > 30 * 24 * 60 * 60 * 1000) continue
          if (!mergedMap.has(key)) {
            mergedMap.set(key, item)
          }
        }

        records.value = Array.from(mergedMap.values())
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 200)
      } catch (e) {
        console.warn('加载浏览记录失败:', e)
        records.value = []
      }
    }
  }

  function cleanup() {
    const now = Date.now()
    records.value = records.value
      .filter(item => now - new Date(item.time).getTime() <= 30 * 24 * 60 * 60 * 1000)
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 200)
  }

  return {
    records,
    addRecord,
    updateLastRead,
    removeRecord,
    clearAll,
    getRecordsByType,
    saveToLocal,
    loadFromLocal
  }
})
