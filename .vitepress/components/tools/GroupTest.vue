<template>
    <div><h1>更多工具持续更新中</h1></div>
</template>

<script setup lang="ts">
import { markRaw } from 'vue'
  defineOptions({
    name: 'ColorPickr',
    customOptions: {
      chineseName: '更多工具',
      group: '持续更新中',
      icon: markRaw(IconEpLoading)
    }
  }) 
</script>