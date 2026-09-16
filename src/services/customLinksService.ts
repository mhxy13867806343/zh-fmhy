import { ref, computed } from 'vue'

export interface CustomLinkItem {
  id: string
  title: string
  url: string
  desc: string
  category: string
  tags: string[]
  icon?: string
}

export interface CustomCategoryGroup {
  name: string
  nameEn?: string
  icon?: string
  color?: string
  description?: string
  items: CustomLinkItem[]
}

export const customGroups = ref<CustomCategoryGroup[]>([])
export const loadingCustom = ref(false)
export const lastLoadedTime = ref<string>('')

// 计算所有自选资源单项总数
export const totalCustomItemsCount = computed(() => {
  return customGroups.value.reduce((acc, g) => acc + g.items.length, 0)
})

// 默认分类视觉风格字典
const CATEGORY_STYLES: Record<string, { icon: string; color: string; en: string }> = {
  音效: { icon: 'Volume2', color: '#10b981', en: 'Sound Effects' },
  游戏: { icon: 'Gamepad2', color: '#3b82f6', en: 'Gaming & Assets' },
  AI: { icon: 'Bot', color: '#8b5cf6', en: 'Artificial Intelligence' },
  ai: { icon: 'Bot', color: '#8b5cf6', en: 'Artificial Intelligence' },
  人工智能: { icon: 'Bot', color: '#8b5cf6', en: 'Artificial Intelligence' },
  订阅: { icon: 'Rss', color: '#ec4899', en: 'Subscriptions & Proxies' },
  搜索: { icon: 'Search', color: '#06b6d4', en: 'Search Engines' },
  开发: { icon: 'Code2', color: '#f59e0b', en: 'Development' },
  工具: { icon: 'Wrench', color: '#14b8a6', en: 'Tools' },
  设计: { icon: 'Palette', color: '#8b5cf6', en: 'Design & Graphics' }
}

/**
 * 智能数据归一化器：
 * 无论用户写的是标准分类数组、单一分类对象、平铺单项数组还是键值字典，
 * 均能自动识别并解析为统一的 CustomCategoryGroup[]。
 */
export function normalizeCustomJsonData(
  rawData: any,
  sourceFileName: string = 'custom'
): CustomCategoryGroup[] {
  if (!rawData) return []

  const groupsMap = new Map<string, CustomCategoryGroup>()

  function getOrCreateGroup(catName: string, meta?: Partial<CustomCategoryGroup>): CustomCategoryGroup {
    const name = (catName || '通用自选').trim()
    if (!groupsMap.has(name)) {
      const defaultStyle = CATEGORY_STYLES[name] || {
        icon: 'Bookmark',
        color: '#3b82f6',
        en: 'Custom'
      }
      groupsMap.set(name, {
        name,
        nameEn: meta?.nameEn || defaultStyle.en,
        icon: meta?.icon || defaultStyle.icon,
        color: meta?.color || defaultStyle.color,
        description: meta?.description || '',
        items: []
      })
    }
    return groupsMap.get(name)!
  }

  function normalizeItem(rawItem: any, catName: string, idx: number): CustomLinkItem {
    let url = typeof rawItem === 'string' ? rawItem : (rawItem.url || rawItem.link || '')
    let title = rawItem.title || rawItem.name || ''
    if (!title && url) {
      try {
        title = new URL(url).hostname
      } catch {
        title = url
      }
    }
    return {
      id: rawItem.id || `${sourceFileName}-${catName}-${idx}-${Date.now()}`,
      title: title || '未命名资源',
      url,
      desc: rawItem.desc || rawItem.description || '暂无详细描述',
      category: catName,
      tags: Array.isArray(rawItem.tags) ? rawItem.tags : [],
      icon: rawItem.icon
    }
  }

  // 1. 如果顶层是数组
  if (Array.isArray(rawData)) {
    for (let i = 0; i < rawData.length; i++) {
      const entry = rawData[i]
      if (!entry) continue

      // A. 分类分组格式：{ category: "游戏", items: [...] }
      if (entry.category || entry.categoryName || Array.isArray(entry.items)) {
        const catName = entry.category || entry.categoryName || '未命名分类'
        const grp = getOrCreateGroup(catName, {
          nameEn: entry.categoryEn,
          icon: entry.icon,
          color: entry.color,
          description: entry.description
        })
        const itemsArr = Array.isArray(entry.items) ? entry.items : []
        itemsArr.forEach((it: any, itIdx: number) => {
          grp.items.push(normalizeItem(it, catName, itIdx))
        })
      }
      // B. 平铺单项格式：{ title: "xxx", url: "https://...", category: "音效" }
      else if (entry.url || entry.link) {
        const catName = entry.category || sourceFileName || '通用自选'
        const grp = getOrCreateGroup(catName)
        grp.items.push(normalizeItem(entry, catName, i))
      }
    }
  }
  // 2. 如果顶层是单个分类对象：{ category: "音效", items: [...] }
  else if (typeof rawData === 'object' && (rawData.category || Array.isArray(rawData.items))) {
    const catName = rawData.category || sourceFileName
    const grp = getOrCreateGroup(catName, {
      nameEn: rawData.categoryEn,
      icon: rawData.icon,
      color: rawData.color,
      description: rawData.description
    })
    const itemsArr = Array.isArray(rawData.items) ? rawData.items : []
    itemsArr.forEach((it: any, itIdx: number) => {
      grp.items.push(normalizeItem(it, catName, itIdx))
    })
  }
  // 3. 如果顶层是键值对对象：{ "音效": [...], "游戏": [...] }
  else if (typeof rawData === 'object') {
    Object.keys(rawData).forEach(key => {
      const val = rawData[key]
      if (Array.isArray(val)) {
        const grp = getOrCreateGroup(key)
        val.forEach((it: any, itIdx: number) => {
          grp.items.push(normalizeItem(it, key, itIdx))
        })
      }
    })
  }

  return Array.from(groupsMap.values())
}

