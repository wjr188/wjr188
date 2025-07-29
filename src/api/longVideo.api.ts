// src/api/longVideo.ts
import request from "@/utils/request";

// 获取H5专用长视频列表
export function fetchLongVideoList(params: any) {
  return request.get("/api/long/videos/h5-list", { params });
}

// 获取长视频详情
export function fetchLongVideoDetail(id: number | string) {
  return request.get(`/api/long/videos/${id}`);
}

// 播放视频
export function playLongVideo(data: any) {
  return request.post("/api/long/videos/play", data);
}

// 获取某个子分类下的全部视频（分页）
export function fetchLongVideoByCategory(categoryId: number | string, params: any = {}) {
  return request.get(`/api/h5/long_video/category/${categoryId}`, { params });
}
