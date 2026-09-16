<template>
  <div class="links-page">
    <div class="links-header">
      <h1 class="page-title">🌐 官方入口、生态系统与项目开源</h1>
      <p class="page-desc">
        汇总 FreeMediaHeckYeah (FMHY) 官方生态（Ecosystem）、术语表（Glossary）、底层数据源仓库以及本项目 GitHub 开源代码。
      </p>
    </div>

    <!-- 核心入口卡片网格 -->
    <div class="cards-grid">
      <!-- 1. FMHY 官方站 -->
      <n-card hoverable class="link-card official-site-card">
        <template #header>
          <div class="card-header-inner">
            <div class="header-icon-box site-icon">
              <Globe :size="24" />
            </div>
            <div class="header-titles">
              <span class="card-main-title">FMHY 官方网站</span>
              <span class="card-sub-title">fmhy.net (Official Website)</span>
            </div>
          </div>
        </template>
        <p class="card-desc">
          全球最大互联网免费数字资源聚合导航，每日由数十万国际社区极客共同更新维护，收录全网精选自由媒体与实用工具。
        </p>
        <div class="card-badges">
          <n-tag type="success" size="small" round>官方原版</n-tag>
          <n-tag type="info" size="small" round>英文原版</n-tag>
          <n-tag type="warning" size="small" round>每日更新</n-tag>
        </div>
        <template #action>
          <div class="card-action-bar">
            <span class="link-url-text">https://fmhy.net/</span>
            <n-button
              type="primary"
              size="small"
              tag="a"
              href="https://fmhy.net/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <template #icon><ExternalLink :size="14" /></template>
              访问官网
            </n-button>
          </div>
        </template>
      </n-card>

      <!-- 2. FMHY 官方术语表 -->
      <n-card hoverable class="link-card glossary-card">
        <template #header>
          <div class="card-header-inner">
            <div class="header-icon-box glossary-icon">
              <BookOpen :size="24" />
            </div>
            <div class="header-titles">
              <span class="card-main-title">📖 FMHY 官方术语表</span>
              <span class="card-sub-title">fmhy.net/glossary</span>
            </div>
          </div>
        </template>
        <p class="card-desc">
          官方权威编写的互联网专有名词与行话词典，涵盖 P2P、流媒体、BT、编码格式、网络协议及逆向技术缩写释义。
        </p>
        <div class="card-badges">
          <n-tag type="warning" size="small" round>专有名词释义</n-tag>
          <n-tag type="default" size="small" round>行话词典</n-tag>
          <n-tag type="info" size="small" round>权威科普</n-tag>
        </div>
        <template #action>
          <div class="card-action-bar">
            <span class="link-url-text">fmhy.net/glossary</span>
            <n-button
              type="warning"
              secondary
              size="small"
              tag="a"
              href="https://fmhy.net/glossary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <template #icon><ExternalLink :size="14" /></template>
              阅读术语表
            </n-button>
          </div>
        </template>
      </n-card>

      <!-- 3. FMHY 官方源仓库 -->
      <n-card hoverable class="link-card repo-card">
        <template #header>
          <div class="card-header-inner">
            <div class="header-icon-box repo-icon">
              <GitPullRequest :size="24" />
            </div>
            <div class="header-titles">
              <span class="card-main-title">FMHY 官方数据源仓库</span>
              <span class="card-sub-title">github.com/fmhy/edit</span>
            </div>
          </div>
        </template>
        <p class="card-desc">
          FMHY 网站的全部底层 Markdown 知识库仓库。任何人均可提交 Pull Request 推荐新工具或修正失效链接，本项目通过该仓库直连爬取数据。
        </p>
        <div class="card-badges">
          <n-tag type="primary" size="small" round>开源 Wiki</n-tag>
          <n-tag type="info" size="small" round>Markdown 源数据</n-tag>
          <n-tag type="default" size="small" round>社区协作</n-tag>
        </div>
        <template #action>
          <div class="card-action-bar">
            <span class="link-url-text">github.com/fmhy/edit</span>
            <n-button
              type="info"
              secondary
              size="small"
              tag="a"
              href="https://github.com/fmhy/edit"
              target="_blank"
              rel="noopener noreferrer"
            >
              <template #icon><Github :size="14" /></template>
              官方仓库
            </n-button>
          </div>
        </template>
      </n-card>

      <!-- 4. 本项目开源仓库 -->
      <n-card hoverable class="link-card project-card">
        <template #header>
          <div class="card-header-inner">
            <div class="header-icon-box project-icon">
              <Code2 :size="24" />
            </div>
            <div class="header-titles">
              <span class="card-main-title">本项目 GitHub 源码仓库</span>
              <span class="card-sub-title">github.com/mhxy13867806343/zh-fmhy</span>
            </div>
          </div>
        </template>
        <p class="card-desc">
          当前中文精选导航站点的完整开源代码，基于 Vue 3 + Vite 5 打造，包含轻量数据懒加载、双语模糊检索、社交分享及 GitHub Actions 自动部署。
        </p>
        <div class="card-badges">
          <n-tag type="success" size="small" round>Vue 3 + Vite 5</n-tag>
          <n-tag type="warning" size="small" round>全开源代码</n-tag>
          <n-tag type="info" size="small" round>GitHub Pages 部署</n-tag>
        </div>
        <template #action>
          <div class="card-action-bar">
            <span class="link-url-text">github.com/mhxy13867806343/zh-fmhy</span>
            <n-button
              type="primary"
              secondary
              size="small"
              tag="a"
              href="https://github.com/mhxy13867806343/zh-fmhy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <template #icon><Github :size="14" /></template>
              Star / Fork
            </n-button>
          </div>
        </template>
      </n-card>
    </div>

    <!-- 🌱 FMHY 官方生态系统 (Ecosystem) 完整矩阵 -->
    <div class="section-block">
      <div class="section-header-row">
        <h2 class="sub-title">🌱 FMHY 官方生态系统 (Ecosystem)</h2>
        <span class="sub-tip">点击即可直接调用或前往对应官方生态工具</span>
      </div>
      <div class="ecosystem-grid">
        <a
          v-for="eco in ecosystemItems"
          :key="eco.title"
          :href="eco.url"
          :target="eco.url.startsWith('http') ? '_blank' : '_self'"
          rel="noopener noreferrer"
          class="eco-item-card"
        >
          <div class="eco-emoji">{{ eco.emoji }}</div>
          <div class="eco-info">
            <div class="eco-name-row">
              <span class="eco-name">{{ eco.title }}</span>
              <ExternalLink v-if="eco.url.startsWith('http')" :size="12" class="eco-ext-icon" />
            </div>
            <div class="eco-desc">{{ eco.desc }}</div>
          </div>
        </a>
      </div>
    </div>

    <!-- 社区交流渠道 -->
    <div class="section-block">
      <h2 class="sub-title">💬 官方社群与交流频道</h2>
      <div class="community-grid">
        <a
          href="https://www.reddit.com/r/FREEMEDIAHECKYEAH/"
          target="_blank"
          rel="noopener noreferrer"
          class="community-box"
        >
          <div class="comm-left">
            <div class="comm-badge reddit">R</div>
            <div>
              <div class="comm-name">Reddit r/FREEMEDIAHECKYEAH</div>
              <div class="comm-desc">官方 Reddit 讨论区，数十万社区成员交流与分享新资源</div>
            </div>
          </div>
          <ExternalLink :size="16" class="comm-arrow" />
        </a>

        <a
          href="https://discord.gg/fmhy"
          target="_blank"
          rel="noopener noreferrer"
          class="community-box"
        >
          <div class="comm-left">
            <div class="comm-badge discord">D</div>
            <div>
              <div class="comm-name">Discord 官方社区</div>
              <div class="comm-desc">官方 Discord 服务器，实时求助、资源讨论与安全避坑</div>
            </div>
          </div>
          <ExternalLink :size="16" class="comm-arrow" />
        </a>
      </div>
    </div>

    <!-- 项目声明与说明 -->
    <n-card title="📜 开源与免责声明" size="small" class="notice-card">
      <n-ul>
        <n-li><strong>非盈利公益：</strong>本站点为非盈利中文本地化公益索引导航，不托管、不存储任何音视频及文件实体，所有资源均直链跳转至原社区官方推荐页面。</n-li>
        <n-li><strong>版权归属：</strong>原始数据内容归 <a href="https://github.com/fmhy" target="_blank" class="text-link">FMHY 社区</a> 所有。本项目遵从其开源分享规范。</n-li>
        <n-li><strong>纯静态安全：</strong>本站无任何后端数据库，不收集任何用户私人隐私数据，所有收藏记录及搜索历史均保存在用户本地浏览器。</n-li>
      </n-ul>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { Globe, BookOpen, GitPullRequest, Code2, Github, ExternalLink } from 'lucide-vue-next'

