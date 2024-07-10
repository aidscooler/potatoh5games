import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Potato H5 Games",
  description: "Foucsing on the IMP of H5 Games",
  head: [['link', { rel: 'icon', href: '/potato.ico' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/potato.ico",
    nav: [
      { text: '首页', link: '/' },
      { text: '微信小游戏开发实战', link: '/H5Develop/wordle-1' },
      { text: '开源项目学习', link: '/codeLearn/2048' },
      { text: '其他', link: '/'}
    ],

    sidebar: {
      '/H5Develop/': [
        {
          text: '微信小游戏开发实战',
          items: [
            { text: 'cocos creator实现wordle游戏（一）', link: '/H5Develop/wordle-1' },
            { text: 'cocos creator实现wordle游戏（二）', link: '/H5Develop/wordle-2' },
            { text: 'cocos creator实现wordle游戏（三）', link: '/H5Develop/wordle-3' },
            { text: 'cocos creator实现wordle游戏（四）', link: '/H5Develop/wordle-4' },
            { text: 'cocos creator实现wordle游戏（五）', link: '/H5Develop/wordle-5' },
            { text: 'cocos creator实现wordle游戏（六）', link: '/H5Develop/wordle-6' },
            { text: 'cocos creator实现wordle游戏（七）', link: '/H5Develop/wordle-7' },
            { text: 'cocos creator实现wordle游戏（八）', link: '/H5Develop/wordle-8' }
          ]
        }
      ],
      '/codeLearn/': [      
        {
          text: '开源项目学习',
          items: [
            { text: 'H5小游戏-2048', link: '/codeLearn/2048' },
            { text: 'H5小游戏-Tower Game', link: '/codeLearn/TowerGame' }
          ]
        }
      ],
      '/other/': [
        {
          text: '日常记录',
          items: [
            { text: 'MySQL安装部署', link: '/' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/aidscooler/potatoh5games' }
    ],

    footer: {
      message: 'Released under the MIT License. CSDN博主 大宝贱 的个人博客',
      copyright: 'Copyright © 2024-present Bling'
    }
  }
})
