import { defineConfig } from 'vitepress'

/* 中文配置 */
import { zhConfig } from './configs/zh.mjs'
/* 英文配置 */
import { enConfig } from './configs/en.mjs'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Potato H5 Games",
  description: "A website collecting lots of H5 games",
  head: [['link', { rel: 'icon', href: '/potato.ico' }]],
  
  locales: {
    root: { label: '简体中文', lang: 'zh-CN', link: "/", ...zhConfig }, 
    en: { label: 'English', lang: 'en-US', link: "/en", ...enConfig }, 
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/potato.ico",

    socialLinks: [
      { icon: 'github', link: 'https://github.com/aidscooler/potatoh5games' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Bling'
    }
  }
})
