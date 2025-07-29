import { defineStore } from 'pinia';
import { fetchBannerList } from '@/api/banner';

export const useBannerStore = defineStore('banner', {
  state: () => ({
    banners: [],
    totalBanners: 0,
    loading: false,
  }),
  actions: {
    /**
     * 获取广告列表
     * @param {Object} params - 查询参数
     */
    async getBanners(params = { page: 1, pageSize: 10 }) {
      if (this.loading) return; // 防止重复调用
      this.loading = true;
      try {
        const response = await fetchBannerList(params);

        // 自动解包后的数据处理
        if (Array.isArray(response.list)) {
          this.banners = response.list.map((item: any) => ({
            image: item.image_url, // 确保字段名正确
            title: item.title,
            link: item.link,
          }));
          this.totalBanners = response.total || 0;
        } else {
          console.error('获取广告列表失败: 数据格式异常', response);
          this.banners = [];
          this.totalBanners = 0;
        }
      } catch (error) {
        console.error('获取广告列表失败:', error);
        this.banners = [];
        this.totalBanners = 0;
      } finally {
        this.loading = false;
      }
    },
  },
});
