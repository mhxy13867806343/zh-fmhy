<template>
  <!-- 全局居中模态弹窗：检测到文件或数据更新时提示用户 -->
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    type="warning"
    title="📢 检测到文件与数据已有更新"
    positive-text="立即刷新"
    negative-text="稍后再说"
    :mask-closable="false"
    :closable="true"
    :loading="isRefreshing"
    @positive-click="handleConfirmUpdate"
    @negative-click="handleCancel"
    @close="handleCancel"
  >
    <div class="update-modal-content">
      <p class="update-summary">
        系统检测到网站有最新内容或代码已发布更新：
      </p>

      <div class="update-reason-card">
        <div class="reason-header">
          <span class="reason-icon">💡</span>
          <span class="reason-title">更新详情</span>
        </div>
        <div class="reason-desc">
          {{ updateReasonText || '自选导航链接或全站数据已同步更新' }}
        </div>
      </div>

      <p class="update-guide">
        点击“<strong>立即刷新</strong>”将重新载入并展示最新数据；如需稍后查看可点击“稍后再说”。
      </p>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NModal } from 'naive-ui'

const route = useRoute()

// 模态弹窗控制状态
const showModal = ref(false)
const updateReasonText = ref('')
const isRefreshing = ref(false)

// 缓存指纹与冷却控制
let lastVersionHash = ''
let lastCustomLinksHash = ''
let lastCustomIndexHash = ''
let isChecking = false
let checkTimer: any = null
let snoozeUntil = 0 // “稍后再说”冷却截止时间戳

/**
 * 极简高效字符串哈希函数
 */
function computeHash(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) - hash) + content.charCodeAt(i)
    hash |= 0
  }
  return `${hash}_${content.length}`
}

/**
 * 获取请求的基础路径
 */
function getBaseUrl(): string {
  return import.meta.env.BASE_URL.replace(/\/+$/, '') + '/'
}

/**
 * 核心：检查远端数据与部署版本是否有更新
 */
async function checkForUpdates(force = false) {
  // 如果已处于弹窗状态、或正在检测中、或处于稍后再说冷却期（除非强制触发）
  if (showModal.value || isChecking) return
  if (!force && Date.now() < snoozeUntil) return

  isChecking = true
  const baseUrl = getBaseUrl()
  const t = Date.now()

  let hasUpdate = false
  let detectedReason = ''

  try {
    // 1. 检查 custom_links.json（自选链接内容）
    try {
      const linksRes = await fetch(`${baseUrl}data/custom/custom_links.json?_t=${t}`, {
        cache: 'no-store'
      })
      if (linksRes.ok) {
        const text = (await linksRes.text()).trim()
        const hash = computeHash(text)
        if (!lastCustomLinksHash) {
          lastCustomLinksHash = hash
        } else if (lastCustomLinksHash !== hash) {
          hasUpdate = true
          detectedReason = '自选导航链接数据（custom_links.json）已更新'
          lastCustomLinksHash = hash
        }
      }
    } catch {}

    // 2. 检查 index.json（新增或删除了自定义数据文件）
    if (!hasUpdate) {
      try {
        const idxRes = await fetch(`${baseUrl}data/custom/index.json?_t=${t}`, {
          cache: 'no-store'
        })
        if (idxRes.ok) {
          const text = (await idxRes.text()).trim()
          const hash = computeHash(text)
          if (!lastCustomIndexHash) {
            lastCustomIndexHash = hash
          } else if (lastCustomIndexHash !== hash) {
            hasUpdate = true
            detectedReason = '自定义资源文件清单（index.json）已更新'
            lastCustomIndexHash = hash
          }
        }
      } catch {}
    }

    // 3. 检查 version.json（全站代码与静态构建部署戳）
    if (!hasUpdate) {
      try {
        const verRes = await fetch(`${baseUrl}version.json?_t=${t}`, {
          cache: 'no-store'
        })
        if (verRes.ok) {
          const verData = await verRes.json()
          const remoteTime = Number(verData.buildTime) || 0
          const clientTime = typeof __APP_BUILD_TIME__ !== 'undefined' ? Number(__APP_BUILD_TIME__) : 0

          // 如果远端构建时间大于当前客户端的编译时间，说明有全新版本部署
          if (remoteTime && clientTime && remoteTime > clientTime) {
            hasUpdate = true
            detectedReason = `全站功能与代码已发布新构建（${verData.date || '最新版本'}）`
          } else {
            const hash = computeHash(JSON.stringify(verData))
            if (!lastVersionHash) {
              lastVersionHash = hash
            } else if (lastVersionHash !== hash) {
              hasUpdate = true
              detectedReason = '全站功能与资源数据已发布新构建'
              lastVersionHash = hash
            }
          }
        }
      } catch {}
    }

    // 若检测到更新，立即弹出居中全局弹窗
    if (hasUpdate) {
      updateReasonText.value = detectedReason
      showModal.value = true
    }
  } finally {
    isChecking = false
  }
}

/**
 * 用户点击“立即刷新”
 */
function handleConfirmUpdate() {
  isRefreshing.value = true
  // 强制全量重载，清除浏览器缓存
  window.location.reload()
}

/**
 * 用户点击“稍后再说”或关闭
 */
function handleCancel() {
  showModal.value = false
  // 5 分钟内静默，不重复打扰
  snoozeUntil = Date.now() + 5 * 60 * 1000
}

// 页面可见性改变（如在其他标签或GitHub修改后切回网页）
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    checkForUpdates()
  }
}

// 路由切换时静默检测一次
watch(() => route.fullPath, () => {
  checkForUpdates()
})

onMounted(() => {
  // 页面初次加载，先初始化当前指纹基准
  checkForUpdates(true)

  // 每 15 秒轮询检测一次（高灵敏度响应远端变动）
  checkTimer = setInterval(() => {
    checkForUpdates()
  }, 15 * 1000)

  // 监听标签切回与窗口获得焦点事件
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', () => checkForUpdates())

  // 暴露到 window 供开发者或控制台直接测试调试
  if (typeof window !== 'undefined') {
    ;(window as any).__checkUpdate = () => checkForUpdates(true)
    ;(window as any).__triggerUpdateModal = (msg?: string) => {
      updateReasonText.value = msg || '测试：检测到自选文件与全站数据已有更新'
      showModal.value = true
    }
  }
})

onUnmounted(() => {
  if (checkTimer) clearInterval(checkTimer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', () => checkForUpdates())
})
</script>

<style scoped>
.update-modal-content {
  padding: 8px 0;
  line-height: 1.6;
}

.update-summary {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
}

.update-reason-card {
  background: rgba(240, 160, 32, 0.1);
  border: 1px solid rgba(240, 160, 32, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 12px;
}

.reason-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #f0a020;
  margin-bottom: 4px;
}

.reason-desc {
  font-size: 13px;
  opacity: 0.9;
}

.update-guide {
  margin: 0;
  font-size: 12px;
  opacity: 0.75;
}
</style>
