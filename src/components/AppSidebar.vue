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

      <router-link
        to="/repos"
        class="nav-item"
        active-class="none"
        exact-active-class="none"
        :class="{ active: route.path === '/repos' }"
        @click="emit('select')"
      >
        <div class="nav-icon"><FolderGit2 :size="18" /></div>
        <span class="nav-text">开源作品库</span>
        <n-tag v-if="repos.length" size="tiny" round :bordered="false" type="info" class="nav-badge">
          {{ repos.length }}
        </n-tag>
      </router-link>

      <router-link
        to="/stars"
        class="nav-item"
        active-class="none"
        exact-active-class="none"
        :class="{ active: route.path === '/stars' }"
        @click="emit('select')"
      >
        <div class="nav-icon"><Star :size="18" style="color: #f59e0b; fill: #f59e0b;" /></div>
        <span class="nav-text">星标宝藏库</span>
        <n-tag v-if="stars.length" size="tiny" round :bordered="false" type="warning" class="nav-badge">
          {{ stars.length }}
        </n-tag>
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

    <!-- 分类列表（可折叠） -->
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

    <!-- 2. 开源作品 (REPOSITORIES) -->
    <div class="sidebar-section-title collapsible-title">
      <div class="section-title-left" @click="toggleRepos">
        <FolderGit2 :size="13" />
        <span>开源作品 (REPOS)</span>
        <n-tag v-if="repos.length" size="tiny" round :bordered="false" class="nav-badge">
          {{ repos.length }}
        </n-tag>
      </div>
      <div class="section-title-actions">
        <router-link
          to="/repos"
          class="action-expand-link"
          title="在右侧主页分类展开浏览全部作品"
          @click="emit('select')"
        >
          <Maximize2 :size="12" />
          <span>在主页展开</span>
        </router-link>
        <ChevronDown
          :size="14"
          class="collapse-arrow"
          :class="{ 'is-collapsed': !isReposExpanded }"
          @click="toggleRepos"
        />
      </div>
    </div>

    <!-- 开源仓库折叠预览 -->
    <n-collapse-transition :show="isReposExpanded">
      <div class="repo-section-content">
        <router-link
          to="/repos"
          class="main-jump-banner"
          @click="emit('select')"
        >
          <Maximize2 :size="13" />
          <span>在右侧主区分类浏览全部 ({{ repos.length || 38 }}项)</span>
        </router-link>

        <div class="repo-list">
          <n-spin v-if="loadingRepos" size="small" style="padding: 12px 0; display: flex; justify-content: center;" />
          <a
            v-for="repo in previewRepos"
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
          <router-link
            v-if="repos.length > 5"
            to="/repos"
            class="more-link"
            @click="emit('select')"
          >
            查看全部 {{ repos.length }} 个开源项目 ➔
          </router-link>
        </div>
      </div>
    </n-collapse-transition>

    <n-divider style="margin: 12px 0;" />

    <!-- 3. 星标收藏 (STARS) -->
    <div class="sidebar-section-title collapsible-title">
      <div class="section-title-left" @click="toggleStars">
        <Star :size="13" style="color: #f59e0b; fill: #f59e0b;" />
        <span>星标收藏 (STARS)</span>
        <n-tag v-if="stars.length" size="tiny" round :bordered="false" class="nav-badge">
          {{ stars.length }}
        </n-tag>
      </div>
      <div class="section-title-actions">
        <router-link
          to="/stars"
          class="action-expand-link stars-action"
          title="在右侧主页分类展开浏览全部星标"
          @click="emit('select')"
        >
          <Maximize2 :size="12" />
          <span>在主页展开</span>
        </router-link>
        <ChevronDown
          :size="14"
          class="collapse-arrow"
          :class="{ 'is-collapsed': !isStarsExpanded }"
          @click="toggleStars"
        />
      </div>
    </div>

    <!-- 星标仓库折叠预览 -->
    <n-collapse-transition :show="isStarsExpanded">
      <div class="repo-section-content">
        <router-link
          to="/stars"
          class="main-jump-banner stars-banner"
          @click="emit('select')"
        >
          <Maximize2 :size="13" />
          <span>在右侧主区分类浏览全部 ({{ stars.length || 100 }}项)</span>
        </router-link>

        <div class="repo-list">
          <n-spin v-if="loadingStars" size="small" style="padding: 12px 0; display: flex; justify-content: center;" />
          <a
            v-for="repo in previewStars"
            :key="repo.id"
            :href="repo.html_url"
            target="_blank"
            rel="noopener noreferrer"
            class="repo-item"
            :title="repo.description || repo.full_name"
          >
            <div class="repo-header">
              <span class="repo-name star-title">{{ repo.full_name }}</span>
              <span v-if="repo.language" class="repo-lang">{{ repo.language }}</span>
            </div>
            <p v-if="repo.description" class="repo-desc">{{ repo.description }}</p>
          </a>
          <router-link
            v-if="stars.length > 5"
            to="/stars"
            class="more-link"
            @click="emit('select')"
          >
            查看全部 {{ stars.length }} 个星标项目 ➔
          </router-link>
        </div>
      </div>
    </n-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Home,
  Search,
  Heart,
  RefreshCw,
  Globe,
  ChevronDown,
  FolderGit2,
  Star,
  Maximize2
} from 'lucide-vue-next'
import AppIcon from '@/components/AppIcon.vue'
import { categories, bookmarkedItems } from '@/services/dataService'
import { fetchUserRepos, fetchUserStars, type GithubRepo } from '@/services/githubService'

