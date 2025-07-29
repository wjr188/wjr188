// 提取推荐模块中的 items，转为扁平卡片数据
export function extractFlatItems(modules, category) {
  const all = []
  for (const mod of modules) {
    for (const item of mod.items || []) {
      all.push({
        id: item.id,
        title: item.title,
        cover: item.cover,
        count: item.episodeCount, // 原字段为 episodeCount
        tag: item.category || '',
        categoryKey: item.category || '未分类',
        category // 当前分类页（如 漫画 / 动漫 / 小说）
      })
    }
  }
  return all
}
