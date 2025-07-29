import request from "@/utils/request";

// 获取所有长视频分类
export function fetchLongVideoCategories() {
  return request.get("/api/long/categories/list");
}

// 新增主分类
export function addLongVideoParentCategory(data: { name: string }) {
  return request.post("/api/long/categories/add-parent", data);
}

// 新增子分类
export function addLongVideoChildCategory(data: { name: string; parent_id: number }) {
  return request.post("/api/long/categories/add-child", data);
}

// 获取指定主分类下的子分类
export function fetchLongVideoChildCategories(parent_id: number, page = 1, page_size = 20) {
  return request.get("/api/long/categories/list", { params: { parent_id, page, page_size } });
}

// 获取所有长视频主分类（只要主分类，不要子分类）
export function fetchLongVideoParentCategories() {
  return request.get("/api/long/categories/list", { params: { only_parents: 1 } });
}

// ... 其它分类相关接口 ...