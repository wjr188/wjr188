import request from "@/utils/request";

/**
 * 获取广告列表
 * @param {Object} params - 查询参数
 */
export function fetchBannerList(params: { page?: number; pageSize?: number } = {}) {
  return request.get("/api/banner/list", { params });
}

