<template>
  <el-card class="image-base64-converter">
    <template #header>
      <div class="card-header">
        <span>图片 - Base64 转换工具 (图片太大时可能会出现卡顿，请耐心等待)</span>
      </div>
    </template>

    <el-tabs v-model="activeTab" >
      <el-tab-pane label="图片转Base64" name="imageToBase64">
        <div class="converter-container">
          <div class="panel left-panel">
            <el-button type="primary" 
              @click="convertToBase64" 
              :loading="isLoading" 
              :disabled="!imageFile">
              转换为Base64
            </el-button>
            <el-upload
              class="image-uploader"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleImageChange"
              :show-file-list="false"
            >
              <el-icon class="el-icon--upload"><i-ep-upload-filled /></el-icon>
              <div class="el-upload__text">
                拖拽图片到此处或 <em>点击上传</em>
              </div>
            </el-upload>

            <div v-if="imageUrl" class="image-preview">
              <img :src="imageUrl" alt="预览图" />
            </div>
          </div>

          <div class="panel right-panel">
            <el-button type="primary" @click="copyToClipboard(base64Result)" :disabled="!base64Result">
              复制Base64编码
            </el-button>            
            <el-input
              v-model="base64Result"
              type="textarea"
              :rows="15"
              placeholder="Base64 编码结果"
              readonly
            />

          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Base64转图片" name="base64ToImage">
        <div class="converter-container">
          <div class="panel left-panel">
            <el-button type="primary" 
              @click="convertToImage" 
              :loading="isLoading"
              :disabled="!base64Input">
              转换为图片
            </el-button>
            <el-input
              :model-value="base64Input"
              @input="debouncedHandleBase64Input"
              type="textarea"
              :rows="10"
              placeholder="请输入Base64编码"
            />
          </div>

          <div class="panel right-panel">
            <el-button type="primary" @click="downloadImage" :disabled="!convertedImageUrl">
              下载图片
            </el-button>
            <div v-if="convertedImageUrl" class="image-preview">
              <img :src="convertedImageUrl" alt="转换后的图片" />
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    
  </el-card>
</template>
  
  <script setup lang="ts">
  
  const activeTab = ref('imageToBase64')
  const imageFile = ref(null)
  const imageUrl = ref('')
  const base64Result = ref('')
  const base64Input = ref('')
  const convertedImageUrl = ref('')

  const isLoading = ref(false)
  let worker: Worker | null = null
  
  const handleImageChange = (file) => {
    imageFile.value = file.raw
    imageUrl.value = URL.createObjectURL(file.raw)
  }
  
  const convertToBase64 = () => {
    if (!imageFile.value) {
      ElMessage.warning('请先选择一张图片')
      return
    }

    isLoading.value = true

    worker?.postMessage({
      type: 'convertToBase64',
      file: imageFile.value
    })
  }
  
  const convertToImage = () => {
    if (!base64Input.value) {
      ElMessage.warning('请输入Base64编码')
      return
    }

    isLoading.value = true

    worker?.postMessage({
      type: 'convertToImage',
      base64: base64Input.value
    })
  }

// 添加防抖函数
const debounce = (fn: Function, delay: number) => {
  let timer: number | null = null
  return function(...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 使用防抖处理Base64输入
const debouncedHandleBase64Input = debounce((value: string) => {
  base64Input.value = value
}, 100)
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('已复制到剪贴板')
    }, () => {
      ElMessage.error('复制失败')
    })
  }

  const getFileExtensionFromMimeType = (mimeType) => {
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/bmp': 'bmp',
      'image/webp': 'webp',
      'image/svg+xml': 'svg'
    }
    return mimeToExt[mimeType] || 'png' // 默认为 png
  }

  const getMimeTypeFromBase64 = (base64String) => {
    if (base64String.startsWith('data:')) {
      const endIndex = base64String.indexOf(';base64,');
      if (endIndex !== -1) {
        return base64String.substring(5, endIndex);
      }
    }
    return 'image/png'; // 默认MIME类型
  }  

  const downloadImage = () => {
    if (!convertedImageUrl.value) {
      ElMessage.warning('没有可下载的图片')
      return
    }

    const mimeType = getMimeTypeFromBase64(convertedImageUrl.value)
    const fileExtension = getFileExtensionFromMimeType(mimeType)
    
    const link = document.createElement('a')
    link.href = convertedImageUrl.value
    link.download = `converted_image.${fileExtension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success(`图片已下载为 ${fileExtension.toUpperCase()} 格式`)
  }  

  onMounted( async () => {
    worker = new Worker(new URL('../../library/imageWorker.ts', import.meta.url), { type: 'module' })
    //worker = worker = new Worker(WorkerUrl, { type: 'module' }); 
    worker.onmessage = (e: MessageEvent) => {
     if (e.data.type === 'result') {
        if (activeTab.value === 'imageToBase64') {
          base64Result.value = e.data.value
        } else {
          //console.log(e.data.value);
          convertedImageUrl.value = e.data.value
        }
        isLoading.value = false
        ElMessage.success('转换成功')
      } else if (e.data.type === 'error') {
        isLoading.value = false
        ElMessage.error(e.data.message)
      }
    }
  })
  onUnmounted(() => {
    if (worker) {
      worker.terminate()
    }
  })  

  </script>
  
<style scoped>
.image-base64-converter {
  max-width: 1920px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.converter-container {
  display: flex;
  gap: 20px;
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 5px;
}

.image-uploader {
  margin-bottom: 5px;
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  background-color: #fff;
  min-height: 200px;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.el-button {
  align-self: flex-start;
  margin-bottom: 5px;
}

.el-textarea {
  margin-bottom: 20px;
}


:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
}

:deep(.el-tabs__item) {
  font-size: 16px;
}

:deep(.el-tabs__item.is-active) {
  font-weight: bold;
}

</style>
  