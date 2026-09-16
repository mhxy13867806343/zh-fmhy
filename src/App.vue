<template>
  <n-config-provider :theme="activeTheme">
    <n-global-style />
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
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
                  <!-- 返回顶部 (Naive UI BackTop) -->
                  <n-back-top :visibility-height="100" :bottom="40" :right="40" style="z-index: 9999;" />
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
import { useOsTheme, darkTheme } from 'naive-ui'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { loadData } from '@/services/dataService'

const osTheme = useOsTheme()
const themeMode = ref<'auto' | 'light' | 'dark'>('auto')
const drawerActive = ref(false)
const contentAreaRef = ref<HTMLElement | null>(null)
const targetScrollEl = () => contentAreaRef.value

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
</style>
