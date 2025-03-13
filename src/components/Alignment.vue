<template>
  <div ref="containerRef" class="h-full w-full bg-[#EDE3E7] rounded-r-lg relative pt-2 flex flex-col overflow-hidden">
    <img src="../assets/Document.png" alt="Document" class="absolute top-1 left-1 w-4 h-4" />
    <!-- 滚动区域 -->
    <div ref="scrollContainerRef" class="overflow-y-auto flex-1 pl-0 pr-7">
      <!-- Original Title Box -->
      <div class="bg-white px-4 sm:px-6 mx-4 w-[calc(100%-rem)] rounded-lg mb-4">
        <input
          :value="titleRef"
          @input="$emit('update:title', ($event.target as HTMLInputElement).value)"
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
            <img src="../assets/Delete.png" alt="Delete" class="absolute -top-3 -right-2 w-4 h-4 cursor-pointer" @click="removeKnowledge(index, kIndex)" />
            <div class="px-2 pt-1 flex items-center justify-between mb-1">
              <div class="text-[15px] font-semibold">knowledge{{ kIndex + 1 }}:</div>
              <div class="flex gap-4">
                <button @click="applyFormat(kIndex, 'H1')" class="text-[13px] font-bold italic text-red-600 hover:text-red-700">H1</button>
                <button @click="applyFormat(kIndex, 'H2')" class="text-[13px] font-bold italic text-black hover:text-gray-700">H2</button>
                <button @click="applyFormat(kIndex, 'Icon')" class="text-[13px] italic bg-[#FFFBBC] text-black hover:bg-yellow-500">Icon</button>
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
                      .replace(new RegExp(knowledge.first_level_highlight, 'g'), '<span class=\'font-bold text-red-600\'>' + knowledge.first_level_highlight + '</span>')
                      .replace(new RegExp(knowledge.second_level_highlight, 'g'), '<span class=\'font-bold font-black\'>' + knowledge.second_level_highlight + '</span>')
                      .replace(new RegExp(knowledge.icon_keyword, 'g'), '<span class=\'bg-[#FFFBBC]\'>' + knowledge.icon_keyword + '</span>')"
                  ></div>
                </div>

                <!-- Bottom Section -->
                <div class="flex gap-10">
                  <!-- Keyword Section -->
                  <div class="flex flex-col">
                    <div class="text-[15px] font-semibold mb-1">Keyword:</div>
                    <textarea class="bg-white text-[14px] rounded-lg w-full px-2 py-2 focus:outline-none resize-none h-[60px]"></textarea>
                  </div>
                  <!-- Visualization Section -->
                  <div class="flex flex-col">
                    <div class="text-[15px] font-semibold mb-1">Visualization:</div>
                    <div class="bg-white rounded-lg w-[60px] h-[60px]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- End Knowledge Sections -->
        </div>
      </div>
      <!-- Next Step Button -->
      <div class="flex justify-center mt-6 mb-6">
        <button class="bg-[#9ABEAF] text-white px-6 py-1 rounded-lg">NEXT STEP</button>
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
import { ref, onMounted, nextTick, toRef, watch } from 'vue';

interface Knowledge {
  knowledge_content: string;
  data_insight: string;
  first_level_highlight: string;
  second_level_highlight: string;
  icon_keyword: string;
}

interface RelatedSubtask {
  title: string | null;
  relation: string | null;
}

interface GroupData {
  subtask_title: string;
  subtask_content: string;
  subtask_relation: string;
  related_subtask: RelatedSubtask;
  knowledges: Knowledge[];
}

// 定义 emit，并添加类型声明
const emit = defineEmits<{
  (event: 'update:title', value: string): void;
  (event: 'update:data', value: GroupData[]): void;
}>();

// 定义 props 和默认值
const props = withDefaults(defineProps<{
  title?: string;
  data?: GroupData[];
}>(), {
  title: "发生了什么：事件概述",
  data: () => []
});

// 使用 toRef 保持 title 的响应性
const titleRef = toRef(props, 'title');

// 将 props.data 做一次深拷贝，作为组件内部的独立数据状态
const localData = ref<GroupData[]>(props.data ? JSON.parse(JSON.stringify(props.data)) : []);

