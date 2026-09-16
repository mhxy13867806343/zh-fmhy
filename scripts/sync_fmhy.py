import os
import sys
import json
import time
import urllib.request
from datetime import datetime
from parser import parse_markdown_content

# 基础目录路径
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DATA_DIR = os.path.join(BASE_DIR, 'public', 'data')
os.makedirs(OUTPUT_DATA_DIR, exist_ok=True)

DATA_FILE = os.path.join(OUTPUT_DATA_DIR, 'fmhy_data.json')
STATUS_FILE = os.path.join(OUTPUT_DATA_DIR, 'sync_status.json')

# GitHub 官方开源 docs 目录
GITHUB_RAW_BASE = "https://raw.githubusercontent.com/fmhy/edit/main/docs"

# 同步目标配置
CATEGORY_CONFIGS = [
    {
        "id": "video",
        "file": "video.md",
        "title": "影视流媒体 (Streaming)",
        "titleEn": "Movies & TV & Anime",
        "icon": "Tv",
        "color": "#3b82f6",
        "description": "免费电影、电视剧、4K高码率影视、番剧动漫在线播放与聚合搜索站点。"
    },
    {
        "id": "ai",
        "file": "ai.md",
        "title": "人工智能 (Artificial Intelligence)",
        "titleEn": "AI & LLM Tools",
        "icon": "Bot",
        "color": "#8b5cf6",
        "description": "免费大语言模型、AI绘图、开源模型导航与提示词工程工具汇总。"
    },
    {
        "id": "privacy",
        "file": "privacy.md",
        "title": "广告拦截与隐私 (Adblocking & Privacy)",
        "titleEn": "Adblocking & Privacy",
        "icon": "Shield",
        "color": "#ef4444",
        "description": "全平台广告过滤、反追踪插件、私密 DNS、反指纹及安全浏览教程。"
    },
    {
        "id": "audio",
        "file": "audio.md",
        "title": "音乐与播客 (Listening)",
        "titleEn": "Music & Podcasts",
        "icon": "Music",
        "color": "#10b981",
        "description": "免费无损音乐试听与下载、Spotify/Apple Music 替代品及网络电台。"
    },
    {
        "id": "gaming",
        "file": "gaming.md",
        "title": "游戏与模拟器 (Gaming & Emulation)",
        "titleEn": "Gaming & Emulation",
        "icon": "Gamepad2",
        "color": "#06b6d4",
        "description": "开源模拟器、ROM 镜像、游戏汉化补丁、修改器及独立游戏推荐。"
    },
    {
        "id": "reading",
        "file": "reading.md",
        "title": "图书与漫画 (Reading)",
        "titleEn": "Books & Manga",
        "icon": "BookOpen",
        "color": "#f59e0b",
        "description": "海量电子书（EPUB/MOBI/PDF）、漫画、轻小说、科研学术论文免费下载检索。"
    },
    {
        "id": "downloading",
        "file": "downloading.md",
        "title": "网盘与直链下载 (Downloading)",
        "titleEn": "Direct Downloading",
        "icon": "Download",
        "color": "#eab308",
        "description": "各类网盘直链提取、免登录高速下载站、软件库与媒体打包资源。"
    },
    {
        "id": "torrenting",
        "file": "torrenting.md",
        "title": "BT 种子与磁力 (Torrenting)",
        "titleEn": "Torrents & Trackers",
        "icon": "Share2",
        "color": "#6366f1",
        "description": "BitTorrent 客户端、公共 Tracker 列表、磁力元搜索引擎与做种技巧。"
    },
    {
        "id": "tools",
        "file": "internet-tools.md",
        "title": "实用开发与系统工具 (Tools)",
        "titleEn": "Internet & System Tools",
        "icon": "Wrench",
        "color": "#14b8a6",
        "description": "格式转换、媒体压制、Base64解析、网络测速、临时邮箱与常用开发者工具。"
    },
    {
        "id": "educational",
        "file": "educational.md",
        "title": "教育与学术公开课 (Educational)",
        "titleEn": "Educational & Learning",
        "icon": "GraduationCap",
        "color": "#ec4899",
        "description": "全年龄学习指南、计算机科学课、语言学习及免费学术资料库。"
    }
]

def fetch_markdown(file_name: str) -> str:
    url = f"{GITHUB_RAW_BASE}/{file_name}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as res:
        return res.read().decode('utf-8', errors='ignore')

def run_sync():
    print("=" * 60)
    print("🚀 [FMHY CN] 开始执行官方 GitHub 文档同步与中文本地化...")
    print(f"⏰ 当前启动时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    categories_result = []
    total_items_count = 0

    for idx, cfg in enumerate(CATEGORY_CONFIGS, 1):
        cat_id = cfg["id"]
        file_name = cfg["file"]
        print(f"[{idx}/{len(CATEGORY_CONFIGS)}] 正在同步分类 [{cfg['title']}] ({file_name})...")

        try:
            raw_md = fetch_markdown(file_name)
            sections = parse_markdown_content(cat_id, raw_md)

            # 计算此分类下的条目总数
            cat_count = sum(len(s["items"]) for s in sections)
            total_items_count += cat_count

            categories_result.append({
                "id": cat_id,
                "title": cfg["title"],
                "titleEn": cfg["titleEn"],
                "icon": cfg["icon"],
                "color": cfg["color"],
                "description": cfg["description"],
                "itemCount": cat_count,
                "sections": sections
            })
            print(f"   ✓ 成功解析 {len(sections)} 个子专区，共 {cat_count} 个精选资源")
        except Exception as e:
            print(f"   ✗ 同步失败 [{file_name}]: {e}")

    # 写入数据文件
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(categories_result, f, ensure_ascii=False, indent=2)

    # 写入同步状态
    sync_status = {
        "lastSyncTime": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "totalCategories": len(categories_result),
        "totalItems": total_items_count,
        "sourceRepo": "https://github.com/fmhy/edit",
        "status": "success",
        "message": f"同步完成，共提炼 {len(categories_result)} 个核心分类与 {total_items_count} 项中文资源"
    }

    with open(STATUS_FILE, 'w', encoding='utf-8') as f:
        json.dump(sync_status, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print("🎉 同步任务顺利完成！")
    print(f"📂 数据文件已更新: {DATA_FILE}")
    print(f"📊 总分类数: {len(categories_result)} | 总条目数: {total_items_count}")
    print("=" * 60)

if __name__ == "__main__":
    run_sync()
