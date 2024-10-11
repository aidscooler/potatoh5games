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
      <el-icon class="el-icon--upload"><i-ep-upload-filled /></el-icon>
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
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import type { LogEvent } from '@ffmpeg/ffmpeg/dist/esm/types'

//'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'
const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
const isLoading = ref(false)
const ffmpeg = new FFmpeg()
const videoFile = ref(null)
const videoPreviewUrl = ref('')
const watermarkPosition = ref('')
const progress = ref(0)
const progressStatus = ref('')
const processedVideoUrl = ref('')
const cv = ref(null)

const videoInfo = ref({
  codec: '',
  colorSpace: '',
  width: 0,
  height: 0,
  bitrate: '',
  frameRate: 0
})

const handleFileChange = (file) => {
  videoFile.value = file.raw
  videoPreviewUrl.value = URL.createObjectURL(file.raw)
}

const loadFFmpeg = async () => {
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    //,
    //workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
  })
}

const loadOpenCV = async () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = '/thirdlibrary/opencv/4.10.0/opencv.js'
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
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile.value))

    // 获取视频信息
    await getVideoInfo()

    // 提取视频帧
    await extractFrames()

    // 处理帧
    await processFrames()

    // 重新编码视频
    await encodeVideo()

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
    await cleanupFiles()
    isLoading.value = false
  }
}

const getVideoInfo = async () => {
  return new Promise((resolve) => {
    ffmpeg.on('log', ({ message: msg }: LogEvent) => {
      const streamMatch = msg.match(/Stream #0:\d+.*?: Video: (\w+).*?, (\w+).*?, (\d+)x(\d+).*?, (\d+) kb\/s, (\d+(?:\.\d+)?) fps/)
      if (streamMatch) {
        videoInfo.value = {
          codec: streamMatch[1],//视频编码
          colorSpace: streamMatch[2],//颜色空间
          width: parseInt(streamMatch[3]),//视频宽度
          height: parseInt(streamMatch[4]),//视频高度
          bitrate: streamMatch[5],//比特率
          frameRate: parseFloat(streamMatch[6])//帧率
        }
        resolve();
      }
      //console.log(msg);
    })
    ffmpeg.exec(['-hide_banner', '-i', 'input.mp4'])
  })
}

const extractFrames = async () => {
  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-vf', `fps=${videoInfo.value.frameRate}`,
    '-pix_fmt', 'rgba',  // 确保输出为 RGBA 格式
    '-q:v', '2',
    '-s', `${videoInfo.value.width}x${videoInfo.value.height}`,
    'frame%d.png'
  ])
}

const processFrames = async () => {
  const frames = await ffmpeg.listDir('.')
  const totalFrames = frames.filter(file => file.name.startsWith('frame') && file.name.endsWith('.png')).length

  for (let i = 0; i < totalFrames; i++) {
    const frameName = `frame${i + 1}.png`
    const frameData = await ffmpeg.readFile(frameName)
    
    // 创建一个临时的 canvas 元素
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // 创建一个 Image 对象并加载帧数据
    const img = new Image()
    const blob = new Blob([frameData], { type: 'image/png' })
    const imageUrl = URL.createObjectURL(blob)

    await new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(imageUrl)
        resolve()
      }
      img.src = imageUrl
    })

    // 从 canvas 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // 使用 cv.matFromImageData 创建 cv.Mat 对象
    let src = cv.value.matFromImageData(imageData)

    // 确保图像是 8 位 4 通道 (RGBA)
    if (src.type() !== cv.value.CV_8UC4) {
      let dst = new cv.value.Mat()
      cv.value.cvtColor(src, dst, cv.value.COLOR_BGR2RGBA)
      src.delete()
      src = dst
    }

    const rectData = getWatermarkRect(watermarkPosition.value, src.cols, src.rows)
    const mask = new cv.value.Mat(src.rows, src.cols, cv.value.CV_8UC1, new cv.value.Scalar(0))
    //console.log(rectData);
    cv.value.rectangle(mask, 
                 new cv.value.Point(rectData.x, rectData.y),
                 new cv.value.Point(rectData.x + rectData.width, rectData.y + rectData.height),
                 new cv.value.Scalar(255),
                 -1)//,
                 //cv.LINE_8)
    
    const dst = new cv.value.Mat()

    try {
      cv.value.inpaint(src, mask, dst, 3, cv.value.INPAINT_TELEA);
    } catch (e) {
      console.error("Inpaint error:", e);
      // 可能的话，打印出更多的调试信息
      console.log("src info:", src.rows, src.cols, src.type());
      console.log("mask info:", mask.rows, mask.cols, mask.type());
      console.log("dst info:", dst.rows, dst.cols, dst.type());
    }

    // 将处理后的图像编码回 PNG 格式
    let processedImageData = new cv.value.MatVector()
    cv.value.imencode('.png', dst, processedImageData)
    let processedUint8Array = processedImageData.get(0).data

    await ffmpeg.writeFile(`processed_${frameName}`, processedUint8Array)

    src.delete()
    dst.delete()
    mask.delete()
    processedImageData.delete()

    progress.value = Math.round((i + 1) / totalFrames * 100)
    await ffmpeg.deleteFile(frameName)
  }
}



const encodeVideo = async () => {
  await ffmpeg.exec([
    '-framerate', videoInfo.value.frameRate.toString(),
    '-i', 'processed_frame%d.png',
    '-c:v', videoInfo.value.codec,
    '-pix_fmt', videoInfo.value.colorSpace,
    'output.mp4'
  ])
}

const cleanupFiles = async () => {
  const remainingFiles = await ffmpeg.listDir('.')
  for (const file of remainingFiles) {
    if ((file.name.startsWith('processed_frame') || file.name.startsWith('frame')) && file.name.endsWith('.png')) {
      await ffmpeg.deleteFile(file.name)
    }
  }
}

const getWatermarkRect = (position, width, height) => {
  const widthSize = Math.floor(width / 3); //Math.min(width, height) / 4;
  const heightSize = Math.floor(height / 3);
  switch (position) {
    case 'top-left': return new cv.value.Rect(0, 0, widthSize, heightSize)
    case 'top-right': return new cv.value.Rect(width - widthSize, 0, widthSize, heightSize)
    case 'bottom-left': return new cv.value.Rect(0, height - heightSize, widthSize, heightSize)
    case 'bottom-right': return new cv.value.Rect(width - widthSize, height - heightSize, widthSize, heightSize)
    case 'center': return new cv.value.Rect((width - widthSize) / 2, (height - heightSize) / 2, widthSize, heightSize)
    default: return new cv.value.Rect(0, 0, size, size)
  }
}

// 监听 videoFile 变化，自动获取视频信息
watch(videoFile, async (newFile) => {
  if (newFile) {
    await ffmpeg.writeFile('input.mp4', await fetchFile(newFile))
    await getVideoInfo()
  }
})

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
