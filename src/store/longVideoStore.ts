// src/store/longVideoStore.ts
import { defineStore } from "pinia";
import {
  fetchLongVideoList,
  fetchLongVideoDetail,
  playLongVideo,
} from "@/api/longVideo.api";
import { unlockLongVideo } from '@/api/unlock.api'

export const useLongVideoStore = defineStore("longVideo", {
  state: () => ({
    list: [] as any[],
    total: 0,
    loading: false,
    detail: null as any,
    playUrl: "",       // 播放地址
    // 新增：主分类缓存
    cache: {} as Record<number, {
      list: any[];
      total: number;
      lastPage: number;
      hasMore: boolean;
    }>,
  }),
  actions: {
    /**
     * 加载视频列表
     */
    async loadList(params: any = {}) {
      const { parent_id, page = 1, pageSize = 20 } = params;

      // 检查缓存
      if (
        parent_id &&
        this.cache[parent_id] &&
        page <= this.cache[parent_id].lastPage
      ) {
        this.list = [...this.cache[parent_id].list].slice(0, page * pageSize);
        this.total = this.cache[parent_id].total;
        return;
      }

      this.loading = true;
      try {
        const res = await fetchLongVideoList({ ...params, page, pageSize });
      
        const newItems = (res.list || []).map((item) => ({
          id: item.id,
          title: item.title,
          cover: item.cover_url,
          duration: item.duration,
          preview_duration: item.preview_duration,
          category_id: item.category_id,
          categoryName: item.categoryName,
          parent_id: item.parent_id,
          parentName: item.parentName,
          tags: item.tags,
          vip: item.vip,
          coin: item.coin,
          goldCoins: item.goldCoins,
          play: item.play, // 加上这一行！
          sort: item.sort, // 视频自己的排序
          categorySort: item.categorySort ?? item.category_sort, // 子分类的排序
          // 👇👇👇加这一行！！！
          icon: item.category_icon || '',
        }));

        if (page === 1) {
          // 新主分类，重置缓存
          this.cache[parent_id] = {
            list: newItems,
            total: res.total || 0,
            lastPage: page,
            hasMore: (res.list || []).length >= pageSize,
          };
          this.list = newItems;
        } else {
          // 追加
          this.cache[parent_id].list = [
            ...this.cache[parent_id].list,
            ...newItems,
          ];
          this.cache[parent_id].lastPage = page;
          this.cache[parent_id].hasMore = (res.list || []).length >= pageSize;
          this.list = this.cache[parent_id].list;
        }
        this.total = this.cache[parent_id].total;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 加载视频详情 - 只接受数字ID
     */
    async loadDetail(id: number) {
      this.loading = true;
      try {
        if (typeof id !== "number" || isNaN(id) || id <= 0) {
          throw new Error(`无效的视频ID: ${id}`);
        }
        const res = await fetchLongVideoDetail(id);
        this.detail = res || null;
      } catch (error) {
        console.error("加载视频详情失败", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 播放视频（获取播放地址）
     */
    async fetchPlayUrl(data: { video_id: number; userId?: string }) {
      this.loading = true;
      try {
        if (typeof data.video_id !== "number" || isNaN(data.video_id) || data.video_id <= 0) {
          throw new Error(`无效的视频ID: ${data.video_id}`);
        }
        const payload = {
          video_id: data.video_id,
          userId: data.userId,
        };
        const res = await playLongVideo(payload);
        this.playUrl = res.url;
        return res;
      } catch (error) {
        console.error("获取播放地址失败", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 简化的直接播放封装
     */
    async playVideo(data: any) {
      return await this.fetchPlayUrl(data);
    },

    /**
     * 单部视频金币解锁
     */
    async buySingleVideo({ videoId, coin }: { videoId: number; coin: number }) {
      try {
        await unlockLongVideo({ video_id: videoId, coin })
        // 解锁成功后可选：刷新详情或状态
        await this.loadDetail(videoId)
        return true
      } catch (e) {
        // 这里可以根据后端返回的错误信息做提示
        throw e
      }
    },
  },
});
