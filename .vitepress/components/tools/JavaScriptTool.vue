<template>
  <div class="js-tool">
    <el-card>
      <template #header>
          <div class="card-header">
             <span>采用js-beautify实现美化(缩进为2个空格),terser实现压缩(去掉多余的空格、换行、注释),javascript-obfuscator实现混淆</span>
          </div>
      </template>
      <el-main style="padding-top: 0px">
        <el-alert
          title=""
          type="info"
          :closable="false"
          class="mb-4 usage-tip"
        >
          <p>请输入完整可执行的JavaScript代码。当JS代码是可执行的才会进行相关操作</p>
          <div class="examples">
            <div class="example">
              <strong>正确示例：</strong>
              <code>function add(a, b) { return a + b; }</code>
            </div>
            <div class="example">
              <strong>错误示例：</strong>
              <code>function (a, b) { return a + b;}</code>
            </div>
          </div>
        </el-alert>
        
        <el-row :gutter="20">
          <el-col :span="24" :md="12">
            <el-input
              v-model="inputCode"
              type="textarea"
              :rows="15"
              placeholder="请输入 JavaScript 代码"
            />
          </el-col>
          <el-col :span="24" :md="12">
            <el-input
              v-model="outputCode"
              type="textarea"
              :rows="15"
              placeholder="处理结果将会显示在这"
            />
          </el-col>
        </el-row>
        <el-row class="mt-4">
          <el-col :span="24">
            <el-button-group style="margin-top: 0px">
              <el-button type="primary" @click="processCode('beautify')" :disabled="!inputCode" :loading="loading">
                <i-ep-magic-stick /> 美化
              </el-button>
              <el-button type="primary" @click="processCode('purify')" :disabled="!inputCode" :loading="loading">
                <i-ep-delete /> 压缩
              </el-button>
              <el-button type="primary" @click="processCode('uglify')" :disabled="!inputCode" :loading="loading">
                <i-ep-lock /> 混淆
              </el-button>
              <el-button type="success" @click="download" :disabled="!outputCode">
                <i-ep-download /> 下载
              </el-button>
            </el-button-group>
          </el-col>
        </el-row>
      </el-main>
    </el-card>
  </div>
</template>
  
  <script lang="ts" setup>

  type Action = 'beautify' | 'purify' | 'uglify'
  const inputCode = ref('')
  const outputCode = ref('')
  const loading = ref(false)
  
  const isValidJavaScript = (code: string): boolean => {
    try {
      new Function(code)
      return true
    } catch (e) {
      return false
    }
  }
  const processCode = async (action: Action) => {
    if (!inputCode.value.trim()) {
      ElMessage.warning('请输入JavaScript代码')
      return
    }
    if (!isValidJavaScript(inputCode.value)) {
    ElMessage.error('请输入有效的JavaScript代码')
    return
    }    
    loading.value = true
    try {
      switch(action){
        case 'beautify':
          import('js-beautify').then(async (module) => {
            const beautify = module.js ;
            outputCode.value = await beautify(inputCode.value, { 
              indent_size: 2 });
            ElMessage.success('美化完成');
          });
          break;
        case 'purify':
          import('terser').then(async (module) => {
            const minify = module.minify;
            const result = await minify(inputCode.value, {
              mangle: false,
              compress: false,
              output: {
                comments: false,
                beautify: false,
                semicolons: true
              }
            });
            //console.log('result.code:' + result.code);
            outputCode.value = result.code;
            ElMessage.success('压缩完成');
          });
          break;
        case 'uglify': 
          const JavaScriptObfuscator = await import('javascript-obfuscator')
          const obfuscator = JavaScriptObfuscator.default
          const result = obfuscator.obfuscate(inputCode.value, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            debugProtection: false,
            debugProtectionInterval: 0,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: true,
            renameGlobals: false,
            rotateStringArray: true,
            selfDefending: true,
            shuffleStringArray: true,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 10,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.75,
            transformObjectKeys: true,
            unicodeEscapeSequence: false
          })
            outputCode.value = result.getObfuscatedCode();
            ElMessage.success('混淆完成');
          break;
      }
    } catch (error) {
      console.error('处理错误:', error)
      ElMessage.error('操作失败：' + (error as Error).message)
    } finally {
      loading.value = false
    }
  }
  
  const download = () => {
    if (!outputCode.value) {
      ElMessage.warning('没有可下载的内容')
      return
    }
    const blob = new Blob([outputCode.value], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'processed_code.js'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('下载已开始')
  }
  </script>
  
  <style scoped>
  .js-tool {
    max-width: 1920px;
    margin: 0 auto;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .el-button-group {
    margin-top: 20px;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .usage-tip {
    padding: 10px;
    font-size: 14px;
  }
  .usage-tip .el-alert__title {
    font-size: 16px;
    margin-bottom: 5px;
  }
  .usage-tip p {
    margin: 0 0 5px 0;
  }
  .examples {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
  }
  .examples > div {
    flex: true;
  }
  code {
    background-color: #f5f5f5;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    white-space: nowrap;
  }
  </style>
  