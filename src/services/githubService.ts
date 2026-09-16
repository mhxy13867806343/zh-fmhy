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
const CACHE_DURATION = 30 * 60 * 1000 // 30 分钟缓存

export async function fetchUserRepos(username: string = 'mhxy13867806343'): Promise<GithubRepo[]> {
  // 先读缓存
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    const time = localStorage.getItem(CACHE_TIME_KEY)
    if (cached && time && Date.now() - Number(time) < CACHE_DURATION) {
      return JSON.parse(cached)
    }
  } catch {}

  // 远程拉取 GitHub 公开接口
  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=50`, {
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
    console.warn('请求 GitHub API 失败，尝试读取本地缓存', e)
  }

  // 接口失败时的本地缓存容灾
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) return JSON.parse(cached)
  } catch {}

  return []
}
