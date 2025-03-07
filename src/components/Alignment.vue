<template>
    <div class="h-full w-full bg-[#EDE3E7] rounded-r-lg relative pt-2 flex flex-col overflow-hidden">
        <img src="../assets/Document.png" alt="Document" class="absolute top-1 left-1 w-4 h-4">
        <div class="overflow-y-auto flex-1 pl-0 pr-7">
        <!-- Original Title Box -->
        <div class="bg-white px-4 sm:px-6 mx-4 w-[calc(100%-rem)] rounded-lg mb-4">
            <input :value="title" @input="$emit('update:title', ($event.target as HTMLInputElement).value)" class="text-[15px] font-bold leading-5 w-full bg-transparent focus:outline-none">
        </div>

        <!-- Data Sections -->
        <div v-for="(group, index) in data" :key="index" class="mb-3">
            <!-- Visual Group Header -->
            <div class="flex items-center justify-between mb-1 px-4 sm:px-2 mx-4">
                <div class="text-[16px]">Visual Group {{ index + 1 }}</div>
                <div class="text-[15px] italic text-[#1A6840] mr-4">{{ group.subtask_relation }}</div>
            </div>
            <div class="border-2 border-dashed border-[#A7535A] px-4 sm:px-2 mx-4 w-[calc(100%-3rem)] rounded-lg">

                <!-- Subtitle Section -->
                <div class="mb-3">
                    <div class="text-[15px] font-semibold mb-1">subtitle:</div>
                    <div contenteditable="true" class="text-[14px] leading-4 bg-white px-2 py-1 rounded-lg w-full focus:outline-none" @input="$emit('update:data', data.map((g, i) => i === index ? {...g, subtitle: ($event.target as HTMLElement).textContent || ''} : g))">
                        {{ group.subtitle }}
                    </div>
                </div>

                <!-- Knowledge Sections -->
                <div v-for="(knowledge, kIndex) in Object.values(JSON.parse(group.knowledge)) as Knowledge[]" :key="kIndex" class="mb-3 bg-[#E5D5D9] rounded-lg w-full">
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
                            <div contenteditable="true" class="text-[14px] font-normal font-black bg-white px-0 py-0 rounded-lg w-full focus:outline-none" v-html="knowledge.Knowledge_content
                                .replace(new RegExp(knowledge.First_level_Highlight, 'g'), '<span class=\'font-bold text-red-600\'>' + knowledge.First_level_Highlight + '</span>')
                                .replace(new RegExp(knowledge.Second_level_Highlight, 'g'), '<span class=\'font-bold font-black\'>' + knowledge.Second_level_Highlight + '</span>')
                                .replace(new RegExp(knowledge.Icon_Keyword, 'g'), '<span class=\'bg-[#FFFBBC]\'>' + knowledge.Icon_Keyword + '</span>')"></div>
                        </div>
                        
                        <!-- Bottom Section -->
                        <div class="flex gap-10">
                            <!-- Keyword Section -->
                            <div class="flex flex-col">
                                <div class="text-[15px] font-semibold mb-1">Keyword:</div>
                                <textarea @input="$emit('update:data', data.map((g, i) => i === index ? {...g, knowledge: JSON.stringify({...JSON.parse(g.knowledge), ['Knowledge_' + (kIndex + 1)]: {...JSON.parse(g.knowledge)['Knowledge_' + (kIndex + 1)], Icon_Keyword: ($event.target as HTMLTextAreaElement).value}})} : g))" class="bg-white text-[14px] rounded-lg w-full px-2 py-2 focus:outline-none resize-none h-[60px]"></textarea>
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
        </div>
    </div>
    </div>
</div>
</template>

<script setup lang="ts">
interface Knowledge {
    Knowledge_content: string
    Data_insight: string
    First_level_Highlight: string
    Second_level_Highlight: string
    Icon_Keyword: string
}

