<template>
  <div class="repos-page">
    <!-- 头部介绍 -->
    <div class="repos-header">
      <div class="user-intro">
        <n-avatar
          round
          :size="56"
          src="https://avatars.githubusercontent.com/u/4418166?v=4"
          class="user-avatar"
        />
        <div>
          <div class="title-row">
            <h1 class="page-title">🛠️ 我的 GitHub 开源作品库</h1>
            <n-tag type="primary" round size="small">
              {{ repos.length }} 个公开仓库
            </n-tag>
          </div>
          <p class="page-desc">
            收录个人在 GitHub 上的开源项目、工具、插件与学习模板。
            <a
              href="https://github.com/mhxy13867806343?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              class="gh-link"
            >
              访问 GitHub 个人主页 <ExternalLink :size="12" />
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
              placeholder="搜索项目名称或描述..."
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
          <span class="filter-label">语言分类：</span>
          <n-tag
            :type="selectedLang === 'all' ? 'primary' : 'default'"
            round
            clickable
            size="small"
            @click="selectedLang = 'all'"
          >
            全部 ({{ repos.length }})
          </n-tag>
          <n-tag
            v-for="lang in availableLanguages"
            :key="lang.name"
            :type="selectedLang === lang.name ? 'primary' : 'default'"
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
      <n-spin size="large" description="正在同步 GitHub 仓库数据..." />
    </div>

    <!-- 仓库卡片网格 -->
    <div v-else-if="filteredRepos.length" class="repos-grid">
      <n-card
        v-for="repo in filteredRepos"
        :key="repo.id"
        hoverable
        class="repo-card"
        size="small"
      >
        <template #header>
          <div class="card-top">
            <div class="name-group">
              <FolderGit2 :size="18" class="repo-icon" />
              <span class="card-repo-name">{{ repo.name }}</span>
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
            <span v-if="repo.stargazers_count !== undefined" class="meta-item">
              ⭐ {{ repo.stargazers_count }}
            </span>
            <span v-if="repo.forks_count !== undefined" class="meta-item">
              🍴 {{ repo.forks_count }}
            </span>
            <span class="meta-item time">
              更新于 {{ formatDate(repo.updated_at) }}
            </span>
          </div>
        </div>

        <template #action>
          <div class="card-footer">
            <n-button
              type="primary"
              secondary
              size="small"
              tag="a"
              :href="repo.html_url"
              target="_blank"
              rel="noopener noreferrer"
              class="visit-btn"
            >
              <template #icon><ExternalLink :size="14" /></template>
              前往 GitHub 仓库
            </n-button>
          </div>
        </template>
      </n-card>
    </div>

    <!-- 空结果状态 -->
    <n-empty
      v-else
      description="未匹配到符合条件的仓库"
      style="padding: 60px 0;"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, FolderGit2, ExternalLink } from 'lucide-vue-next'
import { fetchUserRepos, type GithubRepo } from '@/services/githubService'

const repos = ref<GithubRepo[]>([])
const loading = ref(true)
const searchKeyword = ref('')
const selectedLang = ref('all')
const sortBy = ref<'updated' | 'stars' | 'name'>('updated')

const message = useMessage()

const sortOptions = [
  { label: '按最近更新排序', value: 'updated' },
  { label: '按 Star 数量降序', value: 'stars' },
  { label: '按项目名称排序', value: 'name' }
]

function handleSearch() {
  const kw = searchKeyword.value.trim()
  if (kw) {
    if (filteredRepos.value.length === 0) {
      message.warning(`未找到与 "${kw}" 相关的仓库项目`)
    } else {
      message.success(`已筛选出 ${filteredRepos.value.length} 个相关仓库`)
    }
  } else {
    message.info('已显示全部仓库')
  }
}

async function loadData() {
  loading.value = true
  try {
    repos.value = await fetchUserRepos('mhxy13867806343')
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
  for (const r of repos.value) {
    if (r.language) {
      map.set(r.language, (map.get(r.language) || 0) + 1)
    }
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

// 过滤筛选与排序后的仓库
const filteredRepos = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  const result = repos.value.filter(repo => {
    // 语言过滤
    if (selectedLang.value !== 'all' && repo.language !== selectedLang.value) {
      return false
    }
    // 关键词搜索
    if (kw) {
      const matchName = repo.name.toLowerCase().includes(kw)
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
    HTML: { color: '#e34f2620', textColor: '#e34f26' },
    GDScript: { color: '#478cbf20', textColor: '#478cbf' }
  }
  return colors[lang] || { color: 'rgba(0,0,0,0.06)', textColor: 'inherit' }
}
</script>

<style scoped>
.repos-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 60px;
}
.repos-header {
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
  border: 2px solid #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
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
  color: #3b82f6;
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
.repos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 16px;
}
.repo-card {
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
}
.repo-card:hover {
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
}
.repo-icon {
  color: #3b82f6;
  flex-shrink: 0;
}
.card-repo-name {
  font-size: 15px;
  font-weight: 700;
  color: #3b82f6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
