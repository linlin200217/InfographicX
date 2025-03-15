<template>
  <div class="h-full w-full bg-[#A7535A] rounded-b-lg">
      <div class="w-full px-8 pt-1 flex flex-row flex-nowrap items-center">
          <input type="file" ref="fileInput" class="hidden" accept=".pdf" @change="handleFileUpload" />
          <img
            src="/src/assets/Upload.png"
            :class="['h-7 w-7 cursor-pointer transition-transform duration-200', { 'scale-110': isIconEnlarged }]"
            @click="triggerFileInput"
            @mousedown="isIconEnlarged = true"
            @mouseup="isIconEnlarged = false"
            @mouseleave="isIconEnlarged = false"
          />
          <div class="h-7 w-7 border-2 border-dashed border-[#E2E1E4] ml-2 rounded-[20%] flex items-center justify-center">
              <img v-if="uploadStore.showFileIcon" src="/src/assets/File.png" class="h-5 w-5" />
          </div>
          <div class="relative w-[1100px] ml-[100px]">
            <input
              type="text"
              v-model="uploadStore.question"
              placeholder="Type your question"
              class="h-[25px] w-full rounded-full bg-white pl-4 pr-8 placeholder:text-gray-300 text-[#333333] text-sm focus:outline-none"
            />
            <button
              class="absolute right-2 top-1/2 -translate-y-1/2 text-[#333333] hover:text-gray-500 transition-colors text-sm"
              @click="uploadStore.setQuestion('')"
            >
              ×
            </button>
          </div>
          <button
            class="h-[25px] px-4 ml-[100px] bg-[#9ABEAF] text-white rounded-lg transition-transform duration-200"
            :class="{ 'scale-110': isButtonEnlarged, 'opacity-50 cursor-not-allowed': uploadStore.isUploading }"
            @click="handleUpload"
            @mousedown="isButtonEnlarged = true"
            @mouseup="isButtonEnlarged = false"
            @mouseleave="isButtonEnlarged = false"
            :disabled="uploadStore.isUploading"
          >
            {{ uploadStore.isUploading ? '上传中...' : 'Upload' }}
          </button>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUploadStore } from '../stores/uploadStore'
// 移除 Element Plus 导入
// import { ElMessage } from 'element-plus'
// import 'element-plus/dist/index.css'
// 导入自定义通知
import { notify } from '../utils/notification'

const fileInput = ref<HTMLInputElement | null>(null)
const isIconEnlarged = ref(false)
const isButtonEnlarged = ref(false)

// 使用 Pinia store
const uploadStore = useUploadStore()

// 定义emit
const emit = defineEmits(['upload-success', 'upload-error'])

const handleUpload = async () => {
  try {
    // 使用 store 中的方法上传文件和问题
    const result = await uploadStore.uploadFileWithQuestion()
    console.log('上传成功:', result)
    notify.success('上传成功', 2000)
  } catch (error) {
    console.error('上传失败:', error)
    notify.error(error instanceof Error ? error.message : '上传失败，请重试', 3000)
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    uploadStore.setFile(file)
  }
}
</script>
<style scoped>
</style>
