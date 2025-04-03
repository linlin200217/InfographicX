<template>

  <div ref="containerRef" class="h-full w-full bg-[#EDE3E7] rounded-r-lg relative pt-2 flex flex-col overflow-hidden">
    <img src="../assets/Document.png" alt="Document" class="absolute top-1 left-1 w-4 h-4" />
    <!-- 滚动区域 -->
    <div ref="scrollContainerRef" class="overflow-y-auto flex-1 pl-0 pr-7">
      <!-- Original Title Box -->
      <div class="bg-white px-4 sm:px-6 mx-4 w-[calc(100%-rem)] rounded-lg mb-4">
        <input
          :value="titleRef"
          @input="updateTitle(($event.target as HTMLInputElement).value)"
          class="text-[15px] font-bold leading-5 w-full bg-transparent focus:outline-none"
        />
      </div>

      <!-- Data Sections -->
      <!-- 这里使用 localData 替代 props.data -->
      <div v-for="(group, index) in localData" :key="index" class="mb-3">
        <!-- Visual Group Header -->
        <div class="flex items-center justify-between mb-1 px-4 sm:px-2 mx-4">
          <div class="text-[16px]">Visual Group {{ index + 1 }}</div>
          <div class="text-[15px] italic text-[#1A6840] mr-4">{{ group.subtask_relation }}</div>
        </div>
        <!-- 虚线框（增加 ref 用于连线计算） -->
        <div
          ref="dashedRefs"
          class="border-2 border-dashed border-[#A7535A] px-4 sm:px-2 mx-4 w-[calc(100%-3rem)] rounded-lg relative"
        >
          <!-- 删除整个 visual group 按钮 -->
          <img src="../assets/Remove.png" alt="Remove" class="absolute -top-4 -right-4 w-7 h-7 cursor-pointer" @click="removeGroup(index)" />

          <!-- Subtitle Section -->
          <div class="mb-3">
            <div class="text-[15px] font-semibold mb-1">subtitle:</div>
            <div
              contenteditable="true"
              class="text-[14px] leading-4 bg-white px-2 py-1 rounded-lg w-full focus:outline-none"
              @input="updateSubtitle(index, $event)"
            >
              {{ group.subtask_title }}
            </div>
          </div>

          <!-- Knowledge Sections -->
          <div v-for="(knowledge, kIndex) in group.knowledges" :key="kIndex" class="mb-3 bg-[#E5D5D9] rounded-lg w-full relative">
            <!-- 删除当前 knowledge 的按钮 -->
            <img src="../assets/Delete.png" alt="Delete" class="absolute -top-2 -right-2 w-4 h-4 cursor-pointer" @click="removeKnowledge(index, kIndex)" />
            <div class="px-2 pt-1 flex items-center justify-between mb-1">
              <div class="text-[15px] font-semibold">knowledge{{ kIndex + 1 }}:</div>
              <div class="flex gap-4">
                <button @click="applyFormat(index, kIndex, 'H1')" class="text-[13px] font-bold italic text-red-600 hover:text-red-700">H1</button>
                <button @click="applyFormat(index, kIndex, 'H2')" class="text-[13px] font-bold italic text-black hover:text-gray-700">H2</button>
                <button @click="applyFormat(index, kIndex, 'Icon')" class="text-[13px] italic bg-[#FFFBBC] text-black hover:bg-yellow-500">Icon</button>
              </div>
            </div>
            <div class="px-2 pb-2 flex gap-4">
              <div class="flex-1">
                <!-- Knowledge Content -->
                <div class="text-[14px] leading-4 bg-white px-2 py-1 rounded-lg mb-2">
                  <div
                    contenteditable="true"
                    class="text-[14px] font-normal font-black bg-white px-0 py-0 rounded-lg w-full focus:outline-none"
                    v-html="knowledge.knowledge_content
                      .replace(knowledge.first_level_highlight ? new RegExp(knowledge.first_level_highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g') : '', knowledge.first_level_highlight ? '<span class=\'font-bold text-red-600\'>' + knowledge.first_level_highlight + '</span>' : '')
                      .replace(knowledge.second_level_highlight ? new RegExp(knowledge.second_level_highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g') : '', knowledge.second_level_highlight ? '<span class=\'font-bold font-black\'>' + knowledge.second_level_highlight + '</span>' : '')
                      .replace(knowledge.icon_keyword ? new RegExp(knowledge.icon_keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g') : '', knowledge.icon_keyword ? '<span class=\'bg-[#FFFBBC]\'>' + knowledge.icon_keyword + '</span>' : '')"
                    @input="updateKnowledgeContent(index, kIndex, $event)"
                  ></div>
                </div>

                <!-- Bottom Section -->
                <div class="flex gap-10">
                  <!-- Keyword Section -->
                  <div class="flex flex-col">
                    <div class="text-[15px] font-semibold mb-1">Keyword:</div>
                    <textarea 
                      :value="knowledge.icon_keyword"
                      @input="updateKeyword(index, kIndex, $event)"
                      class="bg-white text-[14px] rounded-lg w-full px-2 py-2 focus:outline-none resize-none h-[60px]"
                    ></textarea>
                  </div>
                    <!-- Visualization Section -->
                    <!--Visualization :group="group" /-->
                    <div class="flex flex-col">
                      <div class="text-[15px] font-semibold mb-1">Visualization:</div>
                      <!-- 用 Visualization 组件来渲染 d3 图表 -->
            
                      <div class="relative bg-white rounded-lg w-[60px] h-[60px]">
                        <img src="../assets/Delete.png" alt="Delete" class="absolute -top-2 left-13 w-4 h-4 cursor-pointer" @click="deleteVisualization(index, kIndex)"/>
                        <Visualization :visualization="group.knowledges[kIndex].visualization" />
                      </div>
                    </div>
                  <!-- Visualization Section end -->
              </div>
            </div>
          </div>
        </div>

              
          <!-- End Knowledge Sections -->
        </div>
      </div>
      <!-- Next Step Button -->
      <div class="flex items-center ml-4">
            <input
              type="number"
              placeholder="Height"
              v-model="height"
              class="h-[20px] w-[100px] text-center rounded-md bg-white text-[#333333] placeholder:text-gray-300 text-sm focus:outline-none"
            />
            <span class="mx-2 text-[#A7535A]">×</span>
            <input
              type="number"
              placeholder="Width"
              v-model="width"
              class="h-[20px] w-[100px] text-center rounded-md bg-white text-[#333333] placeholder:text-gray-300 text-sm focus:outline-none"
            />
            <span class="mx-2 text-[#A7535A]">px</span>
          </div>

      
      <div class="flex justify-center mt-6 mb-6">
        <button class="bg-[#9ABEAF] text-white px-6 py-1 rounded-lg" @click="handleNextStep">NEXT STEP</button>
      </div>
      <!-- End Data Sections -->
    </div>

    <!-- SVG overlay 用于绘制连线 -->
    <svg ref="svgRef" class="absolute top-0 left-0 w-full h-full pointer-events-none">
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
          <circle cx="3" cy="3" r="3" fill="white" />
        </marker>
      </defs>
      <!-- 连线路径 -->
      <path
        v-for="(conn, i) in connectionPaths"
        :key="i"
        :d="conn.d"
        stroke="white"
        fill="none"
        stroke-width="2"
        marker-end="url(#arrowhead)"
      />
      <!-- 关系标签 -->
      <text
        v-for="(lbl, i) in connectionLabels"
        :key="'lbl' + i"
        :x="lbl.x"
        :y="lbl.y"
        fill="#1A6840"
        font-size="11"
        font-style="italic"
        text-anchor="middle"
        transform="rotate(-90, {{lbl.x}}, {{lbl.y}})"
      >
        {{ lbl.text }}
      </text>
    </svg>
  </div>

</template>

<script setup lang="ts">
//import Visualization from 'src/components/Visualization.vue';
import { ref, onMounted, nextTick, watch } from 'vue';
import { useUploadStore } from '../stores/uploadStore';
import type { GroupData, ConnectionPath, ConnectionLabel } from '../types';
import { applyTextFormat, extractTextFromHtml } from '../utils/formatUtils';
import { calculateConnections, findConnections } from '../utils/connectionUtils';
import { syncDataUpdate, removeItem } from '../utils/storeUtils';
import { useStyleStore } from '../stores/styleStore';
import { useRankStore } from '../stores/rankStore';
import { notify } from '../utils/notification';
import Visualization from '../components/Visualization.vue';
import { useHeightWidthStore } from '../stores/heightWidth';

// 使用 Pinia store
const uploadStore = useUploadStore();
const styleStore = useStyleStore();
const rankStore = useRankStore();
const heightWidthStore = useHeightWidthStore();

// 从 store 获取标题
const titleRef = ref<string>("");

// 从 store 获取数据并做深拷贝，作为组件内部的独立数据状态
const localData = ref<GroupData[]>([]);

// 监听 uploadStore.uploadResult 的变化，同步更新 localData 和 titleRef
watch(
  () => uploadStore.uploadResult,
  (newResult) => {
    if (newResult) {
      titleRef.value = newResult.title || "";
      localData.value = newResult.data ? JSON.parse(JSON.stringify(newResult.data)) : [];
      // 更新连线
      nextTick(() => {
        updateConnections();
      });
    }
  },
  { deep: true, immediate: true }
);

// 修改关键字
const updateKeyword = (groupIndex: number, knowledgeIndex: number, event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value;
  syncDataUpdate(
    localData.value,
    uploadStore.uploadResult?.data,
    groupIndex,
    knowledgeIndex,
    'icon_keyword',
    value
  );
};

// 修改子标题
const updateSubtitle = (groupIndex: number, event: Event) => {
  const value = (event.target as HTMLElement).textContent || '';
  syncDataUpdate(
    localData.value,
    uploadStore.uploadResult?.data,
    groupIndex,
    null,
    'subtask_title',
    value
  );
};

// 应用格式化（H1、H2、Icon）
const applyFormat = (groupIndex: number, kIndex: number, type: string) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  if (!selectedText) return;
  
  if (groupIndex < 0 || groupIndex >= localData.value.length) return;
  
  const parentElement = range.commonAncestorContainer.parentElement;
  const formatResult = applyTextFormat(type, selectedText, parentElement);
  
  if (formatResult.element) {
    range.deleteContents();
    range.insertNode(formatResult.element);
  }
  
  // 更新数据
  let field = '';
  if (type === 'H1') {
    field = 'first_level_highlight';
  } else if (type === 'H2') {
    field = 'second_level_highlight';
  } else if (type === 'Icon') {
    field = 'icon_keyword';
  }
  
  if (field) {
    const value = formatResult.isRemoved ? '' : selectedText;
    
    // 检查是否已经存在相同的高亮文本，避免重复添加
    const knowledge = localData.value[groupIndex].knowledges[kIndex];
    if (knowledge && !formatResult.isRemoved) {
      // 如果已经存在相同的高亮文本，则不再添加
      if ((field === 'first_level_highlight' && knowledge.first_level_highlight === value) ||
          (field === 'second_level_highlight' && knowledge.second_level_highlight === value) ||
          (field === 'icon_keyword' && knowledge.icon_keyword === value)) {
        selection.removeAllRanges();
        return;
      }
    }
    
    syncDataUpdate(
      localData.value,
      uploadStore.uploadResult?.data,
      groupIndex,
      kIndex,
      field,
      value
    );
  }
  
  // 保持背景色
  if (parentElement?.classList?.contains('bg-[#FFFBBC]') && type !== 'Icon') {
    const wrapperSpan = document.createElement('span');
    wrapperSpan.classList.add('bg-[#FFFBBC]');
    wrapperSpan.appendChild(range.extractContents());
    range.insertNode(wrapperSpan);
  }
  
  selection.removeAllRanges();
  
  // 强制更新视图
  nextTick(() => {
    if (uploadStore.uploadResult?.data) {
      // 触发深层更新
      uploadStore.uploadResult = { ...uploadStore.uploadResult };
    }
  });
};


function saveCursorPosition(containerEl) {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    return {
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      container: range.startContainer
    };
  }
  return null;
}

function restoreCursorPosition(pos) {
  if (!pos) return;
  const range = document.createRange();
  range.setStart(pos.container, pos.startOffset);
  range.setEnd(pos.container, pos.endOffset);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}



const updateKnowledgeContent = (groupIndex, knowledgeIndex, event) => {
  // 保存光标位置
  const cursorPos = saveCursorPosition(event.target);
  
  // 获取纯文本内容（去除HTML标签）
  const htmlContent = event.target.innerHTML;
  const textContent = extractTextFromHtml(htmlContent);
  
  // 检查内容是否真的发生了变化
  const currentKnowledge = localData.value[groupIndex]?.knowledges[knowledgeIndex];
  if (currentKnowledge && currentKnowledge.knowledge_content === textContent) {
    return; // 内容没有变化，不需要更新
  }
  
  syncDataUpdate(
    localData.value,
    uploadStore.uploadResult?.data,
    groupIndex,
    knowledgeIndex,
    'knowledge_content',
    textContent
  );
  
  // 强制更新视图，并恢复光标位置
  nextTick(() => {
    if (uploadStore.uploadResult?.data) {
      // 触发深层更新
      uploadStore.uploadResult = { ...uploadStore.uploadResult };
    }
    // 恢复光标位置
    restoreCursorPosition(cursorPos);
    
  });
};


const containerRef = ref<HTMLElement | null>(null);
const scrollContainerRef = ref<HTMLElement | null>(null);
// 使用 Vue 3 多 ref 特性自动收集所有 visual group 的虚线框 DOM 节点
const dashedRefs = ref<HTMLElement[]>([]);
const svgRef = ref<SVGSVGElement | null>(null);
const connectionPaths = ref<ConnectionPath[]>([]);
const connectionLabels = ref<ConnectionLabel[]>([]);

// 更新连线（动态根据 localData 及 dashedRefs.value 计算）
const updateConnections = () => {
  nextTick(() => {
    if (!containerRef.value) return;
    const containerRect = containerRef.value.getBoundingClientRect();
    
    // 查找连接关系
    const connections = findConnections(localData.value);
    
    // 计算连线路径和标签
    const { paths, labels } = calculateConnections(connections, dashedRefs.value, containerRect);
    
    // 更新标签文本
    labels.forEach((label, index) => {
      const conn = connections[index];
      if (conn) {
        label.text = localData.value[conn.targetIndex].related_subtask?.relation || "";
      }
    });
    
    connectionPaths.value = paths;
    connectionLabels.value = labels;
  });
};

// 删除指定 visual group，并同步更新数据
const removeGroup = (groupIndex: number) => {
  removeItem(localData.value, uploadStore.uploadResult?.data, groupIndex);
  // 删除后更新连线
  updateConnections();
};

// 删除指定 knowledge，并同步更新数据
const removeKnowledge = (groupIndex: number, knowledgeIndex: number) => {
  removeItem(localData.value, uploadStore.uploadResult?.data, groupIndex, knowledgeIndex);
  updateConnections();
};

//删除visualization
const deleteVisualization = (groupIndex: number, knowledgeIndex: number) => {
  const newVisualization = {
    is_visualization: false,
    type: null,
    data: []
  };
  
  // 更新 localData
  localData.value[groupIndex].knowledges[knowledgeIndex].visualization = newVisualization;
  
  // 如果 uploadStore.uploadResult.data 存在，也进行相同更新
  if (uploadStore.uploadResult?.data) {
    uploadStore.uploadResult.data[groupIndex].knowledges[knowledgeIndex].visualization = newVisualization;
  }
  
  updateConnections();
};


// 更新标题
const updateTitle = (value: string) => {
  titleRef.value = value;
  // 更新 store 中的数据
  if (uploadStore.uploadResult) {
    uploadStore.uploadResult.title = value;
  }
};

onMounted(() => {
  updateConnections();
  window.addEventListener('resize', updateConnections);
  if (scrollContainerRef.value) {
    scrollContainerRef.value.addEventListener('scroll', updateConnections);
  }
});


const height = ref(1000);
const width = ref(600);

watch(height, (newHeight) => {
  heightWidthStore.setHeight(newHeight);
});

watch(width, (newWidth) => {
  heightWidthStore.setWidth(newWidth);
});

const handleNextStep = async() => {
  console.log("handleNextStep");
  try {
    // 检查是否有上传结果
    if (!uploadStore.uploadResult) {
      notify.error('请先上传PDF文件并提交问题');
      return;
    }
    // 生成颜色方案
    console.log(uploadStore.uploadResult);
     let colorRes = await styleStore.generateColors(uploadStore.uploadResult);
     console.log("colorRes-->", colorRes);
     uploadStore.colorRes = colorRes;
    // 获取信息图尺寸（这里使用默认尺寸，你可以根据实际需求调整）
    const infographicSize: [number, number] = [heightWidthStore.width, heightWidthStore.height];
    await rankStore.rankElements(uploadStore.uploadResult, infographicSize);
  } catch (error) {
    console.error('生成颜色方案或排序失败:', error);
    notify.error('生成颜色方案或排序失败');
  }
}
// 监听 localData 变化，更新连线
watch(
  () => localData.value,
  () => {
    updateConnections();
  },
  { deep: true }
);


// 结果被修改就打印处理
watch(
  () => uploadStore.uploadResult,
  (newResult) => {
    console.log(`uploadStore.uploadResult: ${JSON.stringify(newResult)}`);
  },
  { deep: true }
);
</script>
