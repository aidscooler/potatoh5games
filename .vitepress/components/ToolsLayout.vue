<template>
    <div class="tools-layout">
      <div :class="['tool-sidebar', { 'collapsed': !sidebarExpanded }]">
        <button @click="toggleSidebar" class="toggle-sidebar">
          <el-icon><IEpExpand v-if="!sidebarExpanded" /><IEpFold v-else /></el-icon>
        </button>
        <div v-for="group in groupedTools" :key="group.name" class="tool-group">
          <div @click="toggleGroup(group.name)" class="group-header">
            <el-icon>
                <IEpFolder v-show="groupCollapsed[group.name]" />
                <IEpFolderOpened v-show="!groupCollapsed[group.name]" />
            </el-icon>
            <span v-if="sidebarExpanded" class="group-title">{{ group.name }}</span>
            <el-icon class="arrow-icon">
              <IEpCaretBottom v-if="!groupCollapsed[group.name]" />
              <IEpCaretRight v-else />
            </el-icon>
          </div>
          <transition name="fade">
            <div v-if="!groupCollapsed[group.name]" class="group-tools">
              <button 
                v-for="tool in group.tools" 
                :key="tool.name"
                @click="selectTool(tool)"
                :class="{ active: currentTool === tool }"
                class="tool-button"
              >
                <el-icon><component :is="tool.icon" /></el-icon>
                <span v-if="sidebarExpanded">{{ tool.chineseName }}</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
      <div class="tool-display">
        <component :is="currentTool?.component" v-if="currentTool" />
        <div v-else class="welcome-message">
          <h2>欢迎使用工具集</h2>
          <p>请从左侧选择一个工具开始使用</p>
        </div>
      </div>
    </div>
</template>
  
<script setup>

//自动导入组件
const toolModules = import.meta.glob('./tools/**/*.vue')
const tools = ref([])
const currentTool = ref(null)
const sidebarExpanded = ref(true)
const groupCollapsed = ref({})

// 初始化工具列表,异步加载组件
Object.entries(toolModules).forEach(([path, importFn]) => {
  const name = path.split('/').pop().replace('.vue', '')
  tools.value.push({
    name,
    chineseName: name,
    group: 'default',
    icon: 'el-icon-star-off', // 默认图标
    component: markRaw(defineAsyncComponent(importFn))
  })
})

// 预加载中文名称、分组信息和图标
Promise.all(
  tools.value.map(async (tool) => {
    const module = await toolModules[`./tools/${tool.name}.vue`]()
    const options = module.default.customOptions || {}
    tool.chineseName = options.chineseName || tool.name
    tool.group = options.group || 'default'
    tool.icon = options.icon || 'el-icon-star-off'
  })
).then(() => {
  // 初始化时将所有分组设置为折叠状态
  groupedTools.value.forEach(group => {
    groupCollapsed.value[group.name] = true
  })
})

function selectTool(tool) {
  currentTool.value = tool
}

function toggleSidebar() {
  sidebarExpanded.value = !sidebarExpanded.value
}

function toggleGroup(group) {
  groupCollapsed.value[group] = !groupCollapsed.value[group]

  // 如果当前分组被展开，则折叠其他分组
  if (!groupCollapsed.value[group]) {
    Object.keys(groupCollapsed.value).forEach(key => {
      if (key !== group) {
        groupCollapsed.value[key] = true
      }
    })
  } 
}

// 按分组组织工具
const groupedTools = computed(() => {
  const groups = {}
  tools.value.forEach(tool => {
    if (!groups[tool.group]) {
      groups[tool.group] = { name: tool.group, tools: [] }// icon: IconEpFolder,
    }
    groups[tool.group].tools.push(tool)
  })
  return Object.values(groups)
})

</script>
  
<style scoped>
.tools-layout {
  display: flex;
  height: 100vh;
  font-family: 'Arial', sans-serif;
}

.tool-sidebar {
  width: 250px;
  background-color: #f5f5f5;
  padding: 20px;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  transition: width 0.3s;
}

.tool-sidebar.collapsed {
  width: 60px;
}

.toggle-sidebar {
  width: 100%;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: right;
}

.tool-group {
  margin-bottom: 20px;
}

.group-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.group-header:hover {
  background-color: #e0e0e0;
}

.group-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-left: 10px;
  flex-grow: 1;
  text-align: center;
}

.arrow-icon {
  margin-left: auto;
}

.group-tools {
  margin-top: 10px;
}

.tool-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
  margin-bottom: 5px;
  background-color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.tool-button:hover {
  background-color: #e0e0e0;
}

.tool-button.active {
  background-color: #4CAF50;
  color: white;
}

.tool-button span {
  margin-left: 10px;
}

.tool-display {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: white;
}

.welcome-message {
  text-align: center;
  padding-top: 100px;
  color: #666;
}

.welcome-message h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.welcome-message p {
  font-size: 16px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.1s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>