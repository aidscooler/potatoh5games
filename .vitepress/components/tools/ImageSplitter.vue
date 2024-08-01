<template>
    <el-card class="image-splitter">
      <template #header>
        <div class="card-header">
          <span>图片分割工具</span>
        </div>
      </template>
  
      <div class="main-content">
        <div class="left-panel">
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
  
        <div v-if="splitImages.length" class="right-panel" :style="rightPanelStyle">
            <el-button type="success" @click="batchDownload" class="batch-download-btn">
                批量下载
            </el-button>
            <div class="split-images-container" :style="[splitImagesContainerStyle, displayGridStyle]">
                <div v-for="(img, index) in splitImages" :key="index" class="split-image-wrapper">
                    <img :src="img" class="split-image" />
                </div>
            </div>
        </div>
      </div>
    </el-card>
  </template>
  
  <script setup>
  import { ElMessage } from 'element-plus'
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

  const containerHeight = 400 // 固定高度
  const originalImageAspectRatio = ref(1)
  const splitImagesContainerStyle = computed(() => {
    const containerWidth = containerHeight * originalImageAspectRatio.value
    return {
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        overflow: 'hidden',
    }
 }) 
  
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
        gridTemplateColumns: `repeat(${actualRows.value}, 1fr)`,
        gridTemplateRows: `repeat(${actualColumns.value}, 1fr)`,
        gap: `${gap}px`,
        width: '100%',
        height: '100%',
        padding: `${gap}px`,
        boxSizing: 'border-box',
    }
  }) 
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
  }
  
  const onImageLoad = () => {
    if (previewImage.value) {
      const img = previewImage.value
      //const container = img.parentElement
      //container.style.width = `${img.width}px`
      //container.style.height = `${img.height}px`
      originalImageAspectRatio.value = img.naturalWidth / img.naturalHeight
    }
  }
  
  const handleSplitImage = async () => {
    try {
        await splitImage()
        // 分割完成后，可以在这里添加其他操作
        actualRows.value = rows.value
        actualColumns.value = columns.value
        splitImages.value = splitImagesArray
        splitImagesArray = [];
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
                    //splitImages.value.push(canvas.toDataURL())
                    splitImagesArray.push(canvas.toDataURL())
                }
            }
            resolve(splitImagesArray)
        }
        img.onerror = reject
        img.src = imageUrl.value
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
  const containerAspectRatio = computed(() => {
    if (previewImage.value) {
        return previewImage.value.naturalWidth / previewImage.value.naturalHeight
    }
    return 1
  })
  const rightPanelStyle = computed(() => {
    return {
        flex: 1,
        maxWidth: '50%',
        display: 'flex',
        flexDirection: 'column',
        aspectRatio: containerAspectRatio.value,
    }
  })  
  </script>
  
  <style scoped>
  .image-splitter {
    max-width: 1920px;
    margin: 20px auto;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .main-content {
    display: flex;
    gap: 20px;
  }
  
  .left-panel {
    flex: 1;
    max-width: 50%;
  }
  
  .right-panel {
    flex: 1;
    max-width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .split-images-container {
    border: 1px solid #dcdfe6;
    border-radius: 4px;   
    overflow: hidden;
  }
  .split-image-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;   
  }
  .split-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
  }

  .image-uploader {
    margin-bottom: 20px;
  }
  
  .image-preview {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .image-container {
    position: relative;
    display: inline-block;
  }
  
  .image-container img {
    max-width: 100%;
    max-height: 400px;
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
    margin-bottom: 20px;
  }
  
  .custom-split-options {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }
  
  .batch-download-btn {
    margin-bottom: 20px;
  }
  
  </style>
  