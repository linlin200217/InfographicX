<template>
  <!-- 外层容器：添加拖拽事件，并使用 overflow: hidden 限制超出部分 -->
  <div
    ref="container"
    class="h-full w-full flex items-center justify-center"
    style="overflow: hidden; position: relative;"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
  >
    <!-- 外层 SVG：宽高根据海报尺寸与 zoomScale 计算，viewBox 固定 -->
    <svg
      :width="scaledWidth"
      :height="scaledHeight"
      :viewBox="`0 0 ${infographicSize[1]} ${infographicSize[0]}`"
      :style="{
        backgroundColor: `#${BackgroundColor}`,
        position: 'absolute',
        left: finalOffsetX + 'px',
        top: finalOffsetY + 'px',
        cursor: isDragging ? 'grabbing' : 'zoom-in'
      }"
      @wheel="handleWheel"
    >
      <!-- 海报背景 -->
      <rect :width="infographicSize[1]" :height="infographicSize[0]" :fill="`#${BackgroundColor}`" />

      <!-- Title -->
      <template v-if="infographicLayoutData.Title">
        <foreignObject
          v-if="infographicLayoutData.Title.text"
          :x="infographicLayoutData.Title.coordinates[0][0]"
          :y="infographicLayoutData.Title.coordinates[0][1] + 20"
          :width="infographicLayoutData.Title.coordinates[1][0] - infographicLayoutData.Title.coordinates[0][0]"
          :height="infographicLayoutData.Title.coordinates[3][1] - infographicLayoutData.Title.coordinates[0][1]"
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            class="w-full h-full font-bold break-words overflow-hidden"
            :style="{
              color: `rgb(${infographicLayoutData.Title.color.join(',')})`,
              fontFamily: infographicLayoutData.Title.font,
              fontSize: `${infographicLayoutData.Title['font-size']}px`
            }"
          >
            {{ infographicLayoutData.Title.text }}
          </div>
        </foreignObject>
      </template>

      <!-- 视觉分组 (VGs) -->
      <template v-for="(vg, vgIndex) in infographicLayoutData.VGs" :key="vgIndex">
        <!-- Subtitle -->
        <text
          v-if="vg.Subtitle?.text"
          :x="vg.Subtitle.coordinates[0][0]"
          :y="vg.Subtitle.coordinates[0][1]"
          :fill="`rgb(${vg.Subtitle.color.join(',')})`"
          :font-family="vg.Subtitle.font"
          :font-size="`${vg.Subtitle['font-size']}px`"
        >
          {{ vg.Subtitle.text }}
        </text>

        <!-- 遍历知识块 (KGs) -->
        <template v-for="(kg, kgIndex) in vg.KGs" :key="kgIndex">
          <!-- Text -->
          <foreignObject
            v-if="kg.Text"
            :x="kg.Text.coordinates[0][0]"
            :y="kg.Text.coordinates[0][1]"
            :width="kg.Text.coordinates[1][0] - kg.Text.coordinates[0][0]"
            :height="kg.Text.coordinates[3][1] - kg.Text.coordinates[0][1]"
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              class="w-full h-full break-words overflow-hidden leading-[1.2]"
              :style="{
                color: `rgb(${kg.Text.color.join(',')})`,
                fontFamily: kg.Text.font,
                fontSize: `${kg.Text['font-size']}px`
              }"
            >
              <span v-html="formatTextWithStyles(kg.Text)"></span>
            </div>
          </foreignObject>

          <!-- Icon：动态加载后内联显示 SVG -->
          <foreignObject
            v-if="kg.Icon"
            :x="kg.Icon.coordinates[0][0]"
            :y="kg.Icon.coordinates[0][1]"
            :width="kg.Icon.coordinates[1][0] - kg.Icon.coordinates[0][0]"
            :height="kg.Icon.coordinates[2][1] - kg.Icon.coordinates[0][1]"
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style="width: 100%; height: 100%;"
              v-if="kg.Icon.svgContent"
              v-html="kg.Icon.svgContent"
            ></div>
            <div v-else>Loading Icon...</div>
          </foreignObject>

          <!-- Vis：动态加载后内联显示 SVG -->
          <foreignObject
            v-if="kg.Vis"
            :x="kg.Vis.coordinates[0][0]"
            :y="kg.Vis.coordinates[0][1]"
            :width="kg.Vis.coordinates[1][0] - kg.Vis.coordinates[0][0]"
            :height="kg.Vis.coordinates[2][1] - kg.Vis.coordinates[0][1]"
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style="width: 100%; height: 100%;"
              v-if="kg.Vis.svgContent"
              v-html="kg.Vis.svgContent"
            ></div>
            <div v-else>Loading Vis...</div>
          </foreignObject>
        </template>
      </template>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

