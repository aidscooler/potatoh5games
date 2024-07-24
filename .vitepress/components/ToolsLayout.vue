<template>
  <div class="tools-home">
    <div class="tools-sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <el-button @click="toggleSidebar" class="toggle-btn">
        <el-icon><Fold v-if="!sidebarCollapsed" /><Expand v-else /></el-icon>
      </el-button>
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="defaultProps"
        @node-click="handleNodeClick"
        :expand-on-click-node="true"
        :current-node-key="currentToolName"
        node-key="name"
        highlight-current
        :expanded-keys="expandedKeys"
        @node-expand="handleNodeExpand"        
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <el-icon v-if="data.icon"><component :is="data.icon" /></el-icon>
            <span v-if="!sidebarCollapsed">{{ node.label }}</span>
          </span>
        </template>
      </el-tree>
    </div>
    <div class="tools-content">
      <component :is="currentTool" v-if="currentTool" />
      <div v-else>请选择一个工具</div>
    </div>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'
import toolsList from '../config/toollist.json'
import { ElTree, ElButton, ElIcon } from 'element-plus'
import { Fold, Expand } from '@element-plus/icons-vue'

const { theme } = useData()

const sidebarCollapsed = ref(false)
const currentTool = ref(null)
const currentToolName = ref('')
const treeRef = ref(null)
const expandedKeys = ref([])

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const treeData = computed(() => {
  const groups = {}
  toolsList.forEach(tool => {
    if (!groups[tool.group]) {
      groups[tool.group] = {
        label: tool.group,
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
    // 如果点击的是分组节点
    const key = data.name
    const index = expandedKeys.value.indexOf(key)
    if (index > -1) {
      // 如果节点已经展开，则从数组中移除（折叠）
      expandedKeys.value.splice(index, 1)
    } else {
      // 如果节点未展开，则添加到数组（展开）
      // 首先，移除所有同级节点
      if (node.parent) {
        expandedKeys.value = expandedKeys.value.filter(k => 
          !node.parent.childNodes.some(sibling => sibling.data.name === k)
        )
      } else {
        // 如果是顶级节点，清空整个数组
        expandedKeys.value = []
      }
      // 然后添加当前节点
      expandedKeys.value.push(key)
    }
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
  // 假设您想默认展开第一个顶级节点
  if (treeData.value.length > 0) {
    expandedKeys.value = [treeData.value[0].name]
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
}

.tools-sidebar {
  width: 250px;
  transition: width 0.3s;
  background-color: #f0f0f0;
  overflow-y: auto;
}

.tools-sidebar.collapsed {
  width: 50px;
}

.tools-content {
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
}

.toggle-btn {
  margin-bottom: 10px;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}

.custom-tree-node .el-icon {
  font-size: 20px;
}

:deep(.el-tree-node__content) {
  height: 40px;
}
</style>
