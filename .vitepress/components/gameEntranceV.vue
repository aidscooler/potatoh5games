<script setup>
/**
 * 竖版游戏入口，中间60%为游戏区域，两边各20%为广告区域
 * 适合视频游戏，或者小窗口游戏
 */
import { ref,onMounted } from 'vue'

defineProps({
    id: String,
    src: String,
    resetHeight: Boolean
})

const iframe = ref()

const resetHeight = () => {
    if(resetHeight.value) { //有些小游戏实现了自适应屏幕尺寸，就不用调整iframe高度。没有自适应的小游戏才需要设置iframe高度
        const documentHeight = iframe.value.contentDocument.documentElement.offsetHeight;
        iframe.value.style.height = documentHeight + "px";    
        iframe.value.parentElement.style.height = documentHeight + "px";
    }
    iframe.value.focus();
}
//判断是否是手机端，手机端不显示两边的广告位
const isMobile = ref(false);
const userAgent = ref(null);
const framecenterwidth = ref("60%");

onMounted(() => {
    userAgent.value = navigator.userAgent;
    isMobile.value  = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(userAgent.value);
    //console.log("userAgent: " + userAgent);
    //console.log("isMobile.value: " + isMobile.value);
    if (isMobile.value) {
        framecenterwidth.value = "100%";
    }
})

//console.log("framecenterwidth : " + framecenterwidth.value);
</script>
<template>
    <div class="iframecontainer">
        <div v-if="!isMobile" class="frameleft">
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
        
        <div v-if="!isMobile" class="frameright">
            <iframe src="/ads/displayVertical.html">
            </iframe>
        </div>
    </div>

</template>
<style scoped>
.iframecontainer{
    width: 100%;
    height: calc(100vh - 64px);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}
.frameleft {
    float:left;
    width:20%;
    height:inherit !important; 
}
.framecenter {
    float:left;
    width:v-bind(framecenterwidth);
    height:inherit !important;   
}
.frameright {
    float:left;
    width:20%;
    height:inherit !important; 
}
iframe {
    width:100%;
    height:inherit !important;
    border:0;
}
</style>



