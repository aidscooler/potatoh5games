<!-- ToolPage.vue -->
<template>
    <div class="tool-page">
      <component :is="currentToolComponent" />
    </div>
</template>
  
<script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    selectedTool: String
  });
  
  const currentToolComponent = computed(() => {
    // 根据选中的工具名称返回组件名称
    return props.selectedTool;
  });
</script>
  