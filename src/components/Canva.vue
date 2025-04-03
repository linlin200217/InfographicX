<template>
  <!-- 外层容器：添加拖拽事件，并使用 overflow: hidden 限制超出部分 -->
  <div ref="container" class="h-full w-full flex items-center justify-center">
    <!-- 
   :style="{
        // border: '1px solid red',
        width: '100%',
        height: '100%',
        backgroundColor: `#${BackgroundColor}`,
        // position: 'absolute',
      }"
  -->
    <canvas id="canva-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, reactive, watch } from "vue";
  import axios from "axios";
  import * as fabric from "fabric";
  import { useLayoutStore } from "../stores/layout";
  import { useHeightWidthStore } from "../stores/heightWidth";
  import { useUploadStore } from "../stores/uploadStore";
  import { useStyleStore } from "../stores/styleStore";
  import { generateIcon } from "../api/icon";
  import { drawChart } from "../components/Visualization";
  import { CanvasDrawer } from "./Canva";

  // 定义 emit
  const emit = defineEmits(["objectSelected"]);

  const styleStore = useStyleStore();
  const uploadStore = useUploadStore();
  const json_data = ref({});

  const layoutStore = useLayoutStore();
  const heightWidthStore = useHeightWidthStore();
  const layoutData0 = ref({});
  const canScale = ref(1);

  let canvasInstance = null;
  let CanvasDrawer0 = null;

  // 全局记录大长方形A对象，用于边界判断
  let outerRect: fabric.Rect;

  // 数据结构定义
  interface TextElement {
    text: string;
    color: number[];
    font: string;
    "font-size": number;
    coordinates: number[][];
    H1?: string | null;
    H1_font?: string | null;
    H1_color?: number[] | null;
    H1_size?: number | null;
    H2?: string | null;
    H2_font?: string | null;
    H2_color?: number[] | null;
    H2_font_style?: string | null;
  }

  interface IconElement {
    path: string;
    coordinates: number[][];
    svgContent?: string;
  }

  interface KG {
    Text?: TextElement;
    Highlight?: TextElement;
    Icon?: IconElement;
    Vis?: IconElement;
    coordinates: number[][];
  }

  interface VG {
    Subtitle?: TextElement;
    KGs: KG[];
    coordinates: number[][];
  }

  interface Infographic {
    Title?: TextElement;
    VGs: VG[];
  }

  const initMouseDown = () => {
    canvasInstance.on("mouse:down", (e) => {
      const target = canvasInstance.findTarget(e.e);
      // 检查是否是画线模式
      if (CanvasDrawer0 && CanvasDrawer0.isDrawing) {
        return; // 如果是画线模式，不处理选择
      }

      if (target) {
        // 检查是否是生成的对象
        if (target.generatedFromData) {

          // 获取或创建对象ID
          let objectId = target.id;
          if (!objectId) {
            // 使用对象的唯一属性组合作为ID
            objectId = `${target.type}-${target.tooltipText || ""}-${Date.now()}`;
            target.id = objectId;
          }

          // target.bringToFront()

          // 根据对象类型设置不同的属性
          let selectedObject = {
            type: target.type || "unknown",
            opacity: target.opacity || 1,
            id: objectId,
            tooltipText: target.tooltipText,
            tooltipType: target.tooltipType,
            ...(target.type === "textbox" || target.type === "i-text"
              ? {
                  fontSize: target.fontSize,
                  fontFamily: target.fontFamily,
                  fill: target.fill,
                  text: target.text,
                  color: target.fill,
                }
              : {}),
          };

          if (target.tooltipType === "titleBg") {
            selectedObject.fill = target.fill;
          }

          // 发送选中事件到父组件
          emit("objectSelected", selectedObject);
        } else {
          console.log("No generated object found at click position");
          emit("objectSelected", null);
        }
      } else {
        console.log("No target found at click position");
        emit("objectSelected", null);
      }
    });
  };

  const generateCanva = async () => {
    const canvasEl = document.querySelector("#canva-canvas") as HTMLCanvasElement;
    if (!canvasEl) return;
    const parentEl = canvasEl.parentElement;
    if (!parentEl) return;
    const containerWidth = parentEl.clientWidth;
    const containerHeight = parentEl.clientHeight;
    canvasEl.width = containerWidth;
    canvasEl.height = containerHeight;

    // 清理所有正在进行的 setTimeout
    // const highestTimeoutId = window.setTimeout(() => {}, 0);
    // for (let i = 0; i < highestTimeoutId; i++) {
    //   window.clearTimeout(i);
    // }

    let mirrorCanvas = layoutStore.mirrorCanvas;
    if (canvasInstance) {
      canvasInstance.dispose();
      canvasInstance = null;
    }

    canvasInstance = new fabric.Canvas("canva-canvas", {
      selection: true,
      preserveObjectStacking: true,
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
      fill: `rgb(${styleStore.backgroundColor.join(",")})`,
      selectable: false,
      hasControls: false,
      moveable: false,
      lockMovementX: true,
      lockMovementY: true,
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
    if (layoutData0.value?.Title) {
      const titleRect = createRect(layoutData0.value.Title, scaleFactor, offsetX, offsetY, {
        fill: "#F8F8F8",
        selectable: true,
        hasControls: true,
        tooltipText: `VG${"top"}, titleBg`,
        tooltipType: "titleBg",
        id: `icon-${"titleBg"}-${Date.now()}`,
        generatedFromData: true,
        titleBg: true,
        lockZIndex: true,
        z: 10,
      });

      const params = calcRectParams(layoutData0.value.Title, scaleFactor);
      const titleText = new fabric.Textbox(json_data.value.title, {
        left: offsetX + layoutData0.value.Title[0][0] * scaleFactor + 10,
        top: offsetY + 10,
        width: params.width - 15,
        height: params.height,
        fontSize: 22, // 初始字体大小（较小值）
        fontFamily: styleStore.firstLevelFont,
        fill: `rgb(${styleStore.firstLevelColor.join(",")})`,
        lineHeight: 3,
        generatedFromData: true,
        lockScalingY: true,
        z: 20,
      });
      arrTitle.push(titleRect);
      arrTitle.push(titleText);
    }

    // 遍历所有 VG（属性名以 "VG" 开头）
    Object.keys(layoutData0.value).forEach((vgKey) => {
      if (vgKey.startsWith("VG")) {
        const vgData = layoutData0.value?.[vgKey];
        const vgIndex = vgKey.replace("VG", "");
        // VG 背景（coords 必须存在）
        if (vgData?.coords) {
          const vgRect = createRect(vgData.coords, scaleFactor, offsetX, offsetY, {
            fill: "#E4E4E4",
            selectable: false,
            generatedFromData: true,
          });
          // arrVGBg.push(vgRect);
        }

        // VG Subtitle
        if (vgData.Subtitle) {
          const subtitleRect = createRect(vgData.Subtitle, scaleFactor, offsetX, offsetY, {
            fill: "#FBFBFB",
            selectable: true,
            hasControls: true,
            tooltipText: `VG${vgIndex}, titleBg`,
            id: `icon-${"titleBg"}-${Date.now()}`,
            tooltipType: "titleBg",
            generatedFromData: true,
            
            titleBg: true,
          });
          if (subtitleRect) {
            arrVGSubtitle.push(subtitleRect);
          }
          const params = calcRectParams(vgData.Subtitle, scaleFactor);
          const subtitleText = new fabric.Textbox(json_data.value.data[vgIndex - 1].subtask_title, {
            left: offsetX + vgData.Subtitle[0][0] * scaleFactor + 2,
            top: vgData.Subtitle[0][1] * scaleFactor + 2,
            width: params.width - 10,
            height: params.height,
            fontSize: 16, // 初始字体大小（较小值）
            fill: `rgb(${styleStore.secondLevelColor.join(",")})`,
            fontFamily: styleStore.secondLevelFont,
            lineHeight: 1,
            generatedFromData: true,
            lockScalingY: true,
          });
          arrVGSubtitle.push(subtitleText);
          // arrVGSubtitle.push(subtitleRect);
        }

        let jsonVgData = json_data.value.data[vgIndex - 1];

        if (layoutData0.value.VisualizationIcon && vgIndex == Object.keys(layoutData0.value).length - 2) {
          const iconApiObj = {
            keyword: layoutData0.value.VisualizationIcon || "",
            colorlist: styleStore.themeColors,
            coordinates: vgData.coords,
          };
          const params = calcRectParams(vgData.coords, scaleFactor);
          setTimeout(async () => {
            const icon = await generateIcon(iconApiObj.keyword, iconApiObj.colorlist, iconApiObj.coordinates);
            if (icon) {
              const blob = new Blob([icon], { type: "image/svg+xml" });
              const iconUrl = URL.createObjectURL(blob);
              fabric.loadSVGFromURL(iconUrl).then((o) => {
                let el = document.createElement("svg");
                el.innerHTML = icon;
                const group = fabric.util.groupSVGElements(o.objects, o.options);
                // group.scaleToWidth(params.width);
                group.scaleToHeight(params.height);
                group.set({
                  left: offsetX + vgData.coords[0][0] * scaleFactor + params.width / 2,
                  top: vgData.coords[0][1] * scaleFactor + params.height / 2,
                  originX: "center",
                  originY: "center",
                  opacity: 1,

                  generatedFromData: true,
                  id: `icon-${vgIndex}-${"star"}-${Date.now()}`,
                  tooltipText: `VG${vgIndex}, ${"star"}icon, visualization`,
                  tooltipType: "visualization",
                });
                group.forEachObject((child) => {
                  child.set({ uniformScaling: false }); // 关键：强制子对象允许非等比缩放
                });
                canvasInstance.add(group);
              });
            }
          }, 0);
        }
        // 遍历 VG 内的 KG（属性名以 "KG" 开头）
        Object.keys(vgData).forEach(async (kgKey) => {
          const kgIndex = kgKey.replace("KG", "");
          if (kgKey.startsWith("KG")) {
            const kgData = vgData[kgKey];
            // KG 背景
            if (kgData.coords) {
              const kgRect = createRect(kgData.coords, scaleFactor, offsetX, offsetY, {
                fill: "#F3F3F3",
                selectable: false,
                generatedFromData: true,
              });
              // arrKGBg.push(kgRect);
            }
            // KG 内部组件：顺序为 Highlight（最上层）、Icon、Vis
            // 这里先收集 Icon、Vis、Highlight分别放入对应数组
            if (kgData.Text) {
              const textRect = createRect(kgData.Text, scaleFactor, offsetX, offsetY, {
                fill: "#DFD7EE",
                selectable: false,
                tooltipText: `VG${vgIndex}, ${kgKey}, text`,
                tooltipType: "text",
                generatedFromData: true,
              });
              // arrKGText.push(textRect);

              const params = calcRectParams(kgData.Text, scaleFactor);

              const kgText = new fabric.Textbox(jsonVgData.knowledges[kgIndex - 1].knowledge_content, {
                left: offsetX + vgData[kgKey].Text[0][0] * scaleFactor + 2,
                top: vgData[kgKey].Text[0][1] * scaleFactor + 1,
                width: params.width,
                height: params.height,
                fontSize: 13, // 初始字体大小（较小值）
                fontFamily: styleStore.textFont,
                fill: `rgb(${styleStore.textColor.join(",")})`,
                lineHeight: 1,
                // splitByGrapheme: true, // 支持中文换行
                selectable: true,
                hasControls: true,
                generatedFromData: true,
                lockScalingY: true,
              });
              let s = jsonVgData.knowledges[kgIndex - 1];
              // if(s.first_level_highlight.indexOf('43')>-1||s.first_level_highlight.indexOf('705')>-1){
              //   console.log(s,'g1026',s.first_level_highlight)
              // }
              function hightlightNum(text: string, str: string) {
                let tarr = str.split(",");
                if (tarr.length > 1 && Number.isNaN(Number(tarr[0]))) {
                  let idx0 = text.indexOf(tarr[0]);
                  let idx1 = text.indexOf(tarr[1]);
                  let len0 = tarr[0].length;
                  let len1 = tarr[1].length;
                  return [
                    [idx0, idx0 + len0],
                    [idx1, idx1 + len1],
                  ];
                } else {
                  let idx = text.indexOf(str);
                  let len = str.length;
                  return [idx, idx + len];
                }
              }

              // if(s.first_level_highlight){
              //   let idxArr1 = hightlightNum(s.knowledge_content,s.first_level_highlight)
              //   console.log(idxArr1,'g1027')
              //   if(Array.isArray(idxArr1[0])){
              //     idxArr1.forEach(item=>{
              //       console.log(item,'g1029')
              //       kgText.setSelectionStyles({
              //         fill:`rgb(${styleStore.firstLevelColor.join(",")})`,
              //       },item[0],item[1])
              //     })
              //   }else{
              //     kgText.setSelectionStyles({
              //       fill:`rgb(${styleStore.firstLevelColor.join(",")})`,
              //     },idxArr1[0],idxArr1[1])
              //   }
              // }
              if (s.second_level_highlight && s.knowledge_content.indexOf(s.second_level_highlight) > -1) {
                let idxArr2 = hightlightNum(s.knowledge_content, s.second_level_highlight);
                if (Array.isArray(idxArr2[0])) {
                  idxArr2.forEach((item) => {
                    kgText.setSelectionStyles(
                      {
                        fill: `rgb(${styleStore.secondLevelColor.join(",")})`,
                        fontFamily: styleStore.secondLevelFont,
                      },
                      item[0],
                      item[1]
                    );
                  });
                } else {
                  kgText.setSelectionStyles(
                    {
                      fill: `rgb(${styleStore.secondLevelColor.join(",")})`,
                      fontFamily: styleStore.secondLevelFont,
                    },
                    idxArr2[0],
                    idxArr2[1]
                  );
                }
              }

              arrKGText.push(kgText);
            }
            if (kgData.Vis) {
              const params = calcRectParams(kgData.Vis, scaleFactor);
              let visObj = drawChart(
                jsonVgData.knowledges[kgIndex - 1].visualization,
                params.width,
                params.height,
                styleStore.themeColors
              );
              let el = document.createElement("svg");
              el.width = params.width;
              el.height = params.height;
              el.innerHTML = visObj.node().outerHTML;
              fabric.loadSVGFromString(el.outerHTML).then((o) => {
                // fabric.loadSVGFromString(el.outerHTML,(o,p) => {
                const group = fabric.util.groupSVGElements(o.objects, o.options);
                const isPie = jsonVgData.knowledges[kgIndex - 1].visualization.type == "single_pie_chart";
                let pieRate = {
                  1: [0.4, 0],
                  2: [0.4, 0.5],
                  3: [0.5, 0.5],
                  4: [0.5, 0.5],
                };
                let degreeInt = 4;
                if (isPie) {
                  let realRate = jsonVgData.knowledges[kgIndex - 1].visualization.data[0].value / 25;
                  realRate = realRate > 4 ? 4 : realRate;
                  degreeInt = Math.ceil(realRate);
                  //  pieRate[1] = [0.4,0.5*realRate/4];
                  //  pieRate[2] = [0.4,0.5*realRate/4];
                  //  pieRate[3] = [0.5,0.5*realRate/4];
                }
                const left =
                  offsetX +
                  kgData.Vis[0][0] * scaleFactor +
                  (!isPie ? params.width / 2 : params.width * pieRate[degreeInt > 4 ? 4 : degreeInt][0]);
                const top =
                  kgData.Vis[0][1] * scaleFactor +
                  (!isPie ? params.height / 2 : params.height * pieRate[degreeInt > 4 ? 4 : degreeInt][1]);
                // group.scaleToWidth(params.width);
                // group.scaleToHeight(params.height);
                group.set({
                  left,
                  top,
                  width: params.width,
                  height: params.height,
                  originX: "center",
                  originY: "center",
                  opacity: 1,
                  selectable: true,
                  hasControls: true,
                  generatedFromData: true,
                  id: `vis-${vgIndex}-${kgKey}-${Date.now()}`,
                  tooltipText: `VG${vgIndex}, ${kgKey}, visualization`,
                  tooltipType: "visualization",
                });
                canvasInstance.add(group);
              });

              // drawChart
              const visRect = createRect(kgData.Vis, scaleFactor, offsetX, offsetY, {
                fill: "#aaECD7",
                selectable: true,
                hasControls: true,
                tooltipText: `VG${vgIndex}, ${kgKey}, visualization`,
                tooltipType: "visualization",
                generatedFromData: true,
              });
              // arrKGVis.push(visRect);
            }
            if (kgData.Icon) {
              const iconApiObj = {
                keyword: jsonVgData.knowledges[kgIndex - 1].icon_keyword,
                colorlist: styleStore.themeColors,
                coordinates: kgData.Icon,
              };
              const params = calcRectParams(kgData.Icon, scaleFactor);
              setTimeout(async () => {
                const icon = await generateIcon(iconApiObj.keyword, iconApiObj.colorlist, iconApiObj.coordinates);
                if (icon) {
                  const blob = new Blob([icon], { type: "image/svg+xml" });
                  const iconUrl = URL.createObjectURL(blob);
                  fabric.loadSVGFromURL(iconUrl).then((o) => {
                    let el = document.createElement("svg");
                    el.innerHTML = icon;
                    const group = fabric.util.groupSVGElements(o.objects, o.options);
                    if (params.width > params.height) {
                      group.scaleToWidth(params.width);
                    } else {
                      group.scaleToHeight(params.height);
                    }
                    group.set({
                      left: offsetX + kgData.Icon[0][0] * scaleFactor + params.width / 2,
                      top: kgData.Icon[0][1] * scaleFactor + params.height / 2,
                      originX: "center",
                      originY: "center",
                      opacity: 1,

                      generatedFromData: true,
                      id: `icon-${vgIndex}-${kgKey}-${Date.now()}`,
                      tooltipText: `VG${vgIndex}, ${kgKey}icon, visualization`,
                      tooltipType: "visualization",
                    });
                    canvasInstance.add(group);
                  });
                }
              }, 0);

              const iconRect = createRect(kgData.Icon, scaleFactor, offsetX, offsetY, {
                fill: "#EED7D7",
                selectable: true,
                hasControls: true,
                tooltipText: `VG${vgIndex}, ${kgKey}, icon`,
                tooltipType: "icon",
                generatedFromData: true,
              });
              // arrKGIcon.push(iconRect);
            }
            if (kgData.Highlight) {
              const highlightRect = createRect(kgData.Highlight, scaleFactor, offsetX, offsetY, {
                fill: "#D7E3EE",
                selectable: true,
                hasControls: true,
                tooltipText: `VG${vgIndex}, ${kgKey}, highlight`,
                generatedFromData: true,
              });
              // arrKGHighlight.push(highlightRect);

              // first_level_highlight
              const params = calcRectParams(kgData.Highlight, scaleFactor);
              const highlightText = new fabric.Textbox(jsonVgData.knowledges[kgIndex - 1].first_level_highlight, {
                left: offsetX + kgData.Highlight[0][0] * scaleFactor + 2,
                top: kgData.Highlight[0][1] * scaleFactor + 1,
                width: params.width,
                height: params.height,
                fontSize: 20, // 初始字体大小（较小值）
                fill: `rgb(${styleStore.firstLevelColor.join(",")})`,
                fontFamily: styleStore.firstLevelFont,
                lineHeight: 1,
                // splitByGrapheme: true, // 支持中文换行/
                generatedFromData: true,
                lockScalingY: true,
              });
              arrKGHighlight.push(highlightText);
            }
          }
        });
      }
    });

    // 添加到 canvas 的顺序（底层在前，上层在后）
    // 顺序：Title + VG 背景  ->  KG 背景  ->  VG Subtitle  ->  KG Visualization  ->  KG Icon  ->  KG Highlight
    arrVGBg.forEach((obj) => canvasInstance.add(obj));
    arrKGBg.forEach((obj) => canvasInstance.add(obj));
    arrTitle.forEach((obj) => canvasInstance.add(obj));
    arrVGSubtitle.forEach((obj) => canvasInstance.add(obj));
    arrKGText.forEach((obj) => canvasInstance.add(obj));
    arrKGVis.forEach((obj) => canvasInstance.add(obj));
    arrKGIcon.forEach((obj) => canvasInstance.add(obj));
    arrKGHighlight.forEach((obj) => canvasInstance.add(obj));

    // 事件：拖拽时限制对象不超出 outerRect
    canvasInstance.on("object:moving", (e) => {
      const obj = e.target;
      constrainToBounds(obj);
    });

    // 事件：缩放时限制边界并对 icon 与 visualization 强制等比缩放
    canvasInstance.on("object:scaling", scalingConstraint);

    // 替换选择事件监听为 mousedown 事件监听
    initMouseDown();

    // 添加 selection:created 事件监听
    canvasInstance.on("selection:created", (e) => {
      const target = e.target;
      if (target && target.generatedFromData) {
        console.log("Selection created:", target);
        // 触发与 mouse:down 相同的选择逻辑
        let objectId = target.id;
        if (!objectId) {
          objectId = `${target.type}-${target.tooltipText || ""}-${Date.now()}`;
          target.id = objectId;
        }

        let selectedObject = {
          type: target.type || "unknown",
          opacity: target.opacity || 1,
          id: objectId,
          tooltipText: target.tooltipText,
          tooltipType: target.tooltipType,
          ...(target.type === "textbox" || target.type === "i-text"
            ? {
                fontSize: target.fontSize,
                fontFamily: target.fontFamily,
                fill: target.fill,
                text: target.text,
              }
            : {}),
        };
        emit("objectSelected", selectedObject);
      }
    });

    // 添加 selection:cleared 事件监听
    canvasInstance.on("selection:cleared", () => {
      console.log("Selection cleared");
      emit("objectSelected", null);
    });
  };

  // 工具函数：根据给定坐标数据计算 left、top、width、height
  function calcRectParams(coords: any, scale: number) {
    if (!coords[0]) return;
    const left = coords[0][0] * scale;
    const top = coords[0][1] * scale;
    const width = (coords[1][0] - coords[0][0]) * scale;
    const height = (coords[2][1] - coords[0][1]) * scale;
    return { left, top, width, height };
  }

  // 辅助函数，创建矩形对象
  function createRect(coords: any, scale: number, offsetX: number, offsetY: number, options: fabric.IRectOptions = {}) {
    if (!coords || !coords[0]) return;
    const params = calcRectParams(coords, scale);
    let s = new fabric.Rect({
      left: offsetX + params.left,
      top: offsetY + params.top,
      width: params.width,
      height: params.height,
      ...options,
    });
    return s;
  }

  // 边界约束：拖拽时确保对象不超出 outerRect
  function constrainToBounds(obj: fabric.Object) {
    if (!outerRect) return;
    obj.setCoords();
    const objBounds = obj.getBoundingRect();
    const outerBounds = outerRect.getBoundingRect();
    let dx = 0,
      dy = 0;
    if (objBounds.left < outerBounds.left) {
      dx = outerBounds.left - objBounds.left;
    }
    if (objBounds.top < outerBounds.top) {
      dy = outerBounds.top - objBounds.top;
    }
    if (objBounds.left + objBounds.width > outerBounds.left + outerBounds.width) {
      dx = outerBounds.left + outerBounds.width - (objBounds.left + objBounds.width);
    }
    if (objBounds.top + objBounds.height > outerBounds.top + outerBounds.height) {
      dy = outerBounds.top + outerBounds.height - (objBounds.top + objBounds.height);
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
    const scale = e.scale;
    if (!obj || !outerRect) return;
    obj.setCoords();
    const objBounds = obj.getBoundingRect();
    const outerBounds = outerRect.getBoundingRect();

    // 强制等比缩放：如果对象的 tooltipType 为 'icon' 或 'visualization'
    if ((obj as any).tooltipType === "icon" || (obj as any).tooltipType === "visualization") {
      obj.scaleY = obj.scaleX;
      obj.setCoords();
    }
    if (
      objBounds.left < outerBounds.left ||
      objBounds.top < outerBounds.top ||
      objBounds.left + objBounds.width > outerBounds.left + outerBounds.width ||
      objBounds.top + objBounds.height > outerBounds.top + outerBounds.height
    ) {
      if (obj.lastValidState) {
        obj.set({
          scaleX: obj.lastValidState.scaleX,
          scaleY: obj.lastValidState.scaleY,
          left: obj.lastValidState.left,
          top: obj.lastValidState.top,
        });
        obj.setCoords();
      }
    } else {
      obj.lastValidState = {
        scaleX: obj.scaleX,
        scaleY: obj.scaleY,
        left: obj.left,
        top: obj.top,
      };
    }
  }

  const updateCanva = () => {
    let s = layoutStore.layoutData;
    layoutData0.value = s;
    json_data.value = uploadStore.uploadResult;
    generateCanva();
  };

  const drawClick = (params: { type: string; lineStyle: string; color: string; radius: number; width: number }) => {
    if (!canvasInstance) return;

    if (!CanvasDrawer0) {
      // 初始化 CanvasDrawer0
      CanvasDrawer0 = new CanvasDrawer(canvasInstance, styleStore);
      // 添加绘制完成事件监听
      CanvasDrawer0.drawingDone(() => {
        console.log("Drawing completed, re-enabling selection");
        initMouseDown();
      });
    }
    CanvasDrawer0.isDrawing = true;
    CanvasDrawer0.initDrawing(params);
  };

  const drawText = () => {
    console.log("drawText");
    if (!canvasInstance) return;
    if (!CanvasDrawer0) {
      // 初始化 CanvasDrawer0
      CanvasDrawer0 = new CanvasDrawer(canvasInstance, styleStore);
      // 添加绘制完成事件监听
      CanvasDrawer0.drawingDone(() => {
        console.log("Drawing completed, re-enabling selection");
        initMouseDown();
        // 重新启用选择功能
        // if (canvasInstance) {
        //   canvasInstance.selection = true;
        //   canvasInstance.renderAll();
        // }
      });
    }
    const params = {
      type: "text",
      lineStyle: "solid",
      color: "#000000",
    };
    CanvasDrawer0.isDrawing = true;
    CanvasDrawer0.initDrawing(params);
  };
  const saveAsImage = () => {
    const svgString = canvasInstance.toSVG({
      viewBox: {
        x: 0,
        y: 0,
        width: canvasInstance.width,
        height: canvasInstance.height,
      },
    });

    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fabric-canvas.svg";
    a.click();
    // URL.revokeObjectURL(url);
    a.remove();
    ElMessage.success("保存成功");
  };

  defineExpose({
    updateCanva,
    drawClick,
    drawText,
    saveAsImage,
    // 添加更新透明度的方法
    updateObjectOpacity: (opacity: number) => {
      if (!canvasInstance) return;
      const activeObject = canvasInstance.getActiveObject();
      if (activeObject) {
        activeObject.set("opacity", opacity);
        canvasInstance.renderAll();
      }
    },
    // 添加删除选中对象的方法
    deleteSelectedObject: () => {
      if (!canvasInstance) return;
      const activeObject = canvasInstance.getActiveObject();
      if (activeObject) {
        canvasInstance.remove(activeObject);
        canvasInstance.renderAll();
      }
    },
    // 添加更新字体大小的方法
    updateObjectFontSize: (fontSize: number) => {
      if (!canvasInstance) return;
      const activeObject = canvasInstance.getActiveObject();
      if (activeObject && (activeObject.type === "textbox" || activeObject.type === "i-text")) {
        activeObject.set("fontSize", fontSize);
        canvasInstance.renderAll();
      }
    },
    // 添加更新字体的方法
    updateObjectFontFamily: (fontFamily: string) => {
      if (!canvasInstance) return;
      const activeObject = canvasInstance.getActiveObject();
      if (activeObject && (activeObject.type === "textbox" || activeObject.type === "i-text")) {
        activeObject.set("fontFamily", fontFamily);
        canvasInstance.renderAll();
      }
    },
    // 添加更新颜色的方法
    updateObjectColor: (color: string) => {
      if (!canvasInstance) return;
      const activeObject = canvasInstance.getActiveObject();
      if (
        activeObject &&
        (activeObject.type === "textbox" || activeObject.type === "i-text" || activeObject.tooltipType === "titleBg")
      ) {
        activeObject.set("fill", color);
        canvasInstance.renderAll();
      }
    },
    // 添加更新文本内容的方法
    updateObjectText: (text: string) => {
      if (!canvasInstance) return;
      const activeObject = canvasInstance.getActiveObject();
      if (activeObject && (activeObject.type === "textbox" || activeObject.type === "i-text")) {
        activeObject.set("text", text);
        canvasInstance.renderAll();
      }
    },
  });

  onMounted(() => {
    // window.addEventListener("resize", updateContainerDimensions);
  });
  onUnmounted(() => {
    // window.removeEventListener("resize", updateContainerDimensions);
  });
</script>

<style scoped>
  /* 如有需要，可添加额外样式 */
</style>
