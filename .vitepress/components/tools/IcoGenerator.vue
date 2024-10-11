<template>
    <div class="ico-generator">
      <el-card class="generator-card">
        <template #header>
          <div class="card-header">
            <h2>ICO 生成器</h2>
          </div>
        </template>
        <el-form :model="form" label-position="top">
          <el-form-item label="上传图片">
            <el-upload
              class="upload-demo"
              drag
              :auto-upload="false"
              :on-change="handleFileChange"
              :show-file-list="false"
              accept=".jpg,.jpeg,.png,.gif,.bmp"
              style="width: 100%;"
            >
              <el-icon class="el-icon--upload"><i-ep-upload-filled/></el-icon>
              
              <div class="el-upload__text">
                拖拽文件到此处或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 JPG/JPEG/PNG/GIF/BMP 格式
                </div>
              </template>
            </el-upload>
          </el-form-item>
          <el-form-item label="ICO 尺寸">
            <el-select v-model="form.size" @change="generateIco">
              <el-option
                v-for="size in sizes"
                :key="size"
                :label="`${size}x${size}`"
                :value="size"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="preview-container">
          <el-row :gutter="20">
            <el-col :span="12">
              <h3>原图预览</h3>
              <el-image
                v-if="originalImageUrl"
                :src="originalImageUrl"
                fit="contain"
                class="preview-image"
              >
                <template #placeholder>
                  <div class="image-slot">
                    加载中<span class="dot">...</span>
                  </div>
                </template>
              </el-image>
            </el-col>
            <el-col :span="12">
                <h3>ICO 预览 ({{ form.size }}x{{ form.size }})</h3>
                <div class="ico-preview-wrapper">
                    <div class="ico-preview-container" :style="icoPreviewContainerStyle">
                    <el-image
                        v-if="previewUrl"
                        :src="previewUrl"
                        :style="icoImageStyle"
                        class="ico-preview"
                    >
                        <template #placeholder>
                        <div class="image-slot">
                            加载中<span class="dot">...</span>
                        </div>
                        </template>
                    </el-image>
                    </div>
                </div>
            </el-col>
          </el-row>
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="generateIco" :loading="isLoading">
            重新生成 ICO
          </el-button>
          <el-button type="success" @click="downloadIco" :disabled="!previewUrl">
            下载 ICO
          </el-button>
        </div>
      </el-card>
    </div>
  </template>
  
  <script setup>
  
  const sizes = [16, 32, 48, 64, 128, 256, 512]
  const form = reactive({
    size: 32
  })
  const imageFile = ref(null)
  const originalImageUrl = ref('')
  const previewUrl = ref('')
  const isLoading = ref(false)
  const fileName = ref('')
  
  const handleFileChange = (file) => {
    imageFile.value = file.raw
    fileName.value = file.name.split('.')[0]
    originalImageUrl.value = URL.createObjectURL(file.raw)
  }
  
  const generateIco = async () => {
    if (!imageFile.value) {
      ElMessage.warning('请先上传图片')
      return
    }
  
    isLoading.value = true
  
    try {
      const pica = (await import('pica')).default()
      const canvas = document.createElement('canvas')
      canvas.width = form.size
      canvas.height = form.size
  
      const img = await createImageBitmap(imageFile.value)
      await pica.resize(img, canvas)
  
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const arrayBuffer = await blob.arrayBuffer()
  
      const ico = await generateICO(arrayBuffer, form.size)
      const icoBlob = new Blob([ico], { type: 'image/x-icon' })
      previewUrl.value = URL.createObjectURL(icoBlob)
  
      ElMessage.success('ICO 生成成功')
    } catch (error) {
      console.error(error)
      ElMessage.error('ICO 生成失败，请重试')
    } finally {
      isLoading.value = false
    }
  }
  
  const downloadIco = () => {
    const link = document.createElement('a')
    link.href = previewUrl.value
    link.download = `${fileName.value}.ico`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // ICO 生成函数
  async function generateICO(pngData, size) {
    const view = new DataView(pngData)
    const bytes = new Uint8Array(pngData)
  
    const iconDir = new ArrayBuffer(6)
    const iconDirView = new DataView(iconDir)
    iconDirView.setUint16(0, 0, true)  // Reserved
    iconDirView.setUint16(2, 1, true)  // Image type: ICO
    iconDirView.setUint16(4, 1, true)  // Number of images
  
    const iconDirEntry = new ArrayBuffer(16)
    const iconDirEntryView = new DataView(iconDirEntry)
    iconDirEntryView.setUint8(0, size)   // Width
    iconDirEntryView.setUint8(1, size)   // Height
    iconDirEntryView.setUint8(2, 0)      // Color palette
    iconDirEntryView.setUint8(3, 0)      // Reserved
    iconDirEntryView.setUint16(4, 1, true)  // Color planes
    iconDirEntryView.setUint16(6, 32, true) // Bits per pixel
    iconDirEntryView.setUint32(8, bytes.length, true)  // Image size
    iconDirEntryView.setUint32(12, iconDir.byteLength + iconDirEntry.byteLength, true)  // Offset
  
    const ico = new Uint8Array(iconDir.byteLength + iconDirEntry.byteLength + bytes.length)
    ico.set(new Uint8Array(iconDir), 0)
    ico.set(new Uint8Array(iconDirEntry), iconDir.byteLength)
    ico.set(bytes, iconDir.byteLength + iconDirEntry.byteLength)
  
    return ico.buffer
  }
  
  // 监听 imageFile 变化，自动生成 ICO
  watch(imageFile, (newFile) => {
    if (newFile) {
      generateIco()
    }
  })

  // 计算ICO预览容器的样式
  const icoPreviewContainerStyle = computed(() => {
    const maxSize = 300;
    const scale = Math.min(1, maxSize / form.size);
    return {
        width: `${form.size * scale}px`,
        height: `${form.size * scale}px`,
        objectFit: 'none',
    }
})

const icoImageStyle = computed(() => {
    const scale = Math.min(1, 300 / form.size);
    return {
        width: `${form.size * scale}px`,
        height: `${form.size * scale}px`,
        objectFit: 'none',
    }
})
  </script>
  
  <style scoped>
  .ico-generator {
    max-width: 960px;
    margin: 0 auto;
  }
  .generator-card {
    margin-top: 20px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .preview-container {
    margin-top: 20px;
  }
  .preview-image {
    width: 100%;
    height: 200px;
    object-fit: contain;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 10px;
  }
  .action-buttons {
    margin-top: 20px;
    text-align: center;
  }
  .image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
    font-size: 14px;
  }
  .dot {
    animation: dot 1.5s infinite ease-in-out;
    display: inline-block;
  }
  @keyframes dot {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60% { content: '...'; }
    80%, 100% { content: ''; }
  }
  .ico-preview-wrapper {
    display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 320px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
  overflow: hidden;
}

.ico-preview-container {
    display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border: 1px solid #dcdfe6;
}

.ico-preview {
  display: block;
  max-width: 100%;
  max-height: 100%;
}
.upload-demo {
  width: 100%;
}

.el-upload {
  width: 100%;
}

.el-upload-dragger {
  width: 100%;
}
  </style>
  