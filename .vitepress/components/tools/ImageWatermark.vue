<template>
  <el-card class="watermark-tool">
    <div class="watermark-layout">
      <!-- 左侧图片列表 -->
          <div class="image-list">
            <div class="wk-button-group">
              <el-button type="primary" @click="triggerUpload">选择图片</el-button>
              <el-button type="danger" @click="clearImages">清空图片</el-button>
            </div>
          <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileChange"
          multiple
          accept="image/jpeg,image/png"
          >
          <el-scrollbar height="calc(100% - 40px)">
          <div 
              v-for="(img, index) in images" 
              :key="index" 
              class="image-item" 
              @click="selectImage(index)"
              :class="{ 'selected': selectedImageIndex === index }"
          >
            <div class="thumbnail-container">
              <el-image :src="img.url" fit="cover"></el-image>
              <el-button class="delete-btn" link @click.stop="deleteImage(index)">
                <i-ep-delete/>
              </el-button>                
            </div>
            <div class="image-info">
              <div class="image-name">{{ img.name }}</div>
              <div class="image-dimensions">{{ img.width }}x{{ img.height }}</div>
            </div>
          </div>
          </el-scrollbar>
      </div>
      <!-- 中间图片展示区 @mousedown="startDrag"  @mouseleave="endDrag"-->
      <div class="image-display" ref="imageDisplay" @wheel="handleZoom"  @mousedown.prevent="startDrag" @mousemove="drag" @mouseup="endDrag" >
          <div class="image-wrapper" :style="wrapperStyle">
              <el-image 
                  v-if="selectedImage"
                  :src="selectedImage.url" 
                  :style="imageStyle" 
                  fit="contain"
                  @load="onImageLoad"
              ></el-image>
              <canvas ref="watermarkOverlay" class="watermark-overlay" :style="canvasStyle"></canvas>
          </div>
      </div>
      <!-- 右侧水印参数设置 -->
      <div class="watermark-settings">
      <el-scrollbar height="100%">
        <el-form label-position="left" label-width="30%">
          <el-form-item label="水印宽度">
            <el-input-number v-model="watermarkWidth" :min="1" :max="1000" ></el-input-number>
          </el-form-item>
          <el-form-item label="水印高度">
            <el-input-number v-model="watermarkHeight" :min="1" :max="1000"></el-input-number>
          </el-form-item>
          <el-form-item label="旋转角度">
            <el-input-number v-model="rotationAngle" :min="0" :max="360"></el-input-number>
          </el-form-item>
          <el-form-item label="水印位置">
            <el-radio-group v-model="watermarkPosition">
              <el-radio value="tile">平铺</el-radio>
              <el-radio value="center">居中</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="水印类型">
            <el-radio-group v-model="watermarkType">
              <el-radio value="text">文字</el-radio>
              <el-radio value="image">图片</el-radio>
            </el-radio-group>
          </el-form-item>
          <!-- 文字水印设置 -->
          <div v-if="watermarkType === 'text'">
            <el-form-item label="文字内容">
              <el-input 
                v-model="watermarkText" 
                type="textarea" 
                :row="2" 
                placeholder="水印文字">
              </el-input>
            </el-form-item>
            <el-form-item label="颜色|大小">
              <el-color-picker v-model="textColor" show-alpha></el-color-picker>
              <el-input-number v-model="fontSize" :min="1" :max="100"></el-input-number>
            </el-form-item>
            <el-form-item label="文字样式">
              <el-checkbox v-model="isBold">加粗</el-checkbox>
              <el-checkbox v-model="isItalic">斜体</el-checkbox>
              <el-checkbox v-model="isUnderline">下划线</el-checkbox>
            </el-form-item>              
          </div>
          <!-- 图片水印设置 -->
          <div v-else>
            <el-form-item label="选择图片">
              <el-button type="primary" @click="triggerWatermarkUpload">选择水印图片</el-button>
              <input
                type="file"
                ref="watermarkInput"
                style="display: none"
                @change="handleWatermarkFileChange"
                accept="image/jpeg,image/png"
              >
            </el-form-item>
            <el-form-item label="透明度">
              <el-slider v-model="imageOpacity" :min="0" :max="1" :step="0.1"></el-slider>
            </el-form-item>
          </div>
        </el-form>
        <div class="watermark-actions">
          <el-button type="primary" size="small" @click="addWatermarkToSelected">单张加水印</el-button>
          <el-button type="primary" size="small" @click="addWatermarkToAll">批量加水印</el-button>
          <el-button type="success" size="small" @click="downloadImages" :disabled="!hasWatermarkedImages">下载图片</el-button>
        </div>  
        <!-- 水印预览区域 -->
        <div class="watermark-preview">
          <h3>水印预览</h3>
          <div class="preview-area" ref="previewArea"></div>
        </div>
      </el-scrollbar>
      </div>
    </div>
    <!-- 进度弹框 -->
    <el-dialog v-model="progressDialogVisible" title="处理进度" width="300px" :close-on-click-modal="false" :show-close="false">
      <el-progress :percentage="progressPercentage" :format="progressFormat"></el-progress>
    </el-dialog>      
  </el-card>
