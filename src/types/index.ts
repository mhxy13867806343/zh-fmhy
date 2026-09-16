export interface ResourceItem {
  id: string
  title: string
  titleEn: string
  url: string
  description: string
  descriptionEn: string
  tags?: string[]
  badge?: 'starred' | 'popular' | 'tool' | 'nsfw' | 'unsafe' | 'free'
  isStarred?: boolean
}

export interface Section {
  id: string
  title: string
  titleEn: string
  description?: string
  items: ResourceItem[]
}

export interface Category {
  id: string
  title: string
  titleEn: string
  icon: string
  color?: string
  description: string
  sections: Section[]
  itemCount: number
}

export interface SyncStatus {
  lastSyncTime: string
  totalCategories: number
  totalItems: number
  sourceRepo: string
  status: 'idle' | 'syncing' | 'success' | 'error'
  message?: string
}
