import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const zhConfig: LocaleSpecificConfig<DefaultTheme.Config> = {

    themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    //logo: "/potato.ico",
    nav: [
      { text: '首页', link: '/' },
      { text: '经典红白机游戏', link: '/classic' },
      { text: '休闲小游戏', link: '/casual' },
      { text: '益智小游戏', link: '/brain' }
    ]

    // sidebar: [
    //   {
    //     text: 'Examples',
    //     items: [
    //       { text: 'Markdown Examples', link: '/markdown-examples' },
    //       { text: 'Runtime API Examples', link: '/api-examples' }
    //     ]
    //   }
    // ],

    },
}