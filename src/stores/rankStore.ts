import { defineStore } from 'pinia'
import { ref } from 'vue'
import { rankInfographicElements } from '../api/rank'


export const useRankStore = defineStore('rank', () => {
  // 状态
  const isRanking = ref<boolean>(false)
  const rankedElements = ref<string[]>([])
  const rankingError = ref<Error | null>(null)

  // 对信息图元素进行排名
  async function rankElements(parserResult: any, infographicSize: [number, number]) {


    try {
      isRanking.value = true
      rankingError.value = null
      
      // 调用API进行排名
      const result = await rankInfographicElements(parserResult, infographicSize)
      
      rankedElements.value = result
      return result
    } catch (error) {
      rankingError.value = error as Error
      throw error
    } finally {
      isRanking.value = false
    }
  }

  // 清空状态
  function clearState() {
    rankedElements.value = []
    rankingError.value = null
  }

  return {
    // 状态
    isRanking,
    rankedElements,
    rankingError,
    
    // 方法
    rankElements,
    clearState
  }
})