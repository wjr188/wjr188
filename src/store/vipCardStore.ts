import { defineStore } from 'pinia'
import {
  fetchVipCardList,
  saveVipCard,
  updateVipCard,
  toggleVipCardStatus,
  deleteVipCard,
  fetchAllVipCardsWithDetail, // 注意这里改掉
  fetchAllVipCardsSimple
} from '@/api/vipCard.api'

export const useVipCardStore = defineStore('vipCard', {
  state: () => ({
    list: [] as any[],
    total: 0,
    loading: false,
    allCards: [] as any[]
  }),
  actions: {
    // 分页获取
    async loadList(page = 1, pageSize = 10) {
      this.loading = true
      try {
        const res = await fetchVipCardList({ page, pageSize })
        this.list = res.data.list || []
        this.total = res.data.total || 0
      } finally {
        this.loading = false
      }
    },

    // 新增或编辑
    async saveCard(card: any) {
      return await saveVipCard(card)
    },

    // 编辑（单独接口）
    async updateCard(id: number, data: any) {
      return await updateVipCard(id, data)
    },

    // 切换状态
    async changeStatus(id: number, status: 'ENABLED' | 'DISABLED') {
      return await toggleVipCardStatus(id, status)
    },

    // 删除
    async removeCard(id: number) {
      return await deleteVipCard(id)
    },

    // 前台：一次性加载所有详细卡片
    // 前台：一次性加载所有启用的卡片
async loadAllCards() {
  const res = await fetchAllVipCardsSimple()
  this.allCards = res || []
}

  }
})
