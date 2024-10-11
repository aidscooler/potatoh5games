<template>
    <el-card class="video-converter" v-loading="isLoading" element-loading-text="首次使用加载会比较慢，请耐心等待！">
      <template #header>
        <div class="card-header">
          <span>视频格式转换工具:支持mp4转换为mov,avi,webm。(本站已CDN加速，首次使用会比较慢，请耐心等待)</span>
        </div>
      </template>

      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :file-list="fileList"
        accept="video/*"
      >
        <el-icon class="el-icon--upload"><i-ep-upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
      </el-upload>
  
      <el-select v-model="targetFormat" placeholder="选择目标格式" :disabled="!inputFile">
        <el-option
          v-for="format in supportedFormats"
          :key="format"
          :label="format"
          :value="format"
        />
      </el-select>
  
      <el-button type="primary" @click="convertVideo" :disabled="!canConvert">
        转换视频
      </el-button>
  
      <el-progress 
        v-if="isConverting" 
        :percentage="conversionProgress"
        :format="progressFormat"
      />
  
      <div v-if="outputUrl">
        <el-button type="success" @click="downloadVideo">下载转换后的视频</el-button>
      </div>
    </el-card>
</template>
  
  <script setup lang="ts">
  import { FFmpeg } from '@ffmpeg/ffmpeg'
  import { fetchFile, toBlobURL } from '@ffmpeg/util'
  //import type { LogEvent } from '@ffmpeg/ffmpeg/dist/esm/types'
  const isLoading = ref(true)  //加载状态

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
  const ffmpeg = new FFmpeg()
  
  const inputFile = ref(null)
  const fileList = ref([])
  const targetFormat = ref('')
  const isConverting = ref(false)
  const conversionProgress = ref(0)
  const outputUrl = ref('')
  
  const supportedFormats = ['mp4', 'webm', 'mov', 'avi']
  
  const canConvert = computed(() => {
    return inputFile.value && targetFormat.value && inputFile.value.name.split('.').pop() !== targetFormat.value
  })
  
  onMounted(async () => {
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
        //,
        //workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')        
      })
      ElMessage.success('FFmpeg 加载成功')
    } catch (error) {
      console.error('Failed to load FFmpeg:', error)
      ElMessage.error('FFmpeg 加载失败，请刷新页面重试')
    } finally {
      isLoading.value = false  // 加载完成，隐藏加载动画
    }    
  })
  
  const handleFileChange = (file) => {
    // 如果已经有文件,先移除它
    if (inputFile.value) {
      fileList.value = []
    }
    inputFile.value = file.raw
    fileList.value = [file]
    targetFormat.value = ''
    outputUrl.value = ''
  }

const handleFileRemove = () => {
  inputFile.value = null
  fileList.value = []
  targetFormat.value = ''
  outputUrl.value = ''
}
  
  const convertVideo = async () => {
    if (!inputFile.value || !targetFormat.value) return
  
    isConverting.value = true
    conversionProgress.value = 0

    const progressCallback = ({ progress }: { progress: number }) => {
      conversionProgress.value = Math.round(progress * 100)
    }    
  
    try {
      const inputName = 'input.' + inputFile.value.name.split('.').pop()
      const outputName = 'output.' + targetFormat.value
  
      await ffmpeg.writeFile(inputName, await fetchFile(inputFile.value))

      // ffmpeg.on('log', ({ message: msg }: LogEvent) => {
      //   console.log(msg);
      // })

      ffmpeg.on('progress', progressCallback);

      if (targetFormat.value === 'webm') {
        await ffmpeg.exec(['-i', inputName,
                        "-fflags", "+genpts",
                        "-preset", "ultrafast",
                        "-c:v", "libvpx",
                        "-c:a", "libvorbis",
                        "-crf", "23",
                        "-threads", "0",
                        outputName])        
      }else {
        await ffmpeg.exec(['-i', inputName,outputName])
      }

      //return ;
  
      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([data.buffer], { type: `video/${targetFormat.value}` })
      outputUrl.value = URL.createObjectURL(blob)
  
      ElMessage.success('视频转换成功！')
    } catch (error) {
      console.error('Error during video conversion:', error)
      ElMessage.error('视频转换失败，请重试。')
    } finally {
      isConverting.value = false
      ffmpeg.off('progress',progressCallback)
      //await ffmpeg.deleteFile('input.mp4')
    }
  }
  
  const downloadVideo = () => {
    if (outputUrl.value) {
      const a = document.createElement('a')
      a.href = outputUrl.value
      a.download = `converted_video.${targetFormat.value}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }
  
  const progressFormat = (percentage: number) => {
    return percentage === 100 ? '转换完成' : `${percentage}%`
  }
  </script>
  
  <style scoped>
  .video-converter {
    max-width: 1080px;
    margin: 0 auto;
    position: relative;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .loading-spinner {
    font-size: 24px;
    margin-bottom: 20px;
  }

.is-spinning {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .el-select,
  .el-button {
    margin-top: 20px;
    width: 100%;
  }
  
  .el-progress {
    margin-top: 20px;
  }
  </style>
  