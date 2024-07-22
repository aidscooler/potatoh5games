<!-- ToolList.vue -->
<template>
    <div class="tool-list">
      <ul>
        <li v-for="tool in tools" :key="tool.componentName" @click="selectTool(tool.name)">
          {{ tool.name }}
        </li>
      </ul>
    </div>
</template>
  
<script setup>
  import { readJSON } from '../utils.mts'
  const tools = readJSON('./vitepress/config/toollist.json');
  
  defineEmits(['select-tool']);
  
  const selectTool = (toolName) => {
    // 触发事件，传递选中的工具名称
    $emit('select-tool', toolName);
  };
</script>
  