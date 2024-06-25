
<script setup>
import { ref, onMounted } from 'vue'
/** 
 * 横版游戏入口，上方区域为游戏区域，下方为广告区域
 * 适合横屏游戏
*/
defineProps({
    id: String,
    src: String,
    resetHeight: Boolean
})

const iframe = ref()
const iframeAds = ref()

const resetHeight = () => {
    if(resetHeight) { //有些小游戏实现了自适应屏幕尺寸，就不用调整iframe高度。没有自适应的小游戏才需要设置iframe高度
        const documentHeight = iframe.value.contentDocument.documentElement.offsetHeight;
        const documentHeightAds = iframeAds.value.contenDocument.documentElement.offsetHeight;
        iframe.value.style.height = documentHeight + "px";    
        iframe.value.parentElement.style.height = documentHeight + "px";

        iframeAds.value.style.height = documentHeightAds + "px";
        iframeAds.value.parentElement.style.height = documentHeightAds + "px";
    }
    iframe.value.focus();
}

</script>
<template>
    <div class="iframecontainer">

        <div class="frameup">
            <iframe
                ref="iframe"
                :id=id 
                :src=src 
                @load="resetHeight">
            </iframe>
        </div>
        
        <div class="framedown">
            <iframe 
                ref="iframeAds">
            </iframe>
        </div>
    </div>

</template>
<style scoped>
.iframecontainer{
    width: 100%;
    height: calc(100vh - 64px);
}
.frameup {
    float:left;
    width:100%;
    height:100%
}
.framedown {
    float:left;
    width:100%;
    height:100%;    
}

iframe {
    width:100%;
    height:100%;
    border:0;
}
</style>



