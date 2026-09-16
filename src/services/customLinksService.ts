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
  AI工具: { icon: 'Bot', color: '#8b5cf6', en: 'AI Tools' },
  API接口: { icon: 'Cpu', color: '#06b6d4', en: 'API & Services' },
  浏览器相关: { icon: 'Globe', color: '#3b82f6', en: 'Browser' },
  云服务: { icon: 'Cloud', color: '#0ea5e9', en: 'Cloud & Deploy' },
  数据库: { icon: 'Database', color: '#10b981', en: 'Databases' },
  设计: { icon: 'Palette', color: '#ec4899', en: 'Design & Graphics' },
  设计美化: { icon: 'Palette', color: '#ec4899', en: 'Design & Graphics' },
  运维部署: { icon: 'Terminal', color: '#64748b', en: 'DevOps & CI/CD' },
  域名网络: { icon: 'Globe', color: '#0284c7', en: 'Domain & DNS' },
  字体排版: { icon: 'Type', color: '#f59e0b', en: 'Fonts & Typography' },
  白嫖福利: { icon: 'Gift', color: '#ef4444', en: 'Freebies & Perks' },
  游戏开发: { icon: 'Gamepad2', color: '#6366f1', en: 'Game Dev' },
  Git与协作: { icon: 'GitBranch', color: '#f97316', en: 'Git & VCS' },
  硬件数码: { icon: 'Cpu', color: '#84cc16', en: 'Hardware' },
  图片图库: { icon: 'Image', color: '#14b8a6', en: 'Images & Stock' },
  学习进修: { icon: 'GraduationCap', color: '#10b981', en: 'Learning' },
  Linux系统: { icon: 'Terminal', color: '#eab308', en: 'Linux' },
  macOS专区: { icon: 'Apple', color: '#64748b', en: 'macOS' },
  地图地理: { icon: 'MapPin', color: '#f97316', en: 'Maps & GIS' },
  移动端: { icon: 'Smartphone', color: '#10b981', en: 'Mobile & APK' },
  音乐音频: { icon: 'Music', color: '#a855f7', en: 'Music & Audio' },
  网络服务: { icon: 'Network', color: '#0284c7', en: 'Network & Proxy' },
  效率工具: { icon: 'Zap', color: '#eab308', en: 'Productivity' },
  编程开发: { icon: 'Code2', color: '#f59e0b', en: 'Programming' },
  开发: { icon: 'Code2', color: '#f59e0b', en: 'Development' },
  科学探索: { icon: 'Atom', color: '#06b6d4', en: 'Science & Math' },
  网络安全: { icon: 'ShieldCheck', color: '#dc2626', en: 'Security & Privacy' },
  软件工具: { icon: 'Package', color: '#6366f1', en: 'Software & Tools' },
  网盘存储: { icon: 'HardDrive', color: '#06b6d4', en: 'Storage & Cloud' },
  终端命令行: { icon: 'Terminal', color: '#6366f1', en: 'Terminal & CLI' },
  工具: { icon: 'Wrench', color: '#14b8a6', en: 'Tools' },
  视频工具: { icon: 'Video', color: '#f43f5e', en: 'Video Tools' },
  虚拟化容器: { icon: 'Box', color: '#0ea5e9', en: 'Virtualization & Docker' },
  Windows工具: { icon: 'Monitor', color: '#3b82f6', en: 'Windows' },
  写作笔记: { icon: 'FileText', color: '#8b5cf6', en: 'Writing & Notes' },
  订阅: { icon: 'Rss', color: '#ec4899', en: 'Subscriptions & Proxies' },
  搜索: { icon: 'Search', color: '#06b6d4', en: 'Search Engines' }
}

