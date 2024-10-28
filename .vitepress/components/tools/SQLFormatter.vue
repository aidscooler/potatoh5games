<template>
  <el-card class="sql-formatter">
    <template #header>
      <div class="card-header">
        <span>SQL 美化和格式化工具</span>
      </div>
    </template>

    <el-form :model="config" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="SQL方言">
            <el-select v-model="config.language" placeholder="选择 SQL 方言">
              <el-option v-for="option in dialectOptions" :key="option.value" :label="option.label" :value="option.value"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="关键字大小写">
            <el-select v-model="config.keywordCase" placeholder="选择关键字大小写">
              <el-option v-for="option in keywordCaseOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="缩进样式">
            <el-select v-model="config.indentStyle" placeholder="选择缩进样式">
              <el-option v-for="option in indentStyleOptions" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row class="sql-input-output" :gutter="20">
        <el-col :xs="24" :sm="24" :md="12">
          <el-form-item label="输入SQL语句">
            <el-input
              v-model="rawSQL"
              type="textarea"
              :rows="10"
              placeholder="Put your SQL query here..."
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12">
          <el-form-item label="处理结果">
            <div class="prettify-container">
              <el-input
                v-model="prettySQL"
                type="textarea"
                :rows="10"
                readonly
              />
              <el-button type="primary" @click="copyToClipboard" class="copy-button">
                复制
              </el-button>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { type FormatOptionsWithLanguage, format as formatSQL } from 'sql-formatter';

const config = reactive<FormatOptionsWithLanguage>({
  keywordCase: 'upper',
  useTabs: false,
  language: 'sql',
  indentStyle: 'standard',
  //tabulateAlias: true,  tabulateAlias config is no more supported.
});

const rawSQL = ref('select field1,field2,field3 from my_table where my_condition;');
const prettySQL = computed(() => formatSQL(rawSQL.value, config));

const dialectOptions = [
  { label: 'GCP BigQuery', value: 'bigquery' },
  { label: 'IBM DB2', value: 'db2' },
  { label: 'Apache Hive', value: 'hive' },
  { label: 'MariaDB', value: 'mariadb' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'Couchbase N1QL', value: 'n1ql' },
  { label: 'Oracle PL/SQL', value: 'plsql' },
  { label: 'PostgreSQL', value: 'postgresql' },
  { label: 'Amazon Redshift', value: 'redshift' },
  { label: 'Spark', value: 'spark' },
  { label: 'Standard SQL', value: 'sql' },
  { label: 'sqlite', value: 'sqlite' },
  { label: 'SQL Server Transact-SQL', value: 'tsql' },
];

const keywordCaseOptions = [
  { label: 'UPPERCASE', value: 'upper' },
  { label: 'lowercase', value: 'lower' },
  { label: 'Preserve', value: 'preserve' },
];

const indentStyleOptions = [
  { label: 'Standard', value: 'standard' },
  { label: 'Tabular left', value: 'tabularLeft' },
  { label: 'Tabular right', value: 'tabularRight' },
];

const copyToClipboard = () => {
  navigator.clipboard.writeText(prettySQL.value).then(() => {
    ElMessage({
      message: '复制成功！',
      type: 'success',
    });
  }).catch(() => {
    ElMessage({
      message: '复制失败，请手动复制。',
      type: 'error',
    });
  });
};
</script>

<style scoped>
.sql-formatter {
max-width: 1200px;
margin: 0 auto;
}
.card-header {
display: flex;
justify-content: space-between;
align-items: center;
}
.prettify-container {
  width:100%;
position: relative;
}
.copy-button {
position: absolute;
top: 10px;
right: 10px;
}
.sql-input-output {
display: flex;
flex-wrap: wrap;
}
.sql-input-output .el-col {
display: flex;
flex-direction: column;
}
.sql-input-output .el-form-item {
flex-grow: 1;
display: flex;
flex-direction: column;
}
.sql-input-output .el-form-item__content {
flex-grow: 1;
display: flex;
flex-direction: column;
}
.sql-input-output .el-input {
flex-grow: 1;
}
.sql-input-output .el-input__inner {
height: 100%;
}
</style>
