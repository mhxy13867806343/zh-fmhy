export interface GithubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
}

const CACHE_KEY = 'fmhy_github_repos_mhxy13867806343'
const CACHE_TIME_KEY = `${CACHE_KEY}_time`
const STARS_CACHE_KEY = 'fmhy_github_stars_mhxy13867806343'
const STARS_TIME_KEY = `${STARS_CACHE_KEY}_time`
const CACHE_DURATION = 30 * 60 * 1000 // 30 分钟缓存

// 1. 获取用户的个人公开仓库
export async function fetchUserRepos(username: string = 'mhxy13867806343'): Promise<GithubRepo[]> {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    const time = localStorage.getItem(CACHE_TIME_KEY)
    if (cached && time && Date.now() - Number(time) < CACHE_DURATION) {
      return JSON.parse(cached)
    }
  } catch {}

  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    })
    if (res.ok) {
      const data: GithubRepo[] = await res.json()
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data))
        localStorage.setItem(CACHE_TIME_KEY, String(Date.now()))
      } catch {}
      return data
    }
  } catch (e) {
    console.warn('请求 GitHub Repos API 失败，尝试读取本地缓存', e)
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) return JSON.parse(cached)
  } catch {}

  return []
}

// 2. 获取用户的 Star 星标收藏仓库
export async function fetchUserStars(username: string = 'mhxy13867806343'): Promise<GithubRepo[]> {
  try {
    const cached = localStorage.getItem(STARS_CACHE_KEY)
    const time = localStorage.getItem(STARS_TIME_KEY)
    if (cached && time && Date.now() - Number(time) < CACHE_DURATION) {
      return JSON.parse(cached)
    }
  } catch {}

  try {
    const res = await fetch(`https://api.github.com/users/${username}/starred?per_page=100`, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    })
    if (res.ok) {
      const data: GithubRepo[] = await res.json()
      try {
        localStorage.setItem(STARS_CACHE_KEY, JSON.stringify(data))
        localStorage.setItem(STARS_TIME_KEY, String(Date.now()))
      } catch {}
      return data
    }
  } catch (e) {
    console.warn('请求 GitHub Starred API 失败，尝试读取本地缓存', e)
  }

  try {
    const cached = localStorage.getItem(STARS_CACHE_KEY)
    if (cached) return JSON.parse(cached)
  } catch {}

  return []
}
