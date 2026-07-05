import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // 500KB 단일 청크 경고 완화 — 편집기 벤더(@xyflow + d3 계열)와 React 런타임을
        // 앱 코드와 분리한다(Phase 9 T7). 앱 청크가 작아져 캐시 효율도 좋아진다.
        codeSplitting: {
          groups: [
            { name: 'vendor-xyflow', test: /node_modules[\\/](@xyflow|d3-|classcat|zustand)/ },
            { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
})
