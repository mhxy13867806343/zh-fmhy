<template>
  <div class="custom-page">
    <!-- 头部区域 -->
    <div class="custom-header">
      <div class="header-main-row">
        <div class="header-icon-box">
          <BookmarkCheck :size="32" class="main-icon" />
        </div>
        <div class="header-text-block">
          <div class="title-row">
            <h1 class="page-title">📌 常用自选 · 个人私藏导航</h1>
            <n-tag type="success" round size="small" :bordered="false">
              {{ totalCustomItemsCount }} 个自选网址
            </n-tag>
            <n-tag type="info" round size="small" :bordered="false">
              {{ customGroups.length }} 个分类
            </n-tag>
          </div>
          <p class="page-desc">
            基于 <code class="code-path">public/data/custom/</code> 目录动态直读渲染。可在对应目录直接修改、新增（如 <code>a.json</code>）或删除，页面即刻同步更新，无需重新打包构建发布！
          </p>
        </div>

        <div class="header-actions">
          <n-button
            secondary
            round
            type="primary"
            size="medium"
            :loading="loadingCustom"
            @click="handleManualRefresh"
          >
            <template #icon><RefreshCw :size="15" :class="{ 'spin-icon': loadingCustom }" /></template>
            刷新数据
          </n-button>
          <n-button
            secondary
            round
            size="medium"
            @click="showHelpModal = true"
          >
            <template #icon><HelpCircle :size="15" /></template>
            格式说明
          </n-button>
        </div>
      </div>

      <!-- 搜索与分类胶囊 -->
      <div class="filter-controls">
        <div class="search-box">
          <n-input
            v-model:value="searchKeyword"
            placeholder="搜索网址名称、链接、描述或标签..."
            clearable
            round
            size="medium"
            @keydown.enter="handleSearch"
          >
            <template #prefix>
              <Search :size="16" style="color: #888;" />
            </template>
            <template #suffix>
              <n-button
                type="primary"
                size="small"
                round
                @click="handleSearch"
              >
                搜索
              </n-button>
            </template>
          </n-input>
        </div>

        <div class="cat-tags-row">
          <span class="filter-label">分类筛选：</span>
          <n-tag
            :type="selectedCategory === 'all' ? 'success' : 'default'"
            :color="selectedCategory === 'all' ? { color: '#10b981', textColor: '#ffffff' } : undefined"
            round
            clickable
            size="small"
            class="filter-tag"
            :class="{ 'tag-active': selectedCategory === 'all' }"
            @click="selectCategory('all')"
          >
            全部 ({{ totalCustomItemsCount }})
          </n-tag>
          <n-tag
            v-for="grp in customGroups"
            :key="grp.name"
            :type="selectedCategory === grp.name ? 'success' : 'default'"
            :color="selectedCategory === grp.name ? { color: grp.color || '#10b981', textColor: '#ffffff' } : undefined"
            round
            clickable
            size="small"
            class="filter-tag"
            :class="{ 'tag-active': selectedCategory === grp.name }"
            @click="selectCategory(grp.name)"
          >
            <template #icon>
              <component :is="getCategoryIcon(grp.name)" :size="12" style="margin-right: 4px;" />
            </template>
            {{ grp.name }} ({{ grp.items.length }})
          </n-tag>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loadingCustom && !customGroups.length" class="loading-wrap">
      <n-spin size="large" description="正在读取 custom 目录下的 JSON 配置..." />
    </div>

    <!-- 分组/列表卡片展示 -->
    <div v-else-if="filteredGroups.length" class="groups-container">
      <section
        v-for="group in filteredGroups"
        :key="group.name"
        class="category-section"
      >
        <div class="section-title-bar">
          <div class="cat-info-left">
            <div class="cat-icon-badge" :style="{ backgroundColor: (group.color || '#10b981') + '18', color: group.color || '#10b981' }">
              <component :is="getCategoryIcon(group.name)" :size="18" />
            </div>
            <div>
              <div class="cat-title-line">
                <h2 class="cat-main-title">{{ group.name }}</h2>
                <span v-if="group.nameEn" class="cat-sub-title">{{ group.nameEn }}</span>
                <n-tag size="tiny" round :bordered="false" type="default" class="item-count-tag">
                  {{ group.items.length }} 项
                </n-tag>
              </div>
              <p v-if="group.description" class="cat-desc-text">{{ group.description }}</p>
            </div>
          </div>
        </div>

        <div class="items-grid">
          <n-card
            v-for="item in group.items"
            :key="item.id"
            hoverable
            size="small"
            class="custom-card"
          >
            <template #header>
              <div class="card-header-row">
                <div class="card-title-group">
                  <span class="card-favicon">{{ getFaviconEmoji(group.name) }}</span>
                  <a
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="card-title-link"
                    :title="item.title"
                  >
                    {{ item.title }}
                  </a>
                </div>
                <n-tag size="tiny" round :bordered="false" class="domain-tag">
                  {{ extractHostname(item.url) }}
                </n-tag>
              </div>
            </template>

            <div class="card-content-block">
              <p class="card-desc">{{ item.desc }}</p>
              <div v-if="item.tags && item.tags.length" class="card-tags-row">
                <n-tag
                  v-for="tag in item.tags"
                  :key="tag"
                  size="tiny"
                  round
                  :bordered="false"
                  class="meta-tag"
                >
                  {{ tag }}
                </n-tag>
              </div>
            </div>

            <template #action>
              <div class="card-footer-actions">
                <n-button
                  size="tiny"
                  quaternary
                  class="action-btn"
                  @click="copyUrl(item.url)"
                >
                  <template #icon><Copy :size="13" /></template>
                  复制网址
                </n-button>
                <n-button
                  type="primary"
                  secondary
                  size="tiny"
                  tag="a"
                  :href="item.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="action-btn visit-btn"
                >
                  <template #icon><ExternalLink :size="13" /></template>
                  直达访问
                </n-button>
              </div>
            </template>
          </n-card>
        </div>
      </section>
    </div>

    <!-- 空数据提示 -->
    <n-empty
      v-else
      description="未找到匹配的自选网址，请检查搜索词或在 public/data/custom/ 目录下添加 JSON 文件"
      style="padding: 60px 0;"
    />

    <!-- JSON 格式帮助说明弹窗 -->
    <n-modal
      v-model:show="showHelpModal"
      preset="card"
      title="💡 如何在目录中新增、修改或删除资源？"
      style="width: 90%; max-width: 640px;"
    >
      <div class="help-content">
        <p><strong>文件存放目录：</strong> <code>public/data/custom/</code></p>
        <p>您可以直接修改现有的 <code>custom_links.json</code>，也可以在该目录下任意新建如 <code>a.json</code>、<code>game.json</code> 等文件，页面会自动扫描识别并渲染！</p>
        
        <n-divider style="margin: 12px 0;">极简支持格式示例 (如 a.json)</n-divider>
        <pre class="code-preview"><code>[
  {
    "category": "我的新分类",
    "items": [
      {
        "title": "项目名称",
        "url": "https://example.com",
        "desc": "网站详细简介",
        "tags": ["实用", "免费"]
      }
    ]
  }
]</code></pre>
        <p style="margin-top: 10px; font-size: 13px; color: #666;">
          或者直接写平铺单项：<code>[ { "title": "xxx", "url": "https://...", "category": "游戏" } ]</code>，解析器均会自动智能归类！
        </p>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  BookmarkCheck,
  Search,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  Copy,
  Volume2,
  Gamepad2,
  Bot,
  Rss,
  Code2,
  Wrench,
  Palette,
  Bookmark
} from 'lucide-vue-next'
import { useMessage } from 'naive-ui'
import {
  customGroups,
  loadingCustom,
  totalCustomItemsCount,
  loadCustomLinks,
  type CustomCategoryGroup
} from '@/services/customLinksService'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const searchKeyword = ref('')
const selectedCategory = ref('all')
const showHelpModal = ref(false)