// 数据结构定义
interface TextElement {
  text: string
  color: number[]
  font: string
  'font-size': number
  coordinates: number[][]
  H1?: string | null
  H1_font?: string | null
  H1_color?: number[] | null
  H1_size?: number | null
  H2?: string | null
  H2_font?: string | null
  H2_color?: number[] | null
  H2_font_style?: string | null
}

interface IconElement {
  path: string
  coordinates: number[][]
  svgContent?: string
}

interface KG {
  Text?: TextElement
  Icon?: IconElement
  Vis?: IconElement
  coordinates: number[][]
}

interface VG {
  Subtitle?: TextElement
  KGs: KG[]
  coordinates: number[][]
}

interface Infographic {
  Title?: TextElement
  VGs: VG[]
}

// 假数据：海报尺寸由后端传入，注意：infographicSize[0] 为高度，infographicSize[1] 为宽度
const infographicSize = [1200, 628]

// 背景颜色（不含 #）
const BackgroundColor = "EFEFEF"

// 缩放比例（初始为1）
const zoomScale = ref(1)

// 获取容器尺寸，用于计算 SVG 居中偏移
const container = ref<HTMLElement | null>(null)
const containerDimensions = ref({ width: 0, height: 0 })

const updateContainerDimensions = () => {
  if (container.value) {
    containerDimensions.value.width = container.value.clientWidth
    containerDimensions.value.height = container.value.clientHeight
  }
}

onMounted(() => {
  updateContainerDimensions()
  window.addEventListener('resize', updateContainerDimensions)
  // 加载所有 KG 的 Icon 与 Vis SVG 内容
  loadAllSvgContents()
})
onUnmounted(() => {
  window.removeEventListener('resize', updateContainerDimensions)
})

// 计算海报缩放后显示尺寸
const scaledWidth = computed(() => infographicSize[1] * zoomScale.value)
const scaledHeight = computed(() => infographicSize[0] * zoomScale.value)

// 自动居中偏移
const autoOffsetX = computed(() => (containerDimensions.value.width - scaledWidth.value) / 2)
const autoOffsetY = computed(() => (containerDimensions.value.height - scaledHeight.value) / 2)

// 拖拽产生的额外偏移
const dragOffset = ref({ x: 0, y: 0 })

// 计算最终偏移 = 自动居中 + 拖拽偏移
const finalOffsetX = computed(() => autoOffsetX.value + dragOffset.value.x)
const finalOffsetY = computed(() => autoOffsetY.value + dragOffset.value.y)

// 拖拽状态
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const onMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  dragStart.value = { x: event.clientX, y: event.clientY }
}

const onMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  const dx = event.clientX - dragStart.value.x
  const dy = event.clientY - dragStart.value.y
  dragOffset.value.x += dx
  dragOffset.value.y += dy
  dragStart.value = { x: event.clientX, y: event.clientY }
}

const onMouseUp = () => {
  isDragging.value = false
}

// 滚轮缩放事件，允许无限放大，最小缩放 0.5
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY < 0 ? 1.1 : 0.9
  const newZoom = zoomScale.value * delta
  zoomScale.value = Math.max(newZoom, 0.5)
}

// 格式化文本样式（例如 H1/H2）
const formatTextWithStyles = (textElement: TextElement) => {
  let text = textElement.text
  if (textElement.H1) {
    const h1Style = `font-family: ${textElement.H1_font}; color: rgb(${textElement.H1_color}); font-size: ${textElement.H1_size}px;`
    text = text.replace(new RegExp(textElement.H1, 'g'), `<span style="${h1Style}">${textElement.H1}</span>`)
  }
  if (textElement.H2) {
    const h2Style = `font-family: ${textElement.H2_font}; color: rgb(${textElement.H2_color}); font-weight: ${textElement.H2_font_style?.toLowerCase()};`
    text = text.replace(new RegExp(textElement.H2, 'g'), `<span style="${h2Style}">${textElement.H2}</span>`)
  }
  return text
}

// 动态加载 SVG 内容，返回 SVG 文本字符串
async function fetchSvgContent(url: string): Promise<string> {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (err) {
    console.error('加载 SVG 失败:', err)
    return ''
  }
}

