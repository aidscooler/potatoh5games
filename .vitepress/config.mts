import { defineConfig } from 'vitepress'

/* 中文配置 */
import { zhConfig } from './configs/zh.mjs'
/* 英文配置 */
import { enConfig } from './configs/en.mjs'
/* 读取游戏导航配置文件 */
import { readJSON } from './utils/util'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Potato H5 Games",
  description: "Foucsing on the IMP of H5 Games",
  head: [['link', { rel: 'icon', href: '/potato.ico' }]],
  ignoreDeadLinks: true,
  
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
  },
  transformPageData(pageData) {
    //console.log(pageData.relativePath);
    //console.log(pageData.frontmatter.features);
    if (pageData.relativePath === 'classic.md') {
      pageData.frontmatter.features = readJSON('./.vitepress/gameNavData/classic.json');
    }
    else if (pageData.relativePath === 'casual.md') {
      pageData.frontmatter.features = readJSON('./.vitepress/gameNavData/casual.json');
    }
    else if (pageData.relativePath === 'brain.md') {
      pageData.frontmatter.features = readJSON('./.vitepress/gameNavData/brain.json');
    }
    else if (pageData.relativePath === 'en/classic.md') {
      pageData.frontmatter.features = readJSON('./.vitepress/gameNavData/en/classic.json');
    }
    else if (pageData.relativePath === 'en/casual.md') {
      pageData.frontmatter.features = readJSON('./.vitepress/gameNavData/en/casual.json');
    }
    else if (pageData.relativePath === 'en/brain.md') {
      pageData.frontmatter.features = readJSON('./.vitepress/gameNavData/en/brain.json');
    }
  }  
})
