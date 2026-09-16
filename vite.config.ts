import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 自定义资源 JSON 目录监控与清单生成插件
function customJsonDirPlugin(): Plugin {
  const customDir = path.resolve(__dirname, 'public/data/custom')
  const indexPath = path.resolve(customDir, 'index.json')

  function updateIndexJson() {
    try {
      if (!fs.existsSync(customDir)) {
        fs.mkdirSync(customDir, { recursive: true })
      }
      const files = fs.readdirSync(customDir)
        .filter(f => f.endsWith('.json') && f !== 'index.json')
        .sort()
      fs.writeFileSync(indexPath, JSON.stringify(files, null, 2), 'utf-8')
      return files
    } catch (e) {
      console.warn('[customJsonDirPlugin] 更新 index.json 失败:', e)
      return []
    }
  }

  return {
    name: 'custom-json-dir-plugin',
    buildStart() {
      updateIndexJson()
    },
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      // 自动复制 dist/index.html 到 dist/404.html，兼容 GitHub Pages 访问
      const indexFile = path.resolve(distDir, 'index.html')
      const notFoundFile = path.resolve(distDir, '404.html')
      if (fs.existsSync(indexFile)) {
        fs.copyFileSync(indexFile, notFoundFile)
      }

      // 生成版本戳文件 version.json 用于在线自动更新检测
      const versionFile = path.resolve(distDir, 'version.json')
      const verData = {
        buildTime: Date.now(),
        date: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      }
      fs.writeFileSync(versionFile, JSON.stringify(verData, null, 2), 'utf-8')
    },
    configureServer(server) {
      updateIndexJson()

      // 监听 public/data/custom 目录下的文件变动
      server.watcher.add(customDir)
      server.watcher.on('add', (filePath) => {
        if (filePath.startsWith(customDir) && filePath.endsWith('.json') && !filePath.endsWith('index.json')) {
          console.log('[Custom JSON] 检测到新增文件:', path.basename(filePath))
          updateIndexJson()
          server.ws.send({ type: 'full-reload' })
        }
      })
      server.watcher.on('unlink', (filePath) => {
        if (filePath.startsWith(customDir) && filePath.endsWith('.json') && !filePath.endsWith('index.json')) {
          console.log('[Custom JSON] 检测到删除文件:', path.basename(filePath))
          updateIndexJson()
          server.ws.send({ type: 'full-reload' })
        }
      })
      server.watcher.on('change', (filePath) => {
        if (filePath.startsWith(customDir) && filePath.endsWith('.json') && !filePath.endsWith('index.json')) {
          console.log('[Custom JSON] 检测到修改文件:', path.basename(filePath))
          server.ws.send({ type: 'full-reload' })
        }
      })

      // 增加开发接口 /api/custom-files
      server.middlewares.use((req, res, next) => {
        const urlObj = new URL(req.url || '/', `http://${req.headers.host}`)
        if (urlObj.pathname === '/api/custom-files') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          const files = updateIndexJson()
          return res.end(JSON.stringify(files))
        }
        next()
      })
    }
  }
}

// 同步触发插件（仅保留 POST /api/sync，其他数据由前端直读 JSON）
function fmhySyncPlugin(): Plugin {
  return {
    name: 'fmhy-sync-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlObj = new URL(req.url || '/', `http://${req.headers.host}`)
        const pathname = urlObj.pathname

        // 仅拦截 POST /api/sync（实时触发爬虫）
        if (pathname === '/api/sync' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          const scriptPath = path.resolve(__dirname, 'scripts/build_data_fast.py')
          exec(`python3 ${scriptPath}`, (err, _stdout, stderr) => {
            if (err) {
              console.error('同步失败', stderr)
              return res.end(JSON.stringify({ success: false, error: stderr }))
            }
            return res.end(JSON.stringify({ success: true, message: '爬取完成' }))
          })
          return
        }

        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/zh-fmhy/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    // 自定义 JSON 目录自动化扫描插件
    customJsonDirPlugin(),
    // 同步触发中间件
    fmhySyncPlugin(),
    // Vue SFC 编译器
    vue(),
    // API 自动按需导入
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar',
            'useOsTheme',
            'darkTheme'
          ]
        }
      ],
      dts: 'src/auto-imports.d.ts'
    }),
    // 组件全自动按需导入
    Components({
      resolvers: [NaiveUiResolver()],
      dts: 'src/components.d.ts'
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  }
})
