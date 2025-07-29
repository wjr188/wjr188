import request from '@/utils/request'

// 获取小说分类
export function getNovelCategoryList(params) {
  return request.get('api/text_novel_category/list', { params })
}

// 获取小说列表
export function getNovelList(params) {
  return request.get('api/text_novel/list', { params })
}

// 获取小说详情
export function getNovelDetail(id) {
  // 兼容你的控制器 read($id)
  return request.get('api/text_novel/read', { params: { id } })
}

// 获取小说章节列表（分页，带 novelId）
export function getNovelChapters(params) {
  // params: { novelId, page, pageSize }
  return request.get('api/text_novel_chapter/list', { params })
}
// 获取单章节内容（正文等）
export function getNovelChapterDetail(id) {
  return request.get(`api/text_novel_chapter/${id}`)
}
// 获取推荐分组及分组下小说（首页推荐模块用）
export function getNovelRecommendAllWithNovels() {
  return request.get('api/novel-recommend/group/allWithNovels')
}
// 获取推荐分组下的所有小说（分页，推荐页“更多”用）
export function getNovelRecommendGroupNovels(params) {
  // params = { groupId, page, pageSize }
  const { groupId, ...rest } = params
  return request.get(`api/novel-recommend/group/${groupId}/novels`, { params: rest })
}
// 获取小说标签列表
export function getNovelTagList(params) {
  return request.get('api/text_novel_tag/list', { params })
}
