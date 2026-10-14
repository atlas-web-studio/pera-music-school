import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendPort = env.VITE_LOCAL_API_PORT || '5001'
  const testSiteKeys = new Set([
    '1x00000000000000000000AA',
    '2x00000000000000000000AB',
    '1x00000000000000000000BB',
    '2x00000000000000000000BB',
    '3x00000000000000000000FF',
  ])

  if (command === 'build' && process.env.VERCEL) {
    if (!env.VITE_TURNSTILE_SITE_KEY || testSiteKeys.has(env.VITE_TURNSTILE_SITE_KEY)) {
      throw new Error('Set a real VITE_TURNSTILE_SITE_KEY in Vercel before deploying.')
    }
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})
