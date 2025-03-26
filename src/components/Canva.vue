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
          <!-- Highlight -->
          <foreignObject
            v-if="kg.Highlight"
            :x="kg.Highlight.coordinates[0][0]"
            :y="kg.Highlight.coordinates[0][1]"
            :width="kg.Highlight.coordinates[1][0] - kg.Highlight.coordinates[0][0]"
            :height="kg.Highlight.coordinates[3][1] - kg.Highlight.coordinates[0][1]"
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              class="w-full h-full break-words overflow-hidden leading-[1.2]"
              :style="{
                color: `rgb(${kg.Highlight.color.join(',')})`,
                fontFamily: kg.Highlight.font,
                fontSize: `${kg.Highlight['font-size']}px`
              }"
            >
              <span v-html="formatHighlightWithStyles(kg.Highlight)"></span>
            </div>
          </foreignObject>

          <!-- Icon：动态加载后内联显示 SVG，并自动等比例缩放 -->
          <foreignObject
            v-if="kg.Icon"
            :x="kg.Icon.coordinates[0][0]"
            :y="kg.Icon.coordinates[0][1]"
            :width="kg.Icon.coordinates[1][0] - kg.Icon.coordinates[0][0]"
            :height="kg.Icon.coordinates[2][1] - kg.Icon.coordinates[0][1]"
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;"
            >
              <div 
                v-if="kg.Icon.svgContent" 
                v-html="kg.Icon.svgContent" 
                style="max-width: 100%; max-height: 100%;"
              ></div>
              <div v-else>Loading Icon...</div>
            </div>
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
  Highlight?: TextElement
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
const BackgroundColor = "FBFCFE"

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
  if (textElement.H2) {
    const h2Style = `font-family: ${textElement.H2_font}; color: rgb(${textElement.H2_color}); font-weight: ${textElement.H2_font_style?.toLowerCase()};`
    text = text.replace(new RegExp(textElement.H2, 'g'), `<span style="${h2Style}">${textElement.H2}</span>`)
  }
  return text
}

const formatHighlightWithStyles = (highlightElement: TextElement) => {
  let text = highlightElement.text
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

// 新增：处理 SVG 内容，确保 SVG 能自适应容器尺寸
function processSvgContent(svgText: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgText, 'image/svg+xml')
  const svgEl = doc.querySelector('svg')
  if (svgEl) {
    // 移除原有的宽高属性
    svgEl.removeAttribute('width')
    svgEl.removeAttribute('height')
    // 设置为自适应容器
    svgEl.setAttribute('width', '100%')
    svgEl.setAttribute('height', '100%')
    svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    // 如果没有 viewBox，默认设置一个 viewBox 值（根据实际情况调整）
    if (!svgEl.getAttribute('viewBox')) {
      svgEl.setAttribute('viewBox', '0 0 1024 1024')
    }
    return new XMLSerializer().serializeToString(svgEl)
  }
  return svgText
}

// 遍历所有视觉分组中的知识块，加载 Icon 和 Vis 的 SVG 内容
async function loadAllSvgContents() {
  for (const vg of infographicLayoutData.VGs) {
    for (const kg of vg.KGs) {
      if (kg.Icon && kg.Icon.path && !kg.Icon.svgContent) {
        let rawSvg = await fetchSvgContent(kg.Icon.path)
        kg.Icon.svgContent = processSvgContent(rawSvg)
      }
      if (kg.Vis && kg.Vis.path && !kg.Vis.svgContent) {
        let rawSvg = await fetchSvgContent(kg.Vis.path)
        kg.Vis.svgContent = processSvgContent(rawSvg)
      }
    }
  }
}