const emit = defineEmits<{
  (e: 'select'): void
}>()

const route = useRoute()
const bookmarkedCount = computed(() => bookmarkedItems.value.length)

// 1. 资源分类折叠/展开
const isCategoriesExpanded = ref(true)
function toggleCategories() {
  isCategoriesExpanded.value = !isCategoriesExpanded.value
  try {
    localStorage.setItem('fmhy_categories_expanded', String(isCategoriesExpanded.value))
  } catch {}
}

// 2. GitHub 开源仓库折叠/展开与数据
const repos = ref<GithubRepo[]>([])
const loadingRepos = ref(false)
const isReposExpanded = ref(true)
const previewRepos = computed(() => repos.value.slice(0, 5))

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

// 3. GitHub 星标收藏折叠/展开与数据
const stars = ref<GithubRepo[]>([])
const loadingStars = ref(false)
const isStarsExpanded = ref(true)
const previewStars = computed(() => stars.value.slice(0, 5))

function toggleStars() {
  isStarsExpanded.value = !isStarsExpanded.value
  try {
    localStorage.setItem('fmhy_stars_expanded', String(isStarsExpanded.value))
  } catch {}
}

async function loadStars() {
  loadingStars.value = true
  try {
    stars.value = await fetchUserStars('mhxy13867806343')
  } finally {
    loadingStars.value = false
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
  const savedStars = localStorage.getItem('fmhy_stars_expanded')
  if (savedStars !== null) {
    isStarsExpanded.value = savedStars === 'true'
  }
  loadRepos()
  loadStars()
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
.section-title-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}
.section-title-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.action-expand-link {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  color: #3b82f6;
  text-decoration: none;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(59, 130, 246, 0.1);
  transition: all 0.2s ease;
}
.action-expand-link:hover {
  background-color: #3b82f6;
  color: #fff;
}
.action-expand-link.stars-action {
  color: #d97706;
  background-color: rgba(245, 158, 11, 0.12);
}
.action-expand-link.stars-action:hover {
  background-color: #f59e0b;
  color: #fff;
}
.collapse-arrow {
  transition: transform 0.25s ease;
  color: var(--n-text-color-3, #999);
  cursor: pointer;
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

/* 仓库及星标列表区 */
.repo-section-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.main-jump-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 10px;
  margin: 4px 4px 6px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  border: 1px dashed rgba(37, 99, 235, 0.3);
  text-decoration: none;
  transition: all 0.2s ease;
}
.main-jump-banner:hover {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.main-jump-banner.stars-banner {
  color: #d97706;
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.3);
}
.main-jump-banner.stars-banner:hover {
  background: #f59e0b;
  color: #fff;
  border-color: #f59e0b;
}

.repo-item {
  display: flex;
  flex-direction: column;
  padding: 7px 12px;
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
.repo-name.star-title {
  color: var(--n-text-color, #333);
}
.repo-name.star-title:hover {
  color: #f59e0b;
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
  margin: 2px 0 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.more-link {
  font-size: 11.5px;
  color: #3b82f6;
  text-align: center;
  padding: 6px;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.2s ease;
}
.more-link:hover {
  background: var(--n-color-hover, rgba(0, 0, 0, 0.04));
  text-decoration: underline;
}
</style>
