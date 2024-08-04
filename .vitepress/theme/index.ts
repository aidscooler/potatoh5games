// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ToolsLayout from '../components/ToolsLayout.vue'
import GameEntranceV from '../components/gameEntranceV.vue'
import GameEntranceH from '../components/gameEntranceH.vue'
import GroupedFeatures from '../components/GroupedFeatures.vue'
import './style.css'
import './rainbow.css'
import 'element-plus/dist/index.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // ...
    app.component('ToolsLayout', ToolsLayout);
    app.component('GameEntranceV', GameEntranceV);
    app.component('GameEntranceH', GameEntranceH);
    app.component('GroupedFeatures', GroupedFeatures);
  }
} satisfies Theme
