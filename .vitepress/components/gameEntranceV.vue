<script setup>
/**
 * 竖版游戏入口，中间60%为游戏区域，两边各20%为广告区域
 * 适合视频游戏，或者小窗口游戏
 */
import { ref } from 'vue'

defineProps({
    id: String,
    src: String,
    resetHeight: Boolean
})

const iframe = ref()

const resetHeight = () => {
    if(resetHeight) { //有些小游戏实现了自适应屏幕尺寸，就不用调整iframe高度。没有自适应的小游戏才需要设置iframe高度
        const documentHeight = iframe.value.contentDocument.documentElement.offsetHeight;
        iframe.value.style.height = documentHeight + "px";    
        iframe.value.parentElement.style.height = documentHeight + "px";
    }
    iframe.value.focus();
}

</script>
<template>
    <div class="iframecontainer">
        <div class="frameleft">
            <iframe src="/ads/displayVerticalLeft.html">
            </iframe>
        </div>

        <div class="framecenter">
            <iframe
                ref="iframe"
                :id=id 
                :src=src 
                @load="resetHeight">
            </iframe>
        </div>
        
        <div class="frameright">
            <iframe src="/ads/displayVertical.html">
            </iframe>
        </div>
    </div>

</template>
<style scoped>
.iframecontainer{
    width: 100%;
    height: calc(100vh - 64px);
}
.frameleft {
    float:left;
    width:20%;
    height:100%
}
.framecenter {
    float:left;
    width:60%;
    height:100%;    
}
.frameright {
    float:left;
    width:20%;
    height:100%
}
iframe {
    width:100%;
    height:100%;
    border:0;
}
</style>



