import re
import hashlib
from translator import translate_online, translate_markdown_title

def generate_id(text: str) -> str:
    """生成稳定且唯一的拼音/英文哈希标识"""
    clean = re.sub(r'[^a-zA-Z0-9]', '', text).lower()
    if clean:
        return clean[:20]
    return hashlib.md5(text.encode('utf-8')).hexdigest()[:10]

def extract_tags(description: str) -> list[str]:
    """根据描述自动生成分类标签"""
    tags = []
    d_lower = description.lower()
    keyword_map = [
        ("open source", "开源"),
        ("no ads", "无广告"),
        ("minimal ads", "少广告"),
        ("subtitles", "多字幕"),
        ("4k", "4K画质"),
        ("1080p", "高清"),
        ("free", "免费"),
        ("flac", "无损音质"),
        ("api", "API接口"),
        ("client", "客户端"),
        ("extension", "浏览器插件"),
        ("self-host", "自建私有化"),
        ("fast", "极速"),
        ("movies", "电影"),
        ("shows", "剧集"),
        ("anime", "动漫"),
        ("manga", "漫画"),
        ("games", "游戏"),
        ("books", "电子书")
    ]
    for eng, cn in keyword_map:
        if eng in d_lower:
            tags.append(cn)
        if len(tags) >= 4:
            break
    return tags

def parse_markdown_content(category_id: str, markdown_text: str, max_items_per_sec: int = 15) -> list[dict]:
    """
    解析 Markdown 内容并提炼为 Sections 和 Items
    """
    sections = []
    current_section = None
    lines = markdown_text.split('\n')

    # 匹配链接项: * [Name](url) - Description 或 * [Name](url) / [Mirror](url2) - Description
    link_pattern = re.compile(r'^\s*\*\s+\[([^\]]+)\]\((https?://[^\)]+)\)(?:\s*/\s*\[[^\]]+\]\([^\)]+\))?\s*(?:[-–—:]\s*(.*))?$')
    # 匹配标题: # ► ... 或 ## ▷ ... 或 ### ...
    header_pattern = re.compile(r'^(#{1,3})\s+(?:[►▷■●\s]*)(.+)$')

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        # 跳过顶部返回导航
        if 'back to wiki' in line_clean.lower() or line_clean.startswith('***'):
            continue

        # 检查是否为小节标题
        h_match = header_pattern.match(line_clean)
        if h_match:
            raw_title = h_match.group(2).strip()
            # 过滤特殊无效标题
            if len(raw_title) < 2 or 'table of contents' in raw_title.lower():
                continue

            sec_title_cn, sec_title_en = translate_markdown_title(raw_title)
            sec_id = generate_id(raw_title)
            current_section = {
                "id": sec_id,
                "title": sec_title_cn,
                "titleEn": sec_title_en,
                "description": "",
                "items": []
            }
            sections.append(current_section)
            continue

        # 检查是否为资源链接
        l_match = link_pattern.match(line_clean)
        if l_match:
            # 如果当前还没有 Section，创建一个默认的
            if current_section is None:
                current_section = {
                    "id": "general",
                    "title": "精选推荐 (Featured)",
                    "titleEn": "General Sites",
                    "description": "",
                    "items": []
                }
                sections.append(current_section)

            # 控制每个 section 的最大提取数量，保证加载与翻译性能
            if len(current_section["items"]) >= max_items_per_sec:
                continue

            name = l_match.group(1).strip()
            url = l_match.group(2).strip()
            desc = (l_match.group(3) or "").strip()

            # 过滤内部 Reddit/GitHub 说明性链接
            if 'reddit.com/r/freemediaheckyeah' in url.lower() and ('rules' in url.lower() or 'wiki' in url.lower()):
                continue

            desc_cn = translate_online(desc) if desc else "高评分社区精选收录站点。"
            tags = extract_tags(desc)
            
            # 判断徽章类型
            badge = "popular"
            name_lower = name.lower()
            if any(k in name_lower for k in ['braflix', 'aniwave', 'openrouter', 'ublock', 'spotube', 'retroarch', 'anna', 'cobalt']):
                badge = "starred"
            elif any(k in name_lower for k in ['tool', 'downloader', 'converter', 'dns']):
                badge = "tool"

            item = {
                "id": generate_id(f"{category_id}_{name}"),
                "title": name,
                "titleEn": name,
                "url": url,
                "description": desc_cn,
                "descriptionEn": desc,
                "tags": tags,
                "badge": badge
            }
            current_section["items"].append(item)

    # 过滤掉没有任何子项的空 Section
    valid_sections = [s for s in sections if len(s["items"]) > 0]
    return valid_sections