// 遍历所有视觉分组中的知识块，加载 Icon 和 Vis 的 SVG 内容
async function loadAllSvgContents() {
  for (const vg of infographicLayoutData.VGs) {
    for (const kg of vg.KGs) {
      if (kg.Icon && kg.Icon.path && !kg.Icon.svgContent) {
        kg.Icon.svgContent = await fetchSvgContent(kg.Icon.path)
      }
      if (kg.Vis && kg.Vis.path && !kg.Vis.svgContent) {
        kg.Vis.svgContent = await fetchSvgContent(kg.Vis.path)
      }
    }
  }
}

// 假数据：Infographic_Layout_Data
const infographicLayoutData: Infographic = {
  Title: {
    text: "XXXXXXXXXXXXXXXX",
    color: [51, 51, 51],
    font: "Gill Sans",
    "font-size": 18,
    coordinates: [[0, 0], [628, 0], [0, 119], [628, 119]]
  },
  VGs: [
    {
      coordinates: [[0, 156], [628, 156], [0, 538], [628, 538]],
      Subtitle: {
        text: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        color: [51, 51, 51],
        font: "Gill Sans",
        "font-size": 16,
        coordinates: [[0, 169], [628, 169], [0, 206], [628, 206]]
      },
      KGs: [
        {
          coordinates: [[0, 156], [628, 156], [0, 538], [628, 538]],
          Text: {
            text: "I like study FrontEnd, FrontEnd makes me very happy. I like to build a system, my system is so visually appealing.",
            color: [51, 51, 51],
            font: "Gill Sans",
            "font-size": 12,
            H1: "FrontEnd",
            H1_font: "Chalkduster",
            H1_color: [153, 0, 0],
            H1_size: 18,
            H2: "makes me very happy",
            H2_font: "Chalkduster",
            H2_color: [0, 51, 102],
            H2_font_style: "Bold",
            coordinates: [[378, 216], [628, 216], [378, 385], [628, 385]]
          },
          Icon: {
            path: "src/assets/Experiment/IconVG1KG1.svg",
            coordinates: [[0, 216], [360, 216], [0, 538], [360, 538]]
          },
          Vis: {
            path: "src/assets/Experiment/VisVG1KG1.svg",
            coordinates: [[378, 385], [628, 385], [378, 538], [628, 538]]
          }
        }
      ]
    },
    {
      coordinates: [[0, 575], [628, 575], [0, 1200], [628, 1200]],
      Subtitle: {
        text: "xxxxxxxxxxxxxxxxxxxxxx",
        color: [51, 51, 51],
        font: "Gill Sans",
        "font-size": 16,
        coordinates: [[0, 588], [628, 588], [0, 625], [628, 625]]
      },
      KGs: [
        {
          coordinates: [[15, 635], [617, 635], [15, 862], [617, 862]],
          Text: {
            text: "I like Backend, I love coding, coding makes me happy :)",
            color: [51, 51, 51],
            font: "Gill Sans",
            "font-size": 12,
            H1: "Backend",
            H1_font: "Chalkduster",
            H1_color: [153, 0, 0],
            H1_size: 18,
            H2: "I love coding",
            H2_color: [0, 51, 102],
            H2_font: "Chalkduster",
            H2_font_style: "Bold",
            coordinates: [[189, 635], [309, 635], [189, 862], [309, 862]]
          },
          Icon: {
            path: "src/assets/Experiment/IconVG2KG1.svg",
            coordinates: [[15, 635], [182, 635], [15, 862], [182, 862]]
          },
          Vis: {
            path: "src/assets/Experiment/VisVG2KG1.svg",
            coordinates: [[316, 635], [617, 635], [316, 862], [617, 862]]
          }
        },
        {
          coordinates: [[15, 888], [617, 888], [15, 1174], [617, 1174]],
          Text: {
            text: "I want to finish this system, I want to finish this paper, I want to graduate.",
            color: [51, 51, 51],
            font: "Gill Sans",
            "font-size": 12,
            H1: "graduate",
            H1_font: "Chalkduster",
            H1_color: [153, 0, 0],
            H1_size: 18,
            H2: null,
            H2_color: null,
            H2_font: null,
            H2_font_style: null,
            coordinates: [[258, 888], [407, 888], [258, 1174], [407, 1174]]
          },
          Icon: {
            path: "src/assets/Experiment/IconVG2KG2.svg",
            coordinates: [[426, 888], [617, 888], [426, 1174], [617, 1174]]
          },
          Vis: {
            path: "src/assets/Experiment/xx.svg",
            coordinates: [[15, 888], [250, 888], [15, 1174], [250, 1174]]
          }
        }
      ]
    }
  ]
}
</script>

<style scoped>
/* 如有需要，可添加额外样式 */
</style>
