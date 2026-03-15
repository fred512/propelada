import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { version: buildVersion } = require('./package.json')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  modules: ['@nuxtjs/supabase', '@nuxtjs/color-mode', '@vite-pwa/nuxt'],

  alias: {
    '@': fileURLToPath(new URL('./app', import.meta.url)),
  },

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: 'ProPelada',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' },
        { name: 'description', content: 'Gerencie suas peladas de futebol' },
        { name: 'theme-color', content: '#1A1C1E' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
        { rel: 'icon', type: 'image/png', href: '/images/favicon.png' },
        { rel: 'apple-touch-icon', href: '/images/apple-touch-icon.png' },
      ]
    }
  },

  runtimeConfig: {
    public: {
      appVersion: buildVersion,
    }
  },

  supabase: {
    redirect: false
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'ProPelada',
      short_name: 'ProPelada',
      description: 'Gerencie suas peladas de futebol',
      theme_color: '#1A1C1E',
      background_color: '#1A1C1E',
      display: 'standalone',
      orientation: 'portrait',
      lang: 'pt-BR',
      icons: [
        { src: '/images/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/images/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
      start_url: '/',
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    devOptions: {
      enabled: false,
    },
  },
})