// 监听 URL Query 参数变化，确保左侧侧边栏点击分类时右侧实时高亮并过滤
watch(
  () => route.query.category,
  (newCat) => {
    selectedCategory.value = (newCat as string) || 'all'
  },
  { immediate: true }
)

function selectCategory(catName: string) {
  selectedCategory.value = catName
  router.replace({
    query: {
      ...route.query,
      category: catName === 'all' ? undefined : catName
    }
  })
}

onMounted(() => {
  loadCustomLinks()
})

async function handleManualRefresh() {
  await loadCustomLinks(true)
  message.success('已刷新自定义导航数据')
}

function handleSearch() {
  const kw = searchKeyword.value.trim()
  if (kw) {
    const totalMatched = filteredGroups.value.reduce((acc, g) => acc + g.items.length, 0)
    if (totalMatched === 0) {
      message.warning(`未找到与 "${kw}" 相关的自选网址`)
    } else {
      message.success(`已筛选出 ${totalMatched} 个相关网址`)
    }
  } else {
    message.info('已显示全部分类网址')
  }
}

// 动态匹配图标组件
function getCategoryIcon(name: string) {
  const map: Record<string, any> = {
    音效: Volume2,
    游戏: Gamepad2,
    AI: Bot,
    ai: Bot,
    人工智能: Bot,
    订阅: Rss,
    搜索: Search,
    开发: Code2,
    工具: Wrench,
    设计: Palette
  }
  return map[name] || Bookmark
}

