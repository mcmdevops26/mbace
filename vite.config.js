import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import javaScriptObfuscator from 'vite-plugin-javascript-obfuscator'

export default defineConfig({
  build: {
    sourcemap: false, // disable source maps in production
  },
  plugins: [
    react(),
    tailwindcss(),
    javaScriptObfuscator({
      apply: 'build', // only runs during production build, not dev
      options: {
        compact: true,
        controlFlowFlattening: false,   // keep off — can break React
        deadCodeInjection: false,        // keep off — bloats bundle size
        debugProtection: false,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        renameGlobals: false,            // keep off — can break globals
        selfDefending: false,            // keep off — can interfere with PWA
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
        transformObjectKeys: false,      // keep off — can break React props
        unicodeEscapeSequence: false,
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'MBAce — The Marketing Case',
        short_name: 'MBAce',
        description: 'MBA Marketing Recruiting Case Interview Prep',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
      },
    }),
  ],
})
