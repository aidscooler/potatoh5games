<template>
    <el-container>
      <el-header>
        <h2>JavaScript 工具</h2>
      </el-header>
      <el-main>
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
              placeholder="输出结果"
              readonly
            />
          </el-col>
        </el-row>
        <el-row class="mt-4">
          <el-col :span="24">
            <el-button-group>
              <el-button type="primary" @click="processCode('beautify')" :loading="loading">
                <i-ep-magic-stick /> 美化
              </el-button>
              <el-button type="primary" @click="processCode('purify')" :loading="loading">
                <i-ep-delete /> 净化
              </el-button>
              <el-button type="primary" @click="processCode('encrypt')" :loading="loading">
                <i-ep-lock /> 加密
              </el-button>
              <el-button type="primary" @click="processCode('decrypt')" :loading="loading">
                <i-ep-unlock /> 解密
              </el-button>
              <el-button type="primary" @click="processCode('uglify')" :loading="loading">
                <i-ep-connection /> 混淆
              </el-button>
              <el-button type="success" @click="download" :disabled="!outputCode">
                <i-ep-download /> 下载
              </el-button>
            </el-button-group>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </template>
  
  <script lang="ts" setup>
  import { ElMessage } from 'element-plus'
  // import { processCode as processCodeUtil, Action } from '../../lib/jsUtils'
  //import { js as beautify } from 'js-beautify'

  type Action = 'beautify' | 'purify' | 'encrypt' | 'decrypt' | 'uglify'
  const inputCode = ref('')
  const outputCode = ref('')
  const loading = ref(false)
  
  const processCode = async (action: Action) => {
    if (!inputCode.value.trim()) {
      ElMessage.warning('请输入JavaScript代码')
      return
    }
    loading.value = true
    try {
      switch(action){
        case 'beautify':
          import('js-beautify').then(async (module) => {
            const beautify = module.js ;
            outputCode.value = await beautify(inputCode.value, { indent_size: 2 });
            ElMessage.success('美化完成');
            //return 'true';
          });
          break;
        case 'purify':
          import('terser').then(async (module) => {
            const minify = module.minify;
            //console.log(module);
            const result = await minify(inputCode.value, {
               mangle: false,
               compress: {
                   dead_code: true,
                   drop_debugger: true, 
                   global_defs: {},
                   hoist_vars: true,
                   if_return: true,
                   join_vars: true,
                   //cascade: true,
                   collapse_vars: true,
                   reduce_vars: true,
                   toplevel: true,
                   unused: true,
                   //warnings: false
               },
               output: {
                   comments: false,
                   beautify: false
               }
            });
            outputCode.value = result.code;
            ElMessage.success('净化完成');
          });
          break;
        case 'encrypt': 
        import('terser').then(async (module) => {
            const minify = module.minify;
            //console.log(module);
            const result = await minify(inputCode.value, {
            mangle: true,
            compress: {
                dead_code: true,
                drop_debugger: true,
                conditionals: true,
                evaluate: true,
                booleans: true,
                loops: true,
                unused: true,
                hoist_funs: true,
                keep_fargs: false,
                hoist_vars: true,
                if_return: true,
                join_vars: true,
                //cascade: true,
                side_effects: true,
                //warnings: false
            }
            });
            outputCode.value = result.code;
            ElMessage.success('净化完成');
          });
          break;
        case 'decrypt': break;
        case 'uglify':break;
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
  .el-button-group {
    margin-top: 20px;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  </style>
  