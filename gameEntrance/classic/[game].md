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
if (params.value.game === 'redalert2') {
    gameurl.value = "https://www.ra2web.com/";
}else if (params.value.game === 'h5battlecity') {
    gameurl.value = "/classic/h5battlecity/index.html"
}else if (params.value.game === 'h5mario') {
    gameurl.value = '/classic/h5mario/index.html'
}else {
    gameurl.value = "/classic/games/index.html?language=zh-CN&name=" + params.value.game;
}
</script>

<GameEntranceV :id="id" :src="gameurl" :resetHeight="resetHeight"></GameEntranceV>