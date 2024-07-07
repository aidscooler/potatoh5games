import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const enConfig: LocaleSpecificConfig<DefaultTheme.Config> = {

    themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    //logo: "/potato.ico",
    nav: [
      { text: 'Home', link: '/en/index' },
      { text: 'Classic', link: '/en/classic' },
      { text: 'Casual', link: '/en/casual' },
      { text: 'Brain', link: '/en/brain' }
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