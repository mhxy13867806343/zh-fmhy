import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
