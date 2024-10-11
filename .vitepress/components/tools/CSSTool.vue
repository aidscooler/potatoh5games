<template>
    <div class="css-tool">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>采用js-beautify实现美化(缩进为两个空格)、csso实现压缩(去掉多余的空格、换行、注释)</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="24" :md="12">
            <el-input
              v-model="inputCSS"
              type="textarea"
              :rows="15"
              placeholder="请输入 CSS 代码"
            ></el-input>
          </el-col>
          <el-col :span="24" :md="12">
            <el-input
              v-model="outputCSS"
              type="textarea"
              :rows="15"
              placeholder="处理后的 CSS 代码将显示在这里"
            ></el-input>
          </el-col>
        </el-row>
        <el-row class="mt-4">
          <el-col :span="24">
            <el-button-group>
              <el-button type="primary" @click="beautifyCSS" :disabled="!inputCSS" :loading="beautify_loading">
                <i-ep-magic-stick />美化 CSS
              </el-button>
              <el-button type="warning" @click="minifyCSS" :disabled="!inputCSS" :loading="minify_loading">
                <i-ep-delete />压缩 CSS
              </el-button>
              <el-button type="success" @click="downloadCSS" :disabled="!outputCSS">
                <i-ep-download />下载 CSS
              </el-button>
            </el-button-group>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </template>
  
  <script setup>
  
  const inputCSS = ref('')
  const outputCSS = ref('')
  const beautify_loading = ref(false)
  const minify_loading = ref(false)

  const beautifyCSS = () => {
    try {
        beautify_loading.value = true;
        import('js-beautify').then(async (module) => {
            const beautify = module.css ;
            outputCSS.value = await beautify(inputCSS.value, {
                indent_size: 2,
                indent_char: ' ',
                //max_preserve_newlines: 0,
                preserve_newlines: true,
                wrap_line_length: 80,
                end_with_newline: false,
                selector_separator_newline: false,
                newline_between_rules: true,
                brace_style: 'collapse,preserve-inline',
            });
            ElMessage.success('美化完成');
        });
    } catch (error) {
      ElMessage.error('CSS 美化失败：' + error.message)
    }finally{
        beautify_loading.value = false;
    }
  }
  
  const minifyCSS = () => {
    try {
        minify_loading.value = true;
        import('csso').then(async (module) => {
            const minify = module.minify;
            const minified = await minify(inputCSS.value)
            outputCSS.value = minified.css;
            ElMessage.success('CSS压缩完成')
        })
    } catch (error) {
      ElMessage.error('CSS 压缩失败：' + error.message)
    }finally{
        minify_loading.value = false;
    }
  }
  
  const downloadCSS = () => {
    const blob = new Blob([outputCSS.value], { type: 'text/css' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'processed.css'
    link.click()
    URL.revokeObjectURL(link.href)
    ElMessage.success('下载已开始')
  }
  </script>
  
  <style scoped>
  .css-tool {
    max-width: 1920px;
    margin: 0 auto;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  </style>
  