<template>
    <el-card class="ws-tester">
      <template #header>
        <div class="card-header">
          <span>WebSocket 测试工具(因浏览器安全机制，不再支持ws://协议，请使用wss://)</span>
        </div>
      </template>
      
      <div class="ws-tester__content" style="display: flex;gap: 20px;">
        <div class="ws-tester__left-panel" style="flex: 1;min-width: 0; ">
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
  
          <div class="ws-tester__message-input">
            <el-input
              v-model="messageToSend"
              type="textarea"
              :rows="3"
              placeholder="输入要发送的消息"
            />
            <el-button type="primary" @click="sendMessage" :disabled="!isConnected || !messageToSend.trim()">发送</el-button>
          </div>
        </div>
  
        <div class="ws-tester__right-panel" style="flex: 1;min-width: 0; ">
          <div style="height: 100%;border: 1px solid #dcdfe6;border-radius: 4px;padding: 10px;  ">
            <h4 style="  margin-top: 0;margin-bottom: 10px;padding-bottom: 10px;border-bottom: 1px solid #dcdfe6;">消息记录</h4>
            <el-scrollbar height="400px">
              <div v-for="(msg, index) in messages" :key="index"  style="margin-bottom: 8px;">
                <span v-if="msg.type === 'sent'" style="color: #67c23a;">
                  发送 ({{ formatTime(msg.timestamp) }}):
                </span>
                <span v-if="msg.type === 'received'" style="color: #409eff;">
                  接收 ({{ formatTime(msg.timestamp) }}):
                </span>
                {{ msg.content }}
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </el-card>
</template>

<script setup>

const isConnected = ref(false)
const isLoading = ref(false)  // 加载状态
const socket = ref(null)
const messages = ref([])
const messageToSend = ref('')
const formRef = ref(null)

const messageStyle = {
  sent: { color: '#67c23a' },
  received: { color: '#409eff' }
}

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

<style scoped>
.ws-tester {
  max-width: 1200px;
  margin: 0 auto;
}

.ws-tester__content {
  display: flex;
  gap: 20px;
}

.ws-tester__left-panel,
.ws-tester__right-panel {
  flex: 1;
  min-width: 0; /* 防止flex子项溢出 */
}

.ws-tester__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ws-tester__message-input {
  margin-top: 20px;
}

.ws-tester__message-input .el-button {
  margin-top: 10px;
}


/* 响应式设计 */
@media (max-width: 768px) {
  .ws-tester__content {
    flex-direction: column;
  }
}

/* 确保滚动条样式在所有环境中一致 */
.el-scrollbar__wrap {
  margin-right: -10px !important;
}
</style>