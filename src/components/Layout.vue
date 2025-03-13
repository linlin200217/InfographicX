<template>
    <div class="h-full w-full bg-[#EDE3E7] rounded-l-lg relative pt-6 p-1">
        <img src="../assets/Layout.png" alt="Layout" class="absolute top-1 left-1 w-4 h-4">
        
        <div class="flex">
            <div class="flex flex-col space-y-2 pl-4 relative">
                <div v-for="img in images" :key="img.name" 
                     :class="{'order-first': img.name === recommendation.Recommendation}">
                    <img :src="img.src" alt="" class="w-10.5 h-13">
                </div>
                <img v-if="recommendation.Recommendation" 
                     src="../assets/Yellowstar.png" 
                     alt="" 
                     class="absolute -top-2 left-11.5 w-5 h-5">
            </div>
            
            <div class="ml-6 w-64 h-88 border-dotted border-2 rounded-sm border-gray-400"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const recommendation = ref({
    Recommendation: 'Star'
})

const images = ref([
    { name: 'Star', src: new URL('../assets/Star.png', import.meta.url).href },
    { name: 'Grid', src: new URL('../assets/Grid.png', import.meta.url).href },
    { name: 'PortraitGrid', src: new URL('../assets/PortraitGrid.png', import.meta.url).href },
    { name: 'Portrait', src: new URL('../assets/Portrait.png', import.meta.url).href },
    { name: 'Landscape', src: new URL('../assets/Landscape.png', import.meta.url).href },
    { name: 'Spiral', src: new URL('../assets/Spiral.png', import.meta.url).href }
])
</script>

<style scoped>
.order-first {
    order: -1;
    margin-bottom: 0.5rem; /* 添加固定间距 */
}
</style>
