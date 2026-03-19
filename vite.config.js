import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 👇 新增 server 配置，允许 cpolar 的域名访问
    allowedHosts: [
      '51225ee1.r31.cpolar.top', // 填入报错中提示的域名
      '.cpolar.top',             // 建议加上泛域名，这样以后 cpolar 前缀变了也不怕
    ]
  }
})
