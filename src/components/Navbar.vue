<template>
  <header class="app-navbar">
    <div class="navbar-left">
      <!-- 移动端展开菜单按钮 -->
      <n-button
        class="mobile-menu-btn"
        quaternary
        circle
        size="medium"
        @click="emit('toggle-sidebar')"
      >
        <template #icon>
          <Menu :size="20" />
        </template>
      </n-button>

      <router-link to="/" class="logo-container">
        <div class="logo-badge">FM</div>
        <div class="logo-text">
          <span class="logo-title">FMHY 中文导航</span>
          <span class="logo-sub">FreeMediaHeckYeah CN</span>
        </div>
      </router-link>

      <!-- 官方生态与术语表导航 (Ecosystem & Glossary) -->
      <div class="official-nav-group hide-mobile">
        <n-dropdown :options="ecosystemOptions" trigger="hover" @select="handleEcosystemSelect">
          <n-button quaternary size="small" class="ecosystem-btn">
            <span style="margin-right: 4px;">🌱</span>
            <span>Ecosystem</span>
            <ChevronDown :size="13" style="margin-left: 2px;" />
          </n-button>
        </n-dropdown>

        <span class="nav-pipe">|</span>

        <n-button
          quaternary
          size="small"
          tag="a"
          href="https://fmhy.net/glossary"
          target="_blank"
          rel="noopener noreferrer"
          class="glossary-btn"
          title="FMHY 官方术语表 (Glossary)"
        >
          <span style="margin-right: 4px;">📖</span>
          <span>Glossary</span>
          <ExternalLink :size="11" style="margin-left: 3px; opacity: 0.6;" />
        </n-button>
      </div>
    </div>

    <!-- 中间搜索框 -->
    <div class="navbar-center">
      <n-input
        v-model:value="searchQuery"
        round
        placeholder="搜索影视、动漫、音乐、工具、AI 或英文原名..."
        clearable
        @keydown.enter="handleSearch"
      >
        <template #prefix>
          <Search :size="16" style="color: #888" />
        </template>
        <template #suffix>
          <n-button
            type="primary"
            text
            size="tiny"
            @click="handleSearch"
          >
            搜索
          </n-button>
        </template>
      </n-input>
    </div>

    <!-- 右侧工具栏 -->
    <div class="navbar-right">
      <!-- 刷新按钮（带弹窗确认与 30s 冷却） -->
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button
            quaternary
            size="small"
            class="nav-link-btn"
            :disabled="refreshCooldown > 0 || isRefreshing"
            @click="handleRefresh"
          >
            <template #icon>
              <RefreshCw :size="16" :class="{ 'spin-icon': isRefreshing }" />
            </template>
            <span class="hide-mobile">
              {{ refreshCooldown > 0 ? `刷新 (${refreshCooldown}s)` : '刷新' }}
            </span>
          </n-button>
        </template>
        {{ refreshCooldown > 0 ? `刷新冷却中，请等待 ${refreshCooldown} 秒` : '点击刷新全站数据缓存' }}
      </n-tooltip>

      <!-- 收藏夹 -->
      <n-button
        :quaternary="route.path !== '/bookmarks'"
        :secondary="route.path === '/bookmarks'"
        :type="route.path === '/bookmarks' ? 'primary' : 'default'"
        size="small"
        class="nav-link-btn"
        @click="router.push('/bookmarks')"
      >
        <template #icon>
          <Heart :size="16" />
        </template>
        <span class="hide-mobile">收藏夹</span>
      </n-button>

      <!-- 定时同步 -->
      <n-button
        :quaternary="route.path !== '/sync'"
        :secondary="route.path === '/sync'"
        :type="route.path === '/sync' ? 'primary' : 'default'"
        size="small"
        class="nav-link-btn"
        @click="router.push('/sync')"
      >
        <template #icon>
          <Settings :size="16" />
        </template>
        <span class="hide-mobile">定时同步</span>
      </n-button>

      <!-- 官方与开源独立页面 -->
      <n-button
        :quaternary="route.path !== '/links'"
        :secondary="route.path === '/links'"
        :type="route.path === '/links' ? 'primary' : 'default'"
        size="small"
        class="nav-link-btn"
        @click="router.push('/links')"
        title="官方生态与开源"
      >
        <template #icon>
          <Globe :size="16" />
        </template>
        <span class="hide-mobile">官方开源</span>
      </n-button>

      <!-- 主题切换（当前模式高亮指示） -->
      <n-dropdown :options="themeOptions" @select="handleThemeSelect">
        <n-button quaternary circle size="small" title="切换主题">
          <template #icon>
            <Sun v-if="currentTheme === 'light'" :size="18" />
            <Moon v-else-if="currentTheme === 'dark'" :size="18" />
            <Laptop v-else :size="18" />
          </template>
        </n-button>
      </n-dropdown>

      <!-- 一键分享 (overtrue share.js) -->
      <n-button
        quaternary
        circle
        size="small"
        title="一键分享本站"
        @click="openShareModal"
      >
        <template #icon>
          <Share2 :size="17" />
        </template>
      </n-button>

      <!-- GitHub 仓库（带官方源与本项目选项） -->
      <n-dropdown :options="repoOptions" trigger="hover" @select="handleRepoSelect">
        <n-button
          quaternary
          circle
          size="small"
          title="GitHub 源码与官方仓库"
        >
          <template #icon>
            <Github :size="18" />
          </template>
        </n-button>
      </n-dropdown>
    </div>

    <!-- overtrue share.js 社交分享弹窗 -->
    <n-modal
      v-model:show="showShareModal"
      preset="card"
      title="🚀 分享 FMHY 中文精选导航"
      style="max-width: 460px; border-radius: 12px;"
    >
      <div style="text-align: center; padding: 10px 0;">
        <p style="font-size: 14px; color: var(--n-text-color-2); margin-top: 0; margin-bottom: 20px;">
          一键分享至社交平台或好友（支持微信扫码、QQ、微博、Twitter等）：
        </p>
        <div ref="shareBoxRef" class="social-share" data-sites="wechat,qq,qzone,weibo,twitter,facebook,douban"></div>
      </div>
    </n-modal>
  </header>
