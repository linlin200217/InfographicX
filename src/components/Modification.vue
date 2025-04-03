<template>
  <div class="h-full w-full bg-[#FFFFFF] rounded-lg drop-shadow-lg p-1">
    <div class="flex items-center gap-4">
      <button class="p-2 bg-white hover:bg-pink-100 rounded" @click.stop="(e) => showStylePopup('line', e)">
        <img src="../assets/line-icon.png" alt="Select" class="w-8 h-8" />
      </button>
      <button class="p-2 bg-white hover:bg-pink-100 rounded" @click.stop="(e) => showStylePopup('rectLine', e)">
        <img src="../assets/rect-icon.png" alt="Select" class="w-8 h-8" />
      </button>

      <button class="p-2 bg-white hover:bg-pink-100 rounded" @click.stop="drawText">
        <img src="../assets/Text.png" alt="Text" class="w-8 h-8" />
      </button>
      <button class="p-2 bg-white hover:bg-pink-100 rounded" @click.stop="saveAsImage">
        <img src="../assets/down-icon.png" alt="Text" class="w-8 h-8" />
      </button>
      <!-- <button class="p-2 bg-white hover:bg-pink-100 rounded">
                <img src="../assets/Shape.png" alt="Shape" class="w-8 h-8">
            </button>
            <button class="p-2 bg-white hover:bg-pink-100 rounded">
                <img src="../assets/Color.png" alt="Color" class="w-8 h-8">
            </button>
            <div class="h-8 w-px bg-gray-300"></div>
            <button class="p-2 bg-white hover:bg-pink-100 rounded">
                <img src="../assets/Font Size.png" alt="Font Size" class="w-8 h-8">
            </button>
            <select class="p-0.5 border rounded">
                <option>Font</option>
            </select>
            <select class="p-0.5 border rounded">
                <option>Size</option>
            </select> -->
    </div>
    <div v-if="showTextTooltip" class="text-tooltip">
      请在画布上单击插入文本
    </div>

    <!-- 颜色选择器弹窗 -->
     <teleport to="body">
    <div v-if="showColorPicker" @click.stop="()=>{}" prevent-capture="true" class="color-picker-popup draw-sel" :style="colorPickerStyle">
      <Chrome v-model="pickerColor" />
      <div class="color-picker-buttons">
        <button @click.stop="showColorPicker = false" class="cancel-button">取消</button>
        <button @click.stop="confirmColor" class="confirm-button">确定</button>
      </div>
    </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from "vue";
  import { Chrome } from '@ckpack/vue-color';

  const emit = defineEmits(["drawClick", "drawText", "saveAsImage"]);
  const showTextTooltip = ref(false);
  const showColorPicker = ref(false);
  const pickerColor = ref("#000000");
  const colorPickerStyle = ref({ top: '0px', left: '0px' });
  let startButton: HTMLButtonElement | null = null;
  let controlsContainer: HTMLDivElement | null = null;
  let popup: HTMLElement | null = null;
  let currentType: string = "";
  let colorPreview: HTMLElement | null = null;

  const selectedStyle = ref("solid");
  const selectedColor = ref("#000000");
  const selectedWidth = ref("1");
  const selectedRadius = ref("0");
