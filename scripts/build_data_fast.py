import os
import json
import re
import hashlib
from datetime import datetime

DOCS_DIR = "/tmp/fmhy_repo/docs"
OUTPUT_DIR = "/Users/hooksvue/Desktop/fmhy/public/data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

DATA_FILE = os.path.join(OUTPUT_DIR, "fmhy_data.json")
STATUS_FILE = os.path.join(OUTPUT_DIR, "sync_status.json")

# 分类配置
CATEGORIES = [
    {
        "id": "video",
        "file": "video.md",
        "title": "影视流媒体 (Streaming)",
        "titleEn": "Movies, TV & Anime",
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
        "title": "实用网络工具 (Internet Tools)",
        "titleEn": "Internet & Web Tools",
        "icon": "Wrench",
        "color": "#14b8a6",
        "description": "格式转换、媒体压制、Base64解析、网络测速、临时邮箱与常用开发者工具。"
    },
    {
        "id": "system-tools",
        "file": "system-tools.md",
        "title": "系统与桌面工具 (System Tools)",
        "titleEn": "System Tools",
        "icon": "Terminal",
        "color": "#64748b",
        "description": "Windows、macOS 与 Linux 系统优化、激活脚本、文件管理与常用辅助。"
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

# 高频标题与词汇翻译表
TITLE_DICT = {
    "Stream Aggregators": "综合播放源聚合",
    "Multi-Server": "多源流媒体播放站",
    "Single-Server": "单源稳定播放站",
    "Anime Streaming": "动漫在线播放站",
    "Cartoon Streaming": "欧美动画播放站",
    "Live TV": "全球电视频道直播",
    "Sports Streams": "体育赛事直播",
    "Asian Drama": "日韩与亚洲剧集",
    "Chat Bots": "免翻 / 免费 AI 对话机器人",
    "AI Tools": "AI 辅助实用工具箱",
    "Text to Image": "AI 图像生成与处理",
    "Code Assistants": "AI 编程助手与代码补全",
    "Audio Generation": "AI 音频与语音克隆",
    "Adblockers": "全平台必备广告拦截扩展",
    "DNS": "隐私与去广告 DNS 服务",
    "Privacy Tools": "网络隐私与反指纹跟踪",
    "VPNs": "安全加密网络连接指南",
    "Music Streaming": "在线音乐试听站点",
    "Music Downloading": "无损音乐与音频下载",
    "Radio": "全球网络电台与广播",
    "Podcasts": "精选播客平台与播放器",
    "PC Games": "PC 电脑游戏下载与直链",
    "Emulators": "全平台复古与主机模拟器",
    "ROMs": "经典游戏 ROM 镜像库",
    "E-Books": "电子书综合搜索引擎",
    "Comics": "欧美漫画与图像小说",
    "Manga": "日本漫画与汉化连载",
    "Audiobooks": "有声书试听与下载",
    "Direct Download Sites": "高速网盘与直链资源站",
    "Debrid Services": "多网盘高速解析服务",
    "Torrent Clients": "BT 客户端推荐与配置",
    "Torrent Sites": "综合磁力与种子搜索引擎",
    "Trackers": "常用公共 Tracker 服务器列表",
    "Downloaders": "主流流媒体与网络视频下载器",
    "File Sharing": "临时文件快传与匿名分享",
    "URL Shorteners": "短链接还原与安全检测",
    "System Monitoring": "系统硬件与状态监控",
    "Package Managers": "应用包管理器与一键安装",
    "Online Courses": "免费公开课与技术教程",
    "Programming": "编程开发与计算机科学"
}

PHRASE_REPLACEMENTS = [
    (r"\bmovies & shows\b", "电影与剧集"),
    (r"\bmovies and tv shows\b", "电影与电视剧"),
    (r"\bmovies\b", "电影"),
    (r"\bshows\b", "电视剧"),
    (r"\banime\b", "动漫"),
    (r"\bmultiserver\b", "多线路源"),
    (r"\bmultilang\b", "多语言字幕"),
    (r"\bmulti-server\b", "多播放源"),
    (r"\bno ads\b", "无广告"),
    (r"\bminimal ads\b", "极少广告"),
    (r"\bopen source\b", "开源"),
    (r"\bfree\b", "免费"),
    (r"\bdownload\b", "下载"),
    (r"\bstreaming\b", "在线播放"),
    (r"\bsubtitles\b", "字幕支持"),
    (r"\bsearch\b", "搜索"),
    (r"\bclient\b", "客户端"),
    (r"\bextension\b", "浏览器扩展"),
    (r"\bhigh quality\b", "高清画质"),
    (r"\bwatchlist\b", "播放列表与追番"),
    (r"\bhistory\b", "观看历史记录"),
    (r"\bplayer\b", "播放器"),
    (r"\bwithout ads\b", "无广告打扰"),
    (r"\bfast\b", "极速秒开"),
    (r"\bclean interface\b", "清爽界面"),
    (r"\bmodern\b", "现代化界面"),
    (r"\blibrary\b", "资源库"),
    (r"\bflac\b", "FLAC无损"),
    (r"\bconverter\b", "转换工具"),
    (r"\btracker\b", "Tracker 服务器"),
    (r"\btorrent\b", "种子BT下载"),
    (r"\bmusic\b", "音乐"),
    (r"\baudio\b", "音频"),
    (r"\bbooks\b", "图书文献")
]

def translate_desc_smart(desc: str) -> str:
    """结合短语与结构生成流畅中文说明"""
    if not desc or len(desc.strip()) < 3:
        return "社区高评分精选推荐站点。"

    text = desc.strip()
    # 替换常见英文术语
    for pattern, repl in PHRASE_REPLACEMENTS:
        text = re.sub(pattern, repl, text, flags=re.IGNORECASE)

    # 修饰中文语感
    text = text.replace(",", "，").replace(";", "；")
    if not text.endswith(("。", "！", ".")):
        text += "。"
    return text

def extract_tags(desc: str) -> list[str]:
    tags = []
    d = desc.lower()
    mapping = [
        ("无广告", "无广告"),
        ("开源", "开源"),
        ("4k", "4K画质"),
        ("字幕", "多字幕"),
        ("高清", "高清"),
        ("极速", "极速秒开"),
        ("客户端", "客户端"),
        ("免费", "免费"),
        ("音乐", "音乐"),
        ("动漫", "新番"),
        ("电影", "院线大片"),
        ("小说", "电子书"),
        ("游戏", "游戏"),
        ("模拟器", "模拟器"),
        ("下载", "高速下载"),
        ("网盘", "网盘直链")
    ]
    for k, v in mapping:
        if k in d or k in desc:
            tags.append(v)
        if len(tags) >= 3:
            break
    if not tags:
        tags = ["精选推荐", "实用"]
    return tags

def build_data():
    print("🚀 开始快速全量爬取与构建 FMHY 中文数据...")
    results = []
    total_items = 0

    header_pattern = re.compile(r'^(#{1,3})\s+(?:[►▷■●\s]*)(.+)$')
    link_pattern = re.compile(r'^\s*\*\s+\[([^\]]+)\]\((https?://[^\)]+)\)(?:\s*/\s*\[[^\]]+\]\([^\)]+\))?\s*(?:[-–—:]\s*(.*))?$')

    for cat in CATEGORIES:
        file_path = os.path.join(DOCS_DIR, cat["file"])
        if not os.path.exists(file_path):
            continue

        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        sections = []
        current_section = None

        for line in content.split("\n"):
            line = line.strip()
            if not line or line.startswith("***") or "back to wiki" in line.lower():
                continue

            h_match = header_pattern.match(line)
            if h_match:
                title_raw = h_match.group(2).strip()
                title_clean = re.sub(r'^[►▷#\*\s\-]+', '', title_raw).strip()
                if len(title_clean) < 2 or "table of contents" in title_clean.lower():
                    continue

                cn_title = TITLE_DICT.get(title_clean, f"{title_clean}")
                current_section = {
                    "id": hashlib.md5(title_clean.encode()).hexdigest()[:8],
                    "title": cn_title if cn_title != title_clean else f"{title_clean} 专区",
                    "titleEn": title_clean,
                    "description": "",
                    "items": []
                }
                sections.append(current_section)
                continue

            l_match = link_pattern.match(line)
            if l_match:
                if current_section is None:
                    current_section = {
                        "id": "featured",
                        "title": "精选热门推荐 (Featured)",
                        "titleEn": "Featured Sites",
                        "description": "",
                        "items": []
                    }
                    sections.append(current_section)

                # 每个 section 收录前 12 个代表性项目
                if len(current_section["items"]) >= 12:
                    continue

                name = l_match.group(1).strip()
                url = l_match.group(2).strip()
                raw_desc = (l_match.group(3) or "").strip()

                if "reddit.com/r/freemediaheckyeah" in url.lower():
                    continue

                desc_cn = translate_desc_smart(raw_desc)
                tags = extract_tags(desc_cn + " " + raw_desc)

                badge = "popular"
                name_low = name.lower()
                if any(x in name_low for x in ["braflix", "aniwave", "binged", "spotube", "retroarch", "anna", "ublock", "cobalt", "openrouter", "duckduckgo", "fitgirl"]):
                    badge = "starred"
                elif any(x in name_low for x in ["tool", "downloader", "converter", "dns", "extension"]):
                    badge = "tool"

                item_id = hashlib.md5(f"{cat['id']}_{name}".encode()).hexdigest()[:10]
                current_section["items"].append({
                    "id": item_id,
                    "title": name,
                    "titleEn": name,
                    "url": url,
                    "description": desc_cn,
                    "descriptionEn": raw_desc,
                    "tags": tags,
                    "badge": badge
                })

        valid_sections = [s for s in sections if len(s["items"]) > 0]
        cat_items_count = sum(len(s["items"]) for s in valid_sections)
        total_items += cat_items_count

        results.append({
            "id": cat["id"],
            "title": cat["title"],
            "titleEn": cat["titleEn"],
            "icon": cat["icon"],
            "color": cat["color"],
            "description": cat["description"],
            "itemCount": cat_items_count,
            "sections": valid_sections
        })
        print(f"✓ 提炼分类 [{cat['title']}]: {len(valid_sections)} 个小节, {cat_items_count} 项资源")

    # 1. 完整数据（保留用于搜索等全量场景）
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # 2. 轻量分类元数据（首页/侧边栏使用，不含 sections）
    categories_meta = []
    for cat in results:
        categories_meta.append({
            "id": cat["id"],
            "title": cat["title"],
            "titleEn": cat["titleEn"],
            "icon": cat["icon"],
            "color": cat["color"],
            "description": cat["description"],
            "itemCount": cat["itemCount"]
        })
    meta_file = os.path.join(OUTPUT_DIR, "categories_meta.json")
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(categories_meta, f, ensure_ascii=False, indent=2)

    # 3. 按分类拆分单独文件（分类详情页按需加载）
    for cat in results:
        cat_file = os.path.join(OUTPUT_DIR, f"category_{cat['id']}.json")
        with open(cat_file, "w", encoding="utf-8") as f:
            json.dump(cat, f, ensure_ascii=False, indent=2)

    status = {
        "lastSyncTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "totalCategories": len(results),
        "totalItems": total_items,
        "sourceRepo": "https://github.com/fmhy/edit",
        "status": "success",
        "message": f"全量直爬完成，已成功提炼 {len(results)} 个核心分类、共 {total_items} 项高质量资源"
    }

    with open(STATUS_FILE, "w", encoding="utf-8") as f:
        json.dump(status, f, ensure_ascii=False, indent=2)

    print("\n🎉 成功生成全量中文数据！")
    print(f"📊 总分类: {len(results)} | 总收录资源: {total_items}")
    print(f"📁 完整数据: {DATA_FILE}")
    print(f"📁 分类元数据: {meta_file}")
    print(f"📁 分类详情: {OUTPUT_DIR}/category_*.json")

if __name__ == "__main__":
    build_data()
