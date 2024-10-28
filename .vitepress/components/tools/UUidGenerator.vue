<template>
  <el-card class="uuid-generator">
    <template #header>
          <div class="card-header">
             <span>UUid生成器</span>
          </div>
    </template>
    <el-form :model="form" label-width="120px">
      <el-form-item label="UUID 版本">
        <el-radio-group v-model="form.version" @change="generateUUID">
          <el-radio-button v-for="v in versions" :key="v" :value="v">
            v{{ v }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="生成数量">
        <el-input-number v-model="form.count" :min="1" :max="100" @change="generateUUID" />
      </el-form-item>

      <template v-if="form.version === 3 || form.version === 5">
        <el-form-item label="命名空间">
          <el-radio-group v-model="form.namespace" @change="generateUUID">
            <el-radio-button v-for="ns in namespaces" :key="ns" :value="ns">
              {{ ns }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="命名空间 UUID">
          <el-input :value="namespaceUUID" readonly />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" @input="generateUUID" />
        </el-form-item>
      </template>

      <el-form-item>
        <el-button type="primary" @click="generateUUID">刷新</el-button>
        <el-button @click="copyUUIDs">复制 UUID</el-button>
      </el-form-item>
    </el-form>

    <div class="uuid-list">
      <p v-for="(uuid, index) in generatedUUIDs" :key="index">{{ uuid }}</p>
    </div>

    <el-divider></el-divider>

    <div class="uuid-info" v-if="versionInfo">
      <h3>UUID v{{ form.version }} 信息</h3>
      <p class="description">{{ versionInfo.description }}</p>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>优点</span>
              </div>
            </template>
            <div v-for="(pro, index) in versionInfo.pros" :key="index" class="text item">
              {{ pro }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>缺点</span>
              </div>
            </template>
            <div v-for="(con, index) in versionInfo.cons" :key="index" class="text item">
              {{ con }}
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script setup>
import { v1, v3, v4, v5 } from 'uuid';

const versions = [1, 3, 4, 5];
const namespaces = ['URL', 'DNS', 'OID', 'X500'];

const form = reactive({
  version: 4,
  count: 5,
  namespace: 'URL',
  name: '',
});

const generatedUUIDs = ref([]);

const namespaceUUIDs = {
  URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
};

const namespaceUUID = computed(() => namespaceUUIDs[form.namespace]);

const versionInfo = computed(() => {
  const info = {
    1: {
      description: 'UUID v1 是基于时间的 UUID。它使用当前时间戳、计算机的 MAC 地址（或随机数）来生成唯一标识符。',
      pros: [
        '保证时间和节点的唯一性',
        '可以按时间排序',
        '生成速度快',
        '在分布式系统中易于生成',
      ],
      cons: [
        '可能泄露生成时间和节点信息，存在隐私风险',
        '在高并发情况下可能重复',
        '依赖系统时钟，时钟回拨可能导致重复',
      ],
    },
    3: {
      description: 'UUID v3 是基于名字的 UUID，使用 MD5 哈希算法。它结合命名空间 UUID 和名字来生成确定性的 UUID。',
      pros: [
        '对于相同输入总是产生相同输出，具有确定性',
        '不需要存储状态',
        '可以用于创建持久的、可重现的标识符',
      ],
      cons: [
        'MD5 算法存在碰撞风险，安全性较低',
        '输入相近时输出可能相似',
        '不适用于需要不可预测性的场景',
      ],
    },
    4: {
      description: 'UUID v4 是完全随机生成的 UUID。它使用加密安全的随机数生成器来创建 UUID。',
      pros: [
        '简单易用',
        '不泄露任何信息，隐私性好',
        '适用于大多数场景',
        '分布式系统中不需要协调即可生成',
      ],
      cons: [
        '理论上存在重复的可能性，尽管概率极低',
        '不可预测，不适用于需要确定性的场景',
        '无法排序或推断生成时间',
      ],
    },
    5: {
      description: 'UUID v5 是基于名字的 UUID，使用 SHA-1 哈希算法。类似于 v3，但使用更安全的哈希算法。',
      pros: [
        '对于相同输入总是产生相同输出，具有确定性',
        '比 v3 更安全，使用 SHA-1 算法',
        '可以用于创建持久的、可重现的标识符',
      ],
      cons: [
        '计算速度比 v3 稍慢',
        '输入相近时输出可能相似',
        '不适用于需要不可预测性的场景',
      ],
    },
  };
  return info[form.version];
});

function generateUUID() {
  generatedUUIDs.value = [];
  for (let i = 0; i < form.count; i++) {
    let uuid;
    switch (form.version) {
      case 1:
        uuid = v1();
        break;
      case 3:
        uuid = v3(form.name, namespaceUUIDs[form.namespace]);
        break;
      case 4:
        uuid = v4();
        break;
      case 5:
        uuid = v5(form.name, namespaceUUIDs[form.namespace]);
        break;
    }
    generatedUUIDs.value.push(uuid);
  }
}

function copyUUIDs() {
  const text = generatedUUIDs.value.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    alert('UUID已复制到剪贴板');
  });
}

// 初始生成
generateUUID();
</script>
<style scoped>
.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
.uuid-generator {
  max-width: 800px;
  margin: 0 auto;
}

.uuid-list {
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
}

.uuid-info {
  margin-top: 20px;
}

.description {
  font-size: 16px;
  color: #606266;
  margin-bottom: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 10px;
}

</style>