// const selectedWidth

  const confirmColor = () => {
    let newColor = pickerColor.value;
    if (typeof newColor === 'object' && newColor.hex) {
      selectedColor.value = newColor.hex;
    } else if (typeof newColor === 'string') {
      selectedColor.value = newColor;
    }
    showColorPicker.value = false;
  };

  const createPopup = () => {
    if (popup) return popup;

    popup = document.createElement("div");
    popup.style.cssText = `
        position: fixed;
        background: white;
        padding: 12px;
        top: -100px;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        display: none;
        width: 220px;
    `;

    // 添加箭头容器
    const arrowContainer = document.createElement("div");
    arrowContainer.style.cssText = `
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 16px;
        height: 16px;
        background: white;
        transform: translateX(-50%) rotate(45deg);
        box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
    `;

    const title = document.createElement("div");
    title.textContent = "选择线条样式";
    title.style.marginBottom = "5px";
    title.style.fontWeight = "bold";
    title.style.fontSize = "14px";

    // 添加操作提示
    const tips = document.createElement("div");
    tips.textContent = "提示：点击可微调操作，按Delete 或 ctrl+backspace键删除";
    tips.style.cssText = `
        font-size: 11px;
        color: #1e90ff;
        margin-bottom: 4px;
        padding: 0 4px;
        line-height: 1.4;
        word-wrap: break-word;
        width: 100%;
    `;

    const styleContainer = document.createElement("div");
    styleContainer.style.display = "flex";
    styleContainer.style.gap = "8px";

    const solidBtn = document.createElement("button");
    solidBtn.textContent = "实线";
    solidBtn.style.cssText = `
        padding: 4px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        background: white;
        transition: all 0.2s ease;
        font-size: 13px;
        position: relative;
    `;

    solidBtn.onmouseover = () => {
      if (selectedStyle.value !== "solid") {
        solidBtn.style.backgroundColor = "#1e90ff";
        solidBtn.style.color = "white";
        solidBtn.style.borderColor = "#1e90ff";
      }
    };

    solidBtn.onmouseout = () => {
      if (selectedStyle.value !== "solid") {
        solidBtn.style.backgroundColor = "white";
        solidBtn.style.color = "black";
        solidBtn.style.borderColor = "#ddd";
      }
    };

    solidBtn.onclick = (e) => {
      e.stopPropagation();
      selectedStyle.value = "solid";
      // 更新按钮样式
      solidBtn.style.cssText = `
            padding: 4px 12px;
            border: 1px solid #1e90ff;
            border-radius: 4px;
            cursor: pointer;
            background: #1e90ff;
            transition: all 0.2s ease;
            font-size: 13px;
            position: relative;
            color: white;
            box-shadow: 0 2px 4px rgba(30, 144, 255, 0.2);
        `;
      dashedBtn.style.cssText = `
            padding: 4px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            background: white;
            transition: all 0.2s ease;
            font-size: 13px;
            position: relative;
            color: black;
        `;
    };

    const dashedBtn = document.createElement("button");
    dashedBtn.textContent = "虚线";
    dashedBtn.style.cssText = `
        padding: 4px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        background: white;
        transition: all 0.2s ease;
        font-size: 13px;
        position: relative;
    `;

    dashedBtn.onmouseover = () => {
      if (selectedStyle.value !== "dashed") {
        dashedBtn.style.backgroundColor = "#1e90ff";
        dashedBtn.style.color = "white";
        dashedBtn.style.borderColor = "#1e90ff";
      }
    };

    dashedBtn.onmouseout = () => {
      if (selectedStyle.value !== "dashed") {
        dashedBtn.style.backgroundColor = "white";
        dashedBtn.style.color = "black";
        dashedBtn.style.borderColor = "#ddd";
      }
    };

    dashedBtn.onclick = (e) => {
      e.stopPropagation();
      selectedStyle.value = "dashed";
      // 更新按钮样式
      dashedBtn.style.cssText = `
            padding: 4px 12px;
            border: 1px solid #1e90ff;
            border-radius: 4px;
            cursor: pointer;
            background: #1e90ff;
            transition: all 0.2s ease;
            font-size: 13px;
            position: relative;
            color: white;
            box-shadow: 0 2px 4px rgba(30, 144, 255, 0.2);
        `;
      solidBtn.style.cssText = `
            padding: 4px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
            background: white;
            transition: all 0.2s ease;
            font-size: 13px;
            position: relative;
            color: black;
        `;
    };

    styleContainer.appendChild(solidBtn);
    styleContainer.appendChild(dashedBtn);
    popup.appendChild(title);
    popup.appendChild(tips);
    popup.appendChild(styleContainer);

    // 创建一个容器来包含颜色选择器、线条粗细选择器和圆角选择器
    controlsContainer = document.createElement("div");
    controlsContainer.style.cssText = `
        display: flex;
        gap: 8px;
        margin-top: 8px;
    `;

    // 颜色选择器容器
    const colorContainer = document.createElement("div");
    colorContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 2px;
        width: 33.33%;
    `;

    const colorLabel = document.createElement("div");
    colorLabel.textContent = "线条颜色";
    colorLabel.style.cssText = `
        font-size: 12px;
        color: #666;
    `;

    colorPreview = document.createElement("div");
    colorPreview.style.cssText = `
        width: 100%;
        height: 32px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        background-color: ${selectedColor.value};
    `;

    // 更新颜色预览框的背景色
    const updateColorPreview = () => {
        if (colorPreview) {
            colorPreview.style.backgroundColor = selectedColor.value;
        }
    };

    // 监听 selectedColor 变化
    watch(selectedColor, () => {
        updateColorPreview();
    });

    colorPreview.onclick = (e) => {
        e.stopPropagation();
        if (colorPreview) {
            const rect = colorPreview.getBoundingClientRect();
            colorPickerStyle.value = {
                top: `${rect.top - 290 - 5}px`,
                left: `${rect.left}px`,
                // top:'-400px',
                // left:'-150px',
                zIndex:'1990'
               
            };
            pickerColor.value = selectedColor.value; // 设置当前颜色
            showColorPicker.value = true;
        }
    };

    colorContainer.appendChild(colorLabel);
    colorContainer.appendChild(colorPreview);

    // 线条粗细选择器容器
    const widthContainer = document.createElement("div");
    widthContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 2px;
        width: 33.33%;
    `;

    const widthLabel = document.createElement("div");
    widthLabel.textContent = "线条粗细";
    widthLabel.style.cssText = `
        font-size: 12px;
        color: #666;
    `;

    const widthSelect = document.createElement("select");
    widthSelect.style.cssText = `
        width: 100%;
        height: 32px;
        padding: 0 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
    `;

    const widthOptions = [1, 2, 3, 5, 8, 15];
    widthOptions.forEach(value => {
        const option = document.createElement("option");
        option.value = value.toString();
        option.textContent = value.toString();
        widthSelect.appendChild(option);
    });

    widthSelect.value = selectedWidth.value;
    widthSelect.onchange = (e) => {
      selectedWidth.value = (e.target as HTMLSelectElement).value;
    };

    widthContainer.appendChild(widthLabel);
    widthContainer.appendChild(widthSelect);

    controlsContainer.appendChild(colorContainer);
    controlsContainer.appendChild(widthContainer);
    popup.appendChild(controlsContainer);

    // 添加开始绘制按钮
    startButton = document.createElement("button");
    startButton.textContent = "开始绘制";
    startButton.style.cssText = `
        margin-top: 8px;
        width: 100%;
        padding: 8px;
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
    `;

    if (startButton) {
      startButton.onmouseover = () => {
        if (startButton) {
          startButton.style.backgroundColor = "#357abd";
        }
      };

      startButton.onmouseout = () => {
        if (startButton) {
          startButton.style.backgroundColor = "#4a90e2";
        }
      };

      startButton.onclick = (e) => {
        e.stopPropagation();
        if (!popup) return;
        const radiusSelect = popup.querySelector('select') as HTMLSelectElement;
        startDrawing(radiusSelect ? radiusSelect.value : "0");
      };
    }

    popup.appendChild(startButton);
    popup.appendChild(arrowContainer);
    document.body.appendChild(popup);

    return popup;
  };

  const showStylePopup = (type: string, event: MouseEvent) => {
    event.stopPropagation();

    const button = event.currentTarget as HTMLElement;
    const buttonRect = button.getBoundingClientRect();

    if (!popup || !controlsContainer) {
      popup = createPopup();
    }

    currentType = type;

    // 移除已存在的圆角选择器（如果有）
    const existingRadiusContainer = popup.querySelector('.radius-container');
    if (existingRadiusContainer) {
      existingRadiusContainer.remove();
    }

    // 如果是矩形，添加圆角选择器
    if (type === 'rectLine' && controlsContainer) {
      const radiusContainer = document.createElement("div");
      radiusContainer.className = 'radius-container';
      radiusContainer.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: 2px;
          width: 33.33%;
      `;

      const radiusLabel = document.createElement("div");
      radiusLabel.textContent = "圆角大小";
      radiusLabel.style.cssText = `
          font-size: 12px;
          color: #666;
      `;

      const radiusSelect = document.createElement("select");
      radiusSelect.style.cssText = `
          width: 100%;
          height: 32px;
          padding: 0 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
      `;

      const radiusOptions = [0, 5, 10, 20, 25, 30];
      radiusOptions.forEach(value => {
          const option = document.createElement("option");
          option.value = value.toString();
          option.textContent = value.toString();
          radiusSelect.appendChild(option);
      });
      radiusSelect.value = selectedRadius.value;
      radiusSelect.onchange = (e) => {
        selectedRadius.value = (e.target as HTMLSelectElement).value;
      };

      radiusContainer.appendChild(radiusLabel);
      radiusContainer.appendChild(radiusSelect);
      controlsContainer.appendChild(radiusContainer);
    }

    popup.style.display = "block";
    popup.style.top = `${buttonRect.top - popup.offsetHeight - 10}px`;
    popup.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
    popup.style.transform = "translateX(-50%)";
  };

  const drawText = () => {
    console.log("drawText");
    // 如果气泡窗是打开的，先关闭它
    if (popup && popup.style.display === "block") {
      hidePopup();
    }
    showTextTooltip.value = true;
    emit("drawText");
    
    // 1.5秒后自动隐藏提示
    setTimeout(() => {
      showTextTooltip.value = false;
    }, 1500);
  };

  const saveAsImage = () => {
    console.log("saveAsImage");
    emit("saveAsImage");
  };

  const hidePopup = () => {
    // Reset values after starting to draw
    // selectedStyle.value = "solid";
    // selectedColor.value = "#000000";
    // selectedWidth.value = "1";

    // Update button styles
    if (!popup) return;

    const solidBtn = popup.querySelector("button:nth-child(1)") as HTMLButtonElement;
    const dashedBtn = popup.querySelector("button:nth-child(2)") as HTMLButtonElement;
    const colorPicker = popup.querySelector('input[type="color"]') as HTMLInputElement;
    const widthSelect = popup.querySelector('select') as HTMLSelectElement;

    // if (solidBtn) {
    //   solidBtn.style.cssText = `
    //         padding: 4px 12px;
    //         border: 1px solid #1e90ff;
    //         border-radius: 4px;
    //         cursor: pointer;
    //         background: #1e90ff;
    //         transition: all 0.2s ease;
    //         font-size: 13px;
    //         position: relative;
    //         color: white;
    //         box-shadow: 0 2px 4px rgba(30, 144, 255, 0.2);
    //     `;
    // }

    // if (dashedBtn) {
    //   dashedBtn.style.cssText = `
    //         padding: 4px 12px;
    //         border: 1px solid #ddd;
    //         border-radius: 4px;
    //         cursor: pointer;
    //         background: white;
    //         transition: all 0.2s ease;
    //         font-size: 13px;
    //         position: relative;
    //         color: black;
    //     `;
    // }

    // if (colorPicker) {
    //   colorPicker.value = "#000000";
    // }

    // if (widthSelect) {
    //   widthSelect.value = "1";
    // }

    if (popup) {
      popup.style.display = "none";
    }
  };

  // 点击其他地方关闭弹窗
  const closePopup = (e: MouseEvent) => {
    if(showColorPicker.value){
      showColorPicker.value = false;
    }
    if (popup && !popup.contains(e.target as Node)) {
      hidePopup();
    }
  };

  onMounted(() => {
    document.addEventListener("click", closePopup);
  });

  onUnmounted(() => {
    document.removeEventListener("click", closePopup);
    if (popup) {
      popup.remove();
      popup = null;
    }
  });

  const startDrawing = (radius: string) => {
    console.log("startDrawing",radius,selectedRadius.value,selectedWidth.value);
    const params = {
      type: currentType,
      lineStyle: selectedStyle.value,
      color: selectedColor.value,
      radius: parseInt(selectedRadius.value),
      width: parseInt(selectedWidth.value)
    };

    emit("drawClick", params);
    hidePopup();
  };
</script>

<style scoped>
  .hover\:bg-pink-100:hover {
    background-color: #fce4ec;
  }

  .popup-color {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .color-label {
    font-size: 12px;
    color: #666;
  }

  .color-picker {
    width: 100%;
    height: 32px;
    padding: 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  }

  .start-drawing-button {
    width: 100%;
    padding: 8px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .start-drawing-button:hover {
    background-color: #357abd;
  }

  .text-tooltip {
    position: fixed;
    left: 50%;
    top: -100%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 1000;
    animation: fadeInOut 1.5s ease-in-out;
  }

  @keyframes fadeInOut {
    0% { opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { opacity: 0; }
  }

  .color-picker-popup {
    position: fixed;
    z-index: 1990;
    background: white;
    padding: 8px;
    border-radius: 4px;
    top: 100px;
    left: 100px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .color-picker-popup :deep(.vc-chrome) {
    width: 225px !important;
    font-family: inherit;
  }

  .color-picker-popup :deep(.vc-chrome-body) {
    padding: 8px !important;
  }

  .color-picker-popup :deep(.vc-chrome-controls) {
    display: flex;
    padding-top: 4px;
  }

  .color-picker-popup :deep(.vc-chrome-fields) {
    padding-top: 4px;
  }

  .color-picker-popup :deep(.vc-chrome-fields .vc-input__input) {
    width: 80px !important;
    height: 20px !important;
    font-size: 11px !important;
  }

  .color-picker-popup :deep(.vc-chrome-fields .vc-input__label) {
    font-size: 11px !important;
  }

  .color-picker-popup :deep(.vc-chrome-active-color) {
    width: 20px !important;
    height: 20px !important;
  }

  .color-picker-popup :deep(.vc-chrome-saturation-wrap) {
    height: 100px !important;
  }

  .color-picker-popup :deep(.vc-chrome-hue-wrap) {
    height: 10px !important;
  }

  .color-picker-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }

  .cancel-button {
    padding: 4px 12px;
    font-size: 12px;
    color: #666;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 3px;
    cursor: pointer;
  }

  .confirm-button {
    padding: 4px 12px;
    font-size: 12px;
    color: #fff;
    background: #4a90e2;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }

  .cancel-button:hover {
    background: #e8e8e8;
  }

  .confirm-button:hover {
    background: #357abd;
  }
</style>
