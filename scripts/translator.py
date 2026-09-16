import sqlite3
import urllib.request
import urllib.parse
import json
import time
import os
import re

DB_PATH = os.path.join(os.path.dirname(__file__), 'cache.db')

# 常用专有名词及高频词典映射（毫秒级命中）
DICT_MAP = {
    "streaming": "在线流媒体",
    "stream aggregators": "综合播放源聚合",
    "adblocking": "广告拦截",
    "privacy": "隐私保护",
    "emulation": "游戏模拟器",
    "emulators": "模拟器",
    "audio": "音频与播客",
    "video": "视频与影视",
    "gaming": "游戏娱乐",
    "reading": "电子书与漫画",
    "books": "电子书与文献",
    "comics": "漫画",
    "manga": "日本动漫与漫画",
    "downloading": "直链网盘下载",
    "torrenting": "BT 种子与磁力",
    "torrents": "BT 磁力链接",
    "educational": "教育学习",
    "tools": "实用工具",
    "system tools": "系统工具",
    "internet tools": "网络工具",
    "file tools": "文件处理工具",
    "open source": "开源项目",
    "free": "免费",
    "no ads": "无广告",
    "minimal ads": "极少广告",
    "subtitles": "字幕支持",
    "movies": "电影",
    "shows": "电视剧/剧集",
    "anime": "动漫新番",
    "music": "音乐",
    "software": "软件应用",
    "search": "搜索引擎"
}

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS translations (
            source_text TEXT PRIMARY KEY,
            translated_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def get_cached_translation(text: str) -> str:
    text = text.strip()
    if not text:
        return ""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT translated_text FROM translations WHERE source_text = ?', (text,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row[0]
    return ""

def set_cached_translation(text: str, translated: str):
    text = text.strip()
    translated = translated.strip()
    if not text or not translated:
        return
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('INSERT OR REPLACE INTO translations (source_text, translated_text) VALUES (?, ?)', (text, translated))
    conn.commit()
    conn.close()

def translate_online(text: str) -> str:
    """使用公共翻译接口获取中文，并带频率控制与容错"""
    text = text.strip()
    if not text:
        return ""

    # 1. 检查 SQLite 缓存
    cached = get_cached_translation(text)
    if cached:
        return cached

    # 2. 检查字典直译
    lower = text.lower()
    if lower in DICT_MAP:
        res = DICT_MAP[lower]
        set_cached_translation(text, res)
        return res

    # 3. 在线 API 翻译 (MyMemory Free API)
    url = 'https://api.mymemory.translated.net/get?q=' + urllib.parse.quote(text) + '&langpair=en|zh-CN'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=4) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get('responseStatus') == 200:
                trans = data.get('responseData', {}).get('translatedText', '')
                if trans and trans.strip() and trans != text:
                    set_cached_translation(text, trans)
                    return trans
    except Exception as e:
        # 网络波动或频率超限时返回原样
        pass

    return text

def translate_markdown_title(title: str) -> tuple[str, str]:
    """清洗并翻译标题，返回 (中文标题, 英文原标题)"""
    clean = re.sub(r'^[►▷#\*\s\-]+', '', title).strip()
    clean = re.sub(r'\s*\(.*?\)$', '', clean).strip()
    if not clean:
        return title, title

    cn = translate_online(clean)
    if cn != clean:
        return f"{cn} ({clean})", clean
    return clean, clean
