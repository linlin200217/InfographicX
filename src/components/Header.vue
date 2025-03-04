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
                <img v-if="showFileIcon" src="/src/assets/File.png" class="h-5 w-5" />
            </div>
            <div class="relative w-[1100px] ml-[100px]">
              <input
                type="text"
                v-model="inputValue"
                placeholder="Type your question"
                class="h-[25px] w-full rounded-full bg-white pl-4 pr-8 placeholder:text-gray-300 text-[#333333] text-sm focus:outline-none"
              />
              <button
                class="absolute right-2 top-1/2 -translate-y-1/2 text-[#333333] hover:text-gray-500 transition-colors text-sm"
                @click="inputValue = ''"
              >
                ×
              </button>
            </div>
            <button
              class="h-[25px] px-4 ml-[100px] bg-[#9ABEAF] text-white rounded-lg transition-transform duration-200"
              :class="{ 'scale-110': isButtonEnlarged }"
              @click="handleUpload"
              @mousedown="isButtonEnlarged = true"
              @mouseup="isButtonEnlarged = false"
              @mouseleave="isButtonEnlarged = false"
            >
              Upload
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const fileInput = ref<HTMLInputElement | null>(null)
const showFileIcon = ref(false)
const isIconEnlarged = ref(false)
const inputValue = ref<string>('')
const isButtonEnlarged = ref(false)

const handleUpload = async () => {
  if (!fileInput.value?.files?.[0]) {
    alert('请先选择PDF文件')
    return
  }

  if (!inputValue.value.trim()) {
    alert('请输入问题')
    return
  }

  const formData = new FormData()
  formData.append('file', fileInput.value.files[0])
  formData.append('question', inputValue.value)

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('上传失败')
    }

    const result = await response.json()
    console.log('上传成功:', result)
    alert('上传成功')
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败，请重试')
  }
}

defineExpose({
  fileInput,
  showFileIcon,
  isIconEnlarged,
  inputValue,
  isButtonEnlarged,
  handleUpload
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file && file.type === 'application/pdf') {
    showFileIcon.value = true
  }
}
</script>
<style scoped>
</style>
