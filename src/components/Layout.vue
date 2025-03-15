<template>
    <div class="h-full w-full bg-[#EDE3E7] rounded-l-lg relative pt-6 p-1">
        <img src="../assets/Layout.png" alt="Layout" class="absolute top-1 left-1 w-4 h-4">
        
        <div class="flex">
            <div class="flex flex-col space-y-2 pl-4 relative">
                <!-- 根据推荐顺序排序图片，并确保Yellowstar显示在第一个图片上方 -->
                <div v-for="(img, index) in sortedImages" :key="img.name" 
                     :class="{'order-first': index === 0}">
                    <img :src="img.src" alt="" class="w-10.5 h-13">
                </div>
                <img v-if="sortedImages.length > 0" 
                     src="../assets/Yellowstar.png" 
                     alt="" 
                     class="absolute -top-2 left-11.5 w-5 h-5">
            </div>
            
            <div class="ml-6 w-64 h-88 border-dotted border-2 rounded-sm border-gray-400"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRankStore } from '../stores/rankStore';

// 使用rankStore
const rankStore = useRankStore();

// 图片数组
const images = ref([
    { name: 'Star', src: new URL('../assets/Star.png', import.meta.url).href },
    { name: 'Grid', src: new URL('../assets/Grid.png', import.meta.url).href },
    { name: 'PortraitGrid', src: new URL('../assets/PortraitGrid.png', import.meta.url).href },
    { name: 'Portrait', src: new URL('../assets/Portrait.png', import.meta.url).href },
    { name: 'Landscape', src: new URL('../assets/Landscape.png', import.meta.url).href },
    { name: 'Spiral', src: new URL('../assets/Spiral.png', import.meta.url).href }
]);

// 根据rankStore中的排名对图片进行排序
const sortedImages = computed(() => {
    // 如果rankStore中有排名数据，则使用它
    if (rankStore.rankedElements.length > 0) {
        return images.value.sort((a, b) => {
            return rankStore.rankedElements.indexOf(a.name) - rankStore.rankedElements.indexOf(b.name);
        });
    } else {
        // 默认排序（保留原有的推荐顺序作为后备）
        const defaultOrder = [ 'PortraitGrid', 'Star','Spiral', 'Grid', 'Portrait', 'Landscape'];
        return images.value.sort((a, b) => {
            return defaultOrder.indexOf(a.name) - defaultOrder.indexOf(b.name);
        });
    }
});

// 监听rankStore.rankedElements的变化
watch(() => rankStore.rankedElements, (newRankedElements) => {
    console.log('排名已更新:', newRankedElements);
}, { deep: true });
</script>

<style scoped>
.order-first {
    order: -1;
    margin-bottom: 0.5rem; /* 添加固定间距 */
}
</style>
