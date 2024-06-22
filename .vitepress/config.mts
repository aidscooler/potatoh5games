import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "zh-CN",
  title: "Potato H5 Games",
  description: "A website collecting lots of H5 games",
  head: [['link', { rel: 'icon', href: '/potato.ico' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    i18nRouting: false,
    logo: "/potato.ico",
    nav: [
      { text: '首页', link: '/' },
      { text: '经典红白机游戏', link: '/classic' },
      { text: '休闲小游戏', link: '/casual' },
      { text: '益智小游戏', link: '/brain' }
    ],

    // sidebar: [
    //   {
    //     text: 'Examples',
    //     items: [
    //       { text: 'Markdown Examples', link: '/markdown-examples' },
    //       { text: 'Runtime API Examples', link: '/api-examples' }
    //     ]
    //   }
    // ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Bling'
    }
  }
})
