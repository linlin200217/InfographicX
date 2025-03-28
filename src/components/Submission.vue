<template>
    <div class="h-full w-full flex justify-center items-center">
        <button class="px-5 py-1 bg-[#9ABEAF] text-white rounded-lg" @click="handleSubmitLayout">
            SUBMIT
        </button>
    </div>
</template>

<script setup lang="ts">
import { useLayoutStore } from '../stores/layout';
import { submitLayout } from '../api/layout';
import { useUploadStore } from '../stores/uploadStore';

const layoutStore = useLayoutStore();
const uploadStore = useUploadStore();

const handleSubmitLayout = async () => {
    console.log('submitLayout');
    const response = await submitLayout(layoutStore.type, layoutStore.layoutData, uploadStore.uploadResult);
    console.log(response);
}








</script>

<style scoped></style>

