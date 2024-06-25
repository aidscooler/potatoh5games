
<script setup>
import { ref, onBeforeUnmount } from 'vue'

defineProps({
    id: String,
    src: String
})
 
const iframe = ref()
const setIframeHeight = () => {
    setTimeout(() => {
        iframe.value.height =
            iframe.value?.contentWindow?.document?.documentElement?.offsetHeight || 0
    }, 150)
}
window.addEventListener('resize', setIframeHeight)
onBeforeUnmount(() => window.removeEventListener('resize', setIframeHeight))
</script>
<template>
    <div class="iframecontainer">
        <div style="float:left;width:25%;height:100%">
            <iframe 
                style="width:100%;height:100%;border:0;">
            </iframe>
        </div>

        <div style="float:left;width:50%;height:100%;">
            <iframe
                ref="ifram"
                :id=id 
                :src=src 
                style="width:100%;height:0;border:0;"
                @load="setIframeHeight">
            </iframe>
        </div>
        
        <div style="float:left;width:25%;height:100%">
            <iframe 
                style="width:100%;height:100%;border:0;">
            </iframe>
        </div>
    </div>

</template>
<style>
.iframecontainer{
    width: 100%;
}
</style>



