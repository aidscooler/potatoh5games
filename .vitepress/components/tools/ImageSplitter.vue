<template>
    <el-card class="image-splitter">
      <template #header>
        <div class="card-header">
          <span>图片分割工具</span>
        </div>
      </template>
  
      <div class="main-content">
        <div class="top-panel">
          <el-button @click="toggleUploader" class="toggle-uploader-btn">
            {{ isUploaderVisible ? '折叠上传组件' : '展开上传组件' }}
          </el-button>
          <div v-show="isUploaderVisible" style="width:100%">
            <el-upload
              class="image-uploader"
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleImageChange"
              :show-file-list="false"
              :accept="acceptedFormats"
            >
              <el-icon class="el-icon--upload"><i-ep-upload-filled /></el-icon>
              <div class="el-upload__text">
                拖拽图片到此处或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 {{ acceptedFormats }} 格式的图片
                </div>
              </template>
            </el-upload>
          </div>
            <div class="control-panel">
              <el-radio-group v-model="splitType" class="split-options">
                <el-radio-button value="horizontal">水平分割</el-radio-button>
                <el-radio-button value="vertical">垂直分割</el-radio-button>
                <el-radio-button value="custom">自定义分割</el-radio-button>
              </el-radio-group>
      
              <div v-show="splitType === 'custom'" class="custom-split-options">
                <el-input-number v-model="rows" :min="1" :max="10" aria-label="行数"></el-input-number>
                <el-input-number v-model="columns" :min="1" :max="10" aria-label="列数"></el-input-number>
              </div>
      
              <el-button type="primary" @click="handleSplitImage" :disabled="!imageUrl">
                分割图片
              </el-button>
            </div>
        </div>
        <div class="bottom-panel">
          <div class="preview-panel">
            <el-button type="success" readonly="true" class="batch-download-btn">
                图片预览
            </el-button>
            <div v-if="imageUrl" class="image-preview">              
              <div class="image-container">
                <img :src="imageUrl" alt="预览图" ref="previewImage" @load="onImageLoad" />
                <div v-if="splitType === 'horizontal'" class="split-line horizontal"></div>
                <div v-if="splitType === 'vertical'" class="split-line vertical"></div>
                <div v-if="splitType === 'custom'" class="custom-grid" :style="gridStyle">
                  <div v-for="i in (rows * columns)" :key="i" class="grid-line"></div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="splitImages.length" class="result-panel" ><!--:style="rightPanelStyle"-->
            <el-button type="success" @click="batchDownload" class="batch-download-btn">
                批量下载
            </el-button>
            <div class="split-images-container"
                ref="splitImagesContainer" 
                :style="displayGridStyle">
                  <div v-for="(img, index) in splitImages" :key="index" class="split-image-wrapper">
                      <img :src="img" class="split-image"/>
                  </div>
            </div>
          </div>          
        </div>
      </div>
    </el-card>
  </template>
  
  <script setup>
  import JSZip from 'jszip'
  import { saveAs } from 'file-saver'
  
  const rows = ref(3)
  const columns = ref(3)
  const imageUrl = ref('')
  const splitType = ref('custom')
  const splitImages = ref([])
  const previewImage = ref(null)
  const actualRows = ref(0)
  const actualColumns = ref(0)
  
  const acceptedFormats = '.jpeg,.jpg,.png,.webp,.jfif,.pjpeg,.pjp'
  let splitImagesArray = [];

  const isUploaderVisible = ref(true)
  const splitImagesContainer = ref(null)
  const gap = 5
  
  const gridStyle = computed(() => {  
    return {
        display: 'grid',
        gridTemplateRows: `repeat(${rows.value}, 1fr)`,
        gridTemplateColumns: `repeat(${columns.value}, 1fr)`,
        width: '100%',
        height:'100%'
    }
  })

  const displayGridStyle = computed(() => {
    if (splitImages.value.length === 0) return {}
    const gap = 2 // 设置间隙
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${actualColumns.value}, 1fr)`,
      gridTemplateRows: `repeat(${actualRows.value}, 1fr)`,
      gap: `${gap}px`,
      width: `${previewImage.value.offsetWidth}px`,
      height: `${previewImage.value.offsetHeight}px`,
      //width: '100%',
      //height: '100%',      
      //padding: `${gap}px`,
      boxSizing: 'border-box',
    }
  }) 

  const toggleUploader = () => {
    isUploaderVisible.value = !isUploaderVisible.value
  }  
  watch(splitType, (newValue) => {
      if (newValue === 'horizontal') {
          rows.value = 2
          columns.value = 1
      } else if (newValue === 'vertical') {
          rows.value = 1
          columns.value = 2       
      }
  })
  const handleImageChange = (file) => {
    const isAccepted = acceptedFormats.split(',').includes(`.${file.raw.type.split('/')[1]}`)
    if (!isAccepted) {
      ElMessage.error('请上传支持的图片格式')
      return false
    }
    imageUrl.value = URL.createObjectURL(file.raw)
    isUploaderVisible.value = false // 上传图片后自动折叠上传组件
  }
  
  const onImageLoad = () => {
    if (previewImage.value) {
      splitImagesArray = [];
      splitImages.value = splitImagesArray
    }
  }
  
  const handleSplitImage = async () => {
    try {
        await splitImage()
        splitImages.value = splitImagesArray
        splitImagesArray = [];
        // 分割完成后，可以在这里添加其他操作
        actualRows.value = rows.value
        actualColumns.value = columns.value
        await nextTick()
        adjustSplitImagesSize()        
    } catch (error) {
        console.error('Image splitting failed:', error)
        ElMessage.error('图片分割失败')
    }
  }  

  const splitImage = async () => {
    return new Promise((resolve, reject) => {
        if (!imageUrl.value) {
            ElMessage.warning('请先上传图片')
            return
        }
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
        
            let numRows = rows.value
            let numCols = columns.value
        
            const pieceWidth = img.width / numCols
            const pieceHeight = img.height / numRows
        
            splitImages.value = []
        
            for (let i = 0; i < numRows; i++) {
                for (let j = 0; j < numCols; j++) {
                    canvas.width = pieceWidth
                    canvas.height = pieceHeight
                    ctx.drawImage(img, j * pieceWidth, i * pieceHeight, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight)
                    splitImagesArray.push(canvas.toDataURL())
                }
            }
            resolve(splitImagesArray)
        }
        img.onerror = reject
        img.src = imageUrl.value
    })
  }

  const adjustSplitImagesSize = () => {
    if (!splitImagesContainer.value) return
    const containerWidth = previewImage.value.offsetWidth
    const containerHeight = previewImage.value.offsetHeight
    const imageWidth = (containerWidth - gap * (actualColumns.value - 1)) / actualColumns.value
    const imageHeight = (containerHeight - gap * (actualRows.value - 1)) / actualRows.value
    
    const images = splitImagesContainer.value.querySelectorAll('.split-image')
    images.forEach(img => {
      img.style.width = `${imageWidth}px`
      img.style.height = `${imageHeight}px`
    })
  }  
  
  const batchDownload = async () => {
    const zip = new JSZip()
    const promises = splitImages.value.map((imgUrl, index) =>
      fetch(imgUrl)
        .then(response => response.blob())
        .then(blob => zip.file(`split_image_${index + 1}.png`, blob))
    )
    await Promise.all(promises)
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'split_images.zip')
  }

// 监听窗口大小变化，调整分割图片大小
window.addEventListener('resize', adjustSplitImagesSize)

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', adjustSplitImagesSize)
})  
  </script>
  
  <style scoped>
  .image-splitter {
    max-width: 1920px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .main-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .top-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .image-uploader {
      width: 100%;
  }
  .control-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .bottom-panel {
    display: flex;
    gap: 20px;
  }
  .preview-panel {
    flex: 1;
    max-width: 50%;
  }  
  .split-images-container {
    border: 1px solid #dcdfe6;
    border-radius: 4px;   
    overflow: hidden;
  }
  .split-image-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;   
  }
  .split-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .image-uploader {
    margin-bottom: 10px;
  }
  
  .image-preview {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    height: auto;
  }
  
  .image-container {
    position: relative;
    max-width: 100%;
    max-height: 100%;
  }
  
  .image-container img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  .result-panel {
    flex: 1;
    max-width: 50%;
    display: flex;
    flex-direction: column;
  }
  .split-line {
    position: absolute;
    background-color: red;
  }
  
  .split-line.horizontal {
    width: 100%;
    height: 2px;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }
  
  .split-line.vertical {
    width: 2px;
    height: 100%;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }
  
  .custom-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

.grid-line {
  position: relative;
}

.grid-line::before,
.grid-line::after {
  content: '';
  position: absolute;
  background-color: red;
}

.grid-line::before {
  right: 0;
  top: 0;
  width: 1px;
  height: 100%;
}

.grid-line::after {
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
}

.grid-line:nth-child(var(--columns)n)::before {
  display: none;
}

.grid-line:nth-last-child(-n + var(--columns))::after {
  display: none;
}

  .split-options {
    margin-bottom: 10px;
  }
  
  .custom-split-options {
    display: flex;
    gap: 20px;
    margin-bottom: 10px;
  }
  
  .batch-download-btn {
    align-self: flex-end;
    margin-bottom: 10px;
  }
  
  </style>
  