// 自动识别文件名并映射为友好的中文分类与风格
const FILE_NAME_MAP: Record<string, { name: string; en: string; icon: string; color: string }> = {
  'ai-tools': { name: 'AI工具', en: 'AI Tools', icon: 'Bot', color: '#8b5cf6' },
  api: { name: 'API接口', en: 'API & Services', icon: 'Cpu', color: '#06b6d4' },
  browser: { name: '浏览器相关', en: 'Browser', icon: 'Globe', color: '#3b82f6' },
  cloud: { name: '云服务', en: 'Cloud & Deploy', icon: 'Cloud', color: '#0ea5e9' },
  database: { name: '数据库', en: 'Databases', icon: 'Database', color: '#10b981' },
  design: { name: '设计美化', en: 'Design & Graphics', icon: 'Palette', color: '#ec4899' },
  devops: { name: '运维部署', en: 'DevOps & CI/CD', icon: 'Terminal', color: '#64748b' },
  domain: { name: '域名网络', en: 'Domain & DNS', icon: 'Globe', color: '#0284c7' },
  fonts: { name: '字体排版', en: 'Fonts & Typography', icon: 'Type', color: '#f59e0b' },
  freebies: { name: '白嫖福利', en: 'Freebies & Perks', icon: 'Gift', color: '#ef4444' },
  'game-dev': { name: '游戏开发', en: 'Game Dev', icon: 'Gamepad2', color: '#6366f1' },
  git: { name: 'Git与协作', en: 'Git & VCS', icon: 'GitBranch', color: '#f97316' },
  hardware: { name: '硬件数码', en: 'Hardware', icon: 'Cpu', color: '#84cc16' },
  images: { name: '图片图库', en: 'Images & Stock', icon: 'Image', color: '#14b8a6' },
  learning: { name: '学习进修', en: 'Learning', icon: 'GraduationCap', color: '#10b981' },
  linux: { name: 'Linux系统', en: 'Linux', icon: 'Terminal', color: '#eab308' },
  mac: { name: 'macOS专区', en: 'macOS', icon: 'Apple', color: '#64748b' },
  maps: { name: '地图地理', en: 'Maps & GIS', icon: 'MapPin', color: '#f97316' },
  mobile: { name: '移动端', en: 'Mobile & APK', icon: 'Smartphone', color: '#10b981' },
  music: { name: '音乐音频', en: 'Music & Audio', icon: 'Music', color: '#a855f7' },
  network: { name: '网络服务', en: 'Network & Proxy', icon: 'Network', color: '#0284c7' },
  productivity: { name: '效率工具', en: 'Productivity', icon: 'Zap', color: '#eab308' },
  programming: { name: '编程开发', en: 'Programming', icon: 'Code2', color: '#f59e0b' },
  science: { name: '科学探索', en: 'Science & Math', icon: 'Atom', color: '#06b6d4' },
  security: { name: '网络安全', en: 'Security & Privacy', icon: 'ShieldCheck', color: '#dc2626' },
  software: { name: '软件工具', en: 'Software & Tools', icon: 'Package', color: '#6366f1' },
  storage: { name: '网盘存储', en: 'Storage & Cloud', icon: 'HardDrive', color: '#06b6d4' },
  terminal: { name: '终端命令行', en: 'Terminal & CLI', icon: 'Terminal', color: '#6366f1' },
  'video-tools': { name: '视频工具', en: 'Video Tools', icon: 'Video', color: '#f43f5e' },
  virtualization: { name: '虚拟化容器', en: 'Virtualization & Docker', icon: 'Box', color: '#0ea5e9' },
  windows: { name: 'Windows工具', en: 'Windows', icon: 'Monitor', color: '#3b82f6' },
  writing: { name: '写作笔记', en: 'Writing & Notes', icon: 'FileText', color: '#8b5cf6' }
}

function resolveFileMeta(fileNameOrCat: string) {
  const clean = fileNameOrCat
    .toLowerCase()
    .replace(/\.json$/i, '')
    .replace(/^category[_-]/i, '')
  return FILE_NAME_MAP[clean] || FILE_NAME_MAP[clean.replace(/_/g, '-')]
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
  const fileMeta = resolveFileMeta(sourceFileName)

  const groupsMap = new Map<string, CustomCategoryGroup>()

  function getOrCreateGroup(catName: string, meta?: Partial<CustomCategoryGroup>): CustomCategoryGroup {
    const rawName = (catName || fileMeta?.name || '通用自选').trim()
    const metaCandidate = resolveFileMeta(rawName)
    const name = metaCandidate?.name || rawName
    if (!groupsMap.has(name)) {
      const defaultStyle = CATEGORY_STYLES[name] || metaCandidate || fileMeta || {
        icon: 'Bookmark',
        color: '#3b82f6',
        en: 'Custom'
      }
      groupsMap.set(name, {
        name,
        nameEn: meta?.nameEn || metaCandidate?.en || fileMeta?.en || defaultStyle.en,
        icon: meta?.icon || metaCandidate?.icon || fileMeta?.icon || defaultStyle.icon,
        color: meta?.color || metaCandidate?.color || fileMeta?.color || defaultStyle.color,
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
        const catName = entry.category || fileMeta?.name || sourceFileName || '通用自选'
        const grp = getOrCreateGroup(catName)
        grp.items.push(normalizeItem(entry, catName, i))
      }
    }
  }
  // 2. 如果顶层是单个分类对象：{ category: "音效", items: [...] }
  else if (typeof rawData === 'object' && (rawData.category || Array.isArray(rawData.items))) {
    const catName = rawData.category || fileMeta?.name || sourceFileName
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