// 监听 props.data 的变化，同步更新 localData
watch(
  () => props.data,
  (newData) => {
    localData.value = newData ? JSON.parse(JSON.stringify(newData)) : [];
  },
  { deep: true, immediate: true }
);

// 修改关键字
const updateKeyword = (groupIndex: number, knowledgeIndex: number, event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value;
  localData.value[groupIndex].knowledges[knowledgeIndex].icon_keyword = value;
  emit('update:data', localData.value);
};

// 修改子标题
const updateSubtitle = (groupIndex: number, event: Event) => {
  const value = (event.target as HTMLElement).textContent || '';
  localData.value[groupIndex].subtask_title = value;
  emit('update:data', localData.value);
};

// 应用格式化（H1、H2、Icon）
const applyFormat = (kIndex: number, type: string) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  if (!selectedText) return;
  if (type === 'H1') {
    const parentElement = range.commonAncestorContainer.parentElement;
    const isRedBold = parentElement?.classList?.contains('font-bold') && parentElement?.classList?.contains('text-red-600');
    if (isRedBold) {
      const normalSpan = document.createElement('span');
      normalSpan.textContent = selectedText;
      normalSpan.classList.add('font-normal', 'text-black');
      range.deleteContents();
      range.insertNode(normalSpan);
    } else {
      const span = document.createElement('span');
      span.textContent = selectedText;
      span.classList.add('font-bold', 'text-red-600');
      range.deleteContents();
      range.insertNode(span);
    }
    if (parentElement?.classList?.contains('bg-[#FFFBBC]')) {
      const wrapperSpan = document.createElement('span');
      wrapperSpan.classList.add('bg-[#FFFBBC]');
      wrapperSpan.appendChild(range.extractContents());
      range.insertNode(wrapperSpan);
    }
    selection.removeAllRanges();
  } else if (type === 'H2') {
    const parentElement = range.commonAncestorContainer.parentElement;
    const isBlackBold = parentElement?.classList?.contains('font-bold') && !parentElement?.classList?.contains('text-red-600');
    if (isBlackBold) {
      const normalSpan = document.createElement('span');
      normalSpan.textContent = selectedText;
      normalSpan.classList.add('font-normal', 'text-black');
      range.deleteContents();
      range.insertNode(normalSpan);
    } else {
      const span = document.createElement('span');
      span.textContent = selectedText;
      span.classList.add('font-bold', 'text-black');
      range.deleteContents();
      range.insertNode(span);
    }
    if (parentElement?.classList?.contains('bg-[#FFFBBC]')) {
      const wrapperSpan = document.createElement('span');
      wrapperSpan.classList.add('bg-[#FFFBBC]');
      wrapperSpan.appendChild(range.extractContents());
      range.insertNode(wrapperSpan);
    }
    selection.removeAllRanges();
  } else if (type === 'Icon') {
    const parentElement = range.commonAncestorContainer.parentElement;
    if (!parentElement) return;
    const hasBackground = parentElement.classList.contains('bg-[#FFFBBC]');
    const isBold = parentElement.classList.contains('font-bold');
    const isRed = parentElement.classList.contains('text-red-600');
    const isBlack = parentElement.classList.contains('text-black');
    if (hasBackground) {
      parentElement.classList.remove('bg-[#FFFBBC]');
    } else {
      const span = document.createElement('span');
      span.textContent = selectedText;
      span.classList.add('bg-[#FFFBBC]');
      if (isBold) span.classList.add('font-bold');
      if (isRed) span.classList.add('text-red-600');
      if (isBlack) span.classList.add('text-black');
      range.deleteContents();
      range.insertNode(span);
    }
    selection.removeAllRanges();
  }
};

const containerRef = ref<HTMLElement | null>(null);
const scrollContainerRef = ref<HTMLElement | null>(null);
// 使用 Vue 3 多 ref 特性自动收集所有 visual group 的虚线框 DOM 节点
const dashedRefs = ref<HTMLElement[]>([]);
const svgRef = ref<SVGSVGElement | null>(null);
const connectionPaths = ref<{ d: string }[]>([]);
const connectionLabels = ref<{ x: number; y: number; text: string }[]>([]);

