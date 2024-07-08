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
if (params.value.game === 'xxx'){
    //这里可根据游戏名称来定制化 是否需要设定firame高度
}
id.value = "h5" + params.value.game;
gameurl.value = "/classic/emulatorJS-4.0.12/games/index.html?language=en-US&name=" + params.value.game;
</script>

<GameEntranceV :id="id" :src="gameurl" :resetHeight="resetHeight"></GameEntranceV>