const ecosystemItems = [
  { emoji: '🌐', title: 'Search', desc: '全网双语模糊检索，毫秒级快速匹配', url: '/search' },
  { emoji: '❓', title: 'FAQs', desc: 'FMHY 官方新手答疑与常见防坑指南', url: 'https://fmhy.net/faqs' },
  { emoji: '🔖', title: 'Bookmarks', desc: '一键将精选站点保存至本地收藏夹', url: '/bookmarks' },
  { emoji: '✅', title: 'SafeGuard ↗', desc: '官方出品的浏览器恶意网站智能防护扩展', url: 'https://github.com/fmhy/SafeGuard' },
  { emoji: '🚀', title: 'Startpage', desc: 'FMHY 极简纯净上网起始页', url: 'https://start.fmhy.net/' },
  { emoji: '🔎', title: 'SearXNG ↗', desc: '官方搭建的无追踪私密元搜索引擎', url: 'https://search.fmhy.net/' },
  { emoji: '💡', title: 'Site Hunting ↗', desc: '挖掘与鉴别优质互联网免费站点的实战指南', url: 'https://fmhy.net/hunting' },
  { emoji: '😇', title: 'SFW FMHY ↗', desc: '工作环境友好的纯净资源过滤版本', url: 'https://sfw.fmhy.net/' },
  { emoji: '🏠', title: 'Selfhosting', desc: '私人私有云与自建开源服务器教程宝典', url: 'https://fmhy.net/selfhosting' },
  { emoji: '🏞️', title: 'Wallpapers', desc: '精选无水印 4K/8K 桌面与移动端壁纸', url: 'https://fmhy.net/wallpapers' },
  { emoji: '💙', title: 'Feedback', desc: '向官方提交站点反馈、纠错与改进建议', url: 'https://fmhy.net/feedback' }
]
</script>

