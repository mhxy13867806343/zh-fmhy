<template>
  <div class="bookmarks-page">
    <div class="bookmarks-header">
      <div>
        <h1 class="page-title">❤️ 我的收藏夹</h1>
        <p class="page-desc">保存在本地浏览器的常用网站与工具，随时快捷调取。</p>
      </div>

      <div v-if="bookmarkedItems.length" class="header-actions">
        <n-button size="small" quaternary type="error" @click="handleClear">
          清空收藏
        </n-button>
        <n-button size="small" type="primary" @click="handleExport">
          导出书签 (JSON)
        </n-button>
      </div>
    </div>

    <div v-if="bookmarkedItems.length" class="resource-grid">
      <ResourceCard
        v-for="item in bookmarkedItems"
        :key="item.id"
        :item="item"
      />
    </div>

    <n-empty
      v-else
      description="暂无收藏任何资源，快去分类列表点击心形图标添加吧！"
      size="large"
      style="padding: 80px 0;"
    >
      <template #extra>
        <n-button type="primary" @click="router.push('/')">去浏览精选资源</n-button>
      </template>
    </n-empty>
  </div>
</template>

<script setup lang="ts">
import ResourceCard from '@/components/ResourceCard.vue'
import { bookmarkedItems, clearAllBookmarks } from '@/services/dataService'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

function handleClear() {
  dialog.warning({
    title: '确认清空',
    content: '确定要清空全部已收藏的网址吗？',
    positiveText: '确认清空',
    negativeText: '取消',
    onPositiveClick: () => {
      clearAllBookmarks()
      message.success('已清空全部收藏')
    }
  })
}

function handleExport() {
  const data = JSON.stringify(bookmarkedItems.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fmhy_bookmarks_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  message.success('书签导出成功！')
}
</script>

<style scoped>
.bookmarks-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 50px;
}
.bookmarks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--n-border-color, rgba(0, 0, 0, 0.08));
  padding-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.page-desc {
  font-size: 14px;
  color: var(--n-text-color-3, #888);
  margin: 4px 0 0;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .resource-grid {
    grid-template-columns: 1fr;
  }
}
</style>
