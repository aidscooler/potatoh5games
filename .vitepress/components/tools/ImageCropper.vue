<template>
  <el-card class="image-cropper-tool">
    <div class="cropper-layout">
      <!-- 左侧图片上传和预览区 -->
      <div class="image-preview">
        <div class="preview-container" ref="previewContainer">
          <img v-if="imageUrl" :src="imageUrl" ref="previewImage" @load="onImageLoad" alt="预览图片"/>
          <div 
            v-if="imageUrl" 
            class="crop-box" 
            :style="cropBoxStyle" 
            @mousedown="startMove" 
            tabindex="0"
            @keydown="handleKeyDown"
            role="application"
            aria-label="裁剪框"
          >
            <div v-for="handle in resizeHandles" :key="handle" 
                 :class="['resize-handle', handle]" 
                 @mousedown.stop="(e) => startResize(e, handle)">
            </div>    
          </div>
        </div>
      </div>

      <!-- 右侧裁剪选项 -->
      <div class="cropper-settings">
        <div class="button-group">
          <el-upload
            class="upload-area"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            :http-request="customUpload"
          >
            <el-button type="primary">上传图片</el-button>
          </el-upload>
          <el-button type="danger" @click="deleteImage" v-if="imageUrl">删除图片</el-button>
          <el-button type="success" @click="cropImage" :disabled="!imageUrl">裁剪</el-button>
        </div>        
        <el-form label-position="left" label-width="80px">
          <el-form-item label="宽度(px)">
            <el-input-number 
              v-model="cropOptions.width" 
              :min="1" 
              :max="imageWidth || 1"
              :step="1"
              @change="updateCropBox"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="高度(px)">
            <el-input-number 
              v-model="cropOptions.height" 
              :min="1" 
              :max="imageHeight || 1" 
              :step="1"
              @change="updateCropBox"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="位置X(px)">
            <el-input-number 
              v-model="cropOptions.x" 
              :min="0" 
              :max="maxX" 
              :step="1"
              @change="updateCropBox"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="位置Y(px)">
            <el-input-number 
              v-model="cropOptions.y" 
              :min="0" 
              :max="maxY" 
              :step="1"
              @change="updateCropBox"
            ></el-input-number>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </el-card>
</template>
  
<script setup>
const imageUrl = ref('')
const previewContainer = ref(null)
const previewImage = ref(null)
const imageWidth = ref(0)
const imageHeight = ref(0)
const scale = ref(1)

const imageOffsetX = ref(0)
const imageOffsetY = ref(0)

const maxX = computed(() => Math.max((imageWidth.value || 0) - cropOptions.width, 0))
const maxY = computed(() => Math.max((imageHeight.value || 0) - cropOptions.height, 0))  

const cropOptions = reactive({
  width: 0,
  height: 0,
  x: 0,
  y: 0
})

const resizeHandles = ['top-left', 'top-middle', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-middle', 'bottom-right']

const cropBoxStyle = computed(() => ({
  width: `${Math.floor(cropOptions.width * scale.value)}px`,
  height: `${Math.floor(cropOptions.height * scale.value)}px`,
  left: `${Math.floor(cropOptions.x * scale.value + imageOffsetX.value)}px`,
  top: `${Math.floor(cropOptions.y * scale.value + imageOffsetY.value)}px`
}))

const handleUploadSuccess = (res) => {
  imageUrl.value = res.url
}

const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isGIF = file.type === 'image/gif'

  if (!isJPG && !isPNG && !isGIF) {
    ElMessage.error('上传图片只能是 JPG/PNG/GIF 格式!')
    return false
  }

  return true
}

const customUpload = ({ file }) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
  }
  reader.onerror = () => {
    ElMessage.error('图片上传失败，请重试')
  }    
  reader.readAsDataURL(file)
}

const onImageLoad = () => {
  if (!previewContainer.value || !previewImage.value) return
  const container = previewContainer.value
  const img = previewImage.value
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight
  const imgWidth = img.naturalWidth
  const imgHeight = img.naturalHeight

  const containerRatio = containerWidth / containerHeight
  const imgRatio = imgWidth / imgHeight

  if (imgRatio > containerRatio) {
    scale.value = containerWidth / imgWidth
    img.style.width = '100%'
    img.style.height = 'auto'
    imageOffsetY.value = (containerHeight - (imgHeight * scale.value)) / 2
    imageOffsetX.value = 0    
  } else {
    scale.value = containerHeight / imgHeight
    img.style.width = 'auto'
    img.style.height = '100%'
    imageOffsetX.value = (containerWidth - (imgWidth * scale.value)) / 2
    imageOffsetY.value = 0    
  }
  imageWidth.value = imgWidth
  imageHeight.value = imgHeight
  // 初始化裁剪选项
  initializeCropBox()
}

