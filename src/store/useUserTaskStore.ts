import { defineStore } from "pinia";
import { ref } from "vue";
import {
  getTaskStatus,
  claimTask,
  fetchPointsExchangeList,
  exchangeItem,
  fetchPointsExchangeRecords, // ⭐ 新增
  TaskStatusResponse,
  PointsExchangeItem,
  PointsExchangeRecord, // ⭐ 新增
} from "@/api/userTask";

export const useUserTaskStore = defineStore("userTask", () => {
  // 任务状态
  const taskStatus = ref<TaskStatusResponse | null>(null);
  const loading = ref(false);

  // 积分兑换列表
  const exchangeList = ref<PointsExchangeItem[]>([]);
  const exchangeLoading = ref(false);

  // === 兑换记录相关 ===
  const recordList = ref<PointsExchangeRecord[]>([]);
  const recordTotal = ref(0);
  const recordLoading = ref(false);
  const recordPage = ref(1);
  const recordPageSize = ref(20);

  /**
   * 获取任务状态
   */
  async function fetchTaskStatus() {
    loading.value = true;
    try {
      const res = await getTaskStatus();
      taskStatus.value = res;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 领取任务积分
   */
  async function claim(type: string) {
    await claimTask(type);
    await fetchTaskStatus();
  }

  /**
   * 获取可兑换商品列表
   */
  async function fetchExchangeList() {
    exchangeLoading.value = true;
    try {
      const res = await fetchPointsExchangeList();
      exchangeList.value = res;
    } finally {
      exchangeLoading.value = false;
    }
  }

  /**
   * 执行兑换
   */
  async function exchange(id: number) {
    await exchangeItem(id);
    await fetchTaskStatus(); // 更新积分
    await fetchExchangeList(); // 如果需要刷新兑换商品状态
    await fetchExchangeRecords({ page: recordPage.value, pageSize: recordPageSize.value }); // 兑换后同步记录
  }

  /**
   * 获取兑换记录
   */
  async function fetchExchangeRecords(params: { page?: number; pageSize?: number } = {}) {
    recordLoading.value = true;
    try {
      const { list, total } = await fetchPointsExchangeRecords({
        page: params.page ?? recordPage.value,
        pageSize: params.pageSize ?? recordPageSize.value,
      });
      recordList.value = list;
      recordTotal.value = total;
      // 更新页码
      if (typeof params.page === "number") recordPage.value = params.page;
      if (typeof params.pageSize === "number") recordPageSize.value = params.pageSize;
    } finally {
      recordLoading.value = false;
    }
  }

  return {
    // 原有
    taskStatus,
    loading,
    fetchTaskStatus,
    claim,
    exchangeList,
    exchangeLoading,
    fetchExchangeList,
    exchange,
    // 兑换记录
    recordList,
    recordTotal,
    recordLoading,
    recordPage,
    recordPageSize,
    fetchExchangeRecords,
  };
});
