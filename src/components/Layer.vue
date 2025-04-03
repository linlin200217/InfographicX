<template>
    <div class="layer-panel bg-[#EDE3E7]">
        <div v-if="selectedObject" class="controls-container">
            <!-- 文本对象的控制面板 -->
            <div v-if="selectedObject.type === 'textbox' || selectedObject.type === 'i-text'" class="text-controls">
                <div class="control-group">
                    <div class="control-label">文本内容</div>
                    <textarea
                        class="text-input"
                        :value="selectedObject.text"
                        @input="handleTextChange"
                    ></textarea>
                </div>
                <div class="control-group">
                    <div class="control-label">字体设置</div>
                    <div class="font-controls">
                        <select 
                            class="font-size-select"
                            :value="selectedObject.fontSize"
                            @change="handleFontSizeChange"
                        >
                            <option value="12">12px</option>
                            <option value="13">13px</option>
                            <option value="14">14px</option>
                            <option value="16">16px</option>
                            <option value="18">18px</option>
                            <option value="20">20px</option>
                            <option value="24">24px</option>
                            <option value="28">28px</option>
                            <option value="32">32px</option>
                            <option value="36">36px</option>
                            <option value="40">40px</option>
                            <option value="48">48px</option>
                            <option value="56">56px</option>
                            <option value="64">64px</option>
                            <option value="72">72px</option>
                        </select>
                        <select 
                            class="font-family-select"
                            :value="selectedObject.fontFamily || 'Arial'"
                            @change="handleFontFamilyChange"
                        >
                            <option v-for="font in availableFonts" :key="font" :value="font">
                                {{ font }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="control-group">
                    <div class="control-label">字体颜色</div>
                    <div class="color-picker-container">
                        <div 
                            class="color-preview"
                            :style="{ backgroundColor: displayColor }"
                            @click="handleColorPreviewClick"
                            ref="colorPreview"
                        ></div>
                        <div v-if="showColorPicker" class="color-picker-popup" :style="colorPickerStyle">
                            <Chrome v-model="pickerColor" />
                            <div class="color-picker-buttons">
                                <button @click="showColorPicker = false" class="cancel-button">取消</button>
                                <button @click="handleColorChange" class="confirm-button">确定</button>
                            </div>
                        </div>
                    </div>
                </div>

                <button @click="showDeleteConfirm = true" class="delete-button">
                    删除
                </button>
            </div>

            <!-- 其他类型对象的控制面板 -->
            <div v-else class="other-controls">
                <div class="control-group">
                    <label class="control-label">透明度</label>
                    <input
                        type="range"
                        :value="selectedObject.opacity"
                        @input="handleOpacityChange"
                        min="0"
                        max="1"
                        step="0.1"
                        class="range-input"
                    />
                </div>

                <div class="control-group" v-if="selectedObject.tooltipType === 'titleBg'">
                    <div class="control-label">填充色</div>
                    <div class="color-picker-container">
                        <div 
                            class="color-preview"
                            :style="{ backgroundColor: displayColor }"
                            @click="handleColorPreviewClick"
                            ref="colorPreview"
                        ></div>
                        <div v-if="showColorPicker" class="color-picker-popup" :style="colorPickerStyle">
                            <Chrome v-model="pickerColor" />
                            <div class="color-picker-buttons">
                                <button @click="showColorPicker = false" class="cancel-button">取消</button>
                                <button @click="handleColorChange" class="confirm-button">确定</button>
                            </div>
                        </div>
                    </div>
                </div>

                <button @click="showDeleteConfirm = true" class="delete-button">
                    删除
                </button>
            </div>
        </div>
        <div v-else class="no-selection">
            请选择一个对象
        </div>

        <!-- 删除确认弹窗 -->
        <div v-if="showDeleteConfirm" class="confirm-popup">
            <div class="confirm-content">
                <div class="confirm-title">确认删除</div>
                <div class="confirm-message">确定要删除这个对象吗？</div>
                <div class="confirm-buttons">
                    <button class="confirm-button cancel" @click="showDeleteConfirm = false">取消</button>
                    <button class="confirm-button confirm" @click="confirmDelete">确定</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Chrome } from '@ckpack/vue-color';

interface SelectedObject {
    type: string;
    opacity: number;
    id: string;
    tooltipText?: string;
    tooltipType?: string;
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    text?: string;
}

const props = defineProps<{
    selectedObject: SelectedObject | null;
}>();

const emit = defineEmits<{
    (e: 'updateOpacity', opacity: number): void;
    (e: 'delete'): void;
    (e: 'updateFontSize', fontSize: number): void;
    (e: 'updateColor', color: string): void;
    (e: 'updateText', text: string): void;
    (e: 'updateFontFamily', fontFamily: string): void;
}>();

