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
          <el-button type="success" readonly="true" class="panel-title">图片预览</el-button>
          <div class="image-preview" ref="previewContainer">
            <div class="image-wrapper" v-if="imageUrl">
              <img :src="imageUrl" alt="预览图" ref="previewImage" @load="onImageLoad" />
              <div class="split-lines" v-show="imageLoaded" :style="splitLinesStyle">
                <template v-if="splitType === 'horizontal' || splitType === 'custom'">
                  <div v-for="i in rows - 1" :key="`h${i}`" class="split-line horizontal" :style="{ top: `${(i / rows) * 100}%` }"></div>
                </template>
                <template v-if="splitType === 'vertical' || splitType === 'custom'">
                  <div v-for="i in columns - 1" :key="`v${i}`" class="split-line vertical" :style="{ left: `${(i / columns) * 100}%` }"></div>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div class="result-panel">
          <el-button type="success" @click="batchDownload" class="panel-title" :disabled="!splitImages.length">批量下载</el-button>
          <div class="split-images-container" ref="splitImagesContainer">
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
const originalFormat = ref('')
const acceptedFormats = '.jpeg,.jpg,.png,.webp,.jfif,.pjpeg,.pjp'
let splitImagesArray = [];
const isUploaderVisible = ref(true)
const previewContainer = ref(null)
const splitImagesContainer = ref(null)
const imageLoaded = ref(false)

const splitLinesStyle = computed(() => {
  if (!imageLoaded.value || !previewImage.value || !previewContainer.value) return {};

  const img = previewImage.value;
  const container = previewContainer.value;
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const imageAspectRatio = img.naturalWidth / img.naturalHeight;
  const containerAspectRatio = containerWidth / containerHeight;

  let width, height, top, left;

  if (imageAspectRatio > containerAspectRatio) {
    width = containerWidth;
    height = width / imageAspectRatio;
    top = (containerHeight - height) / 2;
    left = 0;
  } else {
    height = containerHeight;
    width = height * imageAspectRatio;
    top = 0;
    left = (containerWidth - width) / 2;
  }

  return {
    position: 'absolute',
    width: `${width}px`,
    height: `${height}px`,
    top: `${top}px`,
    left: `${left}px`,
  };
});
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
  originalFormat.value = file.raw.type.split('/')[1]
  isUploaderVisible.value = false // 上传图片后自动折叠上传组件
}

const onImageLoad = () => {
  imageLoaded.value = false;
  if (previewImage.value && previewContainer.value) {
    const container = previewContainer.value;
    const img = previewImage.value;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imageAspectRatio = img.naturalWidth / img.naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    if (imageAspectRatio > containerAspectRatio) {
      img.style.width = '100%';
      img.style.height = 'auto';
    } else {
      img.style.width = 'auto';
      img.style.height = '100%';
    }

    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';

    splitImagesArray = [];
    splitImages.value = splitImagesArray
    imageLoaded.value = true; // 标记图片已加载    
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

      const pieceWidth = img.naturalWidth / numCols
      const pieceHeight = img.naturalHeight / numRows

      splitImages.value = []

      for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
          canvas.width = pieceWidth
          canvas.height = pieceHeight
          ctx.imageSmoothingEnabled = false // 禁用图像平滑
          ctx.drawImage(
            img,
            j * pieceWidth,
            i * pieceHeight,
            pieceWidth,
            pieceHeight,
            0,
            0,
            pieceWidth,
            pieceHeight
          )
          // 使用原图的格式和最高质量
          const format = img.src.split('.').pop().toLowerCase()
          const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`
          splitImagesArray.push(canvas.toDataURL(mimeType, 1.0))
        }
      }
      resolve(splitImagesArray)
    }
    img.onerror = reject
    img.src = imageUrl.value
  })
}

const adjustSplitImagesSize = () => {
  if (!splitImagesContainer.value || !previewImage.value) return;

  //const containerWidth = splitImagesContainer.value.offsetWidth;
  //const containerHeight = splitImagesContainer.value.offsetHeight;
  const containerWidth = previewContainer.value.offsetWidth;
  const containerHeight = previewContainer.value.offsetHeight;
  const aspectRatio = previewImage.value.naturalWidth / previewImage.value.naturalHeight;

  let gridWidth, gridHeight;

  if (containerWidth / containerHeight > aspectRatio) {
    gridHeight = containerHeight;
    gridWidth = gridHeight * aspectRatio;
  } else {
    gridWidth = containerWidth;
    gridHeight = gridWidth / aspectRatio;
  }

  splitImagesContainer.value.style.width = `${gridWidth}px`;
  splitImagesContainer.value.style.height = `${gridHeight}px`;
  splitImagesContainer.value.style.display = 'grid';
  splitImagesContainer.value.style.gridTemplateColumns = `repeat(${columns.value}, 1fr)`;
  splitImagesContainer.value.style.gridTemplateRows = `repeat(${rows.value}, 1fr)`;
  splitImagesContainer.value.style.gap = '2px';
}
const batchDownload = async () => {
  const zip = new JSZip()
  const promises = splitImages.value.map((imgUrl, index) =>
    fetch(imgUrl)
      .then(response => response.blob())
      .then(blob => zip.file(`split_image_${index + 1}.${originalFormat.value}`, blob))
  )
  await Promise.all(promises)
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, 'split_images.zip')
}

const updateSplitLines = () => {
  // 触发重新计算 splitLinesStyle
  imageLoaded.value = false;
  nextTick(() => {
    imageLoaded.value = true;
  });
};

let resizeObserver;

onMounted(() => {
  if (previewContainer.value) {
    resizeObserver = new ResizeObserver(updateSplitLines);
    resizeObserver.observe(previewContainer.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

</script>
<style scoped>
.image-splitter {
  max-width: 1920px;
  margin: 0 auto;
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
.preview-panel, .result-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  width: 50%;
  height: 500px;
  overflow: hidden;
}  
.panel-title {
  margin-bottom: 10px;
}  
.split-images-container {
  display: grid;
  gap: 1px;
  background-color: #f0f0f0;
  margin: auto;
}
.split-image-wrapper {
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
}
.split-image {
  width: 100%; 
  height: 100%; 
  object-fit: cover;
}
.image-uploader {
  margin-bottom: 10px;
}
.image-preview, .split-images-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.image-preview img{
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.result-panel {
  flex: 1;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;    
}
.split-lines {
  position: absolute;
  overflow: hidden;
  z-index: 10;
  pointer-events: none;
}  
.split-line {
  position: absolute;
  background-color: rgba(255, 0, 0, 0.5); /* 半透明红色 */
}
.split-line.horizontal {
  width: 100%;
  height: 2px;
}
.split-line.vertical {
  width: 2px;
  height: 100%;
}
.split-options {
  margin-bottom: 10px;
}
.custom-split-options {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}
</style> 