import { defineStore } from "pinia";
import { fetchCoinPackageList, addCoinPackage, updateCoinPackage, deleteCoinPackage, updateCoinPackageStatus } from "@/api/coinPackage";
import { showToast } from "vant";

export const useCoinPackageStore = defineStore("coinPackage", {
  state: () => ({
    list: [] as any[],
    total: 0,
    loading: false
  }),
  actions: {
    async loadList(status?: number|string) {
      this.loading = true;
      try {
        const res = await fetchCoinPackageList({ status });
        this.list = res.list;
        this.total = res.total;
      } catch (error) {
        console.error("加载失败", error);
      } finally {
        this.loading = false;
      }
    },

    async add(data: any) {
      try {
        const res = await addCoinPackage(data);
        showToast("新增成功");
        return res;
      } catch (error) {
        console.error("新增失败", error);
        throw error;
      }
    },

    async update(data: any) {
      try {
        await updateCoinPackage(data);
        showToast("修改成功");
      } catch (error) {
        console.error("修改失败", error);
        throw error;
      }
    },

    async remove(ids: number[]) {
      try {
        await deleteCoinPackage({ ids });
        showToast("删除成功");
        // 删除后自动刷新
        await this.loadList();
      } catch (error) {
        console.error("删除失败", error);
        throw error;
      }
    },

    async changeStatus(ids: number[], status: number) {
      try {
        await updateCoinPackageStatus({ ids, status });
        showToast((status ? "上架" : "下架") + "成功");
        await this.loadList();
      } catch (error) {
        console.error("状态修改失败", error);
        throw error;
      }
    }
  }
});
