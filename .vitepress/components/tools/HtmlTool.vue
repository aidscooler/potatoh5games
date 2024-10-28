<template>
    <el-card class="html-tool">
      <template #header>
        <div class="card-header">
          <span>HTML工具</span>
        </div>
      </template>
      <el-form :model="formData" label-width="120px">
        <el-card class="mb-4">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="缩进大小">
                <el-input-number v-model="indentSize" :min="0" :max="8"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="换行长度">
                <el-input-number v-model="wrapLineLength" :min="0" :max="200"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最大保留换行数">
                <el-input-number v-model="maxPreserveNewlines" :min="0" :max="10"></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
        
        <el-card class="mb-4">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-button type="primary" @click="beautifyHtml">美化HTML</el-button>
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="compressHtml">压缩HTML</el-button>
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="copyHtml">复制HTML</el-button>
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="downloadHtml">下载HTML</el-button>
            </el-col>
          </el-row>
        </el-card>
        
        <el-card>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-input
                v-model="inputHtml"
                type="textarea"
                :rows="20"
                placeholder="请输入HTML代码"
              ></el-input>
            </el-col>
            <el-col :span="12">
              <el-input
                v-model="outputHtml"
                type="textarea"
                :rows="20"
                readonly
                placeholder="处理结果将显示在这里"
              ></el-input>
            </el-col>
          </el-row>            
        </el-card>
      </el-form>
    </el-card>
</template>
  
<script setup>
  import { html as beautify } from 'js-beautify'
  
  const inputHtml = ref('')
  const outputHtml = ref('')
  const indentSize = ref(2)
  const wrapLineLength = ref(80)
  const maxPreserveNewlines = ref(2)
  const formData = {
    indentSize,
    wrapLineLength,
    maxPreserveNewlines
  }
  
  const beautifyHtml = () => {
    if (!inputHtml.value) {
      ElMessage.warning('请先输入HTML代码')
      return
    }
    outputHtml.value = beautify(inputHtml.value, {
      indent_size: indentSize.value,
      wrap_line_length: wrapLineLength.value,
      max_preserve_newlines: maxPreserveNewlines.value,
    })
  }
  
  const compressHtml = () => {
    if (!inputHtml.value) {
      ElMessage.warning('请先输入HTML代码')
      return
    }
    outputHtml.value = inputHtml.value
      .replace(/<!--(?!<!)[^\[>].*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/> </g, '><')
      .trim()
  }
  
  const copyHtml = () => {
    if (!outputHtml.value) {
      ElMessage.warning('没有可复制的HTML内容')
      return
    }
    navigator.clipboard.writeText(outputHtml.value).then(() => {
      ElMessage.success('HTML已复制到剪贴板')
    }).catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
  }
  
  const downloadHtml = () => {
    if (!outputHtml.value) {
      ElMessage.warning('没有可下载的HTML内容')
      return
    }
    const blob = new Blob([outputHtml.value], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.html'
    a.click()
    URL.revokeObjectURL(url)
  }
</script>
  
<style scoped>
.html-tool {
  max-width: 1920px;
  margin: 0 auto;
}
.mb-4 {
  margin-bottom: 1.5rem;
}
.el-input-number {
  width: 100%;
}
.el-button {
  width: 100%;
}
.el-textarea :deep(.el-textarea__inner) {
  font-family: monospace;
  font-size: 14px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
  