// 更新连线（动态根据 localData 及 dashedRefs.value 计算）
const updateConnections = () => {
  nextTick(() => {
    if (!containerRef.value) return;
    const containerRect = containerRef.value.getBoundingClientRect();
    const connections: { sourceIndex: number; targetIndex: number }[] = [];

    // 根据每个 visual group 的 related_subtask 找出对应关系
    localData.value.forEach((group: GroupData, targetIndex: number) => {
      if (group.related_subtask && group.related_subtask.title) {
        const sourceIndex = localData.value.findIndex(
          (g: GroupData) => g.subtask_title === group.related_subtask!.title
        );
        if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
          connections.push({ sourceIndex, targetIndex });
        }
      }
    });

    // 按同一源组分组，便于计算多条连线的水平偏移
    const grouped: Record<number, { targetIndex: number }[]> = {};
    connections.forEach(conn => {
      if (!grouped[conn.sourceIndex]) {
        grouped[conn.sourceIndex] = [];
      }
      grouped[conn.sourceIndex].push({ targetIndex: conn.targetIndex });
    });

    const paths: { d: string }[] = [];
    const labels: { x: number; y: number; text: string }[] = [];
    const baseHorizontalOffset = 25; // 基础水平偏移
    const horizontalOffsetStep = 5;  // 同源组内额外的水平偏移
    const r = 10;                    // 圆角半径

    connections.forEach(conn => {
      const sourceEl = dashedRefs.value[conn.sourceIndex];
      const targetEl = dashedRefs.value[conn.targetIndex];
      if (!sourceEl || !targetEl) return;

      const sourceRect = sourceEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      const groupConnections = grouped[conn.sourceIndex];
      const order = groupConnections.findIndex(item => item.targetIndex === conn.targetIndex);
      const horizontalOffsetThis = baseHorizontalOffset + order * horizontalOffsetStep;

      // 起点：源虚线框下1/3处（高度的 2/3）
      const sourceX = sourceRect.right - containerRect.left;
      const sourceY = sourceRect.top - containerRect.top + sourceRect.height * (2 / 3);

      // 终点：目标虚线框上1/3处（高度的 1/3）
      const targetX = targetRect.right - containerRect.left;
      const targetY = targetRect.top - containerRect.top + targetRect.height * (1 / 3);

      const horizontalEnd = sourceX + horizontalOffsetThis;

      // 上拐角（外弧）
      const topArc = `
        M ${sourceX} ${sourceY}
        L ${horizontalEnd - r} ${sourceY}
        A ${r} ${r} 0 0 1 ${horizontalEnd} ${sourceY + r}
      `;
      // 下拐角（外弧）
      const bottomArc = `
        L ${horizontalEnd} ${targetY - r}
        A ${r} ${r} 0 0 1 ${horizontalEnd - r} ${targetY}
        L ${targetX} ${targetY}
      `;
      paths.push({ d: (topArc + bottomArc).trim() });

      // 计算 label 位置：取下拐角中点并上移 5 像素
      const labelX = ((horizontalEnd + r) + targetX) / 2 + 7;
      const labelY = targetY - 10;
      const labelText = localData.value[conn.targetIndex].related_subtask?.relation || "";
      labels.push({ x: labelX, y: labelY, text: labelText });
    });

    connectionPaths.value = paths;
    connectionLabels.value = labels;
  });
};

// 删除指定 visual group，并同步更新数据
const removeGroup = (groupIndex: number) => {
  localData.value.splice(groupIndex, 1);
  emit('update:data', localData.value);
  // 删除后更新连线
  updateConnections();
};

// 删除指定 knowledge，并同步更新数据
const removeKnowledge = (groupIndex: number, knowledgeIndex: number) => {
  localData.value[groupIndex].knowledges.splice(knowledgeIndex, 1);
  emit('update:data', localData.value);
  updateConnections();
};

onMounted(() => {
  updateConnections();
  window.addEventListener('resize', updateConnections);
  if (scrollContainerRef.value) {
    scrollContainerRef.value.addEventListener('scroll', updateConnections);
  }
});

// 监听 localData 变化，更新连线
watch(
  () => localData.value,
  () => {
    updateConnections();
  },
  { deep: true }
);
</script>
