import { ref, computed } from 'vue'
import type { Category, ResourceItem, SyncStatus } from '@/types'
import axios from 'axios'

// 静态资源基础路径适配（兼容本地与 GitHub Pages 二级目录部署）
const BASE_URL = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : import.meta.env.BASE_URL + '/'

// ─── 全局状态 ───
const categories = ref<Category[]>([])
const currentCategoryDetail = ref<Category | null>(null)
const searchResults = ref<(ResourceItem & { categoryId: string; categoryTitle: string; sectionTitle: string })[]>([])
const searchLoading = ref(false)
const syncStatus = ref<SyncStatus>({
  lastSyncTime: new Date().toLocaleString(),
  totalCategories: 0,
  totalItems: 0,
  sourceRepo: 'https://github.com/mhxy13867806343/zh-fmhy',
  status: 'idle',
  message: '就绪'
})
const isLoading = ref(false)

// 收藏夹字典存储：id -> ResourceItem
const bookmarkedMap = ref<Record<string, ResourceItem>>({})

// 分类缓存：categoryId -> Category
const categoryCache = new Map<string, Category>()

// 全量数据缓存（仅在搜索或作为降级方案时懒加载）
let cachedFullData: Category[] | null = null

// 首页推荐资源条目
const allResourceItems = ref<(ResourceItem & { categoryId: string; categoryTitle: string; sectionTitle: string })[]>([])

// ─── 本地收藏持久化 ───
function initBookmarks() {
  try {
    const rawItems = localStorage.getItem('fmhy_bookmarks_items')
    if (rawItems) {
      bookmarkedMap.value = JSON.parse(rawItems)
    } else {
      // 兼容旧版仅保存 ID 的情况
      const rawIds = localStorage.getItem('fmhy_bookmarks')
      if (rawIds) {
        const ids = JSON.parse(rawIds) as string[]
        for (const id of ids) {
          bookmarkedMap.value[id] = {
            id,
            title: '已收藏资源',
            titleEn: '',
            url: '#',
            description: '点击重新查看'
          }
        }
      }
    }
  } catch (e) {
    console.error('加载本地收藏失败', e)
  }
}

export function toggleBookmark(item: ResourceItem) {
  if (!item || !item.id) return
  if (bookmarkedMap.value[item.id]) {
    delete bookmarkedMap.value[item.id]
  } else {
    bookmarkedMap.value[item.id] = { ...item }
  }
  // 持久化存储
  localStorage.setItem('fmhy_bookmarks_items', JSON.stringify(bookmarkedMap.value))
  localStorage.setItem('fmhy_bookmarks', JSON.stringify(Object.keys(bookmarkedMap.value)))
}

export function isBookmarked(id: string): boolean {
  return !!bookmarkedMap.value[id]
}

export function clearAllBookmarks() {
  bookmarkedMap.value = {}
  localStorage.removeItem('fmhy_bookmarks_items')
  localStorage.removeItem('fmhy_bookmarks')
}

// ─── 扁平化工具 ───
function flattenItems(data: Category[]): (ResourceItem & { categoryId: string; categoryTitle: string; sectionTitle: string })[] {
  const items: (ResourceItem & { categoryId: string; categoryTitle: string; sectionTitle: string })[] = []
  for (const cat of data) {
    for (const sec of cat.sections || []) {
      for (const item of sec.items || []) {
        items.push({ ...item, categoryId: cat.id, categoryTitle: cat.title, sectionTitle: sec.title })
      }
    }
  }
  return items
}

// ─── 1. 初始加载（仅加载轻量分类元数据 3KB） ───
export async function loadData(): Promise<void> {
  isLoading.value = true
  initBookmarks()
  try {
    const [metaRes, statusRes] = await Promise.all([
      axios.get(`${BASE_URL}data/categories_meta.json`, { params: { _t: Date.now() } }),
      axios.get(`${BASE_URL}data/sync_status.json`, { params: { _t: Date.now() } })
    ])

    const meta = metaRes.data
    categories.value = Array.isArray(meta)
      ? meta.map((c: any) => ({ ...c, sections: [] }))
      : []
    syncStatus.value = statusRes.data
  } catch (e) {
    console.error('[loadData] 加载元数据失败', e)
  } finally {
    isLoading.value = false
  }
}

