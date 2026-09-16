<template>
  <div class="home-page">
    <!-- Hero Banner -->
    <div class="hero-section">
      <div class="hero-content">
        <n-tag type="primary" round size="medium" class="hero-badge">
          ⚡ FMHY 中文自动化同步站
        </n-tag>
        <h1 class="hero-title">
          互联网上最庞大的 <span class="gradient-text">免费数字资源</span> 索引库
        </h1>
        <p class="hero-desc">
          基于 GitHub 官方社区每日同步，自动将英文文档进行智能解析与中文对照翻译。涵盖影视、音乐、动漫、游戏、图书文献、开发工具及广告拦截。
        </p>
        <div class="hero-actions">
          <n-input
            v-model:value="quickSearch"
            round
            placeholder="搜索你想找的资源（支持中英文，如：流媒体、cobalt、电子书...）"
            size="large"
            class="hero-search-input"
            @keydown.enter="handleSearch"
          >
            <template #prefix>
              <Search :size="18" style="color: #888" />
            </template>
            <template #suffix>
              <n-button type="primary" round @click="handleSearch">
                搜索
              </n-button>
            </template>
          </n-input>
        </div>

        <!-- 全局搜索历史 -->
        <div v-if="globalHistory.historyList.value.length" class="hero-history-row">
          <span class="history-label"><Clock :size="13" /> 搜索历史：</span>
          <div class="history-tags">
            <n-tag
              v-for="item in globalHistory.historyList.value"
              :key="item"
              round
              size="small"
              closable
              clickable
              class="history-tag"
              @click="handleQuickSearch(item)"
              @close.stop="handleRemoveHistory(item)"
            >
              {{ item }}
            </n-tag>
            <n-button text size="tiny" type="default" class="clear-btn" @click="handleClearHistory">
              清空
            </n-button>
          </div>
        </div>

        <!-- 统计面板 -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-num">{{ syncStatus.totalCategories }}</span>
            <span class="stat-label">个主题分类</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-card">
            <span class="stat-num">{{ syncStatus.totalItems }}+</span>
            <span class="stat-label">收录精选资源</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-card">
            <span class="stat-num">增量定时</span>
            <span class="stat-label">上次同步: {{ syncStatus.lastSyncTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类网格导航 -->
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">📦 资源大类全览</h2>
        <span class="section-subtitle">点击直达对应分类查看细分子专区</span>
      </div>

      <div class="category-grid">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-card"
          @click="router.push(`/category/${cat.id}`)"
        >
          <div class="cat-card-header">
            <div class="cat-icon-box" :style="{ backgroundColor: cat.color + '15', color: cat.color }">
              <AppIcon :name="cat.icon" :size="24" />
            </div>
            <div class="cat-card-titles">
              <h3 class="cat-card-title">{{ cat.title }}</h3>
              <span class="cat-card-sub">{{ cat.titleEn }}</span>
            </div>
            <n-tag size="small" round :bordered="false" type="info">
              {{ cat.itemCount }} 项
            </n-tag>
          </div>
          <p class="cat-card-desc">{{ cat.description }}</p>
          <div class="cat-card-footer">
            <span class="view-link">浏览专区 →</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门精选资源 -->
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">⭐ 社区高分星标推荐</h2>
        <span class="section-subtitle">从各分类中精选的最实用、最稳定站点</span>
      </div>

      <div class="resource-grid">
        <ResourceCard
          v-for="item in featuredItems"
          :key="item.id"
          :item="item"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Clock } from 'lucide-vue-next'
import AppIcon from '@/components/AppIcon.vue'
import ResourceCard from '@/components/ResourceCard.vue'
import { categories, syncStatus, allItems, loadFeaturedItems } from '@/services/dataService'
import { useSearchHistory } from '@/utils/searchHistory'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const quickSearch = ref('')
const globalHistory = useSearchHistory('global')

function handleSearch() {
  const q = quickSearch.value.trim()
  if (!q) {
    message.warning('请输入搜索关键词')
    return
  }
  globalHistory.add(q)
  router.push({ path: '/search', query: { q } })
}

function handleQuickSearch(keyword: string) {
  quickSearch.value = keyword
  globalHistory.add(keyword)
  router.push({ path: '/search', query: { q: keyword } })
}

function handleRemoveHistory(kw: string) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除搜索历史 "${kw}" 吗？`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      globalHistory.remove(kw)
      message.success(`已删除历史记录 "${kw}"`)
    }
  })
}

function handleClearHistory() {
  dialog.warning({
    title: '确认清空',
    content: '确定要清空全部搜索历史记录吗？',
    positiveText: '确认清空',
    negativeText: '取消',
    onPositiveClick: () => {
      globalHistory.clear()
      message.success('已清空搜索历史记录')
    }
  })
}

// 获取星标推荐（星标优先，不足则用热门填充）
const featuredItems = computed(() => {
  const starred = allItems.value.filter(item => item.badge === 'starred')
  if (starred.length >= 9) return starred.slice(0, 9)
  const popular = allItems.value.filter(item => item.badge === 'popular' && !starred.includes(item))
  return [...starred, ...popular].slice(0, 9)
})

onMounted(() => {
  loadFeaturedItems()
})
</script>

<style scoped>
.hero-history-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 680px;
  margin: 10px auto 0;
  font-size: 12px;
}
.history-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--n-text-color-3, #888);
}
.history-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.history-tag {
  cursor: pointer;
}
.clear-btn {
  margin-left: 4px;
  color: var(--n-text-color-3, #999);
}

.home-page {
  display: flex;
  flex-direction: column;
  gap: 36px;
  padding-bottom: 50px;
}

.hero-section {
  text-align: center;
  padding: 40px 16px 20px;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
  border-radius: 16px;
}
.hero-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.hero-badge {
  font-weight: 600;
}
.hero-title {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.25;
  margin: 0;
}
.gradient-text {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-desc {
  font-size: 15px;
  color: var(--n-text-color-2, #666);
  line-height: 1.6;
  margin: 0;
  max-width: 680px;
}
.hero-actions {
  width: 100%;
  max-width: 600px;
  margin-top: 8px;
}
.hero-search-input {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
  padding: 12px 24px;
  background: var(--n-color-embedded, rgba(0, 0, 0, 0.03));
  border-radius: 12px;
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 20px;
  font-weight: 700;
  color: #3b82f6;
}
.stat-label {
  font-size: 12px;
  color: var(--n-text-color-3, #999);
}
.stat-divider {
  width: 1px;
  height: 28px;
  background: var(--n-border-color, #e0e0e0);
}

.section-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.section-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.section-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}
.section-subtitle {
  font-size: 13px;
  color: var(--n-text-color-3, #888);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.category-card {
  border: 1px solid var(--n-border-color, rgba(0, 0, 0, 0.08));
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  background: var(--n-color, #fff);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease;
}
.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  border-color: #3b82f6;
}
.cat-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cat-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cat-card-titles {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.cat-card-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cat-card-sub {
  font-size: 11px;
  color: var(--n-text-color-3, #999);
}
.cat-card-desc {
  font-size: 13px;
  color: var(--n-text-color-2, #666);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.cat-card-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}
.view-link {
  font-size: 12px;
  color: #3b82f6;
  font-weight: 500;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 24px;
  }
  .stats-row {
    flex-direction: column;
    gap: 12px;
  }
  .stat-divider {
    display: none;
  }
  .category-grid,
  .resource-grid {
    grid-template-columns: 1fr;
  }
}
</style>
