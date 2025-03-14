<template>
  <div class="h-full w-full bg-[#EDE3E7] rounded-l-lg relative pt-5 p-4">
    <img src="../assets/Color.png" alt="Color" class="absolute top-1 left-1 w-4 h-4">
    <div class="flex gap-2">
      <!-- Theme colors -->
      <div class="bg-white rounded-lg p-2 flex-1">
        <div class="flex gap-1">
          <div
            v-for="(color, index) in themeColors"
            :key="index"
            class="w-8 h-8 rounded-full cursor-pointer relative"
            :style="{ backgroundColor: `rgb(${color.join(',')})` }"
            @click="openPicker(index)"
          >
            <img
              src="../assets/Minus.png"
              alt="Remove"
              class="w-3 h-3 absolute -top-1 -right-1 cursor-pointer hover:opacity-80"
              @click.stop="removeColor(index)"
            />
          </div>
          <!-- 加号按钮，传入 -2 表示添加新颜色 -->
          <div
            class="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer"
            @click="openPicker(-2)"
          >
            <span class="text-gray-400 text-lg">+</span>
          </div>
          <!-- 取色器 -->
          <div v-if="showPicker" class="absolute z-50 bg-white p-4 rounded-lg shadow-lg">
            <Chrome v-model="pickerColor" />
            <div class="flex justify-end mt-4 gap-2">
              <button
                @click="showPicker = false"
                class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                @click="applyColor"
                class="px-4 py-2 text-sm text-white bg-[#A7535A] hover:bg-[#720C0C] rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>

      <ColorPicker format="rgb" shape="square" />

      <!-- Background color -->
      <div class="bg-white rounded-lg p-2 flex-1">
        <div
          class="w-8 h-8 rounded-full mx-auto cursor-pointer"
          :style="{ backgroundColor: `rgb(${backgroundColor.join(',')})` }"
          @click="openPicker(-1)"
        ></div>
      </div>
    </div>
    <img src="../assets/Font Size.png" alt="Font" class="absolute left-1 w-4 h-4">
    <div class="mt-4 grid grid-cols-3 gap-4">
      <!-- H1 Section -->
      <div class="flex items-center gap-2">
        <h1 :style="{ fontFamily: styleData.First_level_Font, color: `rgb(${styleData.First_level_Color.join(',')})` }">
          H1
        </h1>
        <!-- H1颜色小圆圈，点击打开取色器 -->
        <div
          class="w-4 h-4 rounded-full cursor-pointer"
          :style="{ backgroundColor: `rgb(${styleData.First_level_Color.join(',')})` }"
          @click="openPicker(-3)"
        ></div>
        <select
          v-model="styleData.First_level_Font"
          class="bg-[#ffffff] rounded-lg px-2 py-0.5 w-20 max-w-[35px] overflow-hidden"
        >
          <option v-for="font in availableFonts" :key="font" :value="font">
            {{ font }}
          </option>
        </select>
      </div>

      <!-- H2 Section -->
      <div class="flex items-center gap-2">
        <h2 :style="{ fontFamily: styleData.Second_level_Font, color: `rgb(${styleData.Second_level_Color.join(',')})` }">
          H2
        </h2>
        <!-- H2颜色小圆圈，点击打开取色器 -->
        <div
          class="w-4 h-4 rounded-full cursor-pointer"
          :style="{ backgroundColor: `rgb(${styleData.Second_level_Color.join(',')})` }"
          @click="openPicker(-4)"
        ></div>
        <select
          v-model="styleData.Second_level_Font"
          class="bg-[#ffffff] rounded-lg px-2 py-0.5 w-20 max-w-[35px] overflow-hidden"
        >
          <option v-for="font in availableFonts" :key="font" :value="font">
            {{ font }}
          </option>
        </select>
      </div>

      <!-- Text Section -->
      <div class="flex items-center gap-2">
        <p :style="{ fontFamily: styleData.Text_Font, color: `rgb(${styleData.Text_Color.join(',')})` }">
          Text
        </p>
        <!-- Text颜色小圆圈，点击打开取色器 -->
        <div
          class="w-4 h-4 rounded-full cursor-pointer"
          :style="{ backgroundColor: `rgb(${styleData.Text_Color.join(',')})` }"
          @click="openPicker(-5)"
        ></div>
        <select
          v-model="styleData.Text_Font"
          class="bg-[#ffffff] rounded-lg px-2 py-0.5 w-20 max-w-[35px] overflow-hidden"
        >
          <option v-for="font in availableFonts" :key="font" :value="font">
            {{ font }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Chrome } from '@ckpack/vue-color'

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

