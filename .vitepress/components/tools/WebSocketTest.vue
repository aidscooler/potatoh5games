<template>
  <div class="websocket-tester">
    <el-card class="websocket-tester">
      <template #header>
        <div class="card-header">
          <span>WebSocket 测试工具</span>
          <el-switch
            v-model="darkMode"
            active-text="暗色模式"
            inactive-text="亮色模式"
          />
        </div>
      </template>
      
      <div class="content-wrapper">
        <div class="left-panel">
          <el-form :model="form" label-width="130px" :rules="formRules" ref="formRef">
            <el-form-item label="WebSocket URL" prop="url">
              <el-input v-model="form.url" placeholder="example.com/websocket">
                <template #prepend>
                  <el-tooltip
                    content="推荐使用 wss:// 以确保安全加密连接。ws:// 不加密，仅建议在受信任的环境中使用。"
                    placement="top"
                  >
                    <el-select v-model="form.protocol" style="width: 120px">
                      <el-option label="wss://" value="wss://" />
                      <el-option label="ws://" value="ws://" />
                    </el-select>
                  </el-tooltip>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="connect" 
                :disabled="isConnected || isLoading"
                :loading="isLoading"
              >
                {{ connectButtonText }}
              </el-button>
              <el-button @click="disconnect" :disabled="!isConnected">断开</el-button>
            </el-form-item>
          </el-form>
  
          <el-divider />
  
          <div class="message-input">
            <el-input
              v-model="messageToSend"
              type="textarea"
              :rows="3"
              placeholder="输入要发送的消息"
            />
            <el-button type="primary" @click="sendMessage" :disabled="!isConnected || !messageToSend.trim()">发送</el-button>
          </div>
        </div>
  
        <div class="right-panel">
          <div class="message-display">
            <h4>消息记录</h4>
            <el-scrollbar height="400px">
              <div v-for="(msg, index) in messages" :key="index" class="message-item">
                <span :class="msg.type">
                  {{ msg.type === 'sent' ? '发送' : '接收' }}
                  ({{ formatTime(msg.timestamp) }}):
                </span>
                {{ msg.content }}
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </el-card>
  </div>
  </template>
<script setup>
import { ElMessage,ElSwitch, ElInput, ElButton } from 'element-plus'

const darkMode = ref(false)
const isConnected = ref(false)
const isLoading = ref(false)  // 加载状态
const socket = ref(null)
const messages = ref([])
const messageToSend = ref('')
const formRef = ref(null)

// 监听 darkMode 的变化
watch(darkMode, (newValue) => {
  if (newValue) {
    document.body.setAttribute('data-theme', 'dark')
  } else {
    document.body.removeAttribute('data-theme')
  }
})

const connectButtonText = computed(() => {
  if (isConnected.value) return '已连接'
  if (isLoading.value) return '连接中...'
  return '连接'
})

const form = reactive({
  protocol: 'wss://',
  url: '',
})

const addMessage = (type, content) => {
  messages.value.push({
    type,
    content,
    timestamp: new Date().getTime()
  });
};

const formRules = {
  url: [
    { required: true, message: '请输入WebSocket URL', trigger: 'blur' },
    { pattern: /^[^\/\s]+[^\s]*$/, message: '请输入有效的URL', trigger: 'blur' }
  ]
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toTimeString().split(' ')[0];
};

const connect = () => {   
  formRef.value.validate((valid) => {
    if (valid) {
      const fullUrl = `${form.protocol}${form.url}`
      if (form.protocol === 'ws://') {
        ElMessage.warning('你正在使用不安全的 ws:// 协议。在生产环境中，建议使用 wss:// 以确保安全。')
      }      
      isLoading.value = true  // 开始连接
      try {
        socket.value = new WebSocket(fullUrl)

        socket.value.onopen = () => {
          isConnected.value = true
          isLoading.value = false
          ElMessage.success('WebSocket 连接成功')
        }

        socket.value.onmessage = (event) => {
            addMessage('received', event.data);
        }

        socket.value.onclose = () => {
          isConnected.value = false
          isLoading.value = false  // 结束加载
          ElMessage.info('WebSocket 连接已关闭')
        }

        socket.value.onerror = (error) => {
          ElMessage.error('WebSocket 错误: ' + error.message)
          isConnected.value = false
          isLoading.value = false  // 结束加载
        }
      } catch (error) {
        ElMessage.error('创建WebSocket连接时出错: ' + error.message)
        isLoading.value = false  // 结束加载
      }
    } else {
      ElMessage.warning('请输入有效的WebSocket URL')
    }
  })
}

const disconnect = () => {
    if (socket.value && (socket.value.readyState === WebSocket.OPEN || socket.value.readyState === WebSocket.CONNECTING)) {
      socket.value.close()
    }    
    if (socket.value) {
        socket.value.close()
        socket.value = null
        isConnected.value = false
    }
}

const sendMessage = () => {
  if (socket.value && messageToSend.value.trim()) {
    try {
      socket.value.send(messageToSend.value)
      addMessage('sent', messageToSend.value);
      messageToSend.value = ''
    } catch (error) {
      ElMessage.error('发送消息时出错: ' + error.message)
    }
  }
}

onUnmounted(() => {
  disconnect()
})
</script>

<style >

:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #dcdfe6;
}

[data-theme="dark"] {
  --bg-color: #1f1f1f;
  --text-color: #ffffff;
  --border-color: #4c4c4c;
}
.websocket-tester {
  max-width: 1920px;
  margin: 0 auto;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.websocket-tester .el-card {
  background-color: var(--bg-color);
  border-color: var(--border-color);
}

.websocket-tester .el-card__header {
  border-bottom-color: var(--border-color);
}

.websocket-tester .el-input__inner,
.websocket-tester .el-textarea__inner {
  background-color: var(--bg-color);
  color: var(--text-color);
  border-color: var(--border-color);
}

.websocket-tester .el-button {
  border-color: var(--border-color);
}

.websocket-tester .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.websocket-tester .content-wrapper {
  display: flex;
  gap: 20px;
}

.websocket-tester .left-panel {
  flex: 1;
}

.websocket-tester .right-panel {
  flex: 1;
}

.websocket-tester .message-input {
  margin-top: 20px;
}

.websocket-tester .message-input .el-button {
  margin-top: 10px;
}

.websocket-tester .message-display {
  height: 100%;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 10px;  
}

.websocket-tester .message-display h4 {
  margin-top: 0;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.websocket-tester .message-item {
  margin-bottom: 8px;
}

.websocket-tester .message-item .sent {
  color: #67c23a;
}

.websocket-tester .message-item .received {
  color: #409eff;
}
/* 为了使滚动条样式与消息框相匹配 */
.websocket-tester .el-scrollbar__wrap {
  margin-right: -10px !important;
}
</style>