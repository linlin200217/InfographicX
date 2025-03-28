<template>
  <input  v-model="visualizationIcon" placeholder="请输入可视化图标" v-if="layoutStore.type == 'Star'"></input>
 <div class="h-full w-full bg-[#EDE3E7] rounded-l-lg relative pt-6 p-1">
   <img src="../assets/Layout.png" alt="Layout" class="absolute top-1 left-1 w-4 h-4">
   <div class="flex">
     <div class="flex flex-col space-y-2 pl-4 relative">
       <!-- 根据推荐顺序排序图片 -->
       <div
         v-for="(img, index) in sortedImages"
         :key="img.name"
         :class="{'order-first': index === 0}"
       >
         <img
           :src="img.src"
           alt=""
           class="w-10.5 h-13 cursor-pointer"
           @click="handleImageClick(img)"
         >
       </div>
       <img
         v-if="sortedImages.length > 0"
         src="../assets/Yellowstar.png"
         alt=""
         class="absolute -top-2 left-11.5 w-5 h-5"
       >
     </div>
     
     <!-- 右侧框：添加canvas容器，设定唯一id -->
     <div class="ml-6 w-64 h-88 border-dotted border-2 rounded-sm border-gray-400 relative">
       <canvas id="layout-canvas"></canvas>
     </div>
     
     
   </div>
  
 </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRankStore } from '../stores/rankStore';
import * as fabric from 'fabric';
import { layoutRequest } from '../api/layout';
import { useHeightWidthStore } from '../stores/heightWidth';
import { useUploadStore } from '../stores/uploadStore';
import { useLayoutStore } from '../stores/layout';
const heightWidthStore = useHeightWidthStore();
const uploadStore = useUploadStore();
const layoutStore = useLayoutStore();

const visualizationIcon = ref('');
watch(visualizationIcon, (newVal) => {
 console.log('visualizationIcon:', newVal);
 if (layoutStore.type == 'Star') {
   layoutStore.setLayoutData({
     ...layoutStore.layoutData,
     VisualizationIcon: newVal
   });
   console.log('new --layoutStore:', layoutStore.layoutData);
 }
});
const layoutData = ref(null);


// 使用 rankStore
const rankStore = useRankStore();

// 图片数组
const images = ref([
 { name: 'Star', src: new URL('../assets/Star.png', import.meta.url).href },
 { name: 'Grid', src: new URL('../assets/Grid.png', import.meta.url).href },
 { name: 'PortraitGrid', src: new URL('../assets/PortraitGrid.png', import.meta.url).href },
 { name: 'Portrait', src: new URL('../assets/Portrait.png', import.meta.url).href },
 { name: 'Landscape', src: new URL('../assets/Landscape.png', import.meta.url).href },
 { name: 'Spiral', src: new URL('../assets/Spiral.png', import.meta.url).href }
]);

const sortedImages = computed(() => {
 if (rankStore.rankedElements.length > 0) {
   return images.value.sort((a, b) => {
     return rankStore.rankedElements.indexOf(a.name) - rankStore.rankedElements.indexOf(b.name);
   });
 } else {
   const defaultOrder = ['PortraitGrid', 'Star', 'Spiral', 'Grid', 'Portrait', 'Landscape'];
   return images.value.sort((a, b) => {
     return defaultOrder.indexOf(a.name) - defaultOrder.indexOf(b.name);
   });
 }
});

watch(() => rankStore.rankedElements, (newRankedElements) => {
 console.log('排名已更新:', newRankedElements);
}, { deep: true });

// 存储 fabric canvas 实例
let canvasInstance: fabric.Canvas | null = null;
// 全局记录大长方形A对象，用于边界判断
let outerRect: fabric.Rect;

// 工具函数：根据给定坐标数据计算 left、top、width、height
function calcRectParams(coords: number[][], scale: number) {
 const left = coords[0][0] * scale;
 const top = coords[0][1] * scale;
 const width = (coords[1][0] - coords[0][0]) * scale;
 const height = (coords[2][1] - coords[0][1]) * scale;
 return { left, top, width, height };
}

// 辅助函数，创建矩形对象
function createRect(
 coords: number[][],
 scale: number,
 offsetX: number,
 offsetY: number,
 options: fabric.IRectOptions = {}
) {
 const params = calcRectParams(coords, scale);
 return new fabric.Rect({
   left: offsetX + params.left,
   top: offsetY + params.top,
   width: params.width,
   height: params.height,
   ...options
 });
}

