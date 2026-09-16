<template>
  <div v-if="pageLoading" class="loading-state" style="padding: 100px 0; display: flex; justify-content: center;">
    <n-spin size="large" description="正在加载分类资源..." />
  </div>

  <div v-else-if="category" class="category-detail-page">
    <!-- 头部面包屑与介绍 -->
    <div class="category-header">
      <n-breadcrumb>
        <n-breadcrumb-item @click="router.push('/')">首页</n-breadcrumb-item>
        <n-breadcrumb-item>分类</n-breadcrumb-item>
        <n-breadcrumb-item>{{ category.title }}</n-breadcrumb-item>
      </n-breadcrumb>

      <div class="header-main">
        <div class="header-left">
          <div class="cat-icon-badge" :style="{ backgroundColor: category.color + '18', color: category.color }">
            <AppIcon :name="category.icon" :size="32" />
          </div>
          <div>
            <h1 class="cat-title">{{ category.title }}</h1>
            <p class="cat-desc">{{ category.description }}</p>
          </div>
        </div>
        <div class="header-right">
          <n-tag type="info" size="large" round>
            共 {{ category.itemCount }} 项收录
          </n-tag>
        </div>
      </div>
    </div>

    <!-- 过滤器与搜索 -->
    <div class="filter-bar">
      <n-tabs
        v-if="category.sections && category.sections.length > 1"
        v-model:value="activeSection"
        type="line"
        animated
        class="section-tabs"
      >
        <n-tab name="all">全部子专区 ({{ category.itemCount }})</n-tab>
        <n-tab
          v-for="sec in category.sections"
          :key="sec.id"
          :name="sec.id"
        >
          {{ sec.title }} ({{ sec.items.length }})
        </n-tab>
      </n-tabs>

      <div class="search-input-wrap">
        <n-input
          v-model:value="subSearch"
          placeholder="在当前分类中过滤..."
          clearable
          size="small"
          @keydown.enter="handleSubSearch"
        >
          <template #prefix>
            <Search :size="14" style="color: #888;" />
          </template>
          <template #suffix>
            <n-button
              type="primary"
              size="tiny"
              round
              @click="handleSubSearch"
            >
              搜索
            </n-button>
          </template>
        </n-input>
      </div>
    </div>

    <!-- 分类专属搜索历史 -->
    <div v-if="catHistory.historyList.value.length" class="cat-history-row">
      <span class="history-label"><Clock :size="12" /> 本分类过滤历史：</span>
      <div class="history-tags">
        <n-tag
          v-for="kw in catHistory.historyList.value"
          :key="kw"
          round
          size="tiny"
          closable
          clickable
          @click="handleApplyHistory(kw)"
          @close.stop="handleRemoveHistory(kw)"
        >
          {{ kw }}
        </n-tag>
        <n-button text size="tiny" type="default" class="clear-btn" @click="handleClearHistory">
          清空
        </n-button>
      </div>
    </div>

    <!-- 资源内容区（按 Section 分组） -->
    <div v-if="displaySections && displaySections.length" class="sections-container">
      <div
        v-for="sec in displaySections"
        :key="sec.id"
        class="section-group"
      >
        <div class="section-title-row">
          <h2 class="sec-title">{{ sec.title }}</h2>
          <span v-if="sec.description" class="sec-desc">{{ sec.description }}</span>
        </div>

        <div v-if="filterSectionItems(sec.items).length" class="resource-grid">
          <ResourceCard
            v-for="item in filterSectionItems(sec.items)"
            :key="item.id"
            :item="item"
          />
        </div>
        <n-empty
          v-else
          description="没有匹配到符合条件的资源"
          style="padding: 24px 0;"
        />
      </div>
    </div>

    <n-spin v-else size="large" style="padding: 80px 0; display: flex; justify-content: center;" />
  </div>

  <div v-else class="not-found">
    <n-empty description="未找到该分类资源" size="large">
      <template #extra>
        <n-button type="primary" @click="router.push('/')">返回首页</n-button>
      </template>
    </n-empty>
  </div>
