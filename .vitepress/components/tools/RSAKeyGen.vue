<template>
    <el-card class="rsa-generator">
      <template #header>
        <div class="card-header">
          <span>RSA 密钥生成器</span>
        </div>
      </template>
      <el-form>
        <el-form-item label="密钥长度 (bits):">
          <el-input-number
            v-model="bits"
            :min="512"
            :max="16384"
            :step="8"
            @change="generateKeys"
          />
          <el-button 
            @click="refreshKeys" 
            type="primary" 
            style="margin-left: 10px"
            :loading="isGenerating"
            :disabled="isGenerating || !isValidBits"
            >
            <el-icon><i-ep-refresh /></el-icon> 刷新密钥对
          </el-button>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="24" :md="12">
            <el-form-item label="公钥">
              <el-input
                v-model="publicKey"
                type="textarea"
                :rows="10"
                readonly
              />
              <el-button 
                @click="copyToClipboard(publicKey)" 
                type="primary" 
                plain 
                style="margin-top: 10px"
                :disabled="!publicKey">
                <el-icon><i-ep-document-copy /></el-icon> 复制公钥
              </el-button>
            </el-form-item>
          </el-col>
          <el-col :span="24" :md="12">
            <el-form-item label="私钥">
              <el-input
                v-model="privateKey"
                type="textarea"
                :rows="10"
                readonly
              />
              <el-button 
                @click="copyToClipboard(privateKey)" 
                type="primary" 
                plain 
                style="margin-top: 10px"
                :disabled="!privateKey">
                <el-icon><i-ep-document-copy /></el-icon> 复制私钥
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </template>
  
  <script setup>

  const bits = ref(2048)
  const publicKey = ref('')
  const privateKey = ref('')
  const isGenerating = ref(false)

  const isValidBits = computed(() => {
    return bits.value >= 512 && bits.value <= 16384 && bits.value % 8 === 0
  })

  const generateKeys = async () => {
    if (!isValidBits.value) {
        publicKey.value = ''
        privateKey.value = ''        
        ElMessage.warning('请输入512到16384之间的8的倍数')
        return
    }    
    isGenerating.value = true
        try {
            const { pki } = await import('node-forge');
            const workerScript = await import('node-forge/dist/prime.worker.min?url');
            const keypair = await new Promise((resolve, reject) => {
                pki.rsa.generateKeyPair({ bits: bits.value, workers: workerScript }, (err, keypair) => {
                    if (err) reject(err);
                    else resolve(keypair);
                });
            });
            
            publicKey.value = pki.publicKeyToPem(keypair.publicKey);
            privateKey.value = pki.privateKeyToPem(keypair.privateKey);
        } catch (err) {
            console.error( err.message);
            ElMessage.error('生成密钥对时发生错误');
        } finally {
            isGenerating.value = false
        }
    }
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('已复制到剪贴板')
    }, () => {
      ElMessage.error('复制失败')
    })
  }
  
  const refreshKeys = async () => {
    await generateKeys();
    ElMessage.success('密钥对已刷新');
}

onMounted(async () => {
  await generateKeys();
});
  </script>
  
  <style scoped>
  .rsa-generator {
    max-width: 1920px;
    margin: 0 auto;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  </style>
  