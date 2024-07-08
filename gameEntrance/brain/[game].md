---
layout: page
footer: false
---
<!-- - package name: {{ $params.name }} -->
<!-- - version: {{ $params.language }} -->
<script setup>
import { useData } from 'vitepress'
import { ref } from 'vue'

// params 是一个 Vue ref
const { params } = useData()
//console.log(params.value);
//console.log(params.value.name);

const id = ref("");
const gameurl = ref("");
const resetHeight = ref(false);

id.value = params.value.game;

if (params.value.game === 'wordle'){
    gameurl.value = "/brain/" + params.value.game + '-zh-CN/index.html';  
}else {
    gameurl.value = "/brain/" + params.value.game + '/index.html';    
}

if (params.value.game === '2048') {
    resetHeight.value = true;
}else {
    resetHeight.value = false;
}

</script>

<GameEntranceV :id="id" :src="gameurl" :resetHeight="resetHeight"></GameEntranceV>