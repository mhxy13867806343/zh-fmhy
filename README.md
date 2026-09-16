# FMHY 中文精选导航与自动化同步系统 (FMHY-CN)

互联网上最庞大的数字生活与免费资源索引库（FreeMediaHeckYeah）的**中文本地化、自动化同步与个人高能导航平台**。

基于 Vue 3 + Vite 5 构建，纯静态客户端架构，零服务端依赖，支持一键部署至 GitHub Pages。

[![GitHub license](https://img.shields.io/github/license/mhxy13867806343/zh-fmhy)](https://github.com/mhxy13867806343/zh-fmhy)
[![GitHub stars](https://img.shields.io/github/stars/mhxy13867806343/zh-fmhy)](https://github.com/mhxy13867806343/zh-fmhy)
[![GitHub forks](https://img.shields.io/github/forks/mhxy13867806343/zh-fmhy)](https://github.com/mhxy13867806343/zh-fmhy)

---

## 🌟 核心功能特性

### 1. 互联网免费资源全景导航
- **11 大主流核心分类**：涵盖影视流媒体、人工智能、广告拦截与隐私、音乐与播客、游戏与模拟器、图书与漫画、网盘与直链、BT 种子与磁力、网络工具、系统与桌面工具、学术公开课。
- **轻量分片懒加载**：首屏仅加载 3KB 分类元数据，进入专区时按需动态拉取对应分类 JSON，极速首屏体验。
- **双语全文模糊搜索**：内置分词检索，支持中英文、网址、描述多字段毫秒级匹配；搜索结果**全量分页展示**（解除原 100 条硬编码限制，支持自定义每页 12/24/48/96 条与快速跳页）。
- **独立搜索历史**：支持全局搜索与分分类专区独立的搜索历史标签，一键快速复用与单项/全量清空。

### 2. 常用自选与私藏资源专区 (`/custom`)
- **免重新打包，热插拔式维护**：数据源位于 `public/data/custom/` 目录。
- **极简扩展（如 `a.json`）**：
  - 想要新增、修改或删除资源？直接在 `public/data/custom/` 目录下添加或编辑任何 `.json` 文件（如 `a.json`、`custom_links.json`）。
  - **无需每次重新构建发布**，前端内置目录智能扫描器与数据归一化器，自动识别并合并所有分类与网址。
  - 支持标准分组数组、单一分类、平铺单项或键值字典等多种宽松格式。
- **左侧侧边栏 ↔ 右侧主视图双向高亮联动**：
  - 左侧点击分类（如“游戏”、“订阅”、“搜索”），右侧分类胶囊与内容区实时对应高亮过滤；
  - 右侧点击分类胶囊，URL 与左侧菜单项同步高亮显示激活指示器。

### 3. GitHub 开源作品与星标宝藏库 (`/repos` & `/stars`)
- **开源作品库 (`/repos`)**：自动调取个人公开 GitHub 仓库，提供语言标签筛选（Vue、JavaScript、TypeScript、Python、Rust 等）、Star/Fork 统计及多维排序。
- **星标宝藏库 (`/stars`)**：精选个人加星收藏的 100+ 个高质量开源框架与神级工具，支持按语言分类、Star 数量降序排布与即时搜索。
- **侧边栏大卡展开交互**：侧边栏提供快速折叠列表与直达大卡展开按钮（`[ ↗ 在主页展开 ]`）。

### 4. FMHY 官方生态全景与多端社交分享 (`/links`)
- **官方矩阵收录**：集成 FMHY 官方站 (`fmhy.net`)、官方术语表 (`Glossary`)、底层文档仓库 (`fmhy/edit`)、本项目开源地址及 Reddit / Discord 社区入口。
- **11 大官方生态系统工具**：包括 Search、SafeGuard 浏览器插件、SearXNG 私密搜索、Startpage 极简起始页、Site Hunting 寻宝指南、SFW 纯净版、自建云教程等。
- **多平台社交分享**：集成 `social-share.js`，一键生成带有站名和简介的分享链接至微信（二维码）、QQ、微博、Twitter、Facebook 等。

### 5. 纯静态安全与持久化存储
- **零后端依赖**：站点不部署任何中心数据库，用户收藏夹与搜索记录安全保存在本地浏览器 `localStorage` 中。
- **数据刷新智能防护**：导航栏一键刷新按钮配有二次确认提示框与 30 秒防刷冷却倒计时。

---

## 🛠️ 技术栈

| 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端框架** | Vue 3.5 + TypeScript | 采用 Composition API 与 `<script setup>` |
| **构建工具** | Vite 5 | 配备自定义 JSON 目录监控与 HMR 插件 |
| **组件库** | Naive UI | 高品质轻量组件库，深度定制主题色彩 |
| **图标库** | Lucide Vue Next | 现代矢量线性图标 |
| **路由管理** | Vue Router 4 | HTML5 History 路由，支持 Base 路径适配 |
| **部署托管** | GitHub Pages + GitHub Actions | 自动化 CI/CD 静态部署 |

---

## 🚀 极速上手

### 1. 克隆代码并安装依赖
```bash
git clone https://github.com/mhxy13867806343/zh-fmhy.git
cd zh-fmhy
pnpm install
```

### 2. 启动本地开发服务
```bash
pnpm dev
```
启动后访问 `http://localhost:5173/` 即可。

### 3. 生产打包
```bash
pnpm build
```
打包输出目录为 `dist/`，可直接部署在任何静态托管服务器或 GitHub Pages。

---

## 📂 自定义自选资源配置指南 (How to Add Custom Links)

站点支持无需重新编译代码，直接通过静态 JSON 文件管理自选网址：

### 目录位置
```
public/data/custom/
├── index.json          # 文件索引清单（本地开发/打包时插件会自动维护）
├── custom_links.json   # 默认内置常用导航（音效、游戏、AI、订阅、搜索等）
└── a.json              # 您可以随时新建的文件！
```

### 文件格式示例 (`a.json`)
新建一个 `public/data/custom/a.json`，内容可以为：
```json
[
  {
    "category": "实用开发",
    "categoryEn": "Dev Tools",
    "icon": "Code2",
    "color": "#3b82f6",
    "items": [
      {
        "title": "GitHub",
        "url": "https://github.com",
        "desc": "全球最大的开源代码托管平台与开发者社区",
        "tags": ["代码托管", "Git", "开源"]
      }
    ]
  }
]
```
或者甚至更简单，直接写入平铺单项：
```json
[
  {
    "title": "爱给网音效",
    "url": "https://www.aigei.com/sound/class/",
    "category": "音效",
    "desc": "海量免费游戏音效与配乐素材下载"
  }
]
```
保存后，页面会自动重载并展现您的专属分类卡片！

---

## 📜 开源协议与免责声明

1. **非盈利公益**：本项目为中文本地化公益索引导航，不托管、不存储任何文件实体与多媒体内容，所有数据直链跳转至原社区官方推荐页面。
2. **版权归属**：原始英文索引数据归 [FreeMediaHeckYeah (FMHY)](https://github.com/fmhy) 国际社区所有。
3. **开源许可**：本项目基于 [MIT License](LICENSE) 开放源码。
