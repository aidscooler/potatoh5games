<template>
  <el-card class="background-removal-tool" ref="cardRef">
    <!--<div v-if="isLoading">Debug: Model: {{modelLoadingProgress}}, Processor: {{processorLoadingProgress}}</div>-->
    <div class="layout">
      <!-- 左侧图片列表 -->
      <div class="image-list">
        <div class="button-group">
          <el-button type="primary" @click="triggerUpload">选择图片</el-button>
          <el-button type="danger" @click="clearImages">清空图片</el-button>
        </div>
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileChange"
          multiple
          accept="image/jpg,image/jpeg,image/png,image/webp,image/bmp"
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
            </div>
          </div>
        </el-scrollbar>
      </div>

      <!-- 中间图片展示区 -->
      <div class="image-display" ref="imageDisplay" >        
        <div class="image-wrapper" :style="wrapperStyle">
          <el-image 
            v-if="selectedImage && selectedImage.removedBackgroundUrl"
            :src="selectedImage.removedBackgroundUrl" 
            :style="[imageStyle, { zIndex: 1 }]" 
            fit="contain"
            @load="onRemovedBackgroundImageLoad"
          ></el-image>
          <el-image 
            v-if="selectedImage"
            :src="selectedImage.url" 
            :style="[imageStyle, selectedImage.removedBackgroundUrl ? { zIndex: 2, clipPath: `inset(0 0 0 ${sliderPosition}%)` } : { zIndex: 2 }]" 
            fit="contain"
            @load="onImageLoad"
          ></el-image>
          <div 
            v-if="selectedImage && selectedImage.removedBackgroundUrl" 
            class="comparison-slider" 
            :style="{ left: `${sliderPosition}%` }"
            @mousedown="startSliderDrag"
          >
            <div class="slider-handle"></div>
          </div>
        </div>
        <div v-if="isProcessing" class="processing-overlay">
          <el-progress type="circle" :percentage="processProgress"></el-progress>
          <p>正在处理图片...</p>
        </div>        
      </div>

      <!-- 右侧功能区域 -->
      <div class="function-area">
        <el-alert
          :title="webGPUMessage"
          :type="webGPUSupported ? 'success' : 'warning'"
          :closable="false"
          show-icon
        />      
        <el-alert
          title="支持常见格式的图片，如jpg、png、bmp、webp"
          type="info"
          :closable="false"
          show-icon
        />          
        <el-scrollbar height="100%">
          <el-button type="primary" @click="removeBackgroundBatch" :loading="isProcessing">批量去除背景</el-button>
          <el-button @click="removeBackgroundCurrent" :loading="isProcessing">去除当前背景</el-button>
          <el-button type="warning" @click="downloadAll">批量下载</el-button>
          <el-button @click="downloadCurrent">下载当前图片</el-button>
        </el-scrollbar>
      </div>
    </div>
  </el-card>
</template>
<script lang="ts" setup>
  import { getGPUTier } from 'detect-gpu';
  import JSZip from 'jszip';

  const images = ref([]);
  const selectedImage = ref(null);
  const selectedImageIndex = ref(null);
  const imageDisplay = ref(null);
  const fileInput = ref(null);

  const modelLoadingProgress = ref(0);
  const processorLoadingProgress = ref(0);
  const isLoadingModel = ref(true);
  const isLoadingProcessor = ref(false);

  const sliderPosition = ref(50);
  const checkerboardPattern = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURb+/v////5nD/3QAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAUSURBVBjTYwABQSCglEENMxgYGAAynwRB8BEAgQAAAABJRU5ErkJggg==";

  const isProcessing = ref(false);
  const processProgress = ref(0);

  const webGPUSupported = ref(false);
  const webGPUMessage = ref('');    