</template>

<script setup lang="ts">
import { h, ref, computed, nextTick } from 'vue'
import {
  Menu,
  Search,
  Heart,
  RefreshCw,
  Settings,
  Sun,
  Moon,
  Laptop,
  Github,
  Check,
  Share2,
  ChevronDown,
  Globe,
  ExternalLink
} from 'lucide-vue-next'
import { loadData } from '@/services/dataService'
import { useSearchHistory } from '@/utils/searchHistory'

const props = defineProps<{
  currentTheme: 'auto' | 'light' | 'dark'
}>()

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
  (e: 'change-theme', theme: 'auto' | 'light' | 'dark'): void
}>()

const router = useRouter()
const route = useRoute()
const message = useMessage()
const dialog = useDialog()
const searchQuery = ref('')
const globalHistory = useSearchHistory('global')

// 刷新与 30s 冷却逻辑
const refreshCooldown = ref(0)
const isRefreshing = ref(false)
let cooldownTimer: any = null

function handleRefresh() {
  if (refreshCooldown.value > 0 || isRefreshing.value) return

  dialog.warning({
    title: '确认刷新数据',
    content: '将重新拉取全站最新分类与资源缓存。执行后将进入 30 秒冷却倒计时，确认继续吗？',
    positiveText: '确认刷新',
    negativeText: '取消',
    onPositiveClick: async () => {
      isRefreshing.value = true
      try {
        await loadData()
        message.success('数据已刷新为最新状态！')
        refreshCooldown.value = 30
        if (cooldownTimer) clearInterval(cooldownTimer)
        cooldownTimer = setInterval(() => {
          refreshCooldown.value--
          if (refreshCooldown.value <= 0) {
            clearInterval(cooldownTimer)
            cooldownTimer = null
          }
        }, 1000)
      } catch (e) {
        console.error(e)
        message.error('刷新数据失败，请稍后再试')
      } finally {
        isRefreshing.value = false
      }
    }
  })
}

// 🌱 FMHY 官方生态下拉选项
const ecosystemOptions = [
  { label: '🌐 Search (全网双语搜索)', key: '/search' },
  { label: '❓ FAQs (官方常见问答)', key: 'https://fmhy.net/faqs' },
  { label: '🔖 Bookmarks (我的收藏夹)', key: '/bookmarks' },
  { label: '✅ SafeGuard ↗ (安全防护扩展)', key: 'https://github.com/fmhy/SafeGuard' },
  { label: '🚀 Startpage (极简起始页)', key: 'https://start.fmhy.net/' },
  { label: '🔎 SearXNG ↗ (私密元搜索引擎)', key: 'https://search.fmhy.net/' },
  { label: '💡 Site Hunting ↗ (优质找站指南)', key: 'https://fmhy.net/hunting' },
  { label: '😇 SFW FMHY ↗ (绿色工作友好版)', key: 'https://sfw.fmhy.net/' },
  { label: '🏠 Selfhosting (自建与私有服务)', key: 'https://fmhy.net/selfhosting' },
  { label: '🏞️ Wallpapers (精选高清壁纸)', key: 'https://fmhy.net/wallpapers' },
  { label: '💙 Feedback (向官方提交反馈)', key: 'https://fmhy.net/feedback' }
]

