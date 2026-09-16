<template>
  <!-- 全局静默更新检测组件，不占用布局空间 -->
  <div class="update-notifier-root" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, h } from 'vue'
import { useNotification, useMessage, NButton, NSpace } from 'naive-ui'
import { loadCustomLinks } from '@/services/customLinksService'
import { loadData } from '@/services/dataService'

const notification = useNotification()
const message = useMessage()

// 记录当前版本与数据指纹
let lastCustomEtag = ''
let lastCustomModified = ''
let lastBuildVersion = ''
let isNotifying = false
let checkTimer: any = null
let snoozeUntil = 0

/**
 * 检查远端数据与版本是否有更新
 */
async function checkForUpdates() {
  // 如果处于稍后提醒的冷却期，跳过
  if (Date.now() < snoozeUntil || isNotifying) return

  const baseUrl = import.meta.env.BASE_URL.replace(/\/+$/, '') + '/'
  const t = Date.now()

  let hasUpdate = false
  let updateReason = ''

  // 1. 检查 custom_links.json 是否有修改
  try {
    const res = await fetch(`${baseUrl}data/custom/custom_links.json?_t=${t}`, {
      method: 'HEAD',
      cache: 'no-cache'
    })
    if (res.ok) {
      const etag = res.headers.get('etag') || ''
      const modified = res.headers.get('last-modified') || ''

      if (!lastCustomEtag && !lastCustomModified) {
        // 初次加载，记录基准值
        lastCustomEtag = etag
        lastCustomModified = modified
      } else if (
        (etag && lastCustomEtag && etag !== lastCustomEtag) ||
        (modified && lastCustomModified && modified !== lastCustomModified)
      ) {
        hasUpdate = true
        updateReason = '自选导航 JSON 文件（custom_links.json）'
        lastCustomEtag = etag
        lastCustomModified = modified
      }
    }
  } catch (e) {
    // 静默忽略网络异常
  }

  // 2. 检查站点部署构建版本 version.json 是否更新
  try {
    const verRes = await fetch(`${baseUrl}version.json?_t=${t}`, {
      cache: 'no-cache'
    })
    if (verRes.ok) {
      const verData = await verRes.json()
      const verKey = String(verData.buildTime || verData.version || '')
      if (!lastBuildVersion) {
        lastBuildVersion = verKey
      } else if (verKey && verKey !== lastBuildVersion) {
        hasUpdate = true
        updateReason = '全站功能与资源数据'
        lastBuildVersion = verKey
      }
    }
  } catch {}

  // 3. 触发全局更新提示弹窗
  if (hasUpdate) {
    promptUserForUpdate(updateReason)
  }
}

/**
 * 弹出更新提示框
 */
function promptUserForUpdate(reasonText: string) {
  if (isNotifying) return
  isNotifying = true

  const n = notification.warning({
    title: '📢 检测到文件与数据已有更新',
    description: `检测到 ${reasonText || '远端文件'} 已发布新修改，是否立即载入最新内容？`,
    content: '点击“立即更新”将无需重新访问即可极速拉取并同步展现最新网址与分类数据。',
    duration: 0, // 不自动关闭
    action: () =>
      h(NSpace, { justify: 'end', size: 'small' }, () => [
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            onClick: () => {
              n.destroy()
              isNotifying = false
              // 5分钟内不再打扰
              snoozeUntil = Date.now() + 5 * 60 * 1000
            }
          },
          { default: () => '稍后再说' }
        ),
        h(
          NButton,
          {
            type: 'primary',
            size: 'small',
            onClick: async () => {
              n.destroy()
              isNotifying = false
              try {
                // 重新静默加载最新数据并局部刷新
                await Promise.all([loadCustomLinks(true), loadData(true)])
                message.success('🎉 已成功同步并载入最新文件数据！')
              } catch {
                // 如果是全量构建差异，执行无损软重载
                window.location.reload()
              }
            }
          },
          { default: () => '立即更新' }
        )
      ]),
    onClose: () => {
      isNotifying = false
      snoozeUntil = Date.now() + 5 * 60 * 1000
    }
  })
}

// 页面可见性改变（如用户在 GitHub 修改代码后切回网页标签）时立即检测
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    checkForUpdates()
  }
}

onMounted(() => {
  // 首次启动先读取并锁定初次指纹
  checkForUpdates()

  // 每隔 45 秒静默检测一次
  checkTimer = setInterval(checkForUpdates, 45 * 1000)

  // 窗口重新聚焦或切回标签时即时触发
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', checkForUpdates)
})

onUnmounted(() => {
  if (checkTimer) clearInterval(checkTimer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', checkForUpdates)
})
</script>

<style scoped>
.update-notifier-root {
  display: none;
}
</style>