/**
 * 加载所有自定义 JSON 文件
 * 1. 尝试从 /api/custom-files (开发环境) 或 data/custom/index.json (生产/打包) 获取文件清单
 * 2. 依次加载并解析所有 json 内容，合并至 customGroups
 */
export async function loadCustomLinks(forceRefresh: boolean = false): Promise<CustomCategoryGroup[]> {
  loadingCustom.value = true
  const baseUrl = import.meta.env.BASE_URL.replace(/\/+$/, '') + '/'
  const t = forceRefresh ? `?t=${Date.now()}` : ''

  let fileList: string[] = []

  // 1. 开发环境下尝试获取最新目录文件列表
  try {
    const devApiRes = await fetch(`/api/custom-files${t}`)
    if (devApiRes.ok) {
      fileList = await devApiRes.json()
    }
  } catch {}

  // 2. 备选：读取 data/custom/index.json
  if (!fileList || !fileList.length) {
    try {
      const idxRes = await fetch(`${baseUrl}data/custom/index.json${t}`)
      if (idxRes.ok) {
        fileList = await idxRes.json()
      }
    } catch (e) {
      console.warn('获取 custom/index.json 失败', e)
    }
  }

  // 3. 保底默认清单（包含 custom_links.json 及可能直接创建的 a.json）
  if (!fileList || !fileList.length) {
    fileList = ['custom_links.json', 'a.json']
  } else if (!fileList.includes('custom_links.json')) {
    fileList.unshift('custom_links.json')
  }

  const combinedGroupsMap = new Map<string, CustomCategoryGroup>()

  for (const file of fileList) {
    if (!file.endsWith('.json') || file === 'index.json') continue
    try {
      const fileUrl = `${baseUrl}data/custom/${file}${t}`
      const res = await fetch(fileUrl, { cache: forceRefresh ? 'no-cache' : 'default' })
      if (res.ok) {
        const jsonData = await res.json()
        const baseFileName = file.replace(/\.json$/i, '')
        const parsedGroups = normalizeCustomJsonData(jsonData, baseFileName)

        for (const grp of parsedGroups) {
          if (!combinedGroupsMap.has(grp.name)) {
            combinedGroupsMap.set(grp.name, { ...grp, items: [...grp.items] })
          } else {
            const existing = combinedGroupsMap.get(grp.name)!
            // 合并项目（通过 id 或 url 去重）
            for (const item of grp.items) {
              const duplicate = existing.items.some(
                ex => ex.url === item.url || (item.title && ex.title === item.title)
              )
              if (!duplicate) {
                existing.items.push(item)
              }
            }
          }
        }
      }
    } catch (e) {
      // 如果单个文件（例如预设的 a.json 尚未创建）404，静默忽略
    }
  }

  const result = Array.from(combinedGroupsMap.values())
  customGroups.value = result
  lastLoadedTime.value = new Date().toLocaleTimeString()
  loadingCustom.value = false

  try {
    localStorage.setItem('fmhy_custom_groups_cache', JSON.stringify(result))
  } catch {}

  return result
}

// 初始化尝试恢复本地缓存
try {
  const cached = localStorage.getItem('fmhy_custom_groups_cache')
  if (cached) {
    customGroups.value = JSON.parse(cached)
  }
} catch {}
