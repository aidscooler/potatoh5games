<template>
    <el-card class="image-compressor">
      <h2>图片压缩工具</h2>
      
      <el-upload
        class="upload-area"
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        multiple
        action="#"
        :file-list="fileList"
        list-type="picture-card"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>
  
      <el-button type="success" @click="compressImages" :disabled="fileList.length === 0 || isCompressing">
        压缩图片
      </el-button>
      <el-button type="primary" @click="downloadImages" :disabled="compressedFiles.length === 0">
        下载图片
      </el-button>
  
      <el-progress v-if="isCompressing" :percentage="compressionProgress" />
    </el-card>
</template>
  
<script setup lang="ts">
  import { ElMessage } from 'element-plus';
  import { Plus } from '@element-plus/icons-vue';
  import JSZip from 'jszip';
  
  const fileList = ref([]);
  const compressedFiles = ref([]);
  const isCompressing = ref(false);
  const compressionProgress = ref(0);
  
const handleFileChange = (file) => {
    if (file.raw.type.startsWith('image/')) {
        file.url = URL.createObjectURL(file.raw);
        fileList.value.push(file);
    } else {
        ElMessage.error('请上传图片文件');
    }
};

const handleFileRemove = (file) => {
  const index = fileList.value.indexOf(file);
  if (index !== -1) {
    URL.revokeObjectURL(file.url);
    fileList.value.splice(index, 1);
  }
};
  
const compressImages = async () => {
  isCompressing.value = true;
  compressedFiles.value = [];
  compressionProgress.value = 0;

  const totalFiles = fileList.value.length;
  let processedFiles = 0;

  const compressWorker = new Worker(new URL('../../library/compressWorker.ts', import.meta.url), { type: 'module' });

  for (const file of fileList.value) {
    compressWorker.postMessage({ 
      file: file.raw, 
      options: { quality: 0.6, maxWidth: 1920, maxHeight: 1080 } 
    });
  }

  compressWorker.onmessage = (e: MessageEvent<{ error?: string; compressedFile?: File }>) => {
    if (e.data.error) {
    //console.log(e.data);
      ElMessage.error(`压缩失败: ${e.data.error}`);
    } else if (e.data.compressedFile) {
      compressedFiles.value.push(e.data.compressedFile);
    }

    processedFiles++;
    compressionProgress.value = Math.round((processedFiles / totalFiles) * 100);

    if (processedFiles === totalFiles) {
      isCompressing.value = false;
      ElMessage.success('压缩完成');
      compressWorker.terminate();
    }
  };
};
  
const downloadImages = async () => {
    if (compressedFiles.value.length === 1) {
      // 下载单个文件
      const url = URL.createObjectURL(compressedFiles.value[0]);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compressed_image.jpg';
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // 下载多个文件为 zip
      const zip = new JSZip();
      compressedFiles.value.forEach((file, index) => {
        zip.file(`compressed_image_${index + 1}.jpg`, file);
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compressed_images.zip';
      link.click();
      URL.revokeObjectURL(url);
    }
  };
  </script>
  
  <style scoped>
  .image-compressor {
    max-width: 960px;
    margin: 0 auto;
  }
  
  .upload-area {
    margin-bottom: 20px;
  }
  
  .image-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .image-item {
    width: 100px;
    height: 100px;
    overflow: hidden;
  }
  
  .el-progress {
    margin-top: 20px;
  }
:deep(.el-upload--picture-card) {
  --el-upload-picture-card-size: 100px;
}  
  </style>
  