import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  const type = ref<string>('');
  const layoutData = ref<any>(null);

  const setType = (newType: string) => {
    type.value = newType;
  }

  const setLayoutData = (newLayoutData: any) => {
    layoutData.value = newLayoutData;
  }

  return {
    type,
    layoutData,
    setType,
    setLayoutData
  }
})