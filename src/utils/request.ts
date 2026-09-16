import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

// 基础 Axios 实例配置
const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 为 GET 请求添加时间戳，防止浏览器缓存
    if (config.method?.toUpperCase() === 'GET') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    return config
  },
  (error) => {
    console.error('[Request Error]:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回业务数据
    return response.data
  },
  (error) => {
    let errorMessage = '网络请求出现异常，请稍后重试'
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = '请求参数有误'
          break
        case 404:
          errorMessage = '未找到请求的资源'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = error.response.data?.message || `网络错误 (${error.response.status})`
      }
    } else if (error.message.includes('timeout')) {
      errorMessage = '网络请求超时，请检查网络环境'
    }

    console.error('[Response Error]:', errorMessage, error)
    return Promise.reject(new Error(errorMessage))
  }
)

// 统一封装的泛型请求工具
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config)
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config)
  }
}

export default service
