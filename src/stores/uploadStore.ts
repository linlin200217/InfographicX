import { defineStore } from 'pinia'
import { ref } from 'vue'
import { uploadPdfWithQuestion } from '../api/upload'


export const useUploadStore = defineStore('upload', () => {
  // 状态
  const file = ref<File | null>(null)
  const question = ref<string>('')
  const showFileIcon = ref<boolean>(false)
  const isUploading = ref<boolean>(false)
  const uploadResult = ref<any | null>(null)
  const uploadError = ref<Error | null>(null)
  const colorRes = ref<any | null>(null)

  // 设置文件
  function setFile(newFile: File | null) {
    file.value = newFile
    if (newFile && newFile.type === 'application/pdf') {
      showFileIcon.value = true
    } else {
      showFileIcon.value = false
    }
  }

  // 设置问题
  function setQuestion(newQuestion: string) {
    question.value = newQuestion
    console.log(`question: ${question.value}`)
  }

  // 清空状态
  function clearState() {
    file.value = null
    question.value = ''
    showFileIcon.value = false
    uploadResult.value = null
    uploadError.value = null
  }

  function setColorRes(colorRes: any) {
    colorRes.value = colorRes
  }

  // 上传文件和问题
  async function uploadFileWithQuestion() {
    if (!file.value) {
      throw new Error('请先选择PDF文件')
    }

    if (!question.value.trim()) {
      throw new Error('请输入问题')
    }

    try {
      isUploading.value = true
      uploadError.value = null
      
      // 使用封装好的上传函数
      const result = await uploadPdfWithQuestion(
        file.value,
        question.value
      )
      
      uploadResult.value = result
      return result
    } catch (error) {
      uploadError.value = error as Error
      throw error
    } finally {
      isUploading.value = false
    }
  }

  return {
    // 状态
    file,
    question,
    showFileIcon,
    isUploading,
    uploadResult,
    colorRes,
    uploadError,
    
    // 方法
    setFile,
    setQuestion,
    clearState,
    uploadFileWithQuestion,
    setColorRes,
  }
}) 