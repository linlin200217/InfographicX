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
                取消
              </button>
              <button
                @click="applyColor"
                class="px-4 py-2 text-sm text-white bg-[#A7535A] hover:bg-[#720C0C] rounded"
              >
                确认
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
          @change="styleStore.updateFirstLevelFont(styleData.First_level_Font)"
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
          @change="styleStore.updateSecondLevelFont(styleData.Second_level_Font)"
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
          @change="styleStore.updateTextFont(styleData.Text_Font)"
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
import { ref, reactive, computed } from 'vue'
import { Chrome } from '@ckpack/vue-color'
import { useStyleStore } from '../stores/styleStore'

// 使用样式store
const styleStore = useStyleStore()

// 可用字体列表
const availableFonts = ['Arial', 'Verdana', 'Helvetica', 'Courier', 'Consolas', 'cursive', 'Tahoma', 'Trebuchet MS', 'Times New Roman', 'Georgia', 'Palatino', 'Baskerville', 'Gill Sans', 'Andalé Mono', 'Avantgarde', 'Optima', 'Arial Narrow', 'Didot', 'Bookman', 'American Typewriter', 'OCR A Std', 'Brush Script MT', 'Lucida', 'Bradley Hand', 'Trattatello', 'fantasy', 'Harrington', 'Marker Felt', 'Chalkduster', 'Comic Sans MS' ]

// 为了兼容模板中的变量名，创建计算属性
const themeColors = computed(() => styleStore.themeColors)
const backgroundColor = computed(() => styleStore.backgroundColor)

// 文本样式（H1、H2、Text）相关颜色和字体
interface StyleData {
  First_level_Color: number[]
  First_level_Font: string
  Second_level_Color: number[]
  Second_level_Font: string
  Text_Color: number[]
  Text_Font: string
}

// 创建一个响应式对象来映射store中的数据到组件中使用的格式
const styleData = reactive<StyleData>({
  First_level_Color: styleStore.firstLevelColor,
  First_level_Font: styleStore.firstLevelFont,
  Second_level_Color: styleStore.secondLevelColor,
  Second_level_Font: styleStore.secondLevelFont,
  Text_Color: styleStore.textColor,
  Text_Font: styleStore.textFont
})

// 监听store中的数据变化，更新本地styleData
styleStore.$subscribe((mutation, state) => {
  styleData.First_level_Color = state.firstLevelColor
  styleData.First_level_Font = state.firstLevelFont
  styleData.Second_level_Color = state.secondLevelColor
  styleData.Second_level_Font = state.secondLevelFont
  styleData.Text_Color = state.textColor
  styleData.Text_Font = state.textFont
})

// 监听本地styleData变化，更新store
const updateStoreFromStyleData = () => {
  styleStore.updateFirstLevelColor(styleData.First_level_Color)
  styleStore.updateFirstLevelFont(styleData.First_level_Font)
  styleStore.updateSecondLevelColor(styleData.Second_level_Color)
  styleStore.updateSecondLevelFont(styleData.Second_level_Font)
  styleStore.updateTextColor(styleData.Text_Color)
  styleStore.updateTextFont(styleData.Text_Font)
}

// 暴露可用字体
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
    pickerColor.value = styleStore.rgbToHex(backgroundColor.value)
  } else if (index === -2) {
    // 加号按钮：新增主题色，默认白色
    pickerColor.value = '#ffffff'
  } else if (index === -3) {
    // H1 颜色
    pickerColor.value = styleStore.rgbToHex(styleData.First_level_Color)
  } else if (index === -4) {
    // H2 颜色
    pickerColor.value = styleStore.rgbToHex(styleData.Second_level_Color)
  } else if (index === -5) {
    // Text 颜色
    pickerColor.value = styleStore.rgbToHex(styleData.Text_Color)
  } else {
    // 已存在的主题色
    pickerColor.value = styleStore.rgbToHex(themeColors.value[index])
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
  const newRgb = styleStore.hexToRgb(hexValue)
  
  if (currentColorIndex.value === -1) {
    // 更新背景色
    styleStore.updateBackgroundColor(newRgb)
  } else if (currentColorIndex.value === -2) {
    // 新增主题色
    styleStore.addThemeColor(newRgb)
  } else if (currentColorIndex.value === -3) {
    // 更新 H1 颜色
    styleData.First_level_Color = newRgb
    styleStore.updateFirstLevelColor(newRgb)
  } else if (currentColorIndex.value === -4) {
    // 更新 H2 颜色
    styleData.Second_level_Color = newRgb
    styleStore.updateSecondLevelColor(newRgb)
  } else if (currentColorIndex.value === -5) {
    // 更新 Text 颜色
    styleData.Text_Color = newRgb
    styleStore.updateTextColor(newRgb)
  } else {
    // 更新已存在的主题色
    styleStore.updateThemeColor(currentColorIndex.value, newRgb)
  }
  showPicker.value = false
}

// 删除主题色
const removeColor = (index: number) => {
  styleStore.removeThemeColor(index)
}
</script>