// 假数据：Infographic_Layout_Data
const infographicLayoutData: Infographic = {
  Title: {
    text: "Factors Influencing Survival Rates",
    color: [105, 138, 202],
    font: "Gill Sans",
    "font-size": 24,
    coordinates: [[0.0, 0.0],
    [628.0, 0.0],
    [0.0, 59.416850511879446],
    [628.0, 59.416850511879446]]
  },
  VGs: [
    {
      coordinates: [[0.0, 59.416850511879446],
      [628.0, 59.416850511879446],
      [0.0, 221.28137123104426],
      [628.0, 221.28137123104426]],
      Subtitle: {
        text: "Overview of Titanic passenger demographics",
        color: [225, 101, 86],
        font: "Gill Sans",
        "font-size": 16,
        coordinates: [[0.0, 59.416850511879446],
      [628.0, 59.416850511879446],
      [0.0, 89.12527576781918],
      [628.0, 89.12527576781918]]
      },
      KGs: [
        {
          coordinates: [[0.0, 89.12527576781918],
        [628.0, 89.12527576781918],
        [0.0, 129.8367471929072],
        [628.0, 129.8367471929072]],
          Text: {
            text: "1,317 passengers aboard the Titanic.",
            color: [51, 51, 51],
            font: "Gill Sans",
            "font-size": 12,
            H2: "",
            H2_font: "Chalkduster",
            H2_color: [225, 101, 86],
            H2_font_style: "Bold",
            coordinates: [[140.0, 89.12527576781918],
        [628.0, 89.12527576781918],
        [140.0, 129.8367471929072],
        [628.0, 129.8367471929072]]
          },
          Highlight:{
            text: "1,317",
            color: [105, 138, 202],
            font: "Helvetica",
            "font-size": 18,
            coordinates: [[0.0, 89.12527576781918],
        [138.63931786105204, 89.12527576781918],
        [0.0, 128.73650944240546],
        [138.63931786105204, 128.73650944240546]]
          },
          Icon: {
            path: "src/assets/Experiment/VG1KG1.svg",
            coordinates: [[486.3132693627384, 89.12527576781918],
        [567.7362122129146, 89.12527576781918],
        [486.3132693627384, 129.8367471929072],
        [567.7362122129146, 129.8367471929072]]
          },
          Vis: {
            path: "",
            coordinates: [[378, 385], [628, 385], [378, 538], [628, 538]]
          }
        },
        {
          coordinates: [[0.0, 129.8367471929072],
        [628.0, 129.8367471929072],
        [0.0, 153.19760060155699],
        [628.0, 153.19760060155699]],
          Text: {
            text: "705 people survived.",
            color: [51, 51, 51],
            font: "Gill Sans",
            "font-size": 12,
            H2: null,
            H2_font: null,
            H2_color: [0, 51, 102],
            H2_font_style: "Bold",
            coordinates: [[84.0, 129.8367471929072],
        [628.0, 129.8367471929072],
        [84.0, 153.19760060155699],
        [628.0, 153.19760060155699]]
          },
          Highlight:{
            text: "705",
            color: [105, 138, 202],
            font: "Helvetica",
            "font-size": 18,
            coordinates: [[0.0, 129.8367471929072],
        [83.18359071663122, 129.8367471929072],
        [0.0, 169.4479808674935],
        [83.18359071663122, 169.4479808674935]]
          },
          Icon: {
            path: "src/assets/Experiment/VG1KG2.svg",
            coordinates: [[521.3434892242184, 129.8367471929072],
        [568.0651960415179, 129.8367471929072],
        [521.3434892242184, 153.19760060155699],
        [568.0651960415179, 153.19760060155699]]
          },
          Vis: {
            path: "",
            coordinates: [[378, 385], [628, 385], [378, 538], [628, 538]]
          }
        },
        {
          coordinates: [[0.0, 153.19760060155699],
        [628.0, 153.19760060155699],
        [0.0, 175.80890791153348],
        [628.0, 175.80890791153348]],
          Text: {
            text: "20 lifeboats available.",
            color: [51, 51, 51],
            font: "Gill Sans",
            "font-size": 12,
            H2: null,
            H2_font: "Chalkduster",
            H2_color: [0, 51, 102],
            H2_font_style: "Bold",
            coordinates: [[55.0, 153.19760060155699],
        [628.0, 153.19760060155699],
        [55.0, 175.80890791153348],
        [628.0, 175.80890791153348]]
          },
          Highlight:{
            text: "20",
            color: [105, 138, 202],
            font: "Helvetica",
            "font-size": 18,
            coordinates: [[0.0, 153.19760060155699],
        [55.45572714442081, 153.19760060155699],
        [0.0, 192.80883427614327],
        [55.45572714442081, 192.80883427614327]]
          },
          Icon: {
            path: "src/assets/Experiment/VG1KG3.svg",
            coordinates: [[518.4407410386804, 153.19760060155699],
        [563.6633556586333, 153.19760060155699],
        [518.4407410386804, 175.80890791153348],
        [563.6633556586333, 175.80890791153348]]
          },
          Vis: {
            path: "",
            coordinates: [[378, 385], [628, 385], [378, 538], [628, 538]]
          }
        },
        {
          coordinates: [[0.0, 175.80890791153348],
        [628.0, 175.80890791153348],
        [0.0, 221.28137123104426],
        [628.0, 221.28137123104426]],
          Text: {
            text: "1,178 people could be saved with lifeboats.",
            color: [51, 51, 51],
            font: "Gill Sans",
            "font-size": 12,
            H2: null,
            H2_font: "Chalkduster",
            H2_color: [0, 51, 102],
            H2_font_style: "Bold",
            coordinates: [[138.0, 175.80890791153348],
        [628.0, 175.80890791153348],
        [138.0, 221.28137123104426],
        [628.0, 221.28137123104426]]
          },
          Highlight:{
            text: "1178",
            color: [105, 138, 202],
            font: "Helvetica",
            "font-size": 18,
            coordinates: [[0.0, 175.80890791153348],
        [138.63931786105204, 175.80890791153348],
        [0.0, 215.42014158611977],
        [138.63931786105204, 215.42014158611977]]
          },
          Icon: {
            path: "src/assets/Experiment/VG1KG4.svg",
            coordinates: [[476.1282365007458, 175.80890791153348],
        [567.0731631397674, 175.80890791153348],
        [476.1282365007458, 221.28137123104426],
        [567.0731631397674, 221.28137123104426]]
          },
          Vis: {
            path: "",
            coordinates: [[378, 385], [628, 385], [378, 538], [628, 538]]
          }
        },

      ]
    },
    {
      coordinates: [[0.0, 221.28137123104426],
      [376.9819137000913, 221.28137123104426],
      [0.0, 567.2774502228593],
      [376.9819137000913, 567.2774502228593]],
      Subtitle: {
        text: "Survival rates based on class",
        color: [225, 101, 86],
        font: "Gill Sans",
        "font-size": 18,
        coordinates: [[0.0, 221.28137123104426],
      [376.9819137000913, 221.28137123104426],
      [0.0, 250.98979648698398],
      [376.9819137000913, 250.98979648698398]]
      },
      KGs: [
        {
          coordinates: [[15, 635], [617, 635], [15, 862], [617, 862]],
          Text: {
            text: "61.9% of First Class passengers survived.",
            color: [51, 51, 51],
            font: "Gill Sans",
            "font-size": 12,
            H2: "First Class",
            H2_color: [225, 101, 86],
            H2_font: "Arial",
            H2_font_style: "Bold",
            coordinates: [[0.0, 290.98979648698398],
        [200.9819137000913, 290.98979648698398],
        [0.0, 358.58100103764525],
        [200.9819137000913, 358.58100103764525]
      ]
          },
          Highlight:{
            text: "61.9%",
            color: [105, 138, 202],
            font: "Helvetica",
            "font-size": 18,
            coordinates: [[0.0, 250.98979648698398],
        [138.63931786105204, 250.98979648698398],
        [0.0, 290.6010301615703],
        [138.63931786105204, 290.6010301615703]]
          },
          Icon: {
            path: "src/assets/Experiment/VG2KG1.svg",
            coordinates: [[268.864286749122, 250.98979648698398],
        [376.4554912997833, 250.98979648698398],
        [268.864286749122, 358.58100103764525],
        [376.4554912997833, 358.58100103764525]]
          },
          Vis: {
            path: "src/assets/Experiment/VisVG2KG1.svg",
            coordinates: [[144.03641111126842, 250.98979648698398],
        [268.864286749122, 250.98979648698398],
        [144.03641111126842, 344.63411429482613],
        [268.864286749122, 344.63411429482613]]
          }
        },
        {
          coordinates: [[0.0, 358.58100103764525],
        [180.9819137000913, 358.58100103764525],
        [0.0, 460.0330556187814],
        [180.9819137000913, 460.0330556187814]],
          Text: {
            text: "43% of Second Class passengers survived.",
            color: [51, 51, 51],
            font: "Gill Sans",
            "font-size": 12,
            H2: "Second Class",
            H2_color: [225, 101, 86],
            H2_font: "Arial",
            H2_font_style: "Bold",
            coordinates: [[0.0, 398.58100103764525],
        [200.9819137000913, 398.58100103764525],
        [0.0, 460.0330556187814],
        [200.9819137000913, 460.0330556187814]]
          },
          Highlight:{
            text: "43%",
            color: [105, 138, 202],
            font: "Helvetica",
            "font-size": 18,
            coordinates: [[0.0, 358.58100103764525],
        [83.18359071663122, 358.58100103764525],
        [0.0, 398.19223471223154],
        [83.18359071663122, 398.19223471223154]]
          },
          Icon: {
            path: "src/assets/Experiment/VG2KG2.svg",
            coordinates: [[252.36365680902696, 358.58100103764525],
        [376.9819137000913, 358.58100103764525],
        [252.36365680902696, 452.0680654720521],
        [376.9819137000913, 452.0680654720521]]
          },
          Vis: {
            path: "src/assets/Experiment/IconVG2KG2.svg",
            coordinates: [[127.74539991796264, 358.58100103764525],
        [252.36365680902696, 358.58100103764525],
        [127.74539991796264, 452.0680654720521],
        [252.36365680902696, 452.0680654720521]]
          }
        },
        {
          coordinates: [[0.0, 460.0330556187814],
        [376.9819137000913, 460.0330556187814],
        [0.0, 567.2774502228592],
        [376.9819137000913, 567.2774502228592]],
          Text: {
            text: "25.5% of Third Class passengers survived.",
            color: [51, 51, 51],
            font: "Gill Sans",
            "font-size": 12,
            H2: "Third Class",
            H2_color: [225, 101, 86],
            H2_font: "Arial",
            H2_font_style: "Bold",
            coordinates: [[0.0, 499.0330556187814],
        [200.9819137000913, 499.0330556187814],
        [0.0, 567.2774502228592],
        [200.9819137000913, 567.2774502228592]
      ]
          },
          Highlight:{
            text: "25.5%",
            color: [105, 138, 202],
            font: "Helvetica",
            "font-size": 18,
            coordinates: [[0.0, 460.0330556187814],
        [138.63931786105204, 460.0330556187814],
        [0.0, 499.6442892933677],
        [138.63931786105204, 499.6442892933677]]
          },
          Icon: {
            path: "src/assets/Experiment/VG2KG3.svg",
            coordinates: [[269.0660163615101, 460.0330556187814],
        [376.31041096558783, 460.0330556187814],
        [269.0660163615101, 567.2774502228592],
        [376.31041096558783, 567.2774502228592]]
          },
          Vis: {
            path: "src/assets/Experiment/VisVG2KG1.svg",
            coordinates: [[144.47104889670646, 460.0330556187814],
        [269.0660163615101, 460.0330556187814],
        [144.47104889670646, 553.5026486156333],
        [269.0660163615101, 553.5026486156333]]
          }
        },
      ]
    },
    {
      coordinates: [[376.9819137000913, 221.28137123104426],
      [628.0, 221.28137123104426],
      [376.9819137000913, 567.2774502228593],
      [628.0, 567.2774502228593]],
      Subtitle: {
        text: "Influence of gender on survival rates",
        color: [225, 101, 86],
        font: "Gill Sans",
        "font-size": 18,
        coordinates: [[376.9819137000913, 221.28137123104426],
      [628.0, 221.28137123104426],
      [376.9819137000913, 250.98979648698398],
      [628.0, 250.98979648698398]]
      },
      KGs: [
        {
          coordinates: [[376.9819137000913, 250.98979648698398],
        [628.0, 250.98979648698398],
        [376.9819137000913, 386.9434816402505],
        [628.0, 386.9434816402505]],
          Text: {
            text: "339 women survived out of 466 onboard.",
            color: [51, 51, 51],
            font: "Gill Sans",
            "font-size": 12,
            H2: "First Class",
            H2_color: [225, 101, 86],
            H2_font: "Arial",
            H2_font_style: "Bold",
            coordinates: [[376.9819137000913, 290.98979648698398],
        [460.0, 290.98979648698398],
        [376.9819137000913, 386.9434816402505],
        [460.0, 386.9434816402505]
      ]
          },
          Highlight:{
            text: "339",
            color: [105, 138, 202],
            font: "Helvetica",
            "font-size": 18,
            coordinates: [[376.9819137000913, 250.98979648698398],
        [460.1655044167225, 250.98979648698398],
        [376.9819137000913, 290.6010301615703],
        [460.1655044167225, 290.6010301615703]]
          },
          Icon: {
            path: "src/assets/Experiment/VG3KG1.svg",
            coordinates: [[540.2050268767829, 250.98979648698398],
        [628.0, 250.98979648698398],
        [540.2050268767829, 368.04976065127346],
        [628.0, 368.04976065127346]]
          },
          Vis: {
            path: "src/assets/Experiment/VisVG2KG1.svg",
            coordinates: [[464.2061496411552, 250.98979648698398],
        [540.2050268767829, 250.98979648698398],
        [464.2061496411552, 386.21911541158835],
        [540.2050268767829, 386.21911541158835]]
          }
        },
        {
          coordinates: [[376.9819137000913, 386.9434816402505],
        [628.0, 386.9434816402505],
        [376.9819137000913, 567.2774502228593],
        [628.0, 567.2774502228593]],
          Text: {
            text: "73% of women survived compared to 19% of men.",
            color: [51, 51, 51],
            font: "Gill Sans",
            "font-size": 12,
            H2: null,
            H2_color: [225, 101, 86],
            H2_font: "Arial",
            H2_font_style: "Bold",
            coordinates: [[376.9819137000913, 426.9434816402505],
        [628.0, 426.9434816402505],
        [376.9819137000913, 567.2774502228593],
        [628.0, 567.2774502228593]]
          },
          Highlight:{
            text: "73%",
            color: [105, 138, 202],
            font: "Helvetica",
            "font-size": 18,
            coordinates: [[376.9819137000913, 386.9434816402505],
        [586.9214521753986, 386.9434816402505],
        [376.9819137000913, 426.5547153148368],
        [586.9214521753986, 426.5547153148368]]
          },
          Icon: {
            path: "src/assets/Experiment/VG3KG2.svg",
            coordinates: [[376.9819137000913, 426.5547153148368],
        [487.96407979355894, 426.5547153148368],
        [376.9819137000913, 537.5368814083045],
        [487.96407979355894, 537.5368814083045]]
          },
          Vis: {
            path: "src/assets/Experiment/xx.svg",
            coordinates: [[517.0178339065324, 456.2952841293917],
        [628.0, 456.2952841293917],
        [517.0178339065324, 567.2774502228593],
        [628.0, 567.2774502228593]]
          }
        },
      ]
    }
  ]
}
</script>

<style scoped>
/* 如有需要，可添加额外样式 */
</style>
