import { defineStore } from 'pinia'
import { unlockNovelChapter, getUnlockedNovelChapters, unlockNovelWhole } from '@/api/unlock.api'
import {
  getNovelCategoryList,
  getNovelList,
  getNovelChapters,
  getNovelChapterDetail,
  getNovelDetail,
  getNovelRecommendAllWithNovels,
  getNovelRecommendGroupNovels,
  getNovelTagList,  // 引入标签列表接口
} from '@/api/novelapi'

function stripTimeFields(list = []) {
  return list.map(({ create_time, update_time, ...rest }) => rest)
}
function compatNovelFields(list = []) {
  return list.map(novel => ({
    ...novel,
    name: novel.name || novel.title || '',
    cover: novel.cover || novel.cover_url || '',
    episodeCount: novel.episodeCount ?? novel.chapter_count ?? 0,
    count: novel.count ?? novel.chapter_count ?? 0,
    intro: novel.intro ?? novel.description ?? '',
    category: novel.category || novel.category_name || '',
    is_serializing: novel.is_serializing ?? novel.serialization_status ?? 0,
    views: novel.views ?? 0,
    is_vip: novel.is_vip ?? 0,
    coin: novel.coin ?? 0,
  }))
}

export const useNovelCategoryStore = defineStore('novelCategory', {
  state: () => ({
    mainCategories: [],
    subCategories: [],
    novels: [],
    total: 0,
    novelLoading: false,
    loading: false,
    novelParams: {
      categoryId: '',
      page: 1,
      pageSize: 15,
      keyword: '',
      tag: '',
      serializationStatus: '',
      shelfStatus: '',
      visibility: '',
    },
    categoryNovelMap: {},
    unlockedNovelChaptersMap: {},
    guessLikeNovelList: [],
    recommendNovelGroups: [],
    hasLoadedRecommendNovelGroups: false,
    novelLibraryCache: {},

    // -------- 目录缓存分离 -------------
    chapterList: [],               // 全部目录
    chapterListCache: {},          // 全部目录缓存
    previewChapterList: [],        // 预览3条
    previewChapterCache: {},       // 预览缓存
    chapterTotal: 0,
    chapterLoading: false,
    chapterParams: {
      novelId: '',
      page: 1,
      pageSize: 50,
    },
    chapterContent: {},
    currentChapter: null,
    currentNovelDetail: null,

    // -------- 新增标签列表 -----------
    tagList: [],  // 存储标签列表
  }),

  getters: {
    fullChapterList: (state) => state.chapterList || [],
    novelDetail: (state) => state.currentNovelDetail || {},
    novelChapterList: (state) => ({
      list: state.chapterList,
      total: state.chapterTotal
    }),
    // 获取标签列表
    allTags: (state) => state.tagList,
  },

  actions: {
    async fetchCategoryList(params = {}) {
      this.loading = true
      try {
        const res = await getNovelCategoryList(params)
        this.mainCategories = stripTimeFields(res.mainCategories || [])
        this.subCategories = stripTimeFields(res.subCategories || [])
      } finally {
        this.loading = false
      }
    },
async fetchNovelList(params = {}, append = false, key) {
  this.novelLoading = true
  try {
    const mergedParams = { ...this.novelParams, ...params }
    const page = mergedParams.page || 1
    const mapKey = key || (mergedParams.categoryId || 'all')
    const cache = this.categoryNovelMap[mapKey]?.[page]
    
    if (cache) {
      // 从缓存加载数据
      this._refreshMergedNovelList(mapKey)
      this.novelParams = mergedParams
      return
    }
    
    // 请求数据
    const res = await getNovelList(mergedParams)
    let novels = stripTimeFields(res.list || [])
    novels = compatNovelFields(novels)
    
    if (!this.categoryNovelMap[mapKey]) this.categoryNovelMap[mapKey] = {}
    this.categoryNovelMap[mapKey][page] = {
      novels,
      total: res.total || novels.length
    }
    
    // 刷新合并的小说列表
    this._refreshMergedNovelList(mapKey)
    this.novelParams = mergedParams
  } catch (err) {
    this.novels = []
    this.total = 0
  } finally {
    this.novelLoading = false
  }
},

async loadLibraryNovelsWithCache(opt: {
  categoryId: number | string,
  tagId: number | string,
  sort: string, // 'default' | 'views' | 'create_time' | 'collects'
  page: number,
  pageSize?: number,
  force?: boolean
}) {
  const { categoryId, tagId, sort, page, pageSize = 15, force = false } = opt;
  const cacheKey = `${categoryId}_${tagId}_${sort}_${page}`;

  if (!force && this.novelLibraryCache[cacheKey]) {
    return this.novelLibraryCache[cacheKey];
  }

  // 排序映射
  const sortMap: Record<string, { orderBy?: string; orderDir?: string }> = {
    default: {},
    views: { orderBy: 'views', orderDir: 'desc' },
    create_time: { orderBy: 'create_time', orderDir: 'desc' },
    collects: { orderBy: 'collects', orderDir: 'desc' }
  };
  const sortObj = sortMap[sort] || {};

  // 组装参数，兼容 tag 和 tagId（后端字段名统一使用 tagId，前端建议也是 tagId）
  const params: any = {
    categoryId,
    tagId,
    page,
    pageSize,
    ...sortObj
  };

  // 发送请求
  const res = await getNovelList(params);

  const data = {
    list: res?.list || [],
    total: res?.total || 0,
    page,
    pageSize,
    noMore: (res?.list?.length || 0) < pageSize || (res?.list?.length || 0) + (page - 1) * pageSize >= res?.total,
  };

  this.novelLibraryCache[cacheKey] = data;
  return data;
},

    // ------- 目录预览3条 --------
    async fetchNovelPreviewChapters(novelId, count = 3) {
      novelId = String(novelId)
      if (this.previewChapterCache[novelId]) {
        this.previewChapterList = [...this.previewChapterCache[novelId]]
        return { list: this.previewChapterList }
      }
      this.chapterLoading = true
      try {
        const res = await getNovelChapters({ novelId, page: 1, pageSize: count })
        this.previewChapterList = res.list || []
        this.previewChapterCache[novelId] = [...this.previewChapterList]
        return { list: this.previewChapterList }
      } finally {
        this.chapterLoading = false
      }
    },

    // 获取标签列表
    async fetchTagList(params = {}) {
      try {
        const res = await getNovelTagList(params)
        this.tagList = res.list || []  // 将获取到的标签列表保存到store中
      } catch (error) {
        console.error('获取标签列表失败:', error)
      }
    },

    // ------- 全部目录 --------
    async fetchNovelAllChapters(novelId) {
      novelId = String(novelId)
      if (this.chapterListCache[novelId]) {
        this.chapterList = [...this.chapterListCache[novelId]]
        return { list: this.chapterList }
      }
      this.chapterLoading = true
      try {
        const res = await getNovelChapters({ novelId, page: 1, pageSize: 999 })
        this.chapterList = res.list || []
        this.chapterListCache[novelId] = [...this.chapterList]
        return { list: this.chapterList }
      } finally {
        this.chapterLoading = false
      }
    },

    // --------- 清理缓存 ---------
    clearChapterCache() {
      this.chapterList = []
      this.chapterListCache = {}
      this.previewChapterList = []
      this.previewChapterCache = {}
      this.chapterTotal = 0
      this.chapterParams = { novelId: '', page: 1, pageSize: 50 }
      this.chapterContent = {}
      this.currentChapter = null
    },

    // -------- 查询已解锁的小说章节ID（用于目录页/阅读器），只拉一次 --------
    async loadUnlockedNovelChapters(novelId, force = false) {
      const nid = String(novelId)
      // 只要是数组（哪怕空的 []），都不请求接口
      if (!force && Array.isArray(this.unlockedNovelChaptersMap[nid])) {
        return this.unlockedNovelChaptersMap[nid]
      }
      try {
        const res = await getUnlockedNovelChapters({ novel_id: nid })
        this.unlockedNovelChaptersMap = {
          ...this.unlockedNovelChaptersMap,
          [nid]: Array.isArray(res) ? res.map(String) : []
        }
        return this.unlockedNovelChaptersMap[nid]
      } catch (e) {
        this.unlockedNovelChaptersMap = {
          ...this.unlockedNovelChaptersMap,
          [nid]: []
        }
        return []
      }
    },

    // -------- 解锁小说章节 --------
    async buyNovelChapter(chapterId) {
      try {
        const res = await unlockNovelChapter({ chapter_id: chapterId })
        let novelId = this.currentNovelDetail?.id
        if (!novelId && this.chapterList?.[0]?.novel_id) {
          novelId = this.chapterList[0].novel_id
        }
        if (novelId) {
          await this.loadUnlockedNovelChapters(novelId, true)
        }
        return res
      } catch (e) {
        throw e
      }
    },
    // -------- 本地记录解锁的章节ID（购买成功后调用即可，不要再请求接口） --------
    addUnlockedNovelChapter(novelId, chapterId) {
      const nid = String(novelId)
      const chId = String(chapterId)
      let list = this.unlockedNovelChaptersMap[nid] || []
      if (!list.includes(chId)) {
        list = [...list, chId]
        this.unlockedNovelChaptersMap = {
          ...this.unlockedNovelChaptersMap,
          [nid]: list
        }
      }
    },

    // -------- 其它不变 --------
    async loadNovelsByCategory(categoryName, categoryId, page = 1, pageSize = 15) {
      const key = categoryName
      if (this.categoryNovelMap[key]?.[page]) return
      this.novelLoading = true
      try {
        const res = await getNovelList({ categoryId, page, pageSize })
        let novels = stripTimeFields(res.list || [])
        novels = compatNovelFields(novels)
        if (!this.categoryNovelMap[key]) this.categoryNovelMap[key] = {}
        this.categoryNovelMap[key][page] = {
          novels,
          total: res.total || novels.length
        }
        this._refreshMergedNovelList(key)
      } finally {
        this.novelLoading = false
      }
    },
_refreshMergedNovelList(key) {
  const pages = Object.keys(this.categoryNovelMap[key] || {})
    .map(p => Number(p))
    .sort((a, b) => a - b)
  
  const seen = new Set(this.novels.map(n => n.id))
  let total = 0
  
  this.novels = []
  pages.forEach(p => {
    const cache = this.categoryNovelMap[key][p]
    if (cache?.novels) {
      cache.novels.forEach(item => {
        if (!seen.has(item.id)) {
          seen.add(item.id)
          this.novels.push(item)
        }
      })
      total = cache.total || total
    }
  })
  
  this.total = total
},

    setNovelCategory(categoryId) {
  this.novelParams.categoryId = categoryId;
  this.novelParams.page = 1;  // 重置为第一页
  this.fetchNovelList(this.novelParams);  // 确保传递完整的参数
},

setNovelPage(page) {
  this.novelParams.page = page;
  this.fetchNovelList(this.novelParams);  // 确保传递完整的参数
},

    resetNovelParams() {
      this.novelParams = {
        categoryId: '',
        page: 1,
        pageSize: 15,
        keyword: '',
        tagId: '', // ← 这里原来是 tag，改为 tagId！
        serializationStatus: '',
        shelfStatus: '',
        visibility: '',
      }
      this.fetchNovelList()
    },
    clearCategoryCache(categoryName) {
      if (this.categoryNovelMap[categoryName]) {
        delete this.categoryNovelMap[categoryName]
      }
    },

    async fetchNovelDetail(novelId) {
      try {
        const res = await getNovelDetail(novelId)
        this.currentNovelDetail = res || null
        return this.currentNovelDetail
      } catch (e) {
        this.currentNovelDetail = null
        return null
      }
    },
// 在 actions 里加一个
async searchNovels({ keyword, page = 1, pageSize = 15, categoryId = '' }) {
  // 只组装要的参数
  const params = {
    keyword,
    page,
    pageSize,
  }
  // 只有有分类时才加
  if (categoryId) params.categoryId = categoryId
  // 请求
  const res = await getNovelList(params)
  // 做必要的兼容格式
  return {
    list: compatNovelFields(stripTimeFields(res.list || [])),
    total: res.total || 0,
  }
},

    // -------- 整本解锁小说 --------
    async buyNovelWhole(novelId) {
      try {
        const res = await unlockNovelWhole({ novel_id: novelId })
        await this.loadUnlockedNovelChapters(novelId, true)
        return res
      } catch (e) {
        throw e
      }
    },

    async loadGuessLikeNovels(categoryId, excludeId, limit = 6) {
      this.novelLoading = true
      try {
        const res = await getNovelList({
          categoryId,
          page: 1,
          pageSize: limit * 2,
          status: 1,
        })
        let list = (res.list || []).filter(item => item.id != excludeId)
        if (list.length > limit) {
          list = list.sort(() => Math.random() - 0.5).slice(0, limit)
        }
        this.guessLikeNovelList = list 
        return list
      } finally {
        this.novelLoading = false
      }
    },
    // 分页拉取推荐分组下的小说（推荐页“更多”用）
    async loadRecommendGroupNovels(groupId, { page = 1, pageSize = 15, append = false } = {}) {
      if (!groupId) return { list: [], total: 0 }
      const cacheKey = `group_${groupId}`
      if (!this.categoryNovelMap[cacheKey]) this.categoryNovelMap[cacheKey] = {}
      if (this.categoryNovelMap[cacheKey][page]) {
        this._refreshMergedNovelList(cacheKey)
        // 这里统一返回 list/total（和接口风格一样）
        return {
          list: this.categoryNovelMap[cacheKey][page].novels || [],
          total: this.categoryNovelMap[cacheKey][page].total || 0
        }
      }
      this.novelLoading = true
      try {
        const res = await getNovelRecommendGroupNovels({ groupId, page, pageSize })
        let novels = stripTimeFields(res.list || [])
        novels = compatNovelFields(novels)
        if (!this.categoryNovelMap[cacheKey]) this.categoryNovelMap[cacheKey] = {}
        this.categoryNovelMap[cacheKey][page] = {
          novels,
          total: res.total || novels.length
        }
        this._refreshMergedNovelList(cacheKey)
        // 这里也直接返回 list/total
        return {
          list: novels,
          total: res.total || novels.length
        }
      } finally {
        this.novelLoading = false
      }
    },

    async loadNovelRecommendGroups(force = false) {
      if (this.hasLoadedRecommendNovelGroups && !force) {
        return this.recommendNovelGroups
      }
      this.novelLoading = true
      try {
        const res = await getNovelRecommendAllWithNovels()
        let groups = Array.isArray(res.groups) ? res.groups : []
        groups = groups.map(group => ({
          ...group,
          novels: compatNovelFields(group.novels || [])
        }))
        this.recommendNovelGroups = groups
        this.hasLoadedRecommendNovelGroups = true
        return groups
      } finally {
        this.novelLoading = false
      }
    },

    async fetchChapterDetail(chapterId) {
      if (!chapterId) return null
      if (this.chapterContent[chapterId]) {
        this.currentChapter = this.chapterContent[chapterId]
        return this.currentChapter
      }
      try {
        const res = await getNovelChapterDetail(chapterId)
        this.chapterContent[chapterId] = res || {}
        this.currentChapter = this.chapterContent[chapterId]
        return this.currentChapter
      } catch (e) {
        this.currentChapter = null
        return null
      }
    },

    clearCurrentState() {
  this.novels = []
  this.total = 0
  this.novelLoading = false
  this.novelParams = {
    categoryId: '',
    page: 1,
    pageSize: 15,
    keyword: '',
    tagId: '',  // ← 改这里
    serializationStatus: '',
    shelfStatus: '',
    visibility: '',
  }
  this.clearChapterCache()
  this.currentNovelDetail = null
}
  }
})
