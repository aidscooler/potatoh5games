<template>
    <el-card class="token-generator">
      <template #header>
        <div class="card-header">
          <span>Token 生成器</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="包含字符:">
          <el-checkbox-group v-model="form.characterTypes" @change="generateToken">
            <el-checkbox value="uppercase">大写字母 (ABC...)</el-checkbox>
            <el-checkbox value="lowercase">小写字母 (abc...)</el-checkbox>
            <el-checkbox value="numbers">数字 (123...)</el-checkbox>
            <el-checkbox value="symbols">符号 (!-;...)</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="Token 长度:">
          <el-slider
            v-model="form.length"
            :min="1"
            :max="512"
            :step="1"
            show-input
            @change="generateToken"
          ></el-slider>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="generatedToken"
            type="textarea"
            :rows="4"
            placeholder="生成的 Token 将显示在这里"
            readonly
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="copyToken">
            <i-ep-document-copy />
            复制 Token
          </el-button>
          <el-button type="info" @click="generateToken">
            <i-ep-refresh />
            刷新 Token
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
</template>
  
  <script setup>
  
  const form = reactive({
    characterTypes: ['uppercase', 'lowercase', 'numbers'],
    length: 64
  })
  
  const generatedToken = ref('')
  
  const generateToken = () => {
    const characters = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }
  
    let availableChars = ''
    form.characterTypes.forEach(type => {
      availableChars += characters[type]
    })
  
    if (availableChars.length === 0) {
      ElMessage.warning('请至少选择一种字符类型')
      generatedToken.value = ""
      return
    }
  
    let result = ''
    for (let i = 0; i < form.length; i++) {
      result += availableChars.charAt(Math.floor(Math.random() * availableChars.length))
    }
  
    generatedToken.value = result
  }
  
  const copyToken = () => {
    navigator.clipboard.writeText(generatedToken.value).then(() => {
      ElMessage.success('Token 已复制到剪贴板')
    }, () => {
      ElMessage.error('复制失败，请手动复制')
    })
  }
  
  onMounted(() => {
    generateToken()
  })
  </script>
  
  <style scoped>
  .token-generator {
    max-width: 1920px;
    margin: 0 auto;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  </style>
  