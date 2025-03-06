<template>
    <div class="h-full w-full bg-[#EDE3E7] rounded-l-lg relative pt-5 p-4">
        <img src="../assets/Color.png" alt="Color" class="absolute top-1 left-1 w-4 h-4">
        
        <div class="flex gap-4">
            <!-- Theme colors -->
            <div class="bg-white rounded-lg p-2 flex-1">
                <div class="flex gap-1">
                    <div
                        v-for="(color, index) in themeColors"
                        :key="index"
                        class="w-8 h-8 rounded-full"
                        :style="{ backgroundColor: `rgb(${color.join(',')})` }"
                    ></div>
                    <div class="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
                        <span class="text-gray-400 text-lg">+</span>
                    </div>
                </div>
            </div>

            <ColorPicker format="rgb" shape="square" />
            <!-- Background color -->
            <div class="bg-white rounded-lg p-2 flex-1">
                <div
                    class="w-8 h-8 rounded-full mx-auto"
                    :style="{ backgroundColor: `rgb(${backgroundColor.join(',')})` }"
                ></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Mock data
const themeColors = [[0, 51, 102], [153, 0, 0], [255, 204, 0], [102, 153, 153], [204, 102, 0], [204, 102, 0]]
const backgroundColor = [240, 240, 240]

</script>

<style scoped></style>




