<template>
  <el-card 
    class="image-compressor"
    v-loading="isCompressing"
    element-loading-text="正在压缩图片，请稍候..."
    :element-loading-background="'rgba(255, 255, 255, 0.5)'"
  >
    <h2>图片压缩工具</h2>
    <el-alert
      title="压缩选项说明"
      type="info"
      description="通过降低最大大小或最大高度/宽度可实现较高的压缩率，但也可能会影响图片质量。请根据您的需求调整这些选项。"
      :closable="false"
      show-icon
    />  
    <div class="options">
      <el-form :inline="true">
        <el-form-item label="最大大小 (MB)">
          <el-input-number v-model="maxSizeMB" :min="0.1" :max="10" :step="0.1" />
        </el-form-item>
        <el-form-item label="最大宽度或高度 (px)">
          <el-input-number v-model="maxWidthOrHeight" :min="100" :max="4000" :step="100" />
        </el-form-item>
      </el-form>
    </div>

    <div class="button-group">
      <el-button type="success" @click="compressImages" :disabled="fileList.length === 0 || isCompressing">
        压缩图片
      </el-button>
      <el-button type="primary" @click="downloadImages" :disabled="compressedFiles.length === 0">
        下载图片
      </el-button>
      <el-button type="danger" @click="clearFiles" :disabled="fileList.length === 0">
        清空图片
      </el-button>
    </div>
    <el-progress v-if="isCompressing" :percentage="compressionProgress" />
    <el-upload
      class="upload-area custom-upload"
      :auto-upload="false"
      :on-change="handleFileChange"
      :on-remove="handleFileRemove"
      :before-upload="beforeUpload"
      multiple
      action="#"
      :file-list="fileList"
      list-type="picture-card"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>

  </el-card>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import JSZip from 'jszip';
import imageCompression from 'browser-image-compression';

const fileList = ref([]);
const compressedFiles = ref([]);
const isCompressing = ref(false);
const compressionProgress = ref(0);
const maxSizeMB = ref(1);
const maxWidthOrHeight = ref(1920);

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('请上传图片文件');
    return false;
  }
  return true;
};

const handleFileChange = (file, uploadFiles) => {
  if (file.status === 'ready') {
    const isDuplicate = fileList.value.some(existingFile => 
      existingFile.name === file.name && existingFile.size === file.size
    );
    if (!isDuplicate) {
      file.url = URL.createObjectURL(file.raw);
      fileList.value.push(file);
    } else {
      // 如果是重复文件，从 uploadFiles 中移除
      const index = uploadFiles.indexOf(file);
      if (index !== -1) {
        uploadFiles.splice(index, 1);
      }
    }
  }
  // 同步 fileList 和 uploadFiles
  fileList.value = uploadFiles.filter(f => f.status === 'ready');
};

const handleFileRemove = (file) => {
  const index = fileList.value.indexOf(file);
  if (index !== -1) {
    URL.revokeObjectURL(file.url);
    fileList.value.splice(index, 1);
  }
};

const clearFiles = () => {
  fileList.value.forEach(file => URL.revokeObjectURL(file.url));
  fileList.value = [];
  compressedFiles.value = [];
};

const compressImage = async (file) => {
  const options = {
    maxSizeMB: maxSizeMB.value,
    maxWidthOrHeight: maxWidthOrHeight.value,
    useWebWorker: true,
    fileType: file.type,
    onProgress: (progress) => {
      //console.log(`Compression progress: ${progress}%`);
    },
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    // 比较压缩前后的文件大小
    if (compressedFile.size < file.size) {
      return new File([compressedFile], file.name, {
        type: file.type,
        lastModified: new Date().getTime()
      });
    } else {
      // 如果压缩后文件更大，则返回原始文件
      return file;
    }
  } catch (error) {
    throw new Error(`压缩失败: ${error.message}`);
  }
};

const compressImages = async () => {
  isCompressing.value = true;
  compressedFiles.value = [];
  compressionProgress.value = 0;

  const totalFiles = fileList.value.length;

  try {
    for (let i = 0; i < totalFiles; i++) {
      const file = fileList.value[i].raw;
      const compressedFile = await compressImage(file);
      compressedFiles.value.push(compressedFile);
      compressionProgress.value = Math.round(((i + 1) / totalFiles) * 100);
    }
    ElMessage.success('压缩完成');
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    isCompressing.value = false;
  }
};

const downloadImages = async () => {
  if (compressedFiles.value.length === 1) {
    // 下载单个文件
    const file = compressedFiles.value[0];
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    // 下载多个文件为 zip
    const zip = new JSZip();
    compressedFiles.value.forEach((file, index) => {
      zip.file(file.name, file);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compressed_images.zip';
    link.click();
    URL.revokeObjectURL(url);
  }

  // 清空压缩后的文件
  compressedFiles.value = [];
};
</script>

<style scoped>
.image-compressor {
  max-width: calc(100vw - 250px); /* 100vw 是视口宽度，减去左侧工具列表的宽度 */
  width: 100%; /* 确保卡片能够在小屏幕上缩小 */
  margin: 0 auto;
  box-sizing: border-box; /* 确保 padding 不会增加元素的总宽度 */
  /* padding: 10px;  添加一些内边距，使内容不会紧贴边缘 */
}
.options {
  margin-bottom: 10px;
}
.button-group {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}

.el-alert {
  margin-bottom: 10px;
}

/* 添加自定义 loading 样式 */
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.5);
}

.upload-area {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;  
}

.custom-upload {
  width: 100%;
  overflow: hidden;
}

:deep(.el-upload-list--picture-card) {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start; /* 左对齐 */
}
:deep(.el-upload-list--picture-card .el-upload-list__item) {
  margin: 0 8px 8px 0;
}

:deep(.el-upload--picture-card) {
  margin: 0 8px 8px 0;
}
</style>
