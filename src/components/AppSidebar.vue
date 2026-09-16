<template>
  <div class="sidebar-wrapper">
    <div class="sidebar-section-title">核心导航</div>
    <div class="nav-list">
      <router-link
        to="/"
        class="nav-item"
        active-class="none"
        exact-active-class="none"
        :class="{ active: route.path === '/' }"
        @click="emit('select')"
      >
        <div class="nav-icon"><Home :size="18" /></div>
        <span class="nav-text">首页精选推荐</span>
      </router-link>

      <router-link
        to="/search"
        class="nav-item"
        active-class="none"
        exact-active-class="none"
        :class="{ active: route.path === '/search' }"
        @click="emit('select')"
      >
        <div class="nav-icon"><Search :size="18" /></div>
        <span class="nav-text">全网双语搜索</span>
      </router-link>

      <router-link
        to="/bookmarks"
        class="nav-item"
        active-class="none"
        exact-active-class="none"
        :class="{ active: route.path === '/bookmarks' }"
        @click="emit('select')"
      >
        <div class="nav-icon"><Heart :size="18" /></div>
        <span class="nav-text">我的收藏夹</span>
        <n-tag size="tiny" round :bordered="false" type="error" class="nav-badge">
          {{ bookmarkedCount }}
        </n-tag>
      </router-link>

      <router-link
        to="/sync"
        class="nav-item"
        active-class="none"
        exact-active-class="none"
        :class="{ active: route.path === '/sync' }"
        @click="emit('select')"
      >
        <div class="nav-icon"><RefreshCw :size="18" /></div>
        <span class="nav-text">定时同步设置</span>
        <n-badge dot type="success" />
      </router-link>

      <router-link
        to="/links"
        class="nav-item"
        active-class="none"
        exact-active-class="none"
        :class="{ active: route.path === '/links' }"
        @click="emit('select')"
      >
        <div class="nav-icon"><Globe :size="18" /></div>
        <span class="nav-text">官方生态与开源</span>
      </router-link>
    </div>

    <n-divider style="margin: 12px 0;" />

    <!-- 1. 资源分类 (CATEGORIES) -->
    <div
      class="sidebar-section-title collapsible-title"
      @click="toggleCategories"
      title="点击展开或折叠资源分类"
    >
      <span>资源分类 (CATEGORIES)</span>
      <ChevronDown
        :size="14"
        class="collapse-arrow"
        :class="{ 'is-collapsed': !isCategoriesExpanded }"
      />
    </div>

    <!-- 2. 分类列表（可折叠） -->
    <n-collapse-transition :show="isCategoriesExpanded">
      <div class="category-list">
        <router-link
          v-for="cat in categories"
          :key="cat.id"
          :to="`/category/${cat.id}`"
          class="nav-item"
          active-class="none"
          exact-active-class="none"
          :class="{ active: isCatActive(cat.id) }"
          @click="emit('select')"
        >
          <div class="nav-icon" :style="{ color: cat.color || '#3b82f6' }">
            <AppIcon :name="cat.icon" :size="18" />
          </div>
          <div class="cat-label">
            <span class="cat-title">{{ cat.title }}</span>
          </div>
          <n-tag size="tiny" round :bordered="false" class="nav-badge">
            {{ cat.itemCount }}
          </n-tag>
        </router-link>
      </div>
    </n-collapse-transition>

    <n-divider style="margin: 12px 0;" />

    <!-- 3. GitHub 开源仓库 (REPOSITORIES) -->
    <div
      class="sidebar-section-title collapsible-title"
      @click="toggleRepos"
      title="点击展开或折叠 GitHub 仓库"
    >
      <div style="display: flex; align-items: center; gap: 6px;">
        <FolderGit2 :size="13" />
        <span>开源作品 (REPOS)</span>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <n-tag v-if="repos.length" size="tiny" round :bordered="false" class="nav-badge">
          {{ repos.length }}
        </n-tag>
        <ChevronDown
          :size="14"
          class="collapse-arrow"
          :class="{ 'is-collapsed': !isReposExpanded }"
        />
      </div>
    </div>

    <!-- 4. 仓库列表（可折叠） -->
    <n-collapse-transition :show="isReposExpanded">
      <div class="repo-list">
        <n-spin v-if="loadingRepos" size="small" style="padding: 12px 0; display: flex; justify-content: center;" />
        <a
          v-for="repo in repos"
          :key="repo.id"
          :href="repo.html_url"
          target="_blank"
          rel="noopener noreferrer"
          class="repo-item"
          :title="repo.description || repo.name"
        >
          <div class="repo-header">
            <span class="repo-name">{{ repo.name }}</span>
            <span v-if="repo.language" class="repo-lang">{{ repo.language }}</span>
          </div>
          <p v-if="repo.description" class="repo-desc">{{ repo.description }}</p>
        </a>
      </div>
    </n-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Home, Search, Heart, RefreshCw, Globe, ChevronDown, FolderGit2 } from 'lucide-vue-next'
