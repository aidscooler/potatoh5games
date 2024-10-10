<template>
    <el-card class="watermark-tool">
      <div class="layout">
        <!-- 左侧图片列表 -->
            <div class="image-list">
            <el-button type="primary" @click="triggerUpload">选择图片</el-button>
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
                <el-image :src="img.url" fit="cover"></el-image>
                <div class="image-info">{{ img.width }}x{{ img.height }}</div>
            </div>
            </el-scrollbar>
        </div>
  
        <!-- 中间图片展示区 @mousedown="startDrag"  -->
        <div class="image-display" ref="imageDisplay" @wheel="handleZoom"  @mousedown.prevent="startDrag" @mousemove="drag" @mouseup="endDrag" @mouseleave="endDrag">
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
          <el-form label-position="top">
            <el-form-item label="水印宽度">
              <el-input-number v-model="watermarkWidth" :min="1" :max="1000"></el-input-number>
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
            <template v-if="watermarkType === 'text'">
              <el-form-item label="文字内容">
                <el-input v-model="watermarkText"></el-input>
              </el-form-item>
              <el-form-item label="字体">
                <el-select v-model="fontFamily">
                  <el-option label="Arial" value="Arial"></el-option>
                  <el-option label="Helvetica" value="Helvetica"></el-option>
                  <el-option label="Times New Roman" value="Times New Roman"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="颜色">
                <el-color-picker v-model="textColor" show-alpha></el-color-picker>
              </el-form-item>
              <el-form-item label="大小">
                <el-input-number v-model="fontSize" :min="1" :max="100"></el-input-number>
              </el-form-item>
            </template>
  
            <!-- 图片水印设置 -->
            <template v-else>
              <el-form-item label="选择图片">
                <el-upload
                  action="#"
                  list-type="picture-card"
                  :auto-upload="false"
                  :on-change="handleWatermarkImageChange"
                  accept="image/jpeg,image/png"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
              </el-form-item>
              <el-form-item label="透明度">
                <el-slider v-model="imageOpacity" :min="0" :max="1" :step="0.1"></el-slider>
              </el-form-item>
            </template>
          </el-form>
  
          <!-- 水印预览区域 -->
          <div class="watermark-preview">
            <h3>水印预览</h3>
            <div class="preview-area" ref="previewArea"></div>
          </div>
        </el-scrollbar>
        </div>
      </div>
    </el-card>
  </template>
  
  <script setup>
  const images = ref([])
  const selectedImage = ref(null)
  const imageDisplay = ref(null)
  const previewArea = ref(null)
  const fileInput = ref(null)
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
  const watermarkImage = ref(null)
  
  const zoomLevel = ref(1)
  const dragStart = ref({ x: 0, y: 0 })
  const dragOffset = ref({ x: 0, y: 0 })
  const isDragging = ref(false)   

  const watermarkOverlay = ref(null)

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
  }))

  const onImageLoad = () => {
    //nextTick(() => {
    updateWatermarkOverlay()
    //})
    nextTick(() => {
      simulateDrag()
    })    
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
            })
        }
        img.src = e.target.result
        }
        reader.readAsDataURL(file)
    }
    // 清除 input 的值，允许重复选择同一文件
    event.target.value = ''
  }
  
  const selectImage = (index) => {
    selectedImage.value = images.value[index]
    selectedImageIndex.value = index
    nextTick(() => {
      updateWatermarkOverlay()
      simulateDrag()
    }) 
  }
  
  
  const handleWatermarkImageChange = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      watermarkImage.value = e.target.result
    }
    reader.readAsDataURL(file.raw)
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
    updateWatermarkOverlay()
  }
}

const endDrag = () => {
  isDragging.value = false
}

const updateWatermarkOverlay = () => {
    if (!watermarkOverlay.value || !selectedImage.value || !imageDisplay.value) return

    const canvas = watermarkOverlay.value
    const ctx = canvas.getContext('2d')

    // 获取图片包装器元素
    const wrapper = imageDisplay.value.querySelector('.image-wrapper')
    if (!wrapper) return

    // 获取图片显示区域的实际尺寸
   // const displayRect = imageDisplay.value.getBoundingClientRect()
    canvas.width = wrapper.offsetWidth
    canvas.height = wrapper.offsetHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 计算缩放比例
    const scaleX = canvas.width / selectedImage.value.width
    const scaleY = canvas.height / selectedImage.value.height

    // 应用缩放
    ctx.scale(scaleX, scaleY)

    if (watermarkPosition.value === 'tile') {
      drawTiledWatermark(ctx, selectedImage.value.width, selectedImage.value.height)
    } else {
      drawCenteredWatermark(ctx, selectedImage.value.width, selectedImage.value.height)
    }
}

