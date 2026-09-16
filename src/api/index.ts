import { request } from '@/utils/request'
import type { Category, ResourceItem, SyncStatus } from '@/types'

/**
 * 获取所有资源分类元数据与统计
 */
export function getCategoriesApi(): Promise<Category[]> {
  return request.get<Category[]>('/categories')
}

/**
 * 获取指定分类下的全部子板块与详细资源条目
 */
export function getCategoryDetailApi(id: string): Promise<Category> {
  return request.get<Category>(`/category/${id}`)
}

/**
 * 获取星标/精选资源条目
 */
export function getFeaturedApi(): Promise<(ResourceItem & { categoryId: string; categoryTitle: string; sectionTitle: string })[]> {
  return request.get('/featured')
}

/**
 * 全网双语模糊检索接口
 */
export interface SearchResponse {
  total: number
  results: (ResourceItem & { categoryId: string; categoryTitle: string; sectionTitle: string })[]
}

export function searchResourcesApi(query: string, category: string = 'all'): Promise<SearchResponse> {
  return request.get<SearchResponse>('/search', {
    params: {
      q: query,
      cat: category
    }
  })
}

/**
 * 获取当前爬虫与同步状态
 */
export function getSyncStatusApi(): Promise<SyncStatus> {
  return request.get<SyncStatus>('/sync/status')
}

/**
 * 实时触发后端增量爬取与中文翻译同步
 */
export function triggerSyncApi(): Promise<{ success: boolean; message: string; stdout?: string }> {
  return request.post('/sync')
}
