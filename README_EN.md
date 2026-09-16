# FreeMediaHeckYeah Chinese Edition (FMHY-CN)

[中文文档](README.md) | [English Documentation](README_EN.md)

A modern, fast, localized Chinese web portal and personal power navigation platform for **FreeMediaHeckYeah (FMHY)** — the largest digital media and free internet resources index.

Built with Vue 3 + Vite 5, pure client-side static architecture, zero server dependencies, and automated GitHub Pages CI/CD deployment.

---

### 🌐 Live Demo & Preview
👉 **Live URL: [https://mhxy13867806343.github.io/zh-fmhy/](https://mhxy13867806343.github.io/zh-fmhy/)**

[![GitHub license](https://img.shields.io/github/license/mhxy13867806343/zh-fmhy)](https://github.com/mhxy13867806343/zh-fmhy)
[![GitHub stars](https://img.shields.io/github/stars/mhxy13867806343/zh-fmhy)](https://github.com/mhxy13867806343/zh-fmhy)
[![GitHub forks](https://img.shields.io/github/forks/mhxy13867806343/zh-fmhy)](https://github.com/mhxy13867806343/zh-fmhy)
[![GitHub Pages Deploy](https://github.com/mhxy13867806343/zh-fmhy/actions/workflows/deploy.yml/badge.svg)](https://github.com/mhxy13867806343/zh-fmhy/actions/workflows/deploy.yml)

---

## 🌟 Key Features

### 1. Complete Free Internet Resources Index
- **11 Major Core Categories**: Video Streaming, AI & LLM Tools, Adblocking & Privacy, Music & Podcasts, Gaming & Emulators, Books & Manga, Cloud Storage & Direct Download, Torrents & Magnets, Web Utilities, System & Desktop Tools, Educational & Academic courses.
- **Lazy-loaded Chunking**: Loads a tiny 3KB metadata file on first visit; full category datasets are fetched lazily on demand.
- **Bilingual Fuzzy Search with Full Pagination**: Sub-millisecond instant matching across titles, URLs, tags, and descriptions. Includes pagination (12, 24, 48, 96 items/page) without any hard item limits.
- **Independent Search History**: Distinct history caches for global search and per-category searches, with one-click re-query and clearing.
- **Naive UI BackTop**: Built-in smooth back-to-top floating button responsive to page scroll depth.

### 2. Custom Hot-pluggable Navigation (`/custom`)
- **No Rebuild Required**: Powered dynamically by JSON files inside `public/data/custom/`.
- **Drop-in Flexibility (e.g. `a.json`)**:
  - Add, modify, or remove links simply by creating or editing any `.json` file (e.g. `a.json`, `custom_links.json`).
  - The built-in scanner and normalizer merges categories, handles loose formats, and hot-reloads instantly.
- **Bidirectional Active Highlighting**:
  - Clicking a category in the sidebar highlights the matching tag pill and filters the cards in the main area.
  - Clicking a tag pill in the main view synchronizes with the URL query and highlights the sidebar category.

### 3. Personal GitHub Repositories & Starred Repos (`/repos` & `/stars`)
- **Open-source Projects (`/repos`)**: Directly fetches public repositories from GitHub API with language filtering (Vue, TS, JS, Python, Rust, etc.), star counts, and multiple sorting criteria.
- **Starred Gems (`/stars`)**: Curated showcase of 100+ high-value open-source frameworks and tools with tags, stars, and direct links.
- **Sidebar Expand Interaction**: Collapsible sidebar sections with a prominent `[ ↗ Open in Main View ]` action button.

### 4. Official FMHY Ecosystem & Social Sharing (`/links`)
- **Official FMHY Integration**: Direct access to FMHY Official Site (`fmhy.net`), Glossary, original edit repository (`fmhy/edit`), project source, and Reddit/Discord communities.
- **11 Ecosystem Modules**: Search, SafeGuard browser extension, SearXNG private search, Startpage, Site Hunting guide, SFW version, self-hosting guide, etc.
- **Multi-platform Social Sharing**: Integrated with `social-share.js` for instant sharing to WeChat (QR code), QQ, Weibo, Twitter/X, Facebook, and more.

### 5. Pure Static Security & Local Persistence
- **100% Client-side**: No external database; bookmarks and search histories are stored safely in the user's browser `localStorage`.
- **Anti-abuse Cooldown**: Navbar manual sync button includes confirmation dialogs and a 30-second cooldown timer.

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | Vue 3.5 + TypeScript | Composition API with `<script setup>` |
| **Build Tool** | Vite 5 | Custom JSON directory watcher & HMR plugin |
| **Component Library** | Naive UI | Lightweight UI (BackTop, Tag, Card, Dialog, etc.) |
| **Icon Set** | Lucide Vue Next | Modern vector linear icons |
| **Routing** | Vue Router 4 | HTML5 History mode with base URL resolution |
| **Deployment** | GitHub Pages + GitHub Actions | Automated CI/CD deployment on push |

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/mhxy13867806343/zh-fmhy.git
cd zh-fmhy
pnpm install
```

### 2. Start Dev Server
```bash
pnpm dev
```
Open `http://localhost:5173/` in your browser.

### 3. Build for Production
```bash
pnpm build
```
Production assets are generated in `dist/`, ready for any static hosting or GitHub Pages.

---

## 📂 Custom JSON Configuration Guide

Manage personal bookmarks without rebuilding the code:

### File Directory
```
public/data/custom/
├── index.json          # File registry manifest (auto-maintained by Vite plugin)
├── custom_links.json   # Default collection (Sound, Gaming, AI, Subscriptions, Search, etc.)
└── a.json              # Add your own new JSON file anytime!
```

### JSON Format Example (`a.json`)
Create `public/data/custom/a.json`:
```json
[
  {
    "category": "Developer Tools",
    "categoryEn": "Dev Tools",
    "icon": "Code2",
    "color": "#3b82f6",
    "items": [
      {
        "title": "GitHub",
        "url": "https://github.com",
        "desc": "The largest code hosting and open-source collaboration platform",
        "tags": ["Git", "Open Source", "Code"]
      }
    ]
  }
]
```
Or simply use a flat list:
```json
[
  {
    "title": "Aigei Sound Effects",
    "url": "https://www.aigei.com/sound/class/",
    "category": "Sound Effects",
    "desc": "Massive free sound effects and background audio for game development"
  }
]
```
Save the file, and the navigation page will immediately reflect your new categorized cards!

---

## 📜 License & Disclaimer

1. **Non-profit**: This project is an open-source, non-profit localized directory. It does not host or store any media or proprietary files; all links redirect directly to community-recommended resources.
2. **Attribution**: Original English data belongs to the [FreeMediaHeckYeah (FMHY)](https://github.com/fmhy) community.
3. **License**: Released under the [MIT License](LICENSE).
