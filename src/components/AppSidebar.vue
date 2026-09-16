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

    <div class="sidebar-section-title">资源分类 (Categories)</div>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Home, Search, Heart, RefreshCw, Globe } from 'lucide-vue-next'
import AppIcon from '@/components/AppIcon.vue'
import { categories, bookmarkedItems } from '@/services/dataService'

const emit = defineEmits<{
  (e: 'select'): void
}>()

const route = useRoute()
const bookmarkedCount = computed(() => bookmarkedItems.value.length)

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
.nav-list,
.category-list {
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
</style>