interface GroupData {
    subtitle: string
    knowledge: string
    subtask_relation?: string
}

withDefaults(defineProps<{
    title?: string
    data?: GroupData[]
}>(), {
    title: "Death and Causaulities in WorldW",
    data: () => [
        {
            subtitle: 'Global casualties overview xxxxxxxxxxxxxxxxx',
            subtask_relation: 'Generalization',
            related_subtask_title: "None",
            related_subtask_relation: "None",
            knowledge: JSON.stringify({
                Knowledge_1: {
                    Knowledge_content: '60 to 80 million people died in World War II.',
                    Data_insight: 'Value',
                    First_level_Highlight: '60 to 80 million',
                    Second_level_Highlight: 'died',
                    Icon_Keyword: 'people'
                },
                Knowledge_2: {
                    Knowledge_content: '60 to 80 million people died in World War II.',
                    Data_insight: 'Value',
                    First_level_Highlight: '60 to 80 million',
                    Second_level_Highlight: 'died',
                    Icon_Keyword: 'people'
                }
            })
        },
        {
            subtitle: 'Holocaust victims',
            subtask_relation: 'Elobration',
            related_subtask_title: "Global casualties overview xxxxxxxxxxxxxxxxx",
            related_subtask_relation: "Example",
            knowledge: JSON.stringify({
                Knowledge_1: {
                    Knowledge_content: '6 million Jews died during the Holocaust.',
                    Data_insight: 'Value',
                    First_level_Highlight: '6 million',
                    Second_level_Highlight: 'Jews',
                    Icon_Keyword: 'Jews'
                },
                Knowledge_2: {
                    Knowledge_content: 'The Holocaust accounted for two-thirds of European Jews.',
                    Data_insight: 'Proportion',
                    First_level_Highlight: 'two-thirds',
                    Second_level_Highlight: 'European Jews',
                    Icon_Keyword: 'Jews'
                }
        
            })
        },
        {
            subtitle: 'Major Battles Overview',
            subtask_relation: 'Example',
            related_subtask_title: "None",
            related_subtask_relation: "None",
            knowledge: JSON.stringify({
                Knowledge_1: {
                    Knowledge_content: 'The Battle of Stalingrad resulted in nearly 2 million casualties.',
                    Data_insight: 'Value',
                    First_level_Highlight: '2 million',
                    Second_level_Highlight: 'casualties',
                    Icon_Keyword: 'battle'
                },
                Knowledge_2: {
                    Knowledge_content: 'The Battle of the Bulge was the last major German offensive on the Western Front.',
                    Data_insight: 'Event',
                    First_level_Highlight: 'last major',
                    Second_level_Highlight: 'German offensive',
                    Icon_Keyword: 'battle'
                },
                Knowledge_3: {
                    Knowledge_content: 'The Normandy landings involved over 150,000 Allied troops.',
                    Data_insight: 'Value',
                    First_level_Highlight: '150,000',
                    Second_level_Highlight: 'Allied troops',
                    Icon_Keyword: 'troops'
                }
            })
        },
        {
            subtitle: 'xxxxxx',
            subtask_relation: 'Elobration',
            related_subtask_title: "Global casualties overview xxxxxxxxxxxxxxxxx",
            related_subtask_relation: "Generalization",
            knowledge: JSON.stringify({
                Knowledge_1: {
                    Knowledge_content: '6 million Jews died during the Holocaust.',
                    Data_insight: 'Value',
                    First_level_Highlight: '6 million',
                    Second_level_Highlight: 'Jews',
                    Icon_Keyword: 'Jews'
                },
                Knowledge_2: {
                    Knowledge_content: 'The Holocaust accounted for two-thirds of European Jews.',
                    Data_insight: 'Proportion',
                    First_level_Highlight: 'two-thirds',
                    Second_level_Highlight: 'European Jews',
                    Icon_Keyword: 'Jews'
                }
        
            })
        }
    ]
})
const applyFormat = (kIndex: number, type: string) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  if (!selectedText) return;

  if (type === 'H1') {
    // 获取选中内容的父元素
    const parentElement = range.commonAncestorContainer.parentElement;
    
    // 检查是否是红色加粗
    const isRedBold = parentElement?.classList?.contains('font-bold') &&
                     parentElement?.classList?.contains('text-red-600');
    
    // 创建新的文本节点
    const textNode = document.createTextNode(selectedText);
    
    if (isRedBold) {
      // 如果是红色加粗，转换为普通黑色
      const normalSpan = document.createElement('span');
      normalSpan.textContent = selectedText;
      normalSpan.classList.add('font-normal', 'text-black');
      range.deleteContents();
      range.insertNode(normalSpan);
    } else {
      // 如果不是红色加粗，转换为红色加粗
      const span = document.createElement('span');
      span.textContent = selectedText;
      span.classList.add('font-bold', 'text-red-600');
      range.deleteContents();
      range.insertNode(span);
    }
    
    // 如果父元素有背景色，保留背景色
    if (parentElement?.classList?.contains('bg-[#FFFBBC]')) {
      const wrapperSpan = document.createElement('span');
      wrapperSpan.classList.add('bg-[#FFFBBC]');
      wrapperSpan.appendChild(range.extractContents());
      range.insertNode(wrapperSpan);
    }
    
    // 清除selection
    selection.removeAllRanges();
  } else if (type === 'H2') {
    // 获取选中内容的父元素
    const parentElement = range.commonAncestorContainer.parentElement;
    
    // 检查是否是黑色加粗
    const isBlackBold = parentElement?.classList?.contains('font-bold') &&
                       !parentElement?.classList?.contains('text-red-600');
    
    if (isBlackBold) {
      // 如果是黑色加粗，转换为普通黑色
      const normalSpan = document.createElement('span');
      normalSpan.textContent = selectedText;
      normalSpan.classList.add('font-normal', 'text-black');
      range.deleteContents();
      range.insertNode(normalSpan);
    } else {
      // 如果不是黑色加粗，转换为黑色加粗
      const span = document.createElement('span');
      span.textContent = selectedText;
      span.classList.add('font-bold', 'text-black');
      range.deleteContents();
      range.insertNode(span);
    }
    
    // 如果父元素有背景色，保留背景色
    if (parentElement?.classList?.contains('bg-[#FFFBBC]')) {
      const wrapperSpan = document.createElement('span');
      wrapperSpan.classList.add('bg-[#FFFBBC]');
      wrapperSpan.appendChild(range.extractContents());
      range.insertNode(wrapperSpan);
    }
    
    // 清除selection
    selection.removeAllRanges();
  } else if (type === 'Icon') {
    // 获取选中内容的父元素
    const parentElement = range.commonAncestorContainer.parentElement;
    
    if (!parentElement) return;
    
    // 检查是否有背景色
    const hasBackground = parentElement.classList.contains('bg-[#FFFBBC]');
    
    // 获取当前文字样式
    const isBold = parentElement.classList.contains('font-bold');
    const isRed = parentElement.classList.contains('text-red-600');
    const isBlack = parentElement.classList.contains('text-black');
    
    if (hasBackground) {
      // 如果有背景色，移除背景色
      parentElement.classList.remove('bg-[#FFFBBC]');
    } else {
      // 如果没有背景色，添加背景色
      const span = document.createElement('span');
      span.textContent = selectedText;
      span.classList.add('bg-[#FFFBBC]');
      
      // 强制保留原有文字样式
      if (isBold) span.classList.add('font-bold');
      if (isRed) span.classList.add('text-red-600');
      if (isBlack) span.classList.add('text-black');
      
      range.deleteContents();
      range.insertNode(span);
    }
    
    // 清除selection
    selection.removeAllRanges();
  }
};
</script>