const updateCropBox = () => {
  cropOptions.width = Math.floor(Math.min(Math.max(cropOptions.width, 10), imageWidth.value))
  cropOptions.height = Math.floor(Math.min(Math.max(cropOptions.height, 10), imageHeight.value))
  cropOptions.x = Math.floor(Math.min(Math.max(cropOptions.x, 0), imageWidth.value - cropOptions.width))
  cropOptions.y = Math.floor(Math.min(Math.max(cropOptions.y, 0), imageHeight.value - cropOptions.height))
}

const initializeCropBox = () => {
  const aspectRatio = imageWidth.value / imageHeight.value
  let newWidth, newHeight
  if (aspectRatio > 1) {
    newWidth = Math.floor(imageWidth.value * 0.8)
    newHeight = Math.floor(newWidth / aspectRatio)
  } else {
    newHeight = Math.floor(imageHeight.value * 0.8)
    newWidth = Math.floor(newHeight * aspectRatio)
  }
  cropOptions.width = newWidth
  cropOptions.height = newHeight
  cropOptions.x = Math.floor((imageWidth.value - newWidth) / 2)
  cropOptions.y = Math.floor((imageHeight.value - newHeight) / 2)
}  

const startResize = (e, handle) => {
  if (e && e.preventDefault) {
    e.preventDefault();
  }
  const startX = e.clientX
  const startY = e.clientY
  const startWidth = cropOptions.width
  const startHeight = cropOptions.height
  const startLeft = cropOptions.x
  const startTop = cropOptions.y

  const onMouseMove = (moveEvent) => {
    const dx = (moveEvent.clientX - startX) / scale.value
    const dy = (moveEvent.clientY - startY) / scale.value

    switch (handle) {
      case 'top-left':
        cropOptions.x = Math.min(Math.max(startLeft + dx, 0), startLeft + startWidth - 10)
        cropOptions.y = Math.min(Math.max(startTop + dy, 0), startTop + startHeight - 10)
        cropOptions.width = startWidth - (cropOptions.x - startLeft)
        cropOptions.height = startHeight - (cropOptions.y - startTop)
        break
      case 'top-middle':
        cropOptions.y = Math.min(Math.max(startTop + dy, 0), startTop + startHeight - 10)
        cropOptions.height = startHeight - (cropOptions.y - startTop)
        break
      case 'top-right':
        cropOptions.y = Math.min(Math.max(startTop + dy, 0), startTop + startHeight - 10)
        cropOptions.width = Math.min(Math.max(startWidth + dx, 10), imageWidth.value - startLeft)
        cropOptions.height = startHeight - (cropOptions.y - startTop)
        break
      case 'middle-left':
        cropOptions.x = Math.min(Math.max(startLeft + dx, 0), startLeft + startWidth - 10)
        cropOptions.width = startWidth - (cropOptions.x - startLeft)
        break
      case 'middle-right':
        cropOptions.width = Math.min(Math.max(startWidth + dx, 10), imageWidth.value - startLeft)
        break
      case 'bottom-left':
        cropOptions.x = Math.min(Math.max(startLeft + dx, 0), startLeft + startWidth - 10)
        cropOptions.width = startWidth - (cropOptions.x - startLeft)
        cropOptions.height = Math.min(Math.max(startHeight + dy, 10), imageHeight.value - startTop)
        break
      case 'bottom-middle':
        cropOptions.height = Math.min(Math.max(startHeight + dy, 10), imageHeight.value - startTop)
        break
      case 'bottom-right':
        cropOptions.width = Math.min(Math.max(startWidth + dx, 10), imageWidth.value - startLeft)
        cropOptions.height = Math.min(Math.max(startHeight + dy, 10), imageHeight.value - startTop)
        break
    }
    updateCropBox()
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const cropImage = () => {
  if (!previewImage.value) {
    ElMessage.error('请先上传图片')
    return
  }    
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = cropOptions.width
  canvas.height = cropOptions.height
  ctx.imageSmoothingEnabled = false; // 关闭图像平滑
  try {
    ctx.drawImage(
      previewImage.value,
      cropOptions.x,
      cropOptions.y,
      cropOptions.width,
      cropOptions.height,
      0,
      0,
      cropOptions.width,
      cropOptions.height)
    // 获取原始图片的文件类型
    const originalFormat = imageUrl.value.split(';')[0].split('/')[1]
    // 根据原始格式设置MIME类型
    let mimeType
    switch (originalFormat.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        mimeType = 'image/jpeg'
        break
      case 'png':
        mimeType = 'image/png'
        break
      case 'gif':
        mimeType = 'image/gif'
        break
      default:
        mimeType = 'image/png' // 默认使用PNG
    }
    // 使用toDataURL以最高质量导出图片
    const dataUrl = canvas.toDataURL(mimeType, 1.0)          
    // 创建下载链接
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `cropped_image.${originalFormat}`
    link.click()
  } catch(error) {
    console.error('裁剪过程中发生错误:', error)
    ElMessage.error('裁剪失败，请重试')        
  }
}

const deleteImage = () => {
  imageUrl.value = ''
  cropOptions.width = 100
  cropOptions.height = 100
  cropOptions.x = 0
  cropOptions.y = 0
}

const startMove = (e) => {
  e.preventDefault()
  const startX = e.clientX
  const startY = e.clientY
  const startLeft = cropOptions.x
  const startTop = cropOptions.y

  const onMouseMove = (e) => {
    const dx = (e.clientX - startX) / scale.value
    const dy = (e.clientY - startY) / scale.value

    cropOptions.x = Math.min(Math.max(startLeft + dx, 0), imageWidth.value - cropOptions.width)
    cropOptions.y = Math.min(Math.max(startTop + dy, 0), imageHeight.value - cropOptions.height)

    updateCropBox()
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const handleKeyDown = (e) => {
  const step = e.shiftKey ? 10 : 1
  switch (e.key) {
    case 'ArrowLeft':
      cropOptions.x = Math.max(cropOptions.x - step, 0)
      break
    case 'ArrowRight':
      cropOptions.x = Math.min(cropOptions.x + step, imageWidth.value - cropOptions.width)
      break
    case 'ArrowUp':
      cropOptions.y = Math.max(cropOptions.y - step, 0)
      break
    case 'ArrowDown':
      cropOptions.y = Math.min(cropOptions.y + step, imageHeight.value - cropOptions.height)
      break
  }
  updateCropBox()
}

watch([imageWidth, imageHeight], () => {
  updateCropBox()
})
let observer
onMounted(() => {
  //window.addEventListener('resize', onImageLoad)
  observer = new ResizeObserver(onImageLoad)
  observer.observe(previewContainer.value)
})

onUnmounted(() => {
  //window.removeEventListener('resize', onImageLoad)
  if(observer) {
    observer.disconnect
  }
})
</script>
  
<style scoped>
.image-cropper-tool {
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
}
.cropper-layout {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.image-preview {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.preview-container {
  width: 100%;
  height: calc(100vh - 100px); /* 动态计算高度 */
  min-height: 300px; /* 设置最小高度 */
  border: 1px solid #ddd;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.preview-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.crop-box {
  position: absolute;
  border: 2px solid #fff;
  box-shadow: 0 0 0 9999em rgba(0, 0, 0, 0.5);
  cursor: move;
}
.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #fff;
  border: 1px solid #333;
}
.top-left { top: -5px; left: -5px; cursor: nw-resize; }
.top-middle { top: -5px; left: 50%; margin-left: -5px; cursor: n-resize; }
.top-right { top: -5px; right: -5px; cursor: ne-resize; }
.middle-left { top: 50%; left: -5px; margin-top: -5px; cursor: w-resize; }
.middle-right { top: 50%; right: -5px; margin-top: -5px; cursor: e-resize; }
.bottom-left { bottom: -5px; left: -5px; cursor: sw-resize; }
.bottom-middle { bottom: -5px; left: 50%; margin-left: -5px; cursor: s-resize; }
.bottom-right { bottom: -5px; right: -5px; cursor: se-resize; }  

.cropper-settings {
  width: 300px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;  
}
.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.button-group .el-button {
  flex: 1;
}
.upload-area {
  flex: 1;
}
@media (max-width: 768px) {
  .cropper-layout {
    flex-direction: column;
  }
  .cropper-settings {
    width: 100%;
  }
  .preview-container {
    height: 50vh;
  }
  .button-group {
    flex-direction: column;
  }
}
</style>
  