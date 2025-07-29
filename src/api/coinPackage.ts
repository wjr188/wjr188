import request from "@/utils/request"; // 这里改成你刚才那个拦截器文件路径

// 列表
export function fetchCoinPackageList(params: { status?: number|string } = {}) {
  return request.get("/api/coin-package/list", { params });
}

// 新增
export function addCoinPackage(data: any) {
  return request.post("/api/coin-package/add", data);
}

// 编辑
export function updateCoinPackage(data: any) {
  return request.post("/api/coin-package/update", data);
}

// 删除
export function deleteCoinPackage(data: { id?: number; ids?: number[] }) {
  return request.post("/api/coin-package/delete", data);
}

// 批量上下架
export function updateCoinPackageStatus(data: { ids: number[]; status: number }) {
  return request.post("/api/coin-package/status", data);
}