import AppIcon from '@/components/AppIcon.vue'
import { categories, bookmarkedItems } from '@/services/dataService'
import { fetchUserRepos, type GithubRepo } from '@/services/githubService'

const emit = defineEmits<{
  (e: 'select'): void
}>()

const route = useRoute()
const bookmarkedCount = computed(() => bookmarkedItems.value.length)

// 资源分类列表折叠/展开
const isCategoriesExpanded = ref(true)
function toggleCategories() {
  isCategoriesExpanded.value = !isCategoriesExpanded.value
  try {
    localStorage.setItem('fmhy_categories_expanded', String(isCategoriesExpanded.value))
  } catch {}
}

// GitHub 开源作品折叠/展开
const repos = ref<GithubRepo[]>([])
const loadingRepos = ref(false)
const isReposExpanded = ref(true)
function toggleRepos() {
  isReposExpanded.value = !isReposExpanded.value
  try {
    localStorage.setItem('fmhy_repos_expanded', String(isReposExpanded.value))
  } catch {}
}

async function loadRepos() {
  loadingRepos.value = true
  try {
    repos.value = await fetchUserRepos('mhxy13867806343')
  } finally {
    loadingRepos.value = false
  }
}

onMounted(() => {
  const savedCat = localStorage.getItem('fmhy_categories_expanded')
  if (savedCat !== null) {
    isCategoriesExpanded.value = savedCat === 'true'
  }
  const savedRepos = localStorage.getItem('fmhy_repos_expanded')
  if (savedRepos !== null) {
    isReposExpanded.value = savedRepos === 'true'
  }
  loadRepos()
})

function isCatActive(catId: string): boolean {
  return route.path === `/category/${catId}` || (route.params as any)?.id === catId
}
</script>

<style scoped>
.sidebar-wrapper {
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
}
.sidebar-section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--n-text-color-3, #999);
  padding: 6px 12px;
  letter-spacing: 0.5px;
}
.collapsible-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
  transition: all 0.2s ease;
}
.collapsible-title:hover {
  background-color: var(--n-color-hover, rgba(0, 0, 0, 0.04));
  color: #3b82f6;
}
.collapse-arrow {
  transition: transform 0.25s ease;
  color: var(--n-text-color-3, #999);
}
.collapse-arrow.is-collapsed {
  transform: rotate(-90deg);
}

.nav-list,
.category-list,
.repo-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  color: var(--n-text-color, #333);
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.15s ease;
  position: relative;
}
.nav-item:hover {
  background-color: var(--n-color-hover, rgba(0, 0, 0, 0.04));
}
.nav-item.active {
  background-color: rgba(59, 130, 246, 0.14) !important;
  color: #3b82f6 !important;
  font-weight: 600;
}
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 15%;
  bottom: 15%;
  width: 3.5px;
  background-color: #3b82f6;
  border-radius: 0 4px 4px 0;
}
.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
.nav-text {
  flex: 1;
}
.cat-label {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.cat-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-badge {
  margin-left: auto;
  font-size: 11px;
}

/* 仓库列表样式 */
.repo-item {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}
.repo-item:hover {
  background-color: var(--n-color-hover, rgba(0, 0, 0, 0.04));
  border-color: var(--n-border-color, rgba(0, 0, 0, 0.06));
}
.repo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.repo-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #3b82f6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.repo-lang {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--n-color-embedded, rgba(0, 0, 0, 0.06));
  color: var(--n-text-color-3, #888);
  flex-shrink: 0;
}
.repo-desc {
  font-size: 11px;
  color: var(--n-text-color-3, #999);
  margin: 3px 0 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
