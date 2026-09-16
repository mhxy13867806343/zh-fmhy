<template>
  <n-config-provider :theme="activeTheme">
    <n-global-style />
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <!-- 全局文件更新检测与提示组件 -->
            <GlobalUpdateNotifier />

            <div class="app-layout">
              <!-- 顶部导航栏 -->
              <Navbar
                :current-theme="themeMode"
                @toggle-sidebar="drawerActive = true"
                @change-theme="setTheme"
              />

              <!-- 主体区域：桌面端侧边栏 + 内容区 -->
              <div class="main-body">
                <!-- 桌面端侧边栏 -->
                <aside class="desktop-sidebar">
                  <AppSidebar />
                </aside>

                <!-- 移动端侧边抽屉 -->
                <n-drawer
                  v-model:show="drawerActive"
                  :width="280"
                  placement="left"
                >
                  <n-drawer-content body-content-style="padding: 0;">
                    <AppSidebar @select="drawerActive = false" />
                  </n-drawer-content>
                </n-drawer>

                <!-- 路由展示区 -->
                <main class="content-area" ref="contentAreaRef">
                  <div class="content-wrapper">
                    <router-view />
                  </div>
                  <!-- Naive UI BackTop 官方组件 (监听 window/document) -->
                  <n-back-top :visibility-height="80" :bottom="50" :right="40" style="z-index: 9999;" />
                  <!-- Naive UI BackTop 官方组件 (监听 .content-area) -->
                  <n-back-top listen-to=".content-area" :visibility-height="80" :bottom="50" :right="40" style="z-index: 9999;" />

                  <!-- 全局双重兜底返回顶部悬浮按钮 -->
                  <transition name="fade">
                    <div
                      v-show="showBackTop"
                      class="global-back-top"
                      title="回到顶部"
                      @click="scrollToTop"
                    >
                      <ChevronUp :size="22" />
                    </div>
                  </transition>
                </main>
              </div>
            </div>
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useOsTheme, darkTheme } from 'naive-ui'
import { ChevronUp } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { loadData } from '@/services/dataService'

const osTheme = useOsTheme()
const themeMode = ref<'auto' | 'light' | 'dark'>('auto')
const drawerActive = ref(false)
const contentAreaRef = ref<HTMLElement | null>(null)
const showBackTop = ref(false)

function checkScroll() {
  const winScroll = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
  const contentScroll = contentAreaRef.value ? contentAreaRef.value.scrollTop : 0
  showBackTop.value = winScroll > 100 || contentScroll > 100
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
  document.body.scrollTo({ top: 0, behavior: 'smooth' })
  if (contentAreaRef.value) {
    contentAreaRef.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const activeTheme = computed(() => {
  if (themeMode.value === 'dark') return darkTheme
  if (themeMode.value === 'light') return null
  return osTheme.value === 'dark' ? darkTheme : null
})

function setTheme(mode: 'auto' | 'light' | 'dark') {
  themeMode.value = mode
  localStorage.setItem('fmhy_theme', mode)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('fmhy_theme') as 'auto' | 'light' | 'dark' | null
  if (savedTheme) {
    themeMode.value = savedTheme
  }
  loadData()

  window.addEventListener('scroll', checkScroll, { passive: true })
  document.addEventListener('scroll', checkScroll, { passive: true })
  if (contentAreaRef.value) {
    contentAreaRef.value.addEventListener('scroll', checkScroll, { passive: true })
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
  document.removeEventListener('scroll', checkScroll)
  contentAreaRef.value?.removeEventListener('scroll', checkScroll)
})
</script>

<style>
/* 全局基础样式与字体适配 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  overflow-x: hidden;
}
* {
  box-sizing: border-box;
}
</style>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-body {
  display: flex;
  flex: 1;
  width: 100%;
}
.desktop-sidebar {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid var(--n-border-color, rgba(0, 0, 0, 0.08));
  height: calc(100vh - 60px);
  position: sticky;
  top: 60px;
  overflow-y: auto;
}
.content-area {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}
.content-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 20px;
}

@media (max-width: 900px) {
  .desktop-sidebar {
    display: none;
  }
  .content-wrapper {
    padding: 16px 14px;
  }
}

.global-back-top {
  position: fixed;
  right: 40px;
  bottom: 50px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--n-color-modal, #ffffff);
  color: var(--n-text-color, #1f2937);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
  border: 1px solid var(--n-border-color, rgba(0, 0, 0, 0.12));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 99999;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.global-back-top:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
  color: #3b82f6;
  border-color: #3b82f6;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.9);
}
</style>
