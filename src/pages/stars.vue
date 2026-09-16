<template>
  <div class="stars-page">
    <!-- 头部介绍 -->
    <div class="stars-header">
      <div class="user-intro">
        <n-avatar
          round
          :size="56"
          src="https://avatars.githubusercontent.com/u/4418166?v=4"
          class="user-avatar"
        />
        <div>
          <div class="title-row">
            <h1 class="page-title">⭐ 我的 GitHub 星标宝藏库</h1>
            <n-tag type="warning" round size="small">
              {{ stars.length }} 个星标项目
            </n-tag>
          </div>
          <p class="page-desc">
            收录个人在 GitHub 上 Star 收藏的高价值开源框架、实用工具、算法与开发套件。
            <a
              href="https://github.com/mhxy13867806343?tab=stars"
              target="_blank"
              rel="noopener noreferrer"
              class="gh-link"
            >
              访问 GitHub Stars 页面 <ExternalLink :size="12" />
            </a>
          </p>
        </div>
      </div>

      <!-- 搜索、排序与语言分类筛选 -->
      <div class="filter-controls">
        <div class="search-and-sort">
          <div class="search-box">
            <n-input
              v-model:value="searchKeyword"
              placeholder="搜索星标仓库名、作者或描述..."
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

          <div class="sort-box">
            <n-select
              v-model:value="sortBy"
              :options="sortOptions"
              size="medium"
              style="width: 160px;"
            />
          </div>
        </div>

        <!-- 语言分类标签 -->
        <div class="lang-tags-row">
          <span class="filter-label">分类筛选：</span>
          <n-tag
            :type="selectedLang === 'all' ? 'warning' : 'default'"
            round
            clickable
            size="small"
            @click="selectedLang = 'all'"
          >
            全部 ({{ stars.length }})
          </n-tag>
          <n-tag
            v-for="lang in availableLanguages"
            :key="lang.name"
            :type="selectedLang === lang.name ? 'warning' : 'default'"
            round
            clickable
            size="small"
            @click="selectedLang = lang.name"
          >
            {{ lang.name }} ({{ lang.count }})
          </n-tag>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-wrap">
      <n-spin size="large" description="正在同步 GitHub 星标数据..." />
    </div>

    <!-- 仓库卡片网格 -->
    <div v-else-if="filteredStars.length" class="stars-grid">
      <n-card
        v-for="repo in filteredStars"
        :key="repo.id"
        hoverable
        class="star-card"
        size="small"
      >
        <template #header>
          <div class="card-top">
            <div class="name-group">
              <Star :size="18" class="star-icon" />
              <a
                :href="repo.html_url"
                target="_blank"
                rel="noopener noreferrer"
                class="card-repo-name"
                :title="repo.full_name"
              >
                {{ repo.full_name }}
              </a>
            </div>
            <n-tag
              v-if="repo.language"
              size="tiny"
              round
              :bordered="false"
              :color="getLanguageColor(repo.language)"
              class="lang-badge"
            >
              {{ repo.language }}
            </n-tag>
          </div>
        </template>

        <div class="card-body">
          <p class="repo-desc">
            {{ repo.description || '暂无项目描述' }}
          </p>
          <div class="meta-row">
            <span v-if="repo.stargazers_count !== undefined" class="meta-item star-count">
              ⭐ {{ repo.stargazers_count.toLocaleString() }}
            </span>
            <span v-if="repo.forks_count !== undefined" class="meta-item">
              🍴 {{ repo.forks_count.toLocaleString() }}
            </span>
            <span class="meta-item time">
              更新于 {{ formatDate(repo.updated_at) }}
            </span>
          </div>
        </div>

        <template #action>
          <div class="card-footer">
            <n-button
              type="warning"
              secondary
              size="small"
              tag="a"
              :href="repo.html_url"
              target="_blank"
              rel="noopener noreferrer"
              class="visit-btn"
            >
              <template #icon><ExternalLink :size="14" /></template>
              前往项目主页
            </n-button>
          </div>
        </template>
      </n-card>
    </div>

    <!-- 空结果状态 -->
    <n-empty
      v-else
      description="未匹配到符合条件的星标项目"
      style="padding: 60px 0;"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Star, ExternalLink } from 'lucide-vue-next'
import { fetchUserStars, type GithubRepo } from '@/services/githubService'

const stars = ref<GithubRepo[]>([])
const loading = ref(true)
const searchKeyword = ref('')
const selectedLang = ref('all')
const sortBy = ref<'stars' | 'updated' | 'name'>('stars')
const message = useMessage()