</template>

<script setup lang="ts">
import { Search, Clock } from 'lucide-vue-next'
import AppIcon from '@/components/AppIcon.vue'
import ResourceCard from '@/components/ResourceCard.vue'
import { loadCategoryDetail, currentCategoryDetail } from '@/services/dataService'
import { useSearchHistory } from '@/utils/searchHistory'
import type { ResourceItem } from '@/types'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const categoryId = computed(() => (route.params as any).id as string)
const category = computed(() => currentCategoryDetail.value)
const catHistory = computed(() => useSearchHistory(categoryId.value))

function handleSubSearch() {
  const q = subSearch.value.trim()
  if (q) {
    catHistory.value.add(q)
    const totalMatched = (category.value?.sections || []).reduce(
      (acc, sec) => acc + filterSectionItems(sec.items).length,
      0
    )
    if (totalMatched === 0) {
      message.warning(`未找到与 "${q}" 相关的资源`)
    } else {
      message.success(`已筛选出 ${totalMatched} 个相关资源`)
    }
  } else {
    message.info('已清除搜索过滤')
  }
}

function handleApplyHistory(kw: string) {
  subSearch.value = kw
  handleSubSearch()
}

function handleRemoveHistory(kw: string) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除历史记录 "${kw}" 吗？`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      catHistory.value.remove(kw)
      message.success(`已删除历史记录 "${kw}"`)
    }
  })
}

function handleClearHistory() {
  dialog.warning({
    title: '确认清空',
    content: '确定要清空本分类的历史搜索记录吗？',
    positiveText: '确认清空',
    negativeText: '取消',
    onPositiveClick: () => {
      catHistory.value.clear()
      message.success('已清空搜索历史记录')
    }
  })
}

const pageLoading = ref(true)
const activeSection = ref('all')
const subSearch = ref('')

async function fetchData() {
  if (categoryId.value) {
    pageLoading.value = true
    activeSection.value = 'all'
    subSearch.value = ''
    try {
      await loadCategoryDetail(categoryId.value)
    } finally {
      pageLoading.value = false
    }
  }
}

onMounted(() => {
  fetchData()
})

watch(
  () => categoryId.value,
  () => {
    fetchData()
  }
)

const displaySections = computed(() => {
  if (!category.value || !category.value.sections) return []
  if (activeSection.value === 'all') {
    return category.value.sections
  }
  return category.value.sections.filter(s => s.id === activeSection.value)
})

function filterSectionItems(items: ResourceItem[]) {
  const q = subSearch.value.trim().toLowerCase()
  if (!q) return items
  return items.filter(
    item =>
      item.title.toLowerCase().includes(q) ||
      item.titleEn.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
  )
}
</script>

<style scoped>
.category-detail-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 50px;
}
.category-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--n-border-color, rgba(0, 0, 0, 0.08));
}
.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.cat-icon-badge {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cat-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.cat-desc {
  font-size: 14px;
  color: var(--n-text-color-2, #666);
  margin: 4px 0 0;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.section-tabs {
  flex: 1;
}
.search-input-wrap {
  width: 220px;
}
.cat-history-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: -12px;
  font-size: 11.5px;
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
.clear-btn {
  margin-left: 4px;
  color: var(--n-text-color-3, #999);
}

.sections-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.section-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.section-title-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.sec-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #3b82f6;
}
.sec-desc {
  font-size: 12px;
  color: var(--n-text-color-3, #888);
}
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 16px;
}
.not-found {
  padding: 60px 0;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .header-main {
    flex-direction: column;
    align-items: flex-start;
  }
  .search-input-wrap {
    width: 100%;
  }
  .resource-grid {
    grid-template-columns: 1fr;
  }
}
</style>
