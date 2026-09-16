<template>
  <div class="sync-page">
    <div class="sync-header">
      <h1 class="page-title">⚙️ 自动同步与数据更新</h1>
      <p class="page-desc">
        通过 GitHub Actions 定时从官方社区自动爬取最新数据，无需服务器即可保持数据实时更新。
      </p>
    </div>

    <!-- 运行状态看板 -->
    <div class="status-grid">
      <n-card title="当前数据同步状态" size="small">
        <template #header-extra>
          <n-tag :type="syncStatus.status === 'success' ? 'success' : 'info'" round size="small">
            {{ syncStatus.status === 'success' ? '● 数据正常' : '● 就绪' }}
          </n-tag>
        </template>
        <div class="status-content">
          <div class="status-item">
            <span class="label">上次同步时间：</span>
            <span class="value">{{ syncStatus.lastSyncTime }}</span>
          </div>
          <div class="status-item">
            <span class="label">官方源仓库：</span>
            <a :href="syncStatus.sourceRepo" target="_blank" class="link">
              fmhy/edit (GitHub)
            </a>
          </div>
          <div class="status-item">
            <span class="label">已处理分类总数：</span>
            <span class="value">{{ syncStatus.totalCategories }} 个板块</span>
          </div>
          <div class="status-item">
            <span class="label">已本地化条目数：</span>
            <span class="value">{{ syncStatus.totalItems }} 项</span>
          </div>
          <div class="status-item">
            <span class="label">状态信息：</span>
            <span class="value">{{ syncStatus.message }}</span>
          </div>
        </div>
      </n-card>

      <n-card title="GitHub Actions 自动同步" size="small">
        <div class="actions-desc">
          数据通过 GitHub Actions 每天自动更新，无需手动操作：
        </div>
        <div class="actions-features">
          <div class="feature-item">
            <n-tag type="success" size="small" round>自动</n-tag>
            <span>每天北京时间 08:00 自动执行爬取</span>
          </div>
          <div class="feature-item">
            <n-tag type="info" size="small" round>增量</n-tag>
            <span>仅在数据有变化时才提交更新</span>
          </div>
          <div class="feature-item">
            <n-tag type="warning" size="small" round>部署</n-tag>
            <span>更新后自动构建并部署到 GitHub Pages</span>
          </div>
        </div>
        <div class="actions-btns">
          <n-button
            type="primary"
            size="small"
            tag="a"
            href="https://github.com/hooksvue/fmhy/actions"
            target="_blank"
          >
            打开 GitHub Actions 面板
          </n-button>
          <n-button size="small" @click="handleCopyWorkflow">
            复制 Workflow 配置路径
          </n-button>
        </div>
      </n-card>
    </div>

    <!-- 架构流程 -->
    <n-card title="🔍 自动化同步架构" size="small">
      <n-timeline>
        <n-timeline-item
          type="success"
          title="① GitHub Actions 定时触发"
          content="每天自动运行，也可在 Actions 页面手动点击 Run workflow 立即触发。"
          time="每日 08:00 北京时间"
        />
        <n-timeline-item
          type="info"
          title="② 克隆 FMHY 官方仓库"
          content="从 fmhy/edit 仓库直接拉取 Markdown 源文件，彻底避开 Cloudflare 反爬验证。"
          time="稳定极速"
        />
        <n-timeline-item
          type="warning"
          title="③ 智能解析与中文翻译"
          content="解析器精确识别链接、标签和描述，生成结构化 JSON。翻译引擎将英文描述转为流畅中文。"
          time="增量缓存"
        />
        <n-timeline-item
          type="info"
          title="④ 自动提交与部署"
          content="解析后的数据自动提交到仓库，触发 GitHub Pages 重新部署，站点数据即刻更新。"
          time="自动部署"
        />
      </n-timeline>
    </n-card>

    <!-- 本地开发说明 -->
    <n-card title="💻 本地开发手动同步" size="small">
      <p style="margin-top: 0;">开发环境下，可以通过命令行手动触发数据同步：</p>
      <div class="code-block">
        <code># 1. 先克隆 FMHY 源仓库
git clone --depth 1 https://github.com/fmhy/edit.git /tmp/fmhy_repo

# 2. 执行数据爬取
pnpm sync</code>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { syncStatus } from '@/services/dataService'

const message = useMessage()

function handleCopyWorkflow() {
  navigator.clipboard.writeText('.github/workflows/sync-and-deploy.yml').then(() => {
    message.success('已复制路径！可在该文件中修改定时频率和同步逻辑。')
  })
}
</script>

<style scoped>
.sync-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 50px;
}
.sync-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.page-desc {
  font-size: 14px;
  color: var(--n-text-color-3, #888);
  margin: 0;
}
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 16px;
}
.status-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 13.5px;
}
.status-item {
  display: flex;
  justify-content: space-between;
}
.status-item .label {
  color: var(--n-text-color-3, #888);
}
.status-item .value {
  font-weight: 500;
}
.status-item .link {
  color: #3b82f6;
  text-decoration: none;
}
.status-item .link:hover {
  text-decoration: underline;
}
.actions-desc {
  font-size: 13px;
  color: var(--n-text-color-2, #666);
  margin-bottom: 12px;
}
.actions-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.actions-btns {
  display: flex;
  gap: 10px;
}
.code-block {
  background: var(--n-color-embedded, #18181c);
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  font-size: 12.5px;
  color: #38bdf8;
  margin: 8px 0;
  white-space: pre;
}
</style>