</template>
<script setup>
  import JSZip from 'jszip'
  const images = ref([])
  const selectedImage = ref(null)
  const imageDisplay = ref(null)
  const previewArea = ref(null)
  const fileInput = ref(null)
  const watermarkInput = ref(null)//图片水印选择
  const selectedImageIndex = ref(null)
  
  const watermarkWidth = ref(100)
  const watermarkHeight = ref(100)
  const rotationAngle = ref(20)
  const watermarkPosition = ref('tile')
  const watermarkType = ref('text')
  const watermarkText = ref('水印文字')
  const fontFamily = ref('Arial')
  const textColor = ref('rgba(0, 0, 0, 0.5)')
  const fontSize = ref(16)
  const imageOpacity = ref(0.5)
  const isBold = ref(false)
  const isItalic = ref(false)
  const isUnderline = ref(false)  
  //图片水印相关的响应式变量
  const watermarkImage = ref(null)
  const watermarkImageAspectRatio = ref(1)
  const watermarkOverlay = ref(null)  
  
  const zoomLevel = ref(1)
  const dragStart = ref({ x: 0, y: 0 })
  const dragOffset = ref({ x: 0, y: 0 })
  const isDragging = ref(false)   

  const progressDialogVisible = ref(false)
  const progressPercentage = ref(0)
  const progressFormat = (percentage) => `${percentage}%`