// 边界约束：拖拽时确保对象不超出 outerRect
function constrainToBounds(obj: fabric.Object) {
 if (!outerRect) return;
 obj.setCoords();
 const objBounds = obj.getBoundingRect();
 const outerBounds = outerRect.getBoundingRect();
 let dx = 0, dy = 0;
 if (objBounds.left < outerBounds.left) {
   dx = outerBounds.left - objBounds.left;
 }
 if (objBounds.top < outerBounds.top) {
   dy = outerBounds.top - objBounds.top;
 }
 if (objBounds.left + objBounds.width > outerBounds.left + outerBounds.width) {
   dx = (outerBounds.left + outerBounds.width) - (objBounds.left + objBounds.width);
 }
 if (objBounds.top + objBounds.height > outerBounds.top + outerBounds.height) {
   dy = (outerBounds.top + outerBounds.height) - (objBounds.top + objBounds.height);
 }
 if (dx !== 0 || dy !== 0) {
   obj.left += dx;
   obj.top += dy;
   obj.setCoords();
 }
}

// 缩放约束：确保对象不超出 outerRect，且对于 Icon 与 Visualization 强制等比缩放
function scalingConstraint(e: fabric.TEvent<any>) {
 const obj = e.target;
 if (!obj || !outerRect) return;
 obj.setCoords();
 const objBounds = obj.getBoundingRect();
 const outerBounds = outerRect.getBoundingRect();

 // 强制等比缩放：如果对象的 tooltipType 为 'icon' 或 'visualization'
 if ((obj as any).tooltipType === 'icon' || (obj as any).tooltipType === 'visualization') {
   obj.scaleY = obj.scaleX;
   obj.setCoords();
 }
 
 if (
   objBounds.left < outerBounds.left ||
   objBounds.top < outerBounds.top ||
   (objBounds.left + objBounds.width) > (outerBounds.left + outerBounds.width) ||
   (objBounds.top + objBounds.height) > (outerBounds.top + outerBounds.height)
 ) {
   if (obj.lastValidState) {
     obj.set({
       scaleX: obj.lastValidState.scaleX,
       scaleY: obj.lastValidState.scaleY,
       left: obj.lastValidState.left,
       top: obj.lastValidState.top
     });
     obj.setCoords();
   }
 } else {
   obj.lastValidState = {
     scaleX: obj.scaleX,
     scaleY: obj.scaleY,
     left: obj.left,
     top: obj.top
   };
 }
}



