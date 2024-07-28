<template>
  <div class="tools-home">
    <div class="tools-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <el-button @click="toggleSidebar" class="toggle-btn">
          <el-icon><i-ep-Fold v-show="!sidebarCollapsed" /><i-ep-Expand v-show="sidebarCollapsed" /></el-icon>
        </el-button>
      </div>
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="defaultProps"
        @node-click="handleNodeClick"
        :expand-on-click-node="true"
        :current-node-key="currentToolName"
        node-key="name"
        highlight-current
        @node-expand="handleNodeExpand"        
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <el-icon v-show="!data.children">
              <component :is="data.icon" />
            </el-icon>
            <el-icon v-show="data.children">
              <i-ep-FolderOpened v-show="node.expanded" />
              <i-ep-Folder v-show="!node.expanded" />
            </el-icon>
            <span v-show="!sidebarCollapsed">{{ node.label }}</span>
          </span>
        </template>
      </el-tree>
    </div>
    <div class="tools-content">
    <component :is="currentTool" v-if="currentTool" />
    <div v-else class="empty-state">
      <el-icon class="empty-icon"><i-ep-Tools /></el-icon>
      <h2>欢迎使用工具集</h2>
      <p>请在左侧选择一个工具开始使用</p>
    </div>
  </div>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'
import toolsList from '../config/toollist'

const { theme } = useData()

const sidebarCollapsed = ref(false)
const currentTool = ref(null)
const currentToolName = ref('')
const treeRef = ref(null)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const treeData = computed(() => {
  const groups = {}
  toolsList.forEach(tool => {
    if (!groups[tool.group]) {
      groups[tool.group] = {
        label: tool.groupName,
        name: `group_${tool.group}`,  // 添加唯一的name
        children: []
      }
    }
    groups[tool.group].children.push({
      label: tool.chineseName,
      icon: markRaw(tool.icon),
      name: tool.name
    })
  })
  return Object.values(groups)// [{ label: '所有工具', children: Object.values(groups), name: 'all' }]
})

const defaultProps = {
  children: 'children',
  label: 'label'
}

const handleNodeClick = (data, node) => {
  if (node.childNodes && node.childNodes.length > 0) {
    //...
  } else if (data.name) {
    // 如果点击的是叶子节点（工具）
    window.location.hash = data.name
    loadTool(data.name)
  }
}

const handleNodeExpand = (data, node) => {
  if (node.parent) {
    // 只有当节点有父节点时才执行
    node.parent.childNodes.forEach(childNode => {
      if (childNode !== node && childNode.expanded) {
        childNode.collapse()
      }
    })
  }
}

const loadTool = async (toolName) => {
  try {
    const module = await import(`../components/tools/${toolName}.vue`)
    currentTool.value = markRaw(module.default)
    currentToolName.value = toolName
    // 选中对应的树节点
    nextTick(() => {
      if (treeRef.value) {
        treeRef.value.setCurrentKey(toolName)
      }
    })
  } catch (error) {
    console.error(`Failed to load tool: ${toolName}`, error)
    currentTool.value = null
    currentToolName.value = ''
  }
}

onMounted(() => {
  const hash = window.location.hash.slice(1)
  if (hash) {
    loadTool(hash)
  }
})

watch(() => window.location.hash, (newHash) => {
  const toolName = newHash.slice(1)
  if (toolName) {
    loadTool(toolName)
  }
})
</script>
<style scoped>
.tools-home {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.tools-sidebar {
  width: 250px;
  transition: all 0.3s;
  background-color: #ffffff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;  
}

.tools-sidebar.collapsed {
  width: 53px;
}

.sidebar-header {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
}

.tools-content {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
}

.toggle-btn {
  padding: 10px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-btn .el-icon {
  font-size: 20px; /* 增大图标大小 */
}

.toggle-btn:hover {
  background-color: #f5f7fa;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  padding: 0 10px;
}

.custom-tree-node .el-icon {
  font-size: 18px;
}

:deep(.el-tree) {
  background-color: transparent;
  flex-grow: 1;
}

:deep(.el-tree-node__content) {
  height: 40px;
  border-radius: 4px;
  margin: 4px 0;
  transition: all 0.3s;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f0f2f5;
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #e6f7ff;
  color: #1890ff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 16px;
}
</style>