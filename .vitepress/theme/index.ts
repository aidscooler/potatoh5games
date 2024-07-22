// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ColorPickr from '../components/tools/ColorPickr.vue'
import './style.css'
import './rainbow.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // ...
    // const componentFiles = import.meta.glob('../components/**/*.vue');
    // for (const path in componentFiles) {
    //   componentFiles[path]().then((module) => {
    //     // 从文件路径中提取组件名
    //     // 例如，从 '../components/Button.vue' 提取 'Button'
    //     const componentName = path.split('/').pop()?.replace(/\.\w+$/, '');
    //     // 注册全局组件
    //     console.log(componentName);
    //     app.component(componentName as string, module.default);
    //   });
    // }
    app.component('ColorPickr', ColorPickr);
  }
} satisfies Theme
