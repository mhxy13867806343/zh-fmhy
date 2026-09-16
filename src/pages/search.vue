<template>
  <div class="search-page">
    <div class="search-header">
      <h1 class="page-title">🔍 全网双语模糊检索</h1>
      <p class="page-desc">输入中英文关键字，实时搜索全站资源。</p>

      <div class="search-box-row">
        <n-input
          v-model:value="searchText"
          round
          size="large"
          placeholder="输入中文或英文关键词（如：影视、动漫、音乐、BT、Cobalt、AI、阅读...）"
          clearable
          autofocus
          @input="handleInput"
          @clear="doSearch"
          @keydown.enter="handleEnterSearch"
        >
          <template #prefix>
            <Search :size="18" style="color: #888" />
          </template>
        </n-input>
      </div>

      <!-- 搜索历史（全局与对应分类独立分开管理） -->
      <div v-if="currentHistory.historyList.value.length" class="history-row">
        <span class="history-label">
          <Clock :size="13" />
          {{ selectedCat === 'all' ? '全局搜索历史：' : `【${currentCatTitle}】历史：` }}
        </span>
        <div class="history-tags">
          <n-tag
            v-for="kw in currentHistory.historyList.value"
            :key="kw"
            round
            size="small"
            closable
            clickable
            class="history-tag"
            @click="handleSelectHistory(kw)"
            @close.stop="currentHistory.remove(kw)"
          >
            {{ kw }}
          </n-tag>
          <n-button text size="tiny" type="default" class="clear-btn" @click="currentHistory.clear">
            清空
          </n-button>
        </div>
      </div>

      <!-- 快速过滤标签 -->
      <div class="filter-tags-row">
        <span class="filter-label">分类筛选：</span>
        <n-tag
          :type="selectedCat === 'all' ? 'primary' : 'default'"
          round
          clickable
          size="small"
          @click="selectCategory('all')"
        >
          全部
        </n-tag>
        <n-tag
          v-for="cat in categories"
          :key="cat.id"
          :type="selectedCat === cat.id ? 'primary' : 'default'"
          round
          clickable
          size="small"
          @click="selectCategory(cat.id)"
        >
          {{ cat.title?.split(' ')[0] }}
        </n-tag>
      </div>
    </div>

    <!-- 搜索结果统计 -->
    <div class="result-bar">
      <span class="result-count">
        <n-spin v-if="searchLoading" size="small" style="margin-right: 8px;" />
        找到 <strong>{{ searchResults.length }}</strong> 条匹配结果
        <span v-if="searchResults.length > pageSize" class="page-hint">
          ，当前第 {{ currentPage }}/{{ totalPages }} 页
        </span>
      </span>
    </div>

    <!-- 搜索结果网格（分页后的当前页） -->
    <div v-if="pagedResults.length" class="resource-grid">
      <ResourceCard
        v-for="item in pagedResults"
        :key="item.id"
        :item="item"
      />
    </div>

    <n-empty
      v-else-if="!searchLoading"
      description="未找到相关资源，请尝试输入影视、动漫、音乐、BT、Cobalt 或软件名称等关键词"
      size="large"
      style="padding: 60px 0;"
    />

    <!-- 分页器 -->
    <div v-if="searchResults.length > pageSize" class="pagination-wrap">
      <n-pagination
        v-model:page="currentPage"
        :page-count="totalPages"
        :page-slot="7"
        show-quick-jumper
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Search, Clock } from 'lucide-vue-next'
import ResourceCard from '@/components/ResourceCard.vue'
import { categories, searchResults, searchLoading, querySearch } from '@/services/dataService'
import { useSearchHistory } from '@/utils/searchHistory'

const route = useRoute()
const message = useMessage()
const searchText = ref('')
const selectedCat = ref('all')
const currentPage = ref(1)
const pageSize = 24
let debounceTimer: any = null

// 根据当前分类动态绑定搜索历史（全局与分类各自独立存储）
const currentHistory = computed(() => useSearchHistory(selectedCat.value))

const currentCatTitle = computed(() => {
  const c = categories.value.find(cat => cat.id === selectedCat.value)
  return c ? c.title.split(' ')[0] : '分类'
})

const totalPages = computed(() => Math.ceil(searchResults.value.length / pageSize))

const pagedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return searchResults.value.slice(start, start + pageSize)
})

function doSearch(saveHistory: boolean = false) {
  currentPage.value = 1
  const q = searchText.value.trim()
  if (saveHistory && q) {
    currentHistory.value.add(q)
  }
  querySearch(q, selectedCat.value)
}

function handleEnterSearch() {
  const q = searchText.value.trim()
  if (!q) {
    message.warning('请输入搜索关键词')
    return
  }
  doSearch(true)
}

function handleSelectHistory(keyword: string) {
  searchText.value = keyword
  doSearch(true)
}

function handleInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    doSearch(false)
  }, 300)
}

function selectCategory(cat: string) {
  selectedCat.value = cat
  currentHistory.value.load()
  doSearch(false)
}

// 翻页时滚动到顶部
watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

onMounted(() => {
  if (route.query.q) {
    searchText.value = String(route.query.q)
    currentHistory.value.add(searchText.value)
  }
  doSearch(false)
})

watch(
  () => route.query.q,
  (newQ) => {
    if (newQ !== undefined) {
      searchText.value = String(newQ || '')
      if (searchText.value) {
        currentHistory.value.add(searchText.value)
      }
      doSearch(false)
    }
  }
)
</script>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 50px;
}
.search-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.page-desc {
  font-size: 14px;
  color: var(--n-text-color-3, #888);
  margin: 0;
}
.search-box-row {
  max-width: 680px;
  margin-top: 4px;
}
.history-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 680px;
  font-size: 12px;
}
.history-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--n-text-color-3, #888);
  white-space: nowrap;
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
.filter-tags-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
}
.filter-label {
  font-size: 12px;
  color: var(--n-text-color-3, #999);
}
.result-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--n-border-color, rgba(0, 0, 0, 0.08));
}
.result-count {
  font-size: 13px;
  color: var(--n-text-color-2, #666);
  display: flex;
  align-items: center;
}
.page-hint {
  color: var(--n-text-color-3, #999);
}
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 16px;
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

@media (max-width: 768px) {
  .resource-grid {
    grid-template-columns: 1fr;
  }
}
</style>