// ─── 2. 按需加载单个分类详情（带内存缓存与双重容灾降级） ───
export async function loadCategoryDetail(id: string): Promise<Category | null> {
  if (categoryCache.has(id)) {
    const cached = categoryCache.get(id)!
    currentCategoryDetail.value = cached
    return cached
  }

  isLoading.value = true
  try {
    const res = await axios.get(`${BASE_URL}data/category_${id}.json`, { params: { _t: Date.now() } })
    const data = res.data as Category
    if (data && data.id) {
      categoryCache.set(id, data)
      currentCategoryDetail.value = data
      return data
    }
    throw new Error('分类数据格式不正确')
  } catch (e) {
    console.warn(`[loadCategoryDetail] 加载独立分类 ${id} 失败，尝试从全量数据降级读取...`, e)
    try {
      const full = await ensureFullData()
      const found = full.find(c => c.id === id) || null
      if (found) {
        categoryCache.set(id, found)
        currentCategoryDetail.value = found
        return found
      }
    } catch (err) {
      console.error('全量降级读取分类失败', err)
    }
    currentCategoryDetail.value = null
    return null
  } finally {
    isLoading.value = false
  }
}

// ─── 3. 懒加载完整数据 ───
async function ensureFullData(): Promise<Category[]> {
  if (cachedFullData && cachedFullData.length > 0) return cachedFullData
  const res = await axios.get(`${BASE_URL}data/fmhy_data.json`, { params: { _t: Date.now() } })
  cachedFullData = Array.isArray(res.data) ? res.data : []
  for (const c of cachedFullData) {
    categoryCache.set(c.id, c)
  }
  allResourceItems.value = flattenItems(cachedFullData)
  return cachedFullData
}

// ─── 4. 客户端双语检索 ───
export async function querySearch(q: string, cat: string = 'all'): Promise<void> {
  searchLoading.value = true
  try {
    const fullData = await ensureFullData()
    const query = (q || '').trim().toLowerCase()
    const matched: (ResourceItem & { categoryId: string; categoryTitle: string; sectionTitle: string })[] = []

    for (const category of fullData) {
      if (cat !== 'all' && category.id !== cat) continue
      for (const sec of category.sections || []) {
        for (const item of sec.items || []) {
          if (!query) {
            matched.push({ ...item, categoryId: category.id, categoryTitle: category.title, sectionTitle: sec.title })
            continue
          }
          const inTitle = (item.title || '').toLowerCase().includes(query)
          const inTitleEn = (item.titleEn || '').toLowerCase().includes(query)
          const inDesc = (item.description || '').toLowerCase().includes(query)
          const inDescEn = (item.descriptionEn || '').toLowerCase().includes(query)
          const inTags = (item.tags || []).some(t => t.toLowerCase().includes(query))
          const inCat = (category.title || '').toLowerCase().includes(query)

          if (inTitle || inTitleEn || inDesc || inDescEn || inTags || inCat) {
            matched.push({
              ...item,
              categoryId: category.id,
              categoryTitle: category.title,
              sectionTitle: sec.title
            })
          }
        }
      }
    }

    searchResults.value = matched
  } catch (e) {
    console.error('[querySearch] 搜索失败', e)
  } finally {
    searchLoading.value = false
  }
}

// ─── 5. 加载首页推荐资源 ───
export async function loadFeaturedItems(): Promise<void> {
  if (allResourceItems.value.length > 0) return
  try {
    const ids = categories.value.slice(0, 3).map(c => c.id)
    const targets = ids.length ? ids : ['video', 'ai', 'reading']
    const reqs = targets.map(id => loadCategoryDetail(id))
    const results = await Promise.all(reqs)
    const validCats = results.filter((c): c is Category => !!c)
    allResourceItems.value = flattenItems(validCats)
  } catch (e) {
    console.error('[loadFeaturedItems] 加载推荐失败', e)
  }
}

// ─── 计算属性导出 ───
export const allItems = computed(() => allResourceItems.value)

// 收藏夹资源列表（从本地存储字典直接返回，无论何时都可靠）
export const bookmarkedItems = computed(() => {
  return Object.values(bookmarkedMap.value)
})

export {
  categories,
  currentCategoryDetail,
  searchResults,
  searchLoading,
  syncStatus,
  isLoading
}
