<template>
  <el-card class="image-base64-converter">
    <template #header>
      <div class="card-header">
        <span>图片 - Base64 转换工具</span>
      </div>
    </template>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="图片转Base64" name="imageToBase64">
        <div class="converter-container">
          <div class="panel left-panel">
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

            <el-button type="primary" @click="convertToBase64" :disabled="!imageFile">
              转换为Base64
            </el-button>
          </div>

          <div class="panel right-panel">
            <el-input
              v-model="base64Result"
              type="textarea"
              :rows="15"
              placeholder="Base64 编码结果"
              readonly
            />

            <el-button type="primary" @click="copyToClipboard(base64Result)" :disabled="!base64Result">
              复制Base64编码
            </el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Base64转图片" name="base64ToImage">
        <div class="converter-container">
          <div class="panel left-panel">
            <el-input
              v-model="base64Input"
              type="textarea"
              :rows="10"
              placeholder="请输入Base64编码"
            />

            <el-button type="primary" @click="convertToImage" :disabled="!base64Input">
              转换为图片
            </el-button>
          </div>

          <div class="panel right-panel">
            <div v-if="convertedImageUrl" class="image-preview">
              <img :src="convertedImageUrl" alt="转换后的图片" />
            </div>

            <el-button type="primary" @click="downloadImage" :disabled="!convertedImageUrl">
              下载图片
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>
  
  <script setup>

  import { ElMessage } from 'element-plus'
  
  const activeTab = ref('imageToBase64')
  const imageFile = ref(null)
  const imageUrl = ref('')
  const base64Result = ref('')
  const base64Input = ref('')
  const convertedImageUrl = ref('')
  
  const handleImageChange = (file) => {
    imageFile.value = file.raw
    imageUrl.value = URL.createObjectURL(file.raw)
  }
  
  const convertToBase64 = () => {
    if (!imageFile.value) {
      ElMessage.warning('请先选择一张图片')
      return
    }
  
    const reader = new FileReader()
    reader.onload = (e) => {
      base64Result.value = e.target.result
      ElMessage.success('图片已成功转换为Base64编码')
    }
    reader.readAsDataURL(imageFile.value)
  }
  
  const convertToImage = () => {
    if (!base64Input.value) {
      ElMessage.warning('请输入Base64编码')
      return
    }
  
    try {
      convertedImageUrl.value = base64Input.value
      ElMessage.success('Base64编码已成功转换为图片')
    } catch (error) {
      ElMessage.error('无效的Base64编码')
    }
  }
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('已复制到剪贴板')
    }, () => {
      ElMessage.error('复制失败')
    })
  }
  
  const downloadImage = () => {
    const link = document.createElement('a')
    link.href = convertedImageUrl.value
    link.download = 'converted_image.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  </script>
  
<style scoped>
.image-base64-converter {
  max-width: 1920px;
  margin: 20px auto;
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
  margin-top: 20px;
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 20px;
}

.image-uploader {
  margin-bottom: 20px;
}

.image-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
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
  margin-top: 10px;
  align-self: flex-start;
}

.el-textarea {
  margin-bottom: 20px;
}

.el-tabs {
  margin-top: 20px;
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
  