//组件加载动画 begin
  const cardRef = ref(null);
  let loadingInstance = null;

  const loadingText = computed(() => {
    if (isLoadingModel.value) {
      return `正在加载模型，请耐心等待！（首次使用加载会比较慢，加载进度：${modelLoadingProgress.value}%）`;
    } 
    if (isLoadingProcessor.value) {
      return '正在加载运行环境，请耐心等待！';
    }
    if(!isLoadingModel.value && !isLoadingProcessor.value){
      return '加载完成';
    }
  });

  const startLoading = () => {
    if (!loadingInstance) {
      loadingInstance = ElLoading.service({
        target: cardRef.value.$el,
        lock: true,
        text: '正在加载前端组件，请耐心等待！',
        background: 'rgba(0, 0, 0, 0.7)',
        customClass: 'custom-loading'
      });
    } else {
      updateLoading();
    }
  };

  const updateLoading = () => {
    if (loadingInstance) {
      //console.log(loadingText.value)
      loadingInstance.setText(loadingText.value);
    }
  };

  const stopLoading = () => {
    if (loadingInstance) {
      loadingInstance.close();
    }
  };
  watch(
    [
      loadingText,
      isLoadingProcessor
    ], 
    () => {
      updateLoading()
    },
    { immediate: true });
//end 
  const wrapperStyle = computed(() => {
    if (!selectedImage.value) return {};
    const aspectRatio = selectedImage.value.width / selectedImage.value.height;
    const containerAspectRatio = imageDisplay.value ? imageDisplay.value.clientWidth / imageDisplay.value.clientHeight : 1;

    let width, height;
    if (aspectRatio > containerAspectRatio) {
      width = '100%';
      height = `${100 / aspectRatio * containerAspectRatio}%`;
    } else {
      width = `${100 * aspectRatio / containerAspectRatio}%`;
      height = '100%';
    }
    return {
      width,
      height,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  });

  const imageStyle = computed(() => ({
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    position: 'absolute',
    top: 0,
    left: 0,
  }));

  const onRemovedBackgroundImageLoad = (e) => {
    if (e.target) {
      e.target.style.background = `url("${checkerboardPattern}")`;
    }
  };
  let AutoModel, AutoProcessor, env, RawImage, model, processor;
  //加载模型，判断是否支持WebGPU
  onMounted(async () => {
    sliderPosition.value = 50;
    startLoading();
    isLoadingModel.value = true;
    isLoadingProcessor.value = false;   
    try {
      const modules = await import('@huggingface/transformers');
      AutoModel = modules.AutoModel;
      AutoProcessor = modules.AutoProcessor;
      env = modules.env;
      RawImage = modules.RawImage;
      // Since we will download the model from the Hugging Face Hub, we can skip the local model check
      env.allowLocalModels = false;
      env.remoteHost = "https://briaai.potatoh5games.fun/";
      env.remotePathTemplate = "{model}";   
      env.backends.onnx.wasm.wasmPaths = "/wasm/";
      // Proxy the WASM backend to prevent the UI from freezing
      env.backends.onnx.wasm.proxy = true;

      const gpuTier = await getGPUTier();
      const modelSettings = {
        // Do not require config.json to be present in the repository
        config: { model_type: "custom" },
        subfolder: "",
        progress_callback: (progress) => {
          //console.log(progress)
          if(progress.status === "progress") {
            modelLoadingProgress.value = Math.round(progress.progress * 100) / 100;
          } 
          if(progress.status === "done") {
            isLoadingModel.value = false;
            isLoadingProcessor.value = true;            
          }        
        }
      };
      //判断是否支持WebGPU
      if (gpuTier?.fps && !gpuTier?.isMobile) {
        modelSettings.device = "webgpu";
        modelSettings.dtype = "fp32";
        webGPUSupported.value = true;
        webGPUMessage.value = "您的浏览器支持WebGPU，当前已为您启用WebGPU加快处理速度。"
      }else {
        webGPUSupported.value = false;
        webGPUMessage.value = "您的浏览器不支持WebGPU，处理速度会比较慢。使用最新版的Chrome浏览器可体验更快的处理速度。"        
      }       
      // Load model and processor
      model = await AutoModel.from_pretrained('briaai/RMBG-1.4', modelSettings); 
      //updateLoading();
      processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
        config: {
          // Do not require config.json to be present in the repository
          do_normalize: true,
          do_pad: false,
          do_rescale: true,
          do_resize: true,
          image_mean: [0.5, 0.5, 0.5],
          feature_extractor_type: "ImageFeatureExtractor",
          image_std: [1, 1, 1],
          resample: 2,
          rescale_factor: 0.00392156862745098,
          size: { width: 1024, height: 1024 },
        } //,  这里的 progress_callback 没有被调用
        // progress_callback: (progress) => {
        //   console.log("progress")
        //   if (progress.progress) {
        //     console.log(progress.progress)
        //     processorLoadingProgress.value = Math.round(progress.progress);
        //   }
        // }        
      });       
      //isLoadingProcessor.value = false;      
    } catch (error) {
      console.log("error: " + error);     
    } finally {
      stopLoading();
      isLoadingModel.value = false;
      isLoadingProcessor.value = false;
    }
  });
   // Predict foreground of the given image
  async function predict(url) {
    // 获取原始图片的格式
    //const originalFormat = url.split(';')[0].split('/')[1];    
    // Read image
    const image = await RawImage.fromURL(url);
    // Preprocess image
    const { pixel_values } = await processor(image);
    // Predict alpha matte
    const { output } = await model({ input: pixel_values });
    // Resize mask back to original size
    const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height);
    // Create new canvas
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    // Draw original image output to canvas
    ctx.drawImage(image.toCanvas(), 0, 0);
    // Update alpha channel
    const pixelData = ctx.getImageData(0, 0, image.width, image.height);
    for (let i = 0; i < mask.data.length; ++i) {
      pixelData.data[4 * i + 3] = mask.data[i];
    }
    ctx.putImageData(pixelData, 0, 0);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
  }

  const triggerUpload = () => {
    fileInput.value.click();
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          images.value.push({
            url: e.target.result,
            name: file.name,
            width: img.width,
            height: img.height,
            //originalFormat: file.type.split('/')[1]
          });
          if (!selectedImage.value) {
            selectImage(0);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const deleteImage = (index) => {
    images.value.splice(index, 1);
    if (selectedImageIndex.value === index) {
      selectedImage.value = null;
      selectedImageIndex.value = null;
    } else if (selectedImageIndex.value > index) {
      selectedImageIndex.value--;
    }
  };
  const clearImages = () => {
    images.value = [];
    selectedImage.value = null;
    selectedImageIndex.value = null;
  };
  const selectImage = (index) => {
    selectedImage.value = images.value[index];
    selectedImageIndex.value = index;
    sliderPosition.value = 50;
  };

  const startSliderDrag = (event) => {
    event.preventDefault();
    const imageDisplayRect = imageDisplay.value.getBoundingClientRect();

    const handleSliderDrag = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      requestAnimationFrame(() => {
        const x = clientX - imageDisplayRect.left;
        const newPosition = (x / imageDisplayRect.width) * 100;
        sliderPosition.value = Math.max(0, Math.min(100, newPosition));
      });
    };

    const stopSliderDrag = () => {
      document.removeEventListener('mousemove', handleSliderDrag);
      document.removeEventListener('touchmove', handleSliderDrag);
      document.removeEventListener('mouseup', stopSliderDrag);
      document.removeEventListener('touchend', stopSliderDrag);
    };

    document.addEventListener('mousemove', handleSliderDrag);
    document.addEventListener('touchmove', handleSliderDrag);
    document.addEventListener('mouseup', stopSliderDrag);
    document.addEventListener('touchend', stopSliderDrag);
  };

  const onImageLoad = () => {
    // 图片加载完成后的处理逻辑
  };

  const removeBackgroundBatch = async () => {
    if (images.value.length === 0) {
      ElMessage.warning('请先上传图片');
      return;
    }

    isProcessing.value = true;
    processProgress.value = 0;

    for (let i = 0; i < images.value.length; i++) {
      const image = images.value[i];
      if (!image.removedBackgroundUrl) {
        try {
          const blob = await predict(image.url);
          image.removedBackgroundUrl = URL.createObjectURL(blob);
          image.removedBackgroundBlob = blob; // 保存 Blob 对象以便后续下载
        } catch (error) {
          console.error('去除背景失败:', error);
          ElMessage.error(`去除 ${image.name} 背景失败`);
        }
      }
      processProgress.value = Math.round(((i + 1) / images.value.length) * 100);
    }
    isProcessing.value = false;
    ElMessage.success('批量去除背景完成');
  };

  const removeBackgroundCurrent = async () => {
    if (selectedImage.value) {
      if (!selectedImage.value.removedBackgroundUrl) {
        try {
          isProcessing.value = true;
          const blob = await predict(selectedImage.value.url);
          selectedImage.value.removedBackgroundUrl = URL.createObjectURL(blob);
          selectedImage.value.removedBackgroundBlob = blob; // 保存 Blob 对象以便后续下载
          ElMessage.success('去除背景成功');
        } catch (error) {
          console.error('去除背景失败:', error);
          ElMessage.error('去除背景失败');
        } finally {
          isProcessing.value = false;
        }
      } else {
        ElMessage.info('当前图片已去除背景');
      }
    } else {
      ElMessage.warning('请先选择一张图片');
    }
  };  

  const downloadAll = async () => {
    const zip = new JSZip();
    let hasRemovedBackground = false;

    for (const image of images.value) {
      if (image.removedBackgroundBlob) {
        zip.file(image.name, image.removedBackgroundBlob);
        hasRemovedBackground = true;
      }
    }

    if (!hasRemovedBackground) {
      ElMessage.warning('没有可下载的已去除背景的图片');
      return;
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'removed_background_images.zip';
    link.click();
    URL.revokeObjectURL(link.href);
  };  

  const downloadCurrent = () => {
    if (selectedImage.value && selectedImage.value.removedBackgroundBlob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(selectedImage.value.removedBackgroundBlob);
      link.download = `removed_background_${selectedImage.value.name}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } else {
      ElMessage.warning('请先选择一张已去除背景的图片');
    }
  };
</script>
<style scoped>
  .background-removal-tool {
    width: 100%;
    height: 100%;
    max-width: 1920px;
    position: relative;
  }
  .background-removal-tool :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0; /* 移除默认内边距 */
  }
  .layout {
    display: flex;
    height: 100%;
  }
  .image-list,
  .image-display,
  .function-area {
    padding: 10px;
    height: calc(100vh - 90px);
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
  .function-area {
    width: 300px;
    border-left: 1px solid #eee;
  }
  .image-item {
    position: relative;
    width: 100%;
    margin-bottom: 15px;
    cursor: pointer;
  }
  .image-info {
    width: 100%;
    text-align: center;
    padding-top: 5px;
  }
  .image-name {
    display: block;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .delete-btn {
    position: absolute;
    right: 5px;
    top: 5px;
    z-index: 12;
  }
  .image-item.selected {
    border: 2px solid #409EFF;
    box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
  }
  .button-group {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .thumbnail-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 100%;
    margin-bottom: 5px;
    overflow: hidden;
  }  
  .thumbnail-container .el-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
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
  .function-area .el-button {
    width: 100%;
    margin-bottom: 10px;
  }
  .comparison-slider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: white;
    cursor: ew-resize;
  }
  .slider-handle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
  }
  .processing-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    z-index: 10;
  }

  .image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }  
  .image-display {
    position: relative;
    overflow: hidden;
  }

  .comparison-slider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: white;
    cursor: ew-resize;
    z-index: 10;
  }

  .slider-handle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.1);
  }  
  .el-button+.el-button {
    margin-left :0px;
  } 
  .custom-loading {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 10000 !important;
  }

  .custom-loading .el-loading-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }  
  .custom-loading .el-loading-text {
    color: #fff;
    font-size: 18px;
    margin-top: 10px;
  }
</style> 