const drawWatermark = (ctx, x, y, width, height) => {
  ctx.save()
  ctx.translate(x + width / 2, y + height / 2)
  ctx.rotate((-rotationAngle.value * Math.PI) / 180) // 逆时针旋转
  ctx.translate(-width / 2, -height / 2)

  if (watermarkType.value === 'text') {
    ctx.font = `${fontSize.value}px ${fontFamily.value}`
    ctx.fillStyle = textColor.value
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(watermarkText.value, width / 2, height / 2)
  } else if (watermarkType.value === 'image' && watermarkImage.value) {
    const img = new Image()
    img.onload = () => {
      ctx.globalAlpha = imageOpacity.value
      ctx.drawImage(img, 0, 0, width, height)
    }
    img.src = watermarkImage.value
  }

  ctx.restore()
}

const updateWatermarkPreview = () => {
  if (!previewArea.value) return

  const canvas = document.createElement('canvas')
  canvas.width = watermarkWidth.value
  canvas.height = watermarkHeight.value
  const ctx = canvas.getContext('2d')

  drawWatermark(ctx, 0, 0, canvas.width, canvas.height)
  fitCanvasToPreviewArea(canvas)
}


const fitCanvasToPreviewArea = (canvas) => {
    const previewAreaEl = previewArea.value
    const previewWidth = previewAreaEl.clientWidth
    const previewHeight = previewAreaEl.clientHeight

    const scale = Math.min(previewWidth / canvas.width, previewHeight / canvas.height, 1)

    const scaledCanvas = document.createElement('canvas')
    scaledCanvas.width = canvas.width * scale
    scaledCanvas.height = canvas.height * scale
    const ctx = scaledCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height)

    previewAreaEl.innerHTML = ''
    previewAreaEl.appendChild(scaledCanvas)
}

const drawTiledWatermark = (ctx, imageWidth, imageHeight) => {
  const watermarkW = watermarkWidth.value
  const watermarkH = watermarkHeight.value

  for (let y = 0; y < imageHeight; y += watermarkH) {
    for (let x = 0; x < imageWidth; x += watermarkW) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(x, y, Math.min(watermarkW, imageWidth - x), Math.min(watermarkH, imageHeight - y))
      ctx.clip()
      drawWatermark(ctx, x, y, watermarkW, watermarkH)
      ctx.restore()
    }
  }
}

const drawCenteredWatermark = (ctx, imageWidth, imageHeight) => {
  const watermarkW = watermarkWidth.value
  const watermarkH = watermarkHeight.value
  const x = (imageWidth - watermarkW) / 2
  const y = (imageHeight - watermarkH) / 2

  drawWatermark(ctx, x, y, watermarkW, watermarkH)
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
      imageOpacity,
      watermarkImage,
      wrapperStyle,
      () => imageDisplay.value?.clientWidth,
      () => imageDisplay.value?.clientHeight,      
    ],
    () => {
        updateWatermarkPreview()
        updateWatermarkOverlay()
    },
    { immediate: true }
  )
  //模拟手工拖拽，是因为canvas不是响应式组件，改变浏览器窗口大小时，水印显示位置不对，需要手工拖拽一下图片才正常。
  const simulateDrag = () => {
    // 模拟很小的拖拽
    dragOffset.value = {
      x: dragOffset.value.x + 0.1,
      y: dragOffset.value.y + 0.1
    }
    updateWatermarkOverlay()

    // 立即恢复原位
    nextTick(() => {
      dragOffset.value = {
        x: dragOffset.value.x - 0.1,
        y: dragOffset.value.y - 0.1
      }
      updateWatermarkOverlay()
    })
  }

  let resizeObserver

  onMounted(() => { 
    updateWatermarkPreview()
    updateWatermarkOverlay() 
    resizeObserver = new ResizeObserver(() => {//监听到尺寸变化时，模拟拖拽一下图片，确保水印显示正常
      updateWatermarkOverlay()
      nextTick(() => {
        simulateDrag()
      })
    })

    if (imageDisplay.value) {
      resizeObserver.observe(imageDisplay.value)
    }    
  })

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  })  

  </script>
  
  <style scoped>
.watermark-tool {
  width: 100%;
  height: 100%;
}

.layout {
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
  width: 200px;
  border-left: 1px solid #eee;
}

.image-item {
  margin-bottom: 10px;
  cursor: pointer;
}

.image-info {
  font-size: 12px;
  color: #999;
}

.watermark-preview {
  margin-top: 20px;
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

.image-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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
  </style>
  