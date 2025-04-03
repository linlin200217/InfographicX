import { defineStore } from 'pinia'
import { ref } from 'vue'



export const useHeightWidthStore = defineStore('heightWidth', () => {
  // 状态
    const height = ref(1200);
    const width = ref(800);

    const setHeight = (newHeight: number) => {
        height.value = newHeight;
    }

    const setWidth = (newWidth: number) => {
        width.value = newWidth;
    }
  return {
    height,
    width,
    setHeight,
    setWidth
  }
})

export const useHeightWidthStore2 = defineStore('heightWidth', () => {
  // 状态
    const height = ref(1200);
    const width = ref(628);

    const setHeight = (newHeight: number) => {
        height.value = newHeight;
    }

    const setWidth = (newWidth: number) => {
        width.value = newWidth;
    }
  return {
    height,
    width,
    setHeight,
    setWidth
  }
})