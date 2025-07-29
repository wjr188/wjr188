import { defineStore } from "pinia";
import { fetchHotKeywords } from "@/api/searchHotKeyword.api";

// 定义类型
export interface HotKeywordItem {
  id: number
  keyword: string
  type: string
  status: number
  sort: number
}

export const useHotKeywordStore = defineStore("hotKeyword", {
  state: () => ({
    list: [] as HotKeywordItem[],
    loading: false
  }),
  actions: {
    async load(type = "all") {
      this.loading = true;
      try {
        // 注意：你的 axios 拦截器已经解包了，res 是数组
        const res = await fetchHotKeywords(type);
        this.list = Array.isArray(res) ? res : [];
      } finally {
        this.loading = false;
      }
    }
  }
});