// 新的数据格式
const jsonData = ref({
  "themeColors": [[45, 32, 27], [78, 64, 55], [134, 86, 52], [92, 109, 125]],
  "backgroundColor": [255, 255, 255],
  "First_level_Color": [45, 32, 27],
  "First_level_Font": "Verdana",
  "Second_level_Color": [78, 64, 55],
  "Second_level_Font": "Arial",
  "Text_Color": [51, 51, 58],
  "Text_Font": "Gill Sans"
})

// 模拟数据：主题色和背景色
const themeColors = ref(jsonData.value.themeColors)
const backgroundColor = ref(jsonData.value.backgroundColor)

// 模拟数据：文本样式（H1、H2、Text）相关颜色和字体
interface StyleData {
  First_level_Color: number[]
  First_level_Font: string
  Second_level_Color: number[]
  Second_level_Font: string
  Text_Color: number[]
  Text_Font: string
}

const availableFonts = ['Arial', 'Verdana', 'Helvetica', 'Courier', 'Consolas', 'cursive', 'Tahoma', 'Trebuchet MS', 'Times New Roman', 'Georgia', 'Palatino', 'Baskerville', 'Gill Sans', 'Andalé Mono', 'Avantgarde', 'Optima', 'Arial Narrow', 'Didot', 'Bookman', 'American Typewriter', 'OCR A Std', 'Brush Script MT', 'Lucida', 'Bradley Hand', 'Trattatello', 'fantasy', 'Harrington', 'Marker Felt', 'Chalkduster', 'Comic Sans MS' ]

const styleData = ref<StyleData>({
  First_level_Color: jsonData.value.First_level_Color,
  First_level_Font: jsonData.value.First_level_Font,
  Second_level_Color: jsonData.value.Second_level_Color,
  Second_level_Font: jsonData.value.Second_level_Font,
  Text_Color: jsonData.value.Text_Color,
  Text_Font: jsonData.value.Text_Font
})

defineExpose({
  availableFonts
})

const showPicker = ref(false)
// currentColorIndex 含义：
// -1: 背景色
// -2: 新增主题色
// -3: H1 颜色
// -4: H2 颜色
// -5: Text 颜色
// >= 0: 主题色数组索引
const currentColorIndex = ref(0)
// 用于双向绑定的取色器颜色，初始设为白色
const pickerColor = ref<any>('#ffffff')

// 点击某个颜色圆圈时打开取色器，根据不同标识符初始化取色器颜色
const openPicker = (index: number) => {
  currentColorIndex.value = index
  if (index === -1) {
    // 背景颜色
    pickerColor.value = rgbToHex(backgroundColor.value)
  } else if (index === -2) {
    // 加号按钮：新增主题色，默认白色
    pickerColor.value = '#ffffff'
  } else if (index === -3) {
    // H1 颜色
    pickerColor.value = rgbToHex(styleData.value.First_level_Color)
  } else if (index === -4) {
    // H2 颜色
    pickerColor.value = rgbToHex(styleData.value.Second_level_Color)
  } else if (index === -5) {
    // Text 颜色
    pickerColor.value = rgbToHex(styleData.value.Text_Color)
  } else {
    // 已存在的主题色
    pickerColor.value = rgbToHex(themeColors.value[index])
  }
  showPicker.value = true
}

// 确认取色后，根据 currentColorIndex 更新对应的数据
const applyColor = () => {
  let hexValue = ''
  if (typeof pickerColor.value === 'object' && pickerColor.value.hex) {
    hexValue = pickerColor.value.hex
  } else if (typeof pickerColor.value === 'string') {
    hexValue = pickerColor.value
  }
  const newRgb = hexToRgb(hexValue)
  
  if (currentColorIndex.value === -1) {
    // 更新背景色
    backgroundColor.value = newRgb
  } else if (currentColorIndex.value === -2) {
    // 新增主题色
    themeColors.value.push(newRgb)
  } else if (currentColorIndex.value === -3) {
    // 更新 H1 颜色
    styleData.value.First_level_Color = newRgb
  } else if (currentColorIndex.value === -4) {
    // 更新 H2 颜色
    styleData.value.Second_level_Color = newRgb
  } else if (currentColorIndex.value === -5) {
    // 更新 Text 颜色
    styleData.value.Text_Color = newRgb
  } else {
    // 更新已存在的主题色
    themeColors.value[currentColorIndex.value] = newRgb
  }
  showPicker.value = false
}

// 删除主题色
const removeColor = (index: number) => {
  themeColors.value.splice(index, 1)
}
</script>