<style scoped>
.links-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-bottom: 60px;
}
.links-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.page-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
}
.page-desc {
  font-size: 14.5px;
  color: var(--n-text-color-3, #888);
  margin: 0;
  line-height: 1.6;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}
.link-card {
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.link-card:hover {
  transform: translateY(-2px);
}
.card-header-inner {
  display: flex;
  align-items: center;
  gap: 14px;
}
.header-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.site-icon {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}
.glossary-icon {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}
.repo-icon {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
}
.project-icon {
  background: rgba(139, 92, 246, 0.12);
  color: #8b5cf6;
}
.header-titles {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}
.card-main-title {
  font-size: 16.5px;
  font-weight: 700;
}
.card-sub-title {
  font-size: 12px;
  color: var(--n-text-color-3, #999);
  font-family: 'Fira Code', monospace;
}
.card-desc {
  font-size: 13.5px;
  color: var(--n-text-color-2, #666);
  line-height: 1.6;
  margin: 0 0 16px;
  min-height: 44px;
}
.card-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.card-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.link-url-text {
  font-size: 12px;
  color: var(--n-text-color-3, #999);
  font-family: 'Fira Code', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.section-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.section-header-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}
.sub-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.sub-tip {
  font-size: 12.5px;
  color: var(--n-text-color-3, #888);
}
.ecosystem-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}
.eco-item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--n-border-color, rgba(0, 0, 0, 0.08));
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  background: var(--n-color, rgba(255, 255, 255, 0.6));
}
.eco-item-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}
.eco-emoji {
  font-size: 22px;
  flex-shrink: 0;
}
.eco-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.eco-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.eco-name {
  font-size: 14px;
  font-weight: 600;
}
.eco-ext-icon {
  color: var(--n-text-color-3, #aaa);
}
.eco-desc {
  font-size: 11.5px;
  color: var(--n-text-color-3, #888);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.community-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 14px;
}
.community-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid var(--n-border-color, rgba(0, 0, 0, 0.08));
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  background: var(--n-color, rgba(255, 255, 255, 0.6));
}
.community-box:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}
.comm-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.comm-badge {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  color: #fff;
  flex-shrink: 0;
}
.comm-badge.reddit {
  background: #ff4500;
}
.comm-badge.discord {
  background: #5865f2;
}
.comm-name {
  font-size: 14px;
  font-weight: 600;
}
.comm-desc {
  font-size: 12px;
  color: var(--n-text-color-3, #888);
  margin-top: 2px;
}
.comm-arrow {
  color: var(--n-text-color-3, #aaa);
}
.text-link {
  color: #3b82f6;
  text-decoration: none;
}
.text-link:hover {
  text-decoration: underline;
}
</style>