function handleEcosystemSelect(key: string) {
  if (key.startsWith('/')) {
    router.push(key)
  } else {
    window.open(key, '_blank', 'noopener,noreferrer')
  }
}

// 仓库下拉选项
const repoOptions = [
  { label: '🇨🇳 本项目源码 (zh-fmhy)', key: 'https://github.com/mhxy13867806343/zh-fmhy' },
  { label: '🌐 FMHY 官方源仓库 (fmhy/edit)', key: 'https://github.com/fmhy/edit' },
  { label: '🌍 FMHY 官方网站 (fmhy.net)', key: 'https://fmhy.net/' }
]

function handleRepoSelect(key: string) {
  window.open(key, '_blank', 'noopener,noreferrer')
}

// 主题选项
const themeOptions = computed(() => [
  {
    label: () =>
      h('div', { class: ['theme-menu-item', props.currentTheme === 'auto' ? 'is-active' : ''] }, [
        h('span', null, '跟随系统 (OS Theme)'),
        props.currentTheme === 'auto' ? h(Check, { size: 14, class: 'check-icon' }) : null
      ]),
    key: 'auto'
  },
  {
    label: () =>
      h('div', { class: ['theme-menu-item', props.currentTheme === 'light' ? 'is-active' : ''] }, [
        h('span', null, '浅色模式 (Light)'),
        props.currentTheme === 'light' ? h(Check, { size: 14, class: 'check-icon' }) : null
      ]),
    key: 'light'
  },
  {
    label: () =>
      h('div', { class: ['theme-menu-item', props.currentTheme === 'dark' ? 'is-active' : ''] }, [
        h('span', null, '深色模式 (Dark)'),
        props.currentTheme === 'dark' ? h(Check, { size: 14, class: 'check-icon' }) : null
      ]),
    key: 'dark'
  }
])

function handleThemeSelect(key: string) {
  emit('change-theme', key as 'auto' | 'light' | 'dark')
}

const showShareModal = ref(false)
const shareBoxRef = ref<HTMLElement | null>(null)

function openShareModal() {
  showShareModal.value = true
  nextTick(() => {
    if (shareBoxRef.value && (window as any).socialShare) {
      (window as any).socialShare(shareBoxRef.value, {
        title: 'FMHY 中文精选导航 - 互联网最庞大的免费数字资源索引库',
        description: '基于 GitHub 官方社区每日同步，中英双语检索，涵盖影视、音乐、动漫、游戏、图书文献等精选资源。',
        sites: ['wechat', 'qq', 'qzone', 'weibo', 'twitter', 'facebook', 'douban']
      })
    }
  })
}

function handleSearch() {
  const q = searchQuery.value.trim()
  if (!q) {
    message.warning('请输入搜索关键词')
    return
  }
  globalHistory.add(q)
  router.push({ path: '/search', query: { q } })
}
</script>

<style scoped>
.app-navbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--n-border-color, rgba(0, 0, 0, 0.08));
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: var(--n-color, rgba(255, 255, 255, 0.85));
}
.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mobile-menu-btn {
  display: none;
}
.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
}
.logo-badge {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
}
.logo-text {
  display: flex;
  flex-direction: column;
}
.logo-title {
  font-weight: 700;
  font-size: 15px;
  line-height: 1.2;
}
.logo-sub {
  font-size: 10px;
  color: var(--n-text-color-3, #999);
}

.official-nav-group {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--n-border-color, rgba(0, 0, 0, 0.08));
}
.ecosystem-btn,
.glossary-btn {
  font-size: 13px;
  font-weight: 500;
  color: var(--n-text-color-2, #666);
}
.nav-pipe {
  color: var(--n-border-color, rgba(0, 0, 0, 0.15));
  font-size: 12px;
  margin: 0 2px;
}

.navbar-center {
  flex: 1;
  max-width: 440px;
  margin: 0 16px;
}
.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

:deep(.theme-menu-item) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 150px;
}

:deep(.theme-menu-item.is-active) {
  color: #3b82f6;
  font-weight: 600;
}

:deep(.check-icon) {
  color: #3b82f6;
  flex-shrink: 0;
}

@media (max-width: 900px) {
  .official-nav-group {
    display: none;
  }
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: inline-flex;
  }
  .navbar-center {
    display: none;
  }
  .hide-mobile {
    display: none;
  }
}
</style>
