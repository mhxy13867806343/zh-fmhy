# FMHY 中文自动化同步与导航系统 (FMHY-CN)

互联网上最庞大的数字生活与免费资源索引库（FreeMediaHeckYeah）的**中文本地化与自动化定时同步平台**。

## 技术栈规范

- **前端框架**：Vue 3.5.42 + TypeScript 7.0.2 + Vite 8.3.0
- **UI 组件库**：[Naive UI](https://www.naiveui.com/zh-CN/os-theme)
- **路由系统**：Vue Router 5.3.1（支持自动文件路由 `vue-router/auto-routes`，无需手写 routes 映射）
- **自动导入**：`unplugin-auto-import` + `unplugin-vue-components`（Vue、Router、Naive UI、Lucide 图标全自动按需导入）
- **主题与响应式**：原生支持深色模式 / 浅色模式 / 跟随系统（OS Theme），自适应桌面端与移动端侧边抽屉布局
- **后端同步管道**：Python 3 + SQLite 持久化缓存 + GitHub 官方 `fmhy/edit` 原始 Markdown 语法树解析与增量中文翻译

---

## 项目快速启动

### 1. 安装前端依赖
```bash
pnpm install
# 或者使用 npm
npm install
```

### 2. 启动开发服务器
```bash
pnpm dev
```
启动后在浏览器访问：`http://localhost:5173` 即可畅爽浏览。

### 3. 一键执行增量同步与中文翻译
```bash
pnpm sync
# 或者执行：python3 scripts/sync_fmhy.py
```

### 4. 生产打包
```bash
pnpm build
```

---

## 定时爬取与自动化配置 (macOS)

系统自带一键定时任务配置脚本，可设置每天在后台自动拉取社区最新更新：

```bash
# 赋予执行权限并安装 Crontab 定时任务（默认每天凌晨 04:00 执行）
./scripts/setup_cron.sh
```

如需查看或调整执行时间：
```bash
crontab -e
```
任务示例：
```cron
0 4 * * * cd /Users/hooksvue/Desktop/fmhy && python3 scripts/sync_fmhy.py >> /tmp/fmhy_sync.log 2>&1
```

---

## 核心功能特性

1. **GitHub 官方源直连**：绕过 Cloudflare 网页反爬验证与单页应用动态渲染延迟，直接解析社区最新发布的 Markdown 源码。
2. **语法安全翻译与持久化缓存**：
   - 保留原站真实 URL 与代码格式，杜绝翻译导致链接损坏。
   - 内置 SQLite 本地缓存库，已翻译条目毫秒级复用，增量更新极其轻快。
3. **极速双语检索**：支持对所有收录资源的中文标题、英文原名、中文说明、分类及标签进行毫秒级全文模糊搜索。
4. **一键直达与本地收藏**：提供一键复制网址、新窗口直达以及基于浏览器持久化的个人收藏夹功能。
