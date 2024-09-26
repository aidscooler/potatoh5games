<template>
    <el-card class="image-converter">
      <h2>图片格式转换工具</h2>
      <el-alert
        title="格式转换说明"
        type="info"
        description="支持png,gif,webp,bmp,tiff,svg,psd,heic格式图片转换为jpg格式。"
        :closable="false"
        show-icon
      />
      <div class="button-group">
        <el-upload
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :accept="acceptedFormats"
          multiple
          :show-file-list="false"
        >
          <el-button type="primary">选择图片</el-button>
        </el-upload>
        <el-button 
          type="success" 
          @click.stop="convertImages" 
          :disabled="fileList.length === 0 || isConverting"
        >
          转换为JPG
        </el-button>
        <el-button 
          type="primary" 
          @click.stop="downloadImages" 
          :disabled="convertedImages.length === 0 || isConverting"
        >
          下载
        </el-button>
        <el-button 
          type="danger" 
          @click.stop="clearFiles" 
          :disabled="fileList.length === 0 && convertedImages.length === 0"
        >
          清空图片
        </el-button>
      </div>
  
      <div class="file-list">
        <div v-for="(file, index) in fileList" :key="index" class="file-item">
          <span>{{ file.name }}</span>
          <el-button type="danger" size="small" @click="removeFile(index)">删除</el-button>
        </div>
      </div>
  
      <el-dialog v-model="isConverting" title="转换中" width="30%" :close-on-click-modal="false">
        <el-progress :percentage="conversionProgress" />
        <span>正在转换图片，请稍候...</span>
      </el-dialog>
    </el-card>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus';
  import imageCompression from 'browser-image-compression';
  import heic2any from 'heic2any';
  import UTIF from 'utif';
  import PSD from 'psd.js'
  import JSZip from 'jszip';
  
  const fileList = ref([]);
  const convertedImages = ref([]);
  const isConverting = ref(false);
  const conversionProgress = ref(0);
  const acceptedFormats = '.png,.gif,.webp,.heic,.tiff,.tif,.svg,.psd,.bmp';
  
  const handleFileChange = (file) => {
    fileList.value.push(file);
  };
  const removeFile = (index) => {
    fileList.value.splice(index, 1);
  };

  const clearFiles = () => {
    fileList.value = [];
    convertedImages.value = [];
  };  
  const convertPngGifWebp = async (file) => {
    return await imageCompression(file, {
        maxSizeMB: Number.POSITIVE_INFINITY,
        maxWidthOrHeight: Infinity,
        useWebWorker: true,
        fileType: 'image/jpeg',
        quality: 0.9
    });
  };
  
  const convertHeic = async (file) => {
    const blob = await heic2any({ blob: file, toType: 'image/jpeg' });
    return new File([blob], file.name.replace(/\.heic$/, '.jpg'), { type: 'image/jpeg' });
  };
  
  const convertTiff = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const ifds = UTIF.decode(arrayBuffer);
    UTIF.decodeImages(arrayBuffer, ifds);
    const rgba = UTIF.toRGBA8(ifds[0]);
    const canvas = document.createElement('canvas');
    canvas.width = ifds[0].width;
    canvas.height = ifds[0].height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    imageData.data.set(rgba);
    ctx.putImageData(imageData, 0, 0);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
  };
  
  const convertSvg = async (file) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(resolve => img.onload = resolve);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
  };
  
  const convertPsd = async (file) => {
    const psdFile = await PSD.fromDroppedFile(file); 
    await psdFile.parse();
    const canvas = psdFile.image.toPng();
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
  };
  
  const convertBmp = async (file) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(resolve => img.onload = resolve);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
  };
  
  const convertImages = async () => {
    isConverting.value = true;
    convertedImages.value = [];
    conversionProgress.value = 0;
  
    for (let i = 0; i < fileList.value.length; i++) {
      const file = fileList.value[i].raw;
      try {
        let convertedImage;
        console.log("filetype:" + file.type)
        console.log(file);
        switch (file.type) {          
          case 'image/png':
          case 'image/gif':
          case 'image/webp':
            convertedImage = await convertPngGifWebp(file);
            break;
          case 'image/heic':
            convertedImage = await convertHeic(file);
            break;
          case 'image/tiff':
            convertedImage = await convertTiff(file);
            break;
          case 'image/svg+xml':
            convertedImage = await convertSvg(file);
            break;
          case 'image/vnd.adobe.photoshop':
            convertedImage = await convertPsd(file);
            break;
          case 'image/bmp':
            convertedImage = await convertBmp(file);
            break;
          default:
            throw new Error('Unsupported file type');
        }
        convertedImages.value.push({ name: file.name.replace(/\.[^/.]+$/, '.jpg'), blob: convertedImage });
      } catch (error) {
        console.error(`Error converting ${file.name}:`, error);
        ElMessage.error(`无法转换 ${file.name}`);
      }
      conversionProgress.value = Math.round(((i + 1) / fileList.value.length) * 100);
    }
    isConverting.value = false;
    ElMessage.success('转换完成');
  };
  
  const downloadImages = async () => {
    if (convertedImages.value.length === 1) {
      const url = URL.createObjectURL(convertedImages.value[0].blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = convertedImages.value[0].name;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const zip = new JSZip();
      convertedImages.value.forEach(img => {
        zip.file(img.name, img.blob);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_images.zip';
      a.click();
      URL.revokeObjectURL(url);
    }
    convertedImages.value = []; // 清空已转换的图片
  };
  </script>
  
  <style scoped>
  .image-converter {
    max-width: 1200px;
    margin: 0 auto;
  }
  .button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .file-list {
    margin-top: 20px;
  }
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  </style>