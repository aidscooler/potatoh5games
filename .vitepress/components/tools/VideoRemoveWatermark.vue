<template>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>视频去水印工具</span>
        </div>
      </template>
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
      <el-button type="primary" @click="processVideo" :disabled="!videoFile" :loading="isLoading">开始处理</el-button>
      <el-progress :percentage="progress" :status="progressStatus"></el-progress>
      <video v-if="processedVideoUrl" :src="processedVideoUrl" controls></video>
    </el-card>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { UploadFilled } from '@element-plus/icons-vue'
  import { FFmpeg } from '@ffmpeg/ffmpeg'
  import { fetchFile, toBlobURL } from '@ffmpeg/util'

  const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'
  const isLoading = ref(false)  // 加载状态
  
  const ffmpeg = new FFmpeg()
  const videoFile = ref(null)
  const progress = ref(0)
  const progressStatus = ref('')
  const processedVideoUrl = ref('')
  const cv = ref(null)
  
  const handleFileChange = (file) => {
    videoFile.value = file.raw
  }
  
  const loadFFmpeg = async () => {
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
    })
  }
  
  const loadOpenCV = async () => {
    if (!cv.value) {
        cv.value = await import('opencv.js')
    }
    return new Promise((resolve) => {
        if (cv.value.Mat) {
            resolve()
        } else {
            cv.value.onRuntimeInitialized = () => {
                resolve()
            }
        }
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
  if (!videoFile.value) {
    ElMessage.warning('请先上传视频文件')
    return
  }

  progress.value = 0
  progressStatus.value = ''

  try {
    isLoading.value = true;
    // 写入文件到 FFmpeg
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile.value))

    // 获取视频信息
    const { stderr } = await ffmpeg.exec(['-i', 'input.mp4', '-f', 'null', '-'])
    const fpsMatch = stderr.match(/(\d+(?:\.\d+)?) fps/)
    const fps = fpsMatch ? parseFloat(fpsMatch[1]) : 30

    // 提取帧
    await ffmpeg.exec(['-i', 'input.mp4', '-vf', `fps=${fps}`, 'frame%d.png'])

    // 读取生成的帧
    const frames = await ffmpeg.listDir('.')
    const totalFrames = frames.filter(file => file.startsWith('frame') && file.endsWith('.png')).length

    for (let i = 0; i < totalFrames; i++) {
      const frameName = `frame${i + 1}.png`
      const frameData = await ffmpeg.readFile(frameName)
      
      // 使用 OpenCV 处理帧
      const src = cv.value.matFromImageData(new ImageData(new Uint8ClampedArray(frameData.buffer), 1920, 1080))
      
      // 在这里实现水印去除逻辑
      const dst = new cv.value.Mat()
      cv.value.medianBlur(src, dst, 5)

      // 将处理后的帧写回 FFmpeg
      const processedFrameData = new Uint8Array(dst.data.buffer)
      await ffmpeg.writeFile(`processed_${frameName}`, processedFrameData)

      src.delete()
      dst.delete()

      progress.value = Math.round((i + 1) / totalFrames * 100)
    }

    // 重新组合视频
    await ffmpeg.exec(['-framerate', fps.toString(), '-i', 'processed_frame%d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'output.mp4'])

    // 读取输出视频
    const data = await ffmpeg.readFile('output.mp4')
    processedVideoUrl.value = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))

    progress.value = 100
    progressStatus.value = 'success'
    ElMessage.success('视频处理完成')
  } catch (error) {
    isLoading.value = false;
    progressStatus.value = 'exception'
    ElMessage.error('视频处理失败')
    console.error(error)
  }finally {
    isLoading.value = false;
  }
}
  </script>
  
  <style scoped>
  .box-card {
    width: 480px;
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
  video {
    width: 100%;
    margin-top: 20px;
  }
  </style>