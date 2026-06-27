import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// HTTPS faqat VITE_HTTPS=1 berilganda yoqiladi (mkcert LAN uchun). Standart — HTTP,
// chunki cloudflared tunnel public HTTPS'ni o'zi qo'shadi (tunnel: --url http://...).
const certDir = path.resolve(__dirname, '../certs')
const keyPath = path.join(certDir, 'key.pem')
const certPath = path.join(certDir, 'cert.pem')
const httpsConfig = process.env.VITE_HTTPS && fs.existsSync(keyPath) && fs.existsSync(certPath)
  ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
  : undefined

export default defineConfig({
  // /api va /ws so'rovlarini backendga (localhost:8000) yo'naltiramiz — shunda
  // frontend + API + WebSocket BITTA origin bo'ladi (CORS yo'q, tunnel oson ishlaydi).
  // Backend HTTPS (run.py SSL) -> target https + secure:false.
  // allowedHosts: cloudflared tunnel domeniga ruxsat (aks holda "host not allowed").
  server: {
    host: true,
    port: 5173,
    https: httpsConfig,
    allowedHosts: true,
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true, ws: true, secure: false },
    },
  },
  // Preview HTTP'da turadi — cloudflared tunnel public HTTPS'ni o'zi qo'shadi
  // (shuning uchun tunnel buyrug'i: --url http://localhost:4173, hech qanday flagsiz).
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true, ws: true, secure: false },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'autoUpdate' — yangi versiya chiqqanда foydalanuvchidan SO'RAMAYMIZ.
      // Yangi Service Worker o'zi yuklanadi, clientsClaim:true bilan darhol
      // boshqaruvni oladi va keyingi ochilishda yangi versiya ko'rinadi.
      // Xodimlar "Yangilash" tugmasini bosishi shart emas — eski versiyada
      // qolib ketmaydi. (Banner UpdatePrompt endi kerak emas — App.tsx'dan olindi.)
      registerType: 'autoUpdate',
      // 'script' — registerSW.js'ni index.html'ga MAJBURIY joylaydi (virtual modul
      // ishlatilsa ham). SW sahifa ochilishi bilan ro'yxatdan o'tadi -> install/push ishlaydi.
      injectRegister: 'script',

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        id: '/',
        name: 'DUNYO CRM — Boshqaruv paneli',
        short_name: 'DUNYO CRM',
        description: 'Xodimlar davomati, vazifalar va mahsulotlarni boshqarish tizimi',
        theme_color: '#dc2626',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'uz',
        categories: ['business', 'productivity'],
        screenshots: [
          { src: 'screenshot-wide.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide' },
          { src: 'screenshot-narrow.png', sizes: '720x1280', type: 'image/png' },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,jpg,jpeg,webp,woff,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // Asosiy bundle ~2.1MB — precache limitini oshiramiz (aks holda precache qilinmaydi)
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // Web Push handler'ni generatsiya qilingan SW ichiga qo'shamiz
        importScripts: ['push-sw.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          // Google Fonts CSS — stale-while-revalidate
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          // Google Fonts files — cache-first (rarely change)
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Mahsulot API (yespos.uz) — network-first, 1 soat cache fallback
          {
            urlPattern: /^https:\/\/.*\.yespos\.uz\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'products-api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Rasm va media — cache-first
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

})