// 触发水印图片上传
const triggerWatermarkUpload = () => {
  watermarkInput.value.click()
}
// 处理水印图片文件选择
const handleWatermarkFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        watermarkImage.value = e.target.result
        watermarkImageAspectRatio.value = img.width / img.height
        updateWatermarkPreview()
        updateWatermarkOverlay()
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }
  event.target.value = '' // 清除 input 的值，允许重复选择同一文件
}
const hasWatermarkedImages = computed(() => images.value.some(img => img.watermarked))  
const wrapperStyle = computed(() => {
  if (!selectedImage.value) return {}
  const aspectRatio = selectedImage.value.width / selectedImage.value.height
  const containerAspectRatio = imageDisplay.value ? imageDisplay.value.clientWidth / imageDisplay.value.clientHeight : 1

  let width, height
  if (aspectRatio > containerAspectRatio) {
      width = '100%'
      height = `${100 / aspectRatio * containerAspectRatio}%`
  } else {
      width = `${100 * aspectRatio / containerAspectRatio}%`
      height = '100%'
  }
  return {
      width,
      height,
      position: 'relative',
      transform: `scale(${zoomLevel.value}) translate(${dragOffset.value.x}px, ${dragOffset.value.y}px)`,
  }
})
const imageStyle = computed(() => ({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
}))
const canvasStyle = computed(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  objectFit: 'contain',
}))
const onImageLoad = () => {   
}
const triggerUpload = () => {
  fileInput.value.click()
}
const handleFileChange = (event) => {
  const files = event.target.files
  for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
            images.value.push({
              url: e.target.result,
              width: img.width,
              height: img.height,
              name: file.name
            })
          //图片上传后默认选择第一张图片
          if(!selectedImage.value) {
            selectImage(0)
          }
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
  }
  // 清除 input 的值，允许重复选择同一文件
  event.target.value = ''
}
const deleteImage = (index) => {
  images.value.splice(index, 1)
  if (selectedImageIndex.value === index) {
    selectedImage.value = null
    selectedImageIndex.value = null
    // 清除水印
    clearWatermark()      
  } else if (selectedImageIndex.value > index) {
    selectedImageIndex.value--
  }   
}
// 清除水印的函数
const clearWatermark = () => {
  if (watermarkOverlay.value) {
    const canvas = watermarkOverlay.value
    const ctx = canvas.getContext('2d')
    // 设置 canvas 尺寸为其父元素的尺寸
    if (canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth
        canvas.height = canvas.parentElement.offsetHeight
    } else {
        // 如果没有父元素，设置一个默认尺寸
        canvas.width = 0
        canvas.height = 0
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
}
const clearImages = () => {
  images.value = []
  selectedImage.value = null
  selectedImageIndex.value = null
  // 清除水印
  clearWatermark()  
}
const selectImage = (index) => {
  selectedImage.value = images.value[index]
  selectedImageIndex.value = index
  updateWatermarkOverlay()
}
const handleZoom = (event) => {
  event.preventDefault()
  const delta = event.deltaY * -0.001
  const newZoom = Math.min(Math.max(0.1, zoomLevel.value + delta), 3)
  const zoomPoint = {
      x: event.offsetX,
      y: event.offsetY
  }
  const zoomRatio = newZoom / zoomLevel.value
  dragOffset.value = {
      x: (dragOffset.value.x - zoomPoint.x) * zoomRatio + zoomPoint.x,
      y: (dragOffset.value.y - zoomPoint.y) * zoomRatio + zoomPoint.y
  }
  zoomLevel.value = newZoom
  updateWatermarkOverlay()
}
const startDrag = (event) => {
  if (event.button === 0) {
    isDragging.value = true
    dragStart.value = {
      x: event.clientX - dragOffset.value.x,
      y: event.clientY - dragOffset.value.y
    }
  }
}
const drag = (event) => {
  if (isDragging.value) {
    dragOffset.value = {
      x: event.clientX - dragStart.value.x,
      y: event.clientY - dragStart.value.y
    }
  }
}
const endDrag = () => {
  isDragging.value = false
  updateWatermarkOverlay()
}
const updateWatermarkOverlay = () => {
  if (!watermarkOverlay.value || !selectedImage.value || !imageDisplay.value) {
    clearWatermark()
    return
  }
  const canvas = watermarkOverlay.value
  const ctx = canvas.getContext('2d')   
  // 获取图片包装器元素
  const wrapper = imageDisplay.value.querySelector('.image-wrapper')
  if (!wrapper) {
      clearWatermark()
      return
  }
  // 设置canvas尺寸为图片的实际尺寸
  canvas.width = selectedImage.value.width
  canvas.height = selectedImage.value.height
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (watermarkPosition.value === 'tile') {
    drawTiledWatermark(ctx, selectedImage.value.width, selectedImage.value.height)
  } else {
    drawCenteredWatermark(ctx, selectedImage.value.width, selectedImage.value.height)
  }
}
const drawWatermark = (ctx, x, y, width, height) => {  
  return new Promise((resolve, reject) => {
      if (watermarkType.value === 'text') {
        let fontStyle = ''
        if (isBold.value) fontStyle += 'bold '
        if (isItalic.value) fontStyle += 'italic '
        ctx.font = `${fontStyle}${fontSize.value}px ${fontFamily.value}`
        ctx.fillStyle = textColor.value
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.textRendering = 'optimizeLegibility'
        ctx.save()
        ctx.translate(x + width / 2, y + height / 2)
        ctx.rotate((-rotationAngle.value * Math.PI) / 180) // 逆时针旋转
        ctx.translate(-width / 2, -height / 2)       
        // 处理文本换行
        const lines = watermarkText.value.split('\n')
        const lineHeight = fontSize.value * 1.2 // 行高可以根据需要调整
        const textHeight = lines.length * lineHeight
        const startY = (height - textHeight) / 2    

        lines.forEach((line,index) => {
          ctx.fillText(line, width / 2, startY + index * lineHeight)
          //绘制下划线
          if (isUnderline.value) {
            const metrics = ctx.measureText(line)
            const underlineY = startY + index * lineHeight + fontSize.value / 2 + 0.5 // 下划线与文字的间距
            const underlineStartX = width / 2 - metrics.width / 2
            const underlineEndX = width / 2 + metrics.width / 2
            const clippedUnderlineStartX = Math.max(underlineStartX, 0)
            const clippedUnderlineEndX = Math.min(underlineEndX, width)

            ctx.beginPath()
            ctx.moveTo(clippedUnderlineStartX, underlineY)
            ctx.lineTo(clippedUnderlineEndX, underlineY)
            ctx.strokeStyle = textColor.value
            ctx.lineWidth = 1 // 下划线宽度，可以根据需要调整
            ctx.stroke()
          }       
        })
        ctx.restore()
        resolve();
    } else if (watermarkType.value === 'image' && watermarkImage.value) {
      const img = new Image()
      img.onload = () => {     
        ctx.globalAlpha = imageOpacity.value
        ctx.save()
        ctx.imageSmoothingEnabled = false; // 关闭图像平滑
        //console.log('ctx.globalAlpha:' + ctx.globalAlpha)
        // 计算图片的宽高比
        const imgRatio = img.width / img.height
        // 计算水印区域的宽高比
        const areaRatio = width / height

        let drawWidth, drawHeight
        if (imgRatio > areaRatio) {
          // 图片较宽，以宽度为基准
          drawWidth = width
          drawHeight = width / imgRatio
        } else {
          // 图片较高，以高度为基准
          drawHeight = height
          drawWidth = height * imgRatio
        }
        // 计算居中位置
        const centerX = x + width / 2
        const centerY = y + height / 2

        ctx.translate(centerX, centerY)
        ctx.rotate((-rotationAngle.value * Math.PI) / 180)
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)       
        ctx.restore()
        resolve();
      }
      img.onerror = reject;
      img.src = watermarkImage.value
    }    
  })
}
const updateWatermarkPreview = () => {
  if (!previewArea.value) return
  const canvas = document.createElement('canvas')
  canvas.width = watermarkWidth.value
  canvas.height = watermarkHeight.value
  const ctx = canvas.getContext('2d')
  // 清除canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  // 绘制边框以显示水印区域
  ctx.strokeStyle = '#ddd'
  ctx.strokeRect(0, 0, canvas.width, canvas.height)    

  drawWatermark(ctx, 0, 0, canvas.width, canvas.height)
  .then(() => {
    fitCanvasToPreviewArea(canvas)
  })
  .catch(error => {
    console.error('绘制水印预览失败:', error)
  })
}
const fitCanvasToPreviewArea = (canvas) => {
    const previewAreaEl = previewArea.value
    const previewWidth = 200 //previewAreaEl.clientWidth
    const previewHeight = 200 //previewAreaEl.clientHeight
    const scale = Math.min(previewWidth / canvas.width, previewHeight / canvas.height, 1)
    const scaledCanvas = document.createElement('canvas')
    
    scaledCanvas.width = canvas.width * scale
    scaledCanvas.height = canvas.height * scale
    const ctx = scaledCanvas.getContext('2d')
    ctx.imageSmoothingEnabled = false; // 关闭图像平滑
    ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height)

    previewAreaEl.innerHTML = ''
    previewAreaEl.appendChild(scaledCanvas)
}
const drawTiledWatermark = (ctx, imageWidth, imageHeight) => {
  const watermarkW = watermarkWidth.value
  const watermarkH = watermarkHeight.value
  const promises = [];
  for (let y = 0; y < imageHeight; y += watermarkH) {
    for (let x = 0; x < imageWidth; x += watermarkW) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(x, y, Math.min(watermarkW, imageWidth - x), Math.min(watermarkH, imageHeight - y))
      ctx.clip()
      promises.push(drawWatermark(ctx, x, y, watermarkW, watermarkH));
      ctx.restore()
    }
  }
  return Promise.all(promises);
}
const drawCenteredWatermark = (ctx, imageWidth, imageHeight) => {
  const watermarkW = watermarkWidth.value
  const watermarkH = watermarkHeight.value
  const x = (imageWidth - watermarkW) / 2
  const y = (imageHeight - watermarkH) / 2
  return drawWatermark(ctx, x, y, watermarkW, watermarkH)
}
watch(
  [
    watermarkWidth,
    watermarkHeight,
    rotationAngle,
    watermarkPosition,
    watermarkType,
    watermarkText,
    fontFamily,
    textColor,
    fontSize,
    isBold,
    isItalic,
    isUnderline,      
    imageOpacity,
    watermarkImage,
    () => imageDisplay.value?.clientWidth,
    () => imageDisplay.value?.clientHeight,      
  ],
  () => {
      updateWatermarkPreview()
      updateWatermarkOverlay()
  },
  { immediate: true }
)
onMounted(() => { 
  updateWatermarkPreview()
  updateWatermarkOverlay()    
}) 
//为图片添加水印
const addWatermarkToImage = async (image) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')
    // 绘制原图
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      // 绘制水印
      const drawWatermarkCallback = () => {
        canvas.toBlob(blob => {
          resolve(blob)
        }, image.name.endsWith('.png') ? 'image/png' : 'image/jpeg', 1.0)
      }
      if (watermarkPosition.value === 'tile') {
        drawTiledWatermark(ctx, canvas.width, canvas.height)
        .then(drawWatermarkCallback)
        .catch(reject)
      } else {
        drawCenteredWatermark(ctx, canvas.width, canvas.height)
        .then(drawWatermarkCallback)
        .catch(reject)
      }
    }
    img.onerror = reject
    img.src = image.url
  })
}
const addWatermarkToSelected = async () => {
  if (!selectedImage.value) {
    ElMessage.warning('请先选择一张图片')
    return
  }
  progressDialogVisible.value = true
  progressPercentage.value = 0
  try {
    const watermarkedBlob = await addWatermarkToImage(selectedImage.value)
    const watermarkedUrl = URL.createObjectURL(watermarkedBlob)

    selectedImage.value.watermarkedUrl = watermarkedUrl
    selectedImage.value.watermarked = true

    progressPercentage.value = 100
    ElMessage.success('水印添加成功')
  } catch (error) {
    console.error('添加水印失败:', error)
    ElMessage.error('添加水印失败')
  } finally {
    progressDialogVisible.value = false
  }
}
const addWatermarkToAll = async () => {
  if (images.value.length === 0) {
    ElMessage.warning('请先上传图片')
    return
  }
  progressDialogVisible.value = true
  progressPercentage.value = 0
  try {
    for (let i = 0; i < images.value.length; i++) {
      const image = images.value[i]
      const watermarkedBlob = await addWatermarkToImage(image)
      const watermarkedUrl = URL.createObjectURL(watermarkedBlob)
      image.watermarkedUrl = watermarkedUrl
      image.watermarked = true

      progressPercentage.value = Math.round(((i + 1) / images.value.length) * 100)
    }
    ElMessage.success('批量添加水印成功')
  } catch (error) {
    console.error('批量添加水印失败:', error)
    ElMessage.error('批量添加水印失败')
  } finally {
    progressDialogVisible.value = false
  }
}
//下载添加好水印的图片
const downloadImages = async () => {
  const watermarkedImages = images.value.filter(img => img.watermarked)
  if (watermarkedImages.length === 0) {
    ElMessage.warning('没有可下载的已加水印图片')
    return
  }
  if (watermarkedImages.length === 1) {
    // 下载单张图片
    const link = document.createElement('a')
    link.href = watermarkedImages[0].watermarkedUrl
    link.download = `watermarked_${watermarkedImages[0].name}`
    link.click()
  } else {
    // 下载多张图片为 ZIP
    const zip = new JSZip()
    for (const image of watermarkedImages) {
      const response = await fetch(image.watermarkedUrl)
      const blob = await response.blob()
      zip.file(`watermarked_${image.name}`, blob)
    }
    const content = await zip.generateAsync({ type: 'blob' })
    // 使用 a 标签下载 ZIP 文件
    const link = document.createElement('a')
    link.href = URL.createObjectURL(content)
    link.download = 'watermarked_images.zip'
    link.click()
    // 清理创建的 URL 对象
    setTimeout(() => {
      URL.revokeObjectURL(link.href)
    }, 100)
  }
  ElMessage.success('下载成功')
}
</script>
<style scoped>
.watermark-tool {
  width: 100%;
  height: 100%;
  max-width: 1920px;
}
.watermark-layout {
  display: flex;
  height: 100%;
}
.image-list,
.image-display,
.watermark-settings {
  padding: 10px;
  height: calc(100vh - 40px);
}
.image-list {
  width: 200px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}
