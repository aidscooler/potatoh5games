// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import GameEntranceV from '../components/gameEntranceV.vue'
import GameEntranceH from '../components/gameEntranceH.vue'
import './style.css'
import './custom.css'
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
    app.component('GameEntranceV',GameEntranceV);
    app.component('GameEntranceH',GameEntranceH);
  }
} satisfies Theme
