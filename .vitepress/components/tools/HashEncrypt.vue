<template>
    <el-card class="hash-tool">
      <template #header>
        <div class="card-header">
          <span>Hash 加密工具：实现MD5, SHA1, SHA256, SHA224, SHA512, SHA384, SHA3, RIPEMD160算法进行加密</span>
        </div>
      </template>
      <el-form :model="form" label-position="top">
        <el-form-item label="输入要加密的文本:">
          <el-input
            v-model="form.inputText"
            type="textarea"
            :rows="4"
            placeholder="填写你要加密的字符串"
            @input="generateHash"
          ></el-input>
        </el-form-item>
        <el-form-item label="摘要编码格式:">
          <el-select v-model="form.encoding" @change="generateHash">
            <el-option label="Binary (base 2)" value="binary"></el-option>
            <el-option label="Hexadecimal (base 16)" value="hex"></el-option>
            <el-option label="Base64 (base 64)" value="base64"></el-option>
            <el-option label="Base64url (base 64 with url safe chars)" value="base64url"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-divider></el-divider>
      <div v-for="(hash, algorithm) in hashes" :key="algorithm" class="hash-result">
        <el-row :gutter="20" align="middle">
          <el-col :span="4">
            <strong>{{ algorithm }}</strong>
          </el-col>
          <el-col :span="18">
            <el-input
              :value="hash"
              readonly
              :autosize="{ minRows: 1, maxRows: 3 }"
            ></el-input>
          </el-col>
          <el-col :span="2">
            <el-button
              type="primary"
              
              @click="copyToClipboard(hash)"
            ><i-ep-document-copy/></el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </template>
  
  <script setup>
  
  const form = reactive({
    inputText: '',
    encoding: 'base64'
  })
  
  const hashes = ref({
    MD5: '',
    SHA1: '',
    SHA256: '',
    SHA224: '',
    SHA512: '',
    SHA384: '',
    SHA3: '',
    RIPEMD160: ''
  })
  
  const generateHash = async () => {
    const CryptoJS = await import('crypto-js');
    //if (!form.inputText) return
  
    const algorithms = {
      MD5: CryptoJS.MD5,
      SHA1: CryptoJS.SHA1,
      SHA256: CryptoJS.SHA256,
      SHA224: CryptoJS.SHA224,
      SHA512: CryptoJS.SHA512,
      SHA384: CryptoJS.SHA384,
      SHA3: CryptoJS.SHA3,
      RIPEMD160: CryptoJS.RIPEMD160
    }
  
    for (const [name, algorithm] of Object.entries(algorithms)) {
      const hash = algorithm(form.inputText)
      if ( form.encoding === 'binary') {
        hashes.value[name] = convertHexToBin(hash.toString(CryptoJS.enc[capitalizeFirstLetter(form.encoding)]))
      }else {
        hashes.value[name] = hash.toString(CryptoJS.enc[capitalizeFirstLetter(form.encoding)])
      }
    }
  }
  
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const convertHexToBin = function(hexString) {
    return hexString
      .trim()
      .split('')
      .map(byte => Number.parseInt(byte, 16).toString(2).padStart(4, '0'))
      .join('');
  }
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage({
        message: '已复制到剪贴板',
        type: 'success',
      })
    }).catch(err => {
      console.error('无法复制文本: ', err)
      ElMessage({
        message: '复制失败',
        type: 'error',
      })
    })
  }
  
  onMounted(() => {
    generateHash()
  })
  </script>
  
  <style scoped>
  .hash-tool {
    max-width: 1920px;
    margin: 0 auto;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .hash-result {
    margin-bottom: 15px;
  }
  </style>
  