const showDeleteConfirm = ref(false);
const showColorPicker = ref(false);
const availableFonts = ['Arial', 'Verdana', 'Helvetica', 'Courier', 'Consolas', 'cursive', 'Tahoma', 'Trebuchet MS', 'Times New Roman', 'Georgia', 'Palatino', 'Baskerville', 'Gill Sans', 'Andalé Mono', 'Avantgarde', 'Optima', 'Arial Narrow', 'Didot', 'Bookman', 'American Typewriter', 'OCR A Std', 'Brush Script MT', 'Lucida', 'Bradley Hand', 'Trattatello', 'fantasy', 'Harrington', 'Marker Felt', 'Chalkduster', 'Comic Sans MS' ]

const handleOpacityChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('updateOpacity', parseFloat(target.value));
};

const handleDelete = () => {
    showDeleteConfirm.value = true;
};

const confirmDelete = () => {
    emit('delete');
    showDeleteConfirm.value = false;
};

const handleFontSizeChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    emit('updateFontSize', parseInt(target.value));
};

const handleColorChange = () => {
    emit('updateColor', displayColor.value);
    showColorPicker.value = false;
}

const handleFontFamilyChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    emit('updateFontFamily', target.value);
};

// 添加 RGB 转 Hex 的函数
const rgbToHex = (rgb: string): string => {
    if (!rgb.startsWith('rgb')) return rgb;
    
    // 提取 RGB 值
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return rgb;
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    // 转换为十六进制
    const hex = '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
    
    return hex;
};

const displayColor = ref(props.selectedObject?.fill||'#000000');
const pickerColor = ref(props.selectedObject?.fill||'#000000');
watch(()=>pickerColor.value, (newColor) => {
    if (typeof newColor === 'object' && newColor.hex) {
        displayColor.value = newColor.hex;
    } else if (typeof newColor === 'string') {
        displayColor.value = newColor;
    }
});
watch(()=>props.selectedObject, (newObject) => {
    if(newObject?.fill){
        displayColor.value = rgbToHex(newObject.fill);
    }
}, { immediate: true,deep: true });

const handleTextChange = (event: Event) => {
    const target = event.target as HTMLTextAreaElement;
    emit('updateText', target.value);
};

const colorPreview = ref<HTMLElement | null>(null);
const colorPickerStyle = ref({ top: '0px', left: '0px' });

const handleColorPreviewClick = () => {
    if (colorPreview.value) {
        const rect = colorPreview.value.getBoundingClientRect();
        // 颜色选择器的高度大约是 290px（包括按钮区域）
        const pickerHeight = 290;
        colorPickerStyle.value = {
            top: `${rect.top - pickerHeight - 5}px`,
            left: `${rect.left}px`
        };
    }
    showColorPicker.value = true;
};
</script>

<style scoped>
.layer-panel {
    padding: 12px 16px;
    height: 100%;
    overflow: visible;
    background-color: #EDE3E7;
    border-radius: 8px;
}

.controls-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 10px;
}

.control-label {
    font-size: 11px;
    color: #666;
    line-height: 1;
}

.range-input {
    width: 100%;
    height: 6px;
    -webkit-appearance: none;
    background: #ddd;
    border-radius: 1.5px;
    outline: none;
}

.range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 10px;
    height: 10px;
    background: #4a90e2;
    border-radius: 50%;
    cursor: pointer;
}

.text-input {
    width: 100%;
    padding: 4px;
    font-size: 11px;
    border: 1px solid #ddd;
    border-radius: 3px;
    resize: vertical;
    min-height: 32px;
}

.color-picker-container {
    position: relative;
}

.color-preview {
    width: 100%;
    height: 24px;
    border: 1px solid #ddd;
    border-radius: 3px;
    cursor: pointer;
}

.color-picker-popup {
    position: fixed;
    z-index: 1000;
    background: white;
    padding: 8px;
    border-radius: 4px;
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
    height: 20px !important;
    font-size: 11px !important;
}

.color-picker-popup :deep(.vc-chrome-fields .vc-input__label) {
    font-size: 11px !important;
}

.color-picker-popup :deep(.vc-chrome-active-color) {
    /* width: 20px !important;
    height: 20px !important; */
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

.cancel-button:hover {
    background: #e8e8e8;
}

.delete-button {
    margin-top: 0;
    padding: 6px 12px;
    font-size: 11px;
    color: #fff;
    background-color: #ff4d4f;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.delete-button:hover {
    background-color: #ff7875;
}

.no-selection {
    padding: 16px;
    text-align: center;
    color: #999;
    font-size: 12px;
}

.confirm-popup {
    position: absolute;
    right: 20%;
    bottom: 10%;
    transform: translate(-50%, -50%);
    z-index: 1000;
}

.confirm-content {
    background-color: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    width: 240px;
    border: 1px solid #e8e8e8;
}

.confirm-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 8px;
}

.confirm-message {
    font-size: 12px;
    color: #666;
    margin-bottom: 16px;
}

.confirm-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
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

.confirm-button:hover {
    background: #357abd;
}

.font-controls {
    display: flex;
    gap: 8px;
}

.font-size-select,
.font-family-select {
    flex: 1;
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
    background-color: white;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
}

.font-size-select:hover,
.font-family-select:hover {
    border-color: #999;
}

.font-size-select:focus,
.font-family-select:focus {
    border-color: #666;
}
</style>