const sortOptions = [
  { label: '按 Star 数量降序', value: 'stars' },
  { label: '按最近更新排序', value: 'updated' },
  { label: '按仓库名称排序', value: 'name' }
]

function handleSearch() {
  const kw = searchKeyword.value.trim()
  if (kw) {
    if (filteredStars.value.length === 0) {
      message.warning(`未找到与 "${kw}" 相关的星标项目`)
    } else {
      message.success(`已筛选出 ${filteredStars.value.length} 个相关星标项目`)
    }
  } else {
    message.info('已显示全部星标项目')
  }
}

async function loadData() {
  loading.value = true
  try {
    stars.value = await fetchUserStars('mhxy13867806343')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

// 计算所有可用语言分类与数量
const availableLanguages = computed(() => {
  const map = new Map<string, number>()
  for (const r of stars.value) {
    const lang = r.language || '其他 / 未分类'
    map.set(lang, (map.get(lang) || 0) + 1)
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

// 过滤和排序筛选后的星标仓库
const filteredStars = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const result = stars.value.filter(repo => {
    // 语言过滤
    if (selectedLang.value !== 'all') {
      const lang = repo.language || '其他 / 未分类'
      if (lang !== selectedLang.value) return false
    }
    // 关键词搜索
    if (kw) {
      const matchName = (repo.full_name || repo.name).toLowerCase().includes(kw)
      const matchDesc = (repo.description || '').toLowerCase().includes(kw)
      return matchName || matchDesc
    }
    return true
  })

  // 排序
  if (sortBy.value === 'stars') {
    result.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
  } else if (sortBy.value === 'updated') {
    result.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
  } else if (sortBy.value === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name))
  }

  return result
})

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString()
  } catch {
    return dateStr.slice(0, 10)
  }
}

function getLanguageColor(lang: string) {
  const colors: Record<string, { color: string; textColor: string }> = {
    Vue: { color: '#41b88320', textColor: '#41b883' },
    JavaScript: { color: '#f7df1e20', textColor: '#d97706' },
    TypeScript: { color: '#3178c620', textColor: '#3178c6' },
    Python: { color: '#3776ab20', textColor: '#2563eb' },
    Rust: { color: '#dea58420', textColor: '#b45309' },
    Go: { color: '#00add820', textColor: '#00add8' },
    HTML: { color: '#e34f2620', textColor: '#e34f26' },
    CSS: { color: '#563d7c20', textColor: '#563d7c' },
    'C++': { color: '#f34b7d20', textColor: '#f34b7d' },
    C: { color: '#55555520', textColor: '#555555' },
    Java: { color: '#b0721920', textColor: '#b07219' },
    Shell: { color: '#89e05120', textColor: '#4d9920' },
    Kotlin: { color: '#a97bff20', textColor: '#7f52ff' },
    Swift: { color: '#f0513820', textColor: '#f05138' }
  }
  return colors[lang] || { color: 'rgba(0,0,0,0.06)', textColor: 'inherit' }
}
</script>

<style scoped>
.stars-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 60px;
}
.stars-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-bottom: 1px solid var(--n-border-color, rgba(0, 0, 0, 0.08));
  padding-bottom: 18px;
}
.user-intro {
  display: flex;
  align-items: center;
  gap: 16px;
}
.user-avatar {
  border: 2px solid #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  flex-shrink: 0;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.page-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
}
.page-desc {
  font-size: 13.5px;
  color: var(--n-text-color-3, #888);
  margin: 4px 0 0;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.gh-link {
  color: #f59e0b;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.gh-link:hover {
  text-decoration: underline;
}
.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.search-and-sort {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.search-box {
  flex: 1;
  min-width: 260px;
  max-width: 480px;
}
.lang-tags-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.filter-label {
  font-size: 12px;
  color: var(--n-text-color-3, #999);
}
.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}
.stars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 16px;
}
.star-card {
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
}
.star-card:hover {
  transform: translateY(-2px);
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.name-group {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  flex: 1;
}
.star-icon {
  color: #f59e0b;
  fill: #f59e0b;
  flex-shrink: 0;
}
.card-repo-name {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--n-text-color, #1f2937);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-repo-name:hover {
  color: #f59e0b;
}
.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.repo-desc {
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
.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11.5px;
  color: var(--n-text-color-3, #999);
}
.meta-item.star-count {
  color: #d97706;
  font-weight: 600;
}
.meta-item.time {
  margin-left: auto;
}
.card-footer {
  display: flex;
  justify-content: flex-end;
}
.visit-btn {
  width: 100%;
}
</style>
