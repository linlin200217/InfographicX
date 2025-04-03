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
import { ElMessage } from 'element-plus';

const emit = defineEmits(['submitSuccess']);
const layoutStore = useLayoutStore();
const uploadStore = useUploadStore();

const handleSubmitLayout = async () => {
    console.log('submitLayout');
    
    // Add validation for Star layout
    if (layoutStore.type === 'Star' && !layoutStore.layoutData?.VisualizationIcon) {
        ElMessage.error('该布局需要提供可视化图表参数');
        return;
    }

    const response = await submitLayout(layoutStore.type, layoutStore.layoutData, uploadStore.uploadResult);
    console.log(response);
    if (response === 'ok') {
        ElMessage.success('提交成功');
        emit('submitSuccess');

    } else {
        ElMessage.error('提交失败');
    }
}








</script>

<style scoped></style>

