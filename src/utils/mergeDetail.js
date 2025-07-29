// 把 detail 数据合并进卡片数据中，匹配依据为 title
export function mergeDetailToItems(items, detailMap) {
  return items.map(item => {
    const detail = detailMap[item.title]
    if (!detail) return item

    return {
      ...item,
      count: detail.chapters?.length || item.count || 0,
      views: detail.views || 0,
      fav: detail.likes || 0,
      status: detail.status || 'free', // VIP / coin / free
      serialStatus: detail.serialStatus || '',
      intro: detail.intro || '',
      tag: detail.tags?.[0] || item.tag
    }
  })
}
