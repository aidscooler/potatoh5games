<template>
    <el-card class="json-tool">
      <template #header>
        <div class="card-header">
          <span>JSON 工具</span>
        </div>
      </template>
      <el-form>
        <el-row :gutter="20">
          <el-col :span="24" :md="12">
            <el-form-item >
              <el-input
                v-model="inputJson"
                type="textarea"
                :rows="15"
                placeholder="请输入 JSON 字符串"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24" :md="12">
            <el-form-item>
              <el-input
                v-model="outputJson"
                type="textarea"
                :rows="15"
                placeholder="处理结果将会显示在这"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-checkbox v-model="sortKeys">排序 Keys</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="beautify" :disabled="!inputJson" :loading="loading">
                <i-ep-magic-stick />美化
            </el-button>
            <el-button type="success" @click="compress" :disabled="!inputJson" :loading="loading">
                <i-ep-delete />压缩
            </el-button>
            <el-button type="warning" @click="escape" :disabled="!inputJson" :loading="loading">
                <i-ep-right />转义
            </el-button>
            <el-button type="info" @click="unescape" :disabled="!inputJson" :loading="loading">
                <i-ep-back />去转义
            </el-button>
            <el-button type="danger" @click="validate" :disabled="!inputJson" :loading="loading">
                <i-ep-check />校验
            </el-button>
            <el-button @click="download" :disabled="!outputJson" :loading="loading">
                <i-ep-download />下载
            </el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
    </el-card>
  </template>
  
  <script setup>
  
  const inputJson = ref('')
  const outputJson = ref('')
  const sortKeys = ref(false)
  const loading = ref(false)

  const processJson = (processor) => {
    loading.value = true
    try {
        let result = processor(inputJson.value)
        outputJson.value = result
        ElMessage.success('处理成功')
    } catch (error) {
        ElMessage.error('处理失败：' + error.message)
        outputJson.value = ''
    } finally {
        loading.value = false
    }
}
  
  const sortObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj
    if (Array.isArray(obj)) return obj.map(sortObject)
    return Object.keys(obj).sort().reduce((result, key) => {
      result[key] = sortObject(obj[key])
      return result
    }, {})
  }
  
  const beautify = () => {
  processJson((input) => {
    const parsed = JSON.parse(input)
    return JSON.stringify(sortKeys.value ? sortObject(parsed) : parsed, null, 2)
  })
}

const compress = () => {
  processJson((input) => {
    const parsed = JSON.parse(input)
    return JSON.stringify(sortKeys.value ? sortObject(parsed) : parsed)
  })
}

const escape = () => {
  processJson((input) => {
    let result = '';
    let inString = false;
    
    for (let i = 0; i < input.length; i++) {
      if (input[i] === '"' && (i === 0 || input[i-1] !== '\\')) {
        inString = !inString;
        result += '\\"';
      } else if (inString && input[i] === '\\' && input[i+1] === '"') {
        result += '\\\\\"';
        i++; // Skip the next character as we've already handled it
      } else {
        result += input[i];
      }
    }
    
    return result;
  });
}

const unescape = () => {
  processJson((input) => {
    let result = '';
    
    for (let i = 0; i < input.length; i++) {
      if (input[i] === '\\' && input[i+1] === '"') {
        result += '"';
        i++; // Skip the next character as we've already handled it
      } else {
        result += input[i];
      }
    }
    
    return result;
  });
}


const validate = () => {
  loading.value = true
  try {
    JSON.parse(inputJson.value)
    outputJson.value = '有效的 JSON 数据'
    ElMessage.success('JSON 校验通过')
  } catch (error) {
    outputJson.value = '无效的 JSON 数据'
    ElMessage.error('JSON 校验失败：' + error.message)
  } finally {
    loading.value = false
  }
}
  
  const download = () => {
    if (!outputJson.value) {
      ElMessage.warning('没有可下载的内容')
      return
    }
    const blob = new Blob([outputJson.value], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'processed.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    ElMessage.success('下载已开始')
  }
  </script>
  
  <style scoped>
  .json-tool {
    max-width: 1920px;
    margin: 0 auto;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .el-form-item {
    margin-bottom: 20px;
  }
  </style>
  