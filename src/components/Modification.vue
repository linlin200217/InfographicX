<template>
    <div class="h-full w-full bg-[#FFFFFF] rounded-lg drop-shadow-lg p-1">
        <div class="flex items-center gap-4">
            <button class="p-2 bg-white hover:bg-pink-100 rounded">
                <img src="../assets/Select.png" alt="Select" class="w-8 h-8">
            </button>
            <button class="p-2 bg-white hover:bg-pink-100 rounded">
                <img src="../assets/Shape.png" alt="Shape" class="w-8 h-8">
            </button>
            <button class="p-2 bg-white hover:bg-pink-100 rounded">
                <img src="../assets/Text.png" alt="Text" class="w-8 h-8">
            </button>
            <button class="p-2 bg-white hover:bg-pink-100 rounded">
                <img src="../assets/Color.png" alt="Color" class="w-8 h-8">
            </button>
            <div class="h-8 w-px bg-gray-300"></div>
            <button class="p-2 bg-white hover:bg-pink-100 rounded">
                <img src="../assets/Font Size.png" alt="Font Size" class="w-8 h-8">
            </button>
            <select class="p-0.5 border rounded">
                <option>Font</option>
            </select>
            <select class="p-0.5 border rounded">
                <option>Size</option>
            </select>
        </div>
    </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.hover\:bg-pink-100:hover {
    background-color: #fce4ec;
}
</style>