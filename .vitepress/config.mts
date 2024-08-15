import { defineConfig } from 'vitepress'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import '../types.d.ts'
import fs from "fs";

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
  ignoreDeadLinks: true,
  metaChunk: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/potato.ico",
    nav: readJSON('./.vitepress/config/nav.json'),

    sidebar: genSidebar('./.vitepress/config/sidebar.json'),

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    outline: {
      label: '页面导航'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    socialLinks: [
      //{ icon: 'github', link: 'https://github.com/aidscooler' },
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
  },
  transformPageData(pageData) {//根据配置文件生成home页面的features数据
    // if (pageData.relativePath === 'classic.md') {
    //   pageData.frontmatter.features = readJSON('./.vitepress/config/classic.json');
    // }
    // else 
    if (pageData.relativePath === 'casual.md') {
      pageData.frontmatter.features = readJSON('./.vitepress/config/casual.json');
    }
    else if (pageData.relativePath === 'brain.md') {
      pageData.frontmatter.features = readJSON('./.vitepress/config/brain.json');
    }    
  },     
  vite: { 
    plugins: [
      //Vue(),
      AutoImport({
        // 自动导入vue相关组件 ref onMounted等
        imports: ['vue','@vueuse/core'],
        
        resolvers:[
          ElementPlusResolver(),
          // 自动导入图标组件
          IconsResolver({
            prefix: 'Icon'
          }),
        ],
        dts: '.vitepress/auto-imports.d.ts',
      }),
      Components({
        resolvers:[
          ElementPlusResolver(),
          // 自动注册图标组件
          IconsResolver({
            enabledCollections: ['ep']
          })
        ],
        dts: '.vitepress/components.d.ts',
      }),
      Icons({
        autoInstall: true
      }),
      // to use SharedArrayBuffer
      {
        name: "configure-response-headers",
        configureServer: (server) => {
          server.middlewares.use((_req, res, next) => {
            //console.log(_req);
            let url = _req.url || '';
            if (url.includes('VideoConverter.vue')) {
              //console.log(url);
              res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
              res.setHeader("Cross-Origin-Opener-Policy", "same-origin");              
            }
            // if (url.startsWith('/tools/')) {

            // }
            next();
          });
        },
      },      
    ],
    ssr: {
      // TODO: workaround until they support native ESM
      noExternal: [ /element-plus/], /*'workbox-window', /vue-i18n/, */
    }
    ,
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util','opencv.js']
    }
    // , 发布的时候不需要此配置，开发测试用
    // server: {
    //   host: '0.0.0.0',
    //   https: {
    //     key: fs.readFileSync('certs/localhost+1-key.pem'),
    //     cert: fs.readFileSync('certs/localhost+1.pem')
    //   },
    // }
  }
})
