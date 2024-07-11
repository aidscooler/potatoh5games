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
      { text: '微信小游戏开发实战', link: '/blog/H5Develop/wordle-1' },
      { text: 'JS基础教程', link: '/blog/JSLearn/tutorial_datatype' },
      { text: '开源项目学习', link: '/blog/codeLearn/2048' },
      { text: '其他', link: '/blog/other/MySQL'},
      { text: '关于我们', link: '/blog/about/about'}
    ],

    sidebar: {
      '/blog/H5Develop/': [
        {
          text: '微信小游戏开发实战',
          items: [
            { text: 'cocos creator实现wordle游戏（一）', link: '/blog/H5Develop/wordle-1' },
            { text: 'cocos creator实现wordle游戏（二）', link: '/blog/H5Develop/wordle-2' },
            { text: 'cocos creator实现wordle游戏（三）', link: '/blog/H5Develop/wordle-3' },
            { text: 'cocos creator实现wordle游戏（四）', link: '/blog/H5Develop/wordle-4' },
            { text: 'cocos creator实现wordle游戏（五）', link: '/blog/H5Develop/wordle-5' },
            { text: 'cocos creator实现wordle游戏（六）', link: '/blog/H5Develop/wordle-6' },
            { text: 'cocos creator实现wordle游戏（七）', link: '/blog/H5Develop/wordle-7' },
            { text: 'cocos creator实现wordle游戏（八）', link: '/blog/H5Develop/wordle-8' }
          ]
        }
      ],
      '/blog/JSLearn/': [      
        {
          text: 'JS基础教程',
          items: [
            { text: 'JavaScript数据类型', link: '/blog/JSLearn/tutorial_datatype' },
            { text: 'JavaScript变量的使用', link: '/blog/JSLearn/tutorial_var' },
            { text: 'JavaScript中的运算符', link: '/blog/JSLearn/tutorial_calc' },
            { text: 'JavaScript流程控制语法', link: '/blog/JSLearn/tutorial_control' },
            { text: 'JavaScript的函数', link: '/blog/JSLearn/tutorial_func' },
            { text: 'JavaScript的数组', link: '/blog/JSLearn/tutorial_array' },
            { text: 'JavaScript的对象', link: '/blog/JSLearn/tutorial_class' },
            { text: 'JavaScript异常处理', link: '/blog/JSLearn/tutorial_exception' },
            { text: 'JavaScript中的DOM操作', link: '/blog/JSLearn/tutorial_dom' },
            { text: 'JavaScript中的AJAX操作', link: '/blog/JSLearn/tutorial_ajax' }
          ]
        }
      ],      
      '/blog/codeLearn/': [      
        {
          text: '开源项目学习',
          items: [
            { text: 'H5小游戏-2048', link: '/blog/codeLearn/2048' },
            { text: 'H5小游戏-Tower Game', link: '/blog/codeLearn/TowerGame' }
          ]
        }
      ],
      '/blog/other/': [
        {
          text: '日常记录',
          items: [
            { text: 'MySQL8.0.28安装配置教程', link: '/blog/other/MySQL' },
            { text: 'Git切换账号', link: '/blog/other/Git_changeUser' },
            { text: 'Git清除提交记录', link: '/blog/other/Git_clearHistory' }
          ]
        }
      ],
      '/blog/about/': [
        {
          text: '关于我们',
          items: [
            { text: '关于本站', link: '/blog/about/about' },
            { text: '联系我们', link: '/blog/about/contact' },
            { text: '隐私', link: '/blog/about/privacy' }            
          ]
        }
      ]
    },

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
