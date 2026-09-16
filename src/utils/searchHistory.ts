import { ref } from 'vue'

const MAX_HISTORY = 10

// 统一获取存储 key：'global' 为全局搜索历史，其他字符串为各分类专属历史
function getStorageKey(scope: string = 'global'): string {
  return scope === 'global' ? 'fmhy_search_history_global' : `fmhy_search_history_cat_${scope}`
}

export function useSearchHistory(scope: string = 'global') {
  const historyList = ref<string[]>([])

  function load() {
    try {
      const raw = localStorage.getItem(getStorageKey(scope))
      if (raw) {
        historyList.value = JSON.parse(raw)
      } else {
        historyList.value = []
      }
    } catch {
      historyList.value = []
    }
  }

  function add(keyword: string) {
    const k = keyword.trim()
    if (!k) return
    load()
    // 去重并排在最前面
    const filtered = historyList.value.filter(item => item.toLowerCase() !== k.toLowerCase())
    filtered.unshift(k)
    if (filtered.length > MAX_HISTORY) {
      filtered.length = MAX_HISTORY
    }
    historyList.value = filtered
    localStorage.setItem(getStorageKey(scope), JSON.stringify(filtered))
  }

  function remove(keyword: string) {
    historyList.value = historyList.value.filter(item => item !== keyword)
    localStorage.setItem(getStorageKey(scope), JSON.stringify(historyList.value))
  }

  function clear() {
    historyList.value = []
    localStorage.removeItem(getStorageKey(scope))
  }

  // 初始读取
  load()

  return {
    historyList,
    load,
    add,
    remove,
    clear
  }
}
