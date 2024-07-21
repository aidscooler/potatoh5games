import { defineConfig } from 'vitepress'

/* 读取游戏导航配置文件 */
import { readJSON,genSidebar } from './utils.mjs'
// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Potato H5 Games",
  description: "Foucsing on the IMP of H5 Games",
  head: [ ['link', { rel: 'icon', href: '/potato.ico' }],
          ['script', { 
                        async: 'async',
                        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8732961563471855',
                        crossorigin: 'anonymous',
                    }
          ]
        ],
  metaChunk: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/potato.ico",
    nav: readJSON('./.vitepress/config/nav.json'),

    sidebar: genSidebar('./.vitepress/config/sidebar.json'),
    lastUpdatedText: "最后更新",
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/aidscooler' },
      // You can also add custom icons by passing SVG as string:
      {
        icon: {
            svg: '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="32.000000pt" height="32.000000pt" viewBox="0 0 32.000000 32.000000" preserveAspectRatio="xMidYMid meet"> <g transform="translate(0.000000,32.000000) scale(0.100000,-0.100000)" fill="#F25327" stroke="none"> <path d="M0 160 l0 -160 160 0 160 0 0 160 0 160 -160 0 -160 0 0 -160z m225 108 c24 -11 34 -41 16 -52 -4 -3 -17 1 -27 9 -43 32 -95 3 -109 -62 -5 -27 -2 -37 19 -58 29 -29 62 -32 94 -9 25 17 42 11 42 -15 0 -27 -51 -45 -107 -38 -70 8 -97 42 -91 115 4 48 10 60 41 89 39 35 76 42 122 21z"/> </g> </svg>',
        }, link: "https://blog.csdn.net/aidscooler",
      }     
    ],

    footer: {
      message: 'CSDN博主 大宝贱 的个人博客',
      copyright: 'Copyright © 2024-present Bling | Powered by Vitepress '
    }
  }
})