function getFaviconEmoji(categoryName: string): string {
  const map: Record<string, string> = {
    音效: '🎵',
    游戏: '🎮',
    AI: '🤖',
    ai: '🤖',
    人工智能: '🤖',
    订阅: '📡',
    搜索: '🔍',
    开发: '💻',
    工具: '🛠️'
  }
  return map[categoryName] || '🌐'
}

function extractHostname(urlStr: string): string {
  try {
    const u = new URL(urlStr)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return 'link'
  }
}

function copyUrl(url: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      message.success('已复制网址到剪贴板')
    })
  } else {
    message.info(`网址：${url}`)
  }
}

// 按照搜索词与分类筛选
const filteredGroups = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const targetCat = selectedCategory.value

  const groups: CustomCategoryGroup[] = []

  for (const grp of customGroups.value) {
    if (targetCat !== 'all' && grp.name !== targetCat) {
      continue
    }

    let items = grp.items
    if (kw) {
      items = items.filter(item => {
        const matchTitle = item.title.toLowerCase().includes(kw)
        const matchUrl = item.url.toLowerCase().includes(kw)
        const matchDesc = item.desc.toLowerCase().includes(kw)
        const matchTags = item.tags.some(t => t.toLowerCase().includes(kw))
        return matchTitle || matchUrl || matchDesc || matchTags
      })
    }

    if (items.length > 0) {
      groups.push({
        ...grp,
        items
      })
    }
  }

  return groups
})
</script>

<style scoped>
.custom-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-bottom: 60px;
}
.custom-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-bottom: 1px solid var(--n-border-color, rgba(0, 0, 0, 0.08));
  padding-bottom: 20px;
}
.header-main-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}
.header-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
  flex-shrink: 0;
}
.header-text-block {
  flex: 1;
  min-width: 280px;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.page-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}
.page-desc {
  font-size: 13.5px;
  color: var(--n-text-color-3, #777);
  margin: 6px 0 0;
  line-height: 1.6;
}
.code-path {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: #10b981;
  font-weight: 600;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.spin-icon {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.search-box {
  max-width: 480px;
}
.cat-tags-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.filter-label {
  font-size: 12px;
  color: var(--n-text-color-3, #999);
}
.filter-tag {
  transition: all 0.2s ease;
  font-weight: 500;
}
.filter-tag:hover {
  transform: translateY(-1px);
}
.filter-tag.tag-active {
  font-weight: 700 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14);
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.groups-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.category-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.section-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cat-info-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cat-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cat-title-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.cat-main-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.cat-sub-title {
  font-size: 12.5px;
  color: var(--n-text-color-3, #999);
}
.item-count-tag {
  font-size: 10.5px;
}
.cat-desc-text {
  font-size: 12px;
  color: var(--n-text-color-3, #888);
  margin: 2px 0 0;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 16px;
}
.custom-card {
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.custom-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}
.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.card-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  flex: 1;
}
.card-favicon {
  font-size: 16px;
  flex-shrink: 0;
}
.card-title-link {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--n-text-color, #1f2937);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-title-link:hover {
  color: #10b981;
}
.domain-tag {
  color: var(--n-text-color-3, #888);
  font-size: 11px;
}
.card-content-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.card-desc {
  font-size: 12.5px;
  color: var(--n-text-color-2, #666);
  margin: 0;
  line-height: 1.5;
  min-height: 38px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.meta-tag {
  font-size: 10.5px;
  background: var(--n-color-embedded, rgba(0, 0, 0, 0.05));
  color: var(--n-text-color-3, #777);
}
.card-footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.action-btn {
  flex: 1;
}
.visit-btn {
  font-weight: 600;
}

.help-content {
  font-size: 14px;
  line-height: 1.7;
}
.code-preview {
  background: #1e1e2e;
  color: #a6accd;
  padding: 12px 14px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12.5px;
  overflow-x: auto;
}
</style>
