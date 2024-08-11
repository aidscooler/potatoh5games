<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>视频去水印工具</span>
      </div>
    </template>
    
    <!-- 视频上传组件 -->
    <el-upload
      class="upload-demo"
      drag
      :auto-upload="false"
      :on-change="handleFileChange"
      accept="video/*"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        拖拽视频到此处或 <em>点击上传</em>
      </div>
    </el-upload>

    <!-- 视频预览和水印位置选择 -->
    <div v-if="videoFile" class="video-preview">
      <video ref="videoPreview" :src="videoPreviewUrl" controls></video>
      <el-select v-model="watermarkPosition" placeholder="选择水印位置">
        <el-option label="左上角" value="top-left"></el-option>
        <el-option label="右上角" value="top-right"></el-option>
        <el-option label="左下角" value="bottom-left"></el-option>
        <el-option label="右下角" value="bottom-right"></el-option>
        <el-option label="中心" value="center"></el-option>
      </el-select>
    </div>

    <el-button type="primary" @click="processVideo" :disabled="!videoFile || !watermarkPosition" :loading="isLoading">开始处理</el-button>
    <el-progress :percentage="progress" :status="progressStatus"></el-progress>
    
    <!-- 处理后的视频 -->
    <video v-if="processedVideoUrl" :src="processedVideoUrl" controls></video>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import type { LogEvent } from '@ffmpeg/ffmpeg/dist/esm/types'

const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'
const isLoading = ref(false)
const ffmpeg = new FFmpeg()
const videoFile = ref(null)
const videoPreviewUrl = ref('')
const watermarkPosition = ref('')
const progress = ref(0)
const progressStatus = ref('')
const processedVideoUrl = ref('')
const cv = ref(null)

const handleFileChange = (file) => {
  videoFile.value = file.raw
  videoPreviewUrl.value = URL.createObjectURL(file.raw)
}

const loadFFmpeg = async () => {
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
  })
}

const loadOpenCV = async () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = '/thirdlibrary/opencv/1.2.1/opencv.js'
    script.async = true
    script.onload = () => {
      cv.value = window.cv
      resolve()
    }
    document.body.appendChild(script)
  })
}

onMounted(async () => {  
  try {
    await loadFFmpeg()
    await loadOpenCV()
    ElMessage.success('FFmpeg和OpenCV加载成功')
  } catch (error) {
    ElMessage.error('加载FFmpeg或OpenCV失败')
    console.error(error)
  }
})


const processVideo = async () => {
  if (!videoFile.value || !watermarkPosition.value) {
    ElMessage.warning('请上传视频并选择水印位置')
    return
  }

  progress.value = 0
  progressStatus.value = ''

  try {
    isLoading.value = true
    const videoinfo = { 
      codec: '',
      colorSpace: '',
      width: '',
      height: '',
      bitrate: '',
      frameRate: ''
    };   
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile.value))

    // 获取视频信息
    //Stream #0:1[0x2](und): Video: h264 (High) (avc1 / 0x31637661), yuv420p(tv, bt709, progressive), 1080x1920 [SAR 1:1 DAR 9:16], 1050 kb/s, 30 fps, 30 tbr, 90k tbn (default)
    //1080 是视频的宽度（Width）
    //1920 是视频的高度（Height）
    //h264 (High) 视频编码
    //yuv420p 色彩空间
    //1050 kb/s 比特率
    //30 fps 帧率
    ffmpeg.on('log', ({ message: msg }: LogEvent) => {
      // 解析视频流信息
      const streamMatch = msg.match(/Stream #0:\d+.*?: Video: (\w+).*?, (\w+).*?, (\d+)x(\d+).*?, (\d+) kb\/s, (\d+(?:\.\d+)?) fps/);
      if (streamMatch) {
        videoinfo.codec = streamMatch[1];
        videoinfo.colorSpace = streamMatch[2];
        videoinfo.width = streamMatch[3];
        videoinfo.height = streamMatch[4];
        videoinfo.bitrate = streamMatch[5];
        videoinfo.frameRate = streamMatch[6];          
      }
      console.log(msg);
    }) 
    await ffmpeg.exec([      //'--help', 'full' '-hide_banner', ,'-f','null','-'
      '-hide_banner','-i', 'input.mp4'
    ]);
    //ffmpeg.off('log', ({ message: msg }: LogEvent) => {});
    console.log(videoinfo);
    // 提取视频帧  `fps=${fps}` `${width}x${height}` ,'-q:v', '2', '-s', '1080x1920'
    await ffmpeg.exec(['-i', 'input.mp4', '-r','30', 'frame%d.png'])
    console.log('提取帧');

    const frames = await ffmpeg.listDir('.')
    console.log(frames);
    const totalFrames = frames.filter(file => file.name.startsWith('frame') && file.name.endsWith('.png')).length
    console.log(totalFrames);
    return 
    for (let i = 0; i < totalFrames; i++) {
      const frameName = `frame${i + 1}.png`
      const frameData = await ffmpeg.readFile(frameName)
      
      const src = cv.value.matFromImageData(new ImageData(new Uint8ClampedArray(frameData.buffer), 1920, 1080))
      
      // 水印去除逻辑
      const mask = new cv.value.Mat(src.rows, src.cols, cv.value.CV_8U, new cv.value.Scalar(255))
      const rect = getWatermarkRect(watermarkPosition.value, src.cols, src.rows)
      mask.drawRectangle(rect, new cv.value.Scalar(0), -1)
      
      const dst = new cv.value.Mat()
      cv.value.inpaint(src, mask, dst, 3, cv.value.INPAINT_TELEA)

      const processedFrameData = new Uint8Array(dst.data.buffer)
      await ffmpeg.writeFile(`processed_${frameName}`, processedFrameData)

      src.delete()
      dst.delete()
      mask.delete()

      progress.value = Math.round((i + 1) / totalFrames * 100)
    }

    await ffmpeg.exec(['-framerate', fps.toString(), '-i', 'processed_frame%d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'output.mp4'])

    const data = await ffmpeg.readFile('output.mp4')
    processedVideoUrl.value = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))

    progress.value = 100
    progressStatus.value = 'success'
    ElMessage.success('视频处理完成')
  } catch (error) {
    progressStatus.value = 'exception'
    ElMessage.error('视频处理失败')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const getWatermarkRect = (position, width, height) => {
  const size = Math.min(width, height) / 4
  switch (position) {
    case 'top-left': return new cv.value.Rect(0, 0, size, size)
    case 'top-right': return new cv.value.Rect(width - size, 0, size, size)
    case 'bottom-left': return new cv.value.Rect(0, height - size, size, size)
    case 'bottom-right': return new cv.value.Rect(width - size, height - size, size, size)
    case 'center': return new cv.value.Rect((width - size) / 2, (height - size) / 2, size, size)
    default: return new cv.value.Rect(0, 0, size, size)
  }
}
</script>

<style scoped>
.box-card {
  width: 80%;
  max-width: 800px;
  margin: 20px auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.el-button {
  margin-top: 20px;
}
.el-progress {
  margin-top: 20px;
}
.video-preview {
  margin-top: 20px;
}
.video-preview video {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
}
.el-select {
  margin-top: 10px;
  width: 100%;
}
video {
  width: 100%;
  margin-top: 20px;
}
</style>