.image-display {
  width: calc(100% - 500px);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.watermark-settings {
  width: 300px;
  border-left: 1px solid #eee;
}
.image-item {
  position: relative;
  width: 100%;
  margin-bottom: 15px; /* 增加底部边距 */
  cursor: pointer;
}
.image-info {
  width: 100%;
  text-align: center;
  padding-top: 5px; /* 为图片信息添加一些上边距 */
}
.image-name, .image-dimensions {
  display: block;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.image-dimensions {
  color: #999;
}
.delete-btn {
  position: absolute;
  right: 5px;
  top: 5px;
  z-index: 12; /* 确保删除按钮在图片之上 */
}
.watermark-preview {
  margin-top: 0px;
}
.preview-area {
  width: 100%;
  height: 200px;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.watermark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}
.image-item.selected {
  border: 2px solid #409EFF;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}
.watermark-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.watermark-actions .el-button {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wk-button-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.thumbnail-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%; /* 创建一个正方形的容器 */
  margin-bottom: 5px;
  overflow: hidden;
}  
.thumbnail-container .el-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片填满容器，可能会裁剪部分内容 */
}
.delete-btn {
  position: absolute;
  right: 5px;
  top: 5px;
  padding: 2px;
  color: #f56c6c;
  border-radius: 50%;
}
.delete-btn:hover {
  background-color: #f56c6c;
  color: white;
}
.el-form-item{
  margin-bottom: 5px !important;
}
</style>