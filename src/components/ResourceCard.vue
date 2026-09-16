<template>
  <n-card
    class="resource-card"
    hoverable
    :bordered="true"
    size="small"
  >
    <template #header>
      <div class="card-header">
        <div class="title-group">
          <span class="title-main">{{ item.title }}</span>
          <span v-if="item.titleEn && item.titleEn !== item.title" class="title-en">
            {{ item.titleEn }}
          </span>
        </div>
        <div class="badges">
          <n-tag v-if="item.badge === 'starred'" type="warning" size="small" round>
            ⭐ 精选
          </n-tag>
          <n-tag v-else-if="item.badge === 'popular'" type="info" size="small" round>
            🔥 热门
          </n-tag>
          <n-tag v-else-if="item.badge === 'tool'" type="success" size="small" round>
            🛠 工具
          </n-tag>
        </div>
      </div>
    </template>

    <div class="card-body">
      <p class="description">{{ item.description }}</p>
      <p v-if="showEn && item.descriptionEn" class="description-en">
        {{ item.descriptionEn }}
      </p>

      <div v-if="item.tags && item.tags.length" class="tags-row">
        <n-tag
          v-for="tag in item.tags"
          :key="tag"
          size="tiny"
          :bordered="false"
          type="default"
        >
          #{{ tag }}
        </n-tag>
      </div>
    </div>

    <template #action>
      <div class="card-footer">
        <div class="footer-left">
          <n-button
            quaternary
            circle
            size="small"
            :type="isStarred ? 'error' : 'default'"
            @click="handleBookmark"
            :title="isStarred ? '取消收藏' : '加入收藏'"
          >
            <template #icon>
              <Heart :fill="isStarred ? 'currentColor' : 'none'" :size="16" />
            </template>
          </n-button>
          <n-button
            quaternary
            circle
            size="small"
            @click="handleCopy"
            title="复制网址"
          >
            <template #icon>
              <Copy :size="16" />
            </template>
          </n-button>
          <n-button
            v-if="item.descriptionEn"
            quaternary
            size="tiny"
            @click="showEn = !showEn"
            title="切换英文对照"
          >
            {{ showEn ? '隐英文' : '译文对照' }}
          </n-button>
        </div>
        <n-button
          type="primary"
          size="small"
          tag="a"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <template #icon>
            <ExternalLink :size="15" />
          </template>
          访问直达
        </n-button>
      </div>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { Heart, Copy, ExternalLink } from 'lucide-vue-next'
import type { ResourceItem } from '@/types'
import { toggleBookmark, isBookmarked } from '@/services/dataService'

const props = defineProps<{
  item: ResourceItem
}>()

const message = useMessage()
const showEn = ref(false)

const isStarred = computed(() => isBookmarked(props.item.id))

function handleBookmark() {
  toggleBookmark(props.item)
  if (isStarred.value) {
    message.success(`已收藏：${props.item.title}`)
  } else {
    message.info(`已取消收藏：${props.item.title}`)
  }
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.item.url)
    message.success('已复制链接到剪贴板')
  } catch {
    message.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.resource-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 10px;
}
.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.title-main {
  font-weight: 600;
  font-size: 15px;
  line-height: 1.3;
}
.title-en {
  font-size: 11px;
  color: var(--n-text-color-3, #999);
}
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.description {
  font-size: 13px;
  line-height: 1.5;
  color: var(--n-text-color-2, #555);
  margin: 0;
}
.description-en {
  font-size: 12px;
  color: var(--n-text-color-3, #888);
  font-style: italic;
  padding: 4px 8px;
  background-color: var(--n-color-embedded, rgba(0, 0, 0, 0.03));
  border-radius: 4px;
  margin: 0;
}
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: auto;
  padding-top: 4px;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.footer-left {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
