import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/vue-blog/', // github pages 部署需要
  plugins: [
    vue(),
    // 移除tailwindcss插件，因为它会通过PostCSS配置加载
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
