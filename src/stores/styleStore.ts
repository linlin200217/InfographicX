import { defineStore } from 'pinia'
import { ref } from 'vue'
import { generateColorScheme } from '../api/color'

export const useStyleStore = defineStore('style', () => {
  // 默认数据
  const defaultData = {
    "theme_colors": [[45, 32, 27], [78, 64, 55], [134, 86, 52], [92, 109, 125]],
    "background_color": [255, 255, 255],
    "first_level_color": [45, 32, 27],
    "first_level_font": "Verdana",
    "second_level_color": [78, 64, 55],
    "second_level_font": "Arial",
    "text_color": [51, 51, 58],
    "text_font": "Gill Sans"
  }

  // 状态
  const themeColors = ref<number[][]>(defaultData.theme_colors)
  const backgroundColor = ref<number[]>(defaultData.background_color)
  const firstLevelColor = ref<number[]>(defaultData.first_level_color)
  const firstLevelFont = ref<string>(defaultData.first_level_font)
  const secondLevelColor = ref<number[]>(defaultData.second_level_color)
  const secondLevelFont = ref<string>(defaultData.second_level_font)
  const textColor = ref<number[]>(defaultData.text_color)
  const textFont = ref<string>(defaultData.text_font)
  const isGenerating = ref<boolean>(false)
  const generationError = ref<Error | null>(null)

  // 辅助函数：RGB 数组转 hex 字符串
  const rgbToHex = (rgb: number[]): string => {
    return '#' + rgb.map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  // 辅助函数：hex 字符串转 RGB 数组
  const hexToRgb = (hex: string): number[] => {
    hex = hex.replace(/^#/, '')
    if (hex.length === 3) {
      hex = hex.split('').map(ch => ch + ch).join('')
    }
    const bigint = parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return [r, g, b]
  }

  // 更新主题颜色
  const updateThemeColor = (index: number, color: number[]) => {
    if (index >= 0 && index < themeColors.value.length) {
      themeColors.value[index] = color
    }
  }

  // 添加主题颜色
  const addThemeColor = (color: number[]) => {
    themeColors.value.push(color)
  }

  // 删除主题颜色
  const removeThemeColor = (index: number) => {
    if (index >= 0 && index < themeColors.value.length) {
      themeColors.value.splice(index, 1)
    }
  }

  // 更新背景颜色
  const updateBackgroundColor = (color: number[]) => {
    backgroundColor.value = color
  }

  // 更新一级标题颜色
  const updateFirstLevelColor = (color: number[]) => {
    firstLevelColor.value = color
  }

  // 更新一级标题字体
  const updateFirstLevelFont = (font: string) => {
    firstLevelFont.value = font
  }

  // 更新二级标题颜色
  const updateSecondLevelColor = (color: number[]) => {
    secondLevelColor.value = color
  }

  // 更新二级标题字体
  const updateSecondLevelFont = (font: string) => {
    secondLevelFont.value = font
  }

  // 更新文本颜色
  const updateTextColor = (color: number[]) => {
    textColor.value = color
  }

  // 更新文本字体
  const updateTextFont = (font: string) => {
    textFont.value = font
  }

  // 导入样式数据
  const importStyleData = (data: any) => {
    if (data.theme_colors) themeColors.value = data.theme_colors
    if (data.background_color) backgroundColor.value = data.background_color
    if (data.first_level_color) firstLevelColor.value = data.first_level_color
    if (data.first_level_font) firstLevelFont.value = data.first_level_font
    if (data.second_level_color) secondLevelColor.value = data.second_level_color
    if (data.second_level_font) secondLevelFont.value = data.second_level_font
    if (data.text_color) textColor.value = data.text_color
    if (data.text_font) textFont.value = data.text_font
  }

  // 导出样式数据
  const exportStyleData = () => {
    return {
      theme_colors: themeColors.value,
      background_color: backgroundColor.value,
      first_level_color: firstLevelColor.value,
      first_level_font: firstLevelFont.value,
      second_level_color: secondLevelColor.value,
      second_level_font: secondLevelFont.value,
      text_color: textColor.value,
      text_font: textFont.value
    }
  }

  // 重置为默认样式
  const resetToDefault = () => {
    themeColors.value = defaultData.theme_colors
    backgroundColor.value = defaultData.background_color
    firstLevelColor.value = defaultData.first_level_color
    firstLevelFont.value = defaultData.first_level_font
    secondLevelColor.value = defaultData.second_level_color
    secondLevelFont.value = defaultData.second_level_font
    textColor.value = defaultData.text_color
    textFont.value = defaultData.text_font
  }

  // 根据知识内容生成颜色方案
  async function generateColors(data: any) {


    try {
      isGenerating.value = true
      generationError.value = null
      
      // 调用API生成颜色方案
      const colorScheme = await generateColorScheme(data)
      
      // 更新样式
      importStyleData(colorScheme)
      
      return colorScheme
    } catch (error) {
      generationError.value = error as Error
      throw error
    } finally {
      isGenerating.value = false
    }
  }

  return {
    // 状态
    themeColors,
    backgroundColor,
    firstLevelColor,
    firstLevelFont,
    secondLevelColor,
    secondLevelFont,
    textColor,
    textFont,
    isGenerating,
    generationError,
    
    // 辅助函数
    rgbToHex,
    hexToRgb,
    
    // 操作方法
    updateThemeColor,
    addThemeColor,
    removeThemeColor,
    updateBackgroundColor,
    updateFirstLevelColor,
    updateFirstLevelFont,
    updateSecondLevelColor,
    updateSecondLevelFont,
    updateTextColor,
    updateTextFont,
    importStyleData,
    exportStyleData,
    resetToDefault,
    generateColors
  }
})