// 主点击处理函数
async function handleImageClick(image: { name: string, src: string }) {
 const width = heightWidthStore.width;
 const height = heightWidthStore.height;
 const json_data = uploadStore.uploadResult;
 console.log('点击了图片:', image.name);
 if (image.name == 'Star') {
   layoutData.value = await layoutRequest('star',json_data,[width,height]);

 }else if (image.name == 'Grid') {
   layoutData.value = await layoutRequest('grid',json_data,[width,height]);
 }else if (image.name == 'PortraitGrid') {
   layoutData.value = await layoutRequest('grid_protrait',json_data,[width,height]);
 }else if (image.name == 'Portrait') {
   layoutData.value = await layoutRequest('portrait',json_data,[width,height]);
 }else if (image.name == 'Landscape') {
   layoutData.value = await layoutRequest('landscape',json_data,[width,height]);
 }
 else {
   console.log('无对应布局数据');
   return;
 }
 layoutStore.setType(image.name);
 layoutStore.setLayoutData(layoutData.value);
 console.log('layoutStore:', layoutStore.type, layoutStore.layoutData);
 
 const canvasEl = document.querySelector('#layout-canvas') as HTMLCanvasElement;
 if (!canvasEl) return;
 const parentEl = canvasEl.parentElement;
 if (!parentEl) return;
 const containerWidth = parentEl.clientWidth;
 const containerHeight = parentEl.clientHeight;
 canvasEl.width = containerWidth;
 canvasEl.height = containerHeight;
 
 if (canvasInstance) {
   canvasInstance.dispose();
   canvasInstance = null;
 }
 
 canvasInstance = new fabric.Canvas('layout-canvas', {
   selection: false,
 });
 
 const originalWidth = heightWidthStore.width;
 const originalHeight = heightWidthStore.height;
 const scaleFactor = Math.min(containerWidth / originalWidth, containerHeight / originalHeight);
 const offsetX = (containerWidth - originalWidth * scaleFactor) / 2;
 const offsetY = (containerHeight - originalHeight * scaleFactor) / 2;
 
 // 绘制大长方形A（背景矩形），不可选中
 outerRect = new fabric.Rect({
   left: offsetX,
   top: offsetY,
   width: originalWidth * scaleFactor,
   height: originalHeight * scaleFactor,
   fill: '#fff',
   selectable: false
 });
 canvasInstance.add(outerRect);
 
 // 收集各类对象（数组顺序将决定图层顺序）
 const arrVGBg: fabric.Object[] = [];
 const arrKGBg: fabric.Object[] = [];
 const arrTitle: fabric.Object[] = [];
 const arrVGSubtitle: fabric.Object[] = [];
 const arrKGText: fabric.Object[] = [];
 const arrKGVis: fabric.Object[] = [];
 const arrKGIcon: fabric.Object[] = [];
 const arrKGHighlight: fabric.Object[] = [];
 
 // Title（单个对象）
 if (layoutData.value.Title) {
   const titleRect = createRect(
     layoutData.value.Title,
     scaleFactor,
     offsetX,
     offsetY,
     {
       fill: '#D0D0D0',
       selectable: true,
       hasControls: true,
       tooltipText: 'title'
     }
   );
   arrTitle.push(titleRect);
 }
 
 // 遍历所有 VG（属性名以 "VG" 开头）
 Object.keys(layoutData.value).forEach(vgKey => {
   if (vgKey.startsWith('VG')) {
     const vgData = layoutData.value[vgKey];
     const vgIndex = vgKey.replace('VG', '');
     // VG 背景（coords 必须存在）
     if (vgData.coords) {
       const vgRect = createRect(
         vgData.coords,
         scaleFactor,
         offsetX,
         offsetY,
         {
           fill: '#E4E4E4',
           selectable: false
         }
       );
       arrVGBg.push(vgRect);
     }
     // VG Subtitle
     if (vgData.Subtitle) {
       const subRect = createRect(
         vgData.Subtitle,
         scaleFactor,
         offsetX,
         offsetY,
         {
           fill: '#D0D0D0',
           selectable: true,
           hasControls: true,
           tooltipText: `VG${vgIndex}, subtitle`
         }
       );
       arrVGSubtitle.push(subRect);
     }
     
     // 遍历 VG 内的 KG（属性名以 "KG" 开头）
     Object.keys(vgData).forEach(kgKey => {
       if (kgKey.startsWith('KG')) {
         const kgData = vgData[kgKey];
         // KG 背景
         if (kgData.coords) {
           const kgRect = createRect(
             kgData.coords,
             scaleFactor,
             offsetX,
             offsetY,
             {
               fill: '#F3F3F3',
               selectable: false
             }
           );
           arrKGBg.push(kgRect);
         }
         // KG 内部组件：顺序为 Highlight（最上层）、Icon、Vis
         // 这里先收集 Icon、Vis、Highlight分别放入对应数组
         if (kgData.Text) {
           const textRect = createRect(
             kgData.Text,
             scaleFactor,
             offsetX,
             offsetY,
             {
               fill: '#DFD7EE',
               selectable: true,
               hasControls: true,
               tooltipText: `VG${vgIndex}, ${kgKey}, visualization`,
               tooltipType: 'visualization'
             }
           );
           arrKGText.push(textRect);
         }
         if (kgData.Vis) {
           const visRect = createRect(
             kgData.Vis,
             scaleFactor,
             offsetX,
             offsetY,
             {
               fill: '#EEECD7',
               selectable: true,
               hasControls: true,
               tooltipText: `VG${vgIndex}, ${kgKey}, visualization`,
               tooltipType: 'visualization'
             }
           );
           arrKGVis.push(visRect);
         }
         if (kgData.Icon) {
           const iconRect = createRect(
             kgData.Icon,
             scaleFactor,
             offsetX,
             offsetY,
             {
               fill: '#EED7D7',
               selectable: true,
               hasControls: true,
               tooltipText: `VG${vgIndex}, ${kgKey}, icon`,
               tooltipType: 'icon'
             }
           );
           arrKGIcon.push(iconRect);
         }
         if (kgData.Highlight) {
           const highlightRect = createRect(
             kgData.Highlight,
             scaleFactor,
             offsetX,
             offsetY,
             {
               fill: '#D7E3EE',
               selectable: true,
               hasControls: true,
               tooltipText: `VG${vgIndex}, ${kgKey}, highlight`
             }
           );
           arrKGHighlight.push(highlightRect);
         }
       }
     });
   }
 });
 
 // 添加到 canvas 的顺序（底层在前，上层在后）
 // 顺序：Title + VG 背景  ->  KG 背景  ->  VG Subtitle  ->  KG Visualization  ->  KG Icon  ->  KG Highlight
 arrVGBg.forEach(obj => canvasInstance.add(obj));
 arrKGBg.forEach(obj => canvasInstance.add(obj));
 arrTitle.forEach(obj => canvasInstance.add(obj));
 arrVGSubtitle.forEach(obj => canvasInstance.add(obj));
 arrKGText.forEach(obj => canvasInstance.add(obj));
 arrKGVis.forEach(obj => canvasInstance.add(obj));
 arrKGIcon.forEach(obj => canvasInstance.add(obj));
 arrKGHighlight.forEach(obj => canvasInstance.add(obj));
 
 // 事件：拖拽时限制对象不超出 outerRect
 canvasInstance.on('object:moving', (e) => {
   const obj = e.target;
   constrainToBounds(obj);
 });
 
 // 事件：缩放时限制边界并对 icon 与 visualization 强制等比缩放
 canvasInstance.on('object:scaling', scalingConstraint);
}
</script>

<style scoped>
.order-first {
 order: -1;
 margin-bottom: 0.5rem;
}
</style>
