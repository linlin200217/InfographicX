<template>
    <div class="h-full w-full bg-[#EDE3E7] rounded-r-lg pt-2 flex flex-col overflow-hidden">
        <div class="overflow-y-auto flex-1 pl-0 pr-7">
        <!-- Original Title Box -->
        <div class="bg-white px-4 sm:px-6 mx-4 w-[calc(100%-rem)] rounded-lg mb-4">
            <input :value="title" @input="$emit('update:title', ($event.target as HTMLInputElement).value)" class="text-[15px] font-bold leading-5 w-full bg-transparent focus:outline-none">
        </div>

        <!-- Data Sections -->
        <div v-for="(group, index) in data" :key="index" class="mb-4">
            <!-- Visual Group Header -->
            <div class="text-[16px] mb-2 px-4 sm:px-2 mx-4">
                Visual Group {{ index + 1 }}
            </div>
            <div class="border-2 border-dashed border-[#A7535A] px-4 sm:px-2 mx-4 w-[calc(100%-3rem)] rounded-lg">

                <!-- Subtitle Section -->
                <div class="mb-4">
                    <div class="text-[15px] font-semibold mb-1">subtitle:</div>
                    <div contenteditable="true" class="text-[14px] leading-4 bg-white px-2 py-2 rounded-lg w-full focus:outline-none" @input="$emit('update:data', data.map((g, i) => i === index ? {...g, subtitle: ($event.target as HTMLElement).textContent || ''} : g))">
                        {{ group.subtitle }}
                    </div>
                </div>

                <!-- Knowledge Sections -->
                <div v-for="(knowledge, kIndex) in Object.values(JSON.parse(group.knowledge)) as Knowledge[]" :key="kIndex" class="mb-4 bg-[#E5D5D9] rounded-lg w-full">
                    <div class="text-[15px] font-semibold mb-1 px-2 pt-2">knowledge{{ kIndex + 1 }}:</div>
                    <div class="px-2 pb-2 flex gap-4">
                        <div class="flex-1">
                            <div class="flex gap-2 mb-2">
                                <button @click="applyFormat(kIndex, 'H1')" class="text-[13px] text-Red px-2 py-1 rounded hover:bg-red-700">H1</button>
                                <button @click="applyFormat(kIndex, 'H2')" class="text-[13px] text-black px-2 py-1 rounded hover:bg-gray-700">H2</button>
                                <button @click="applyFormat(kIndex, 'Icon')" class="text-[13px] bg-yellow-400 text-black px-2 py-1 rounded hover:bg-yellow-500">Icon</button>
                            </div>
                        <!-- Knowledge Content -->
                        <div class="text-[14px] leading-4 bg-white px-2 py-2 rounded-lg mb-4">
                            <div contenteditable="true" class="text-[14px] bg-white px-2 py-2 rounded-lg mb-4 w-full focus:outline-none" v-html="knowledge.Knowledge_content
                                .replace(new RegExp(knowledge.First_level_Highlight, 'g'), '<span class=\'font-bold text-red-600\'>' + knowledge.First_level_Highlight + '</span>')
                                .replace(new RegExp(knowledge.Second_level_Highlight, 'g'), '<span class=\'font-bold\'>' + knowledge.Second_level_Highlight + '</span>')
                                .replace(new RegExp(knowledge.Icon_Keyword, 'g'), '<span class=\'bg-[#FFFBBC]\'>' + knowledge.Icon_Keyword + '</span>')"></div>
                        </div>
                        
                        <!-- Bottom Section -->
                        <div class="flex gap-4">
                            <!-- Keyword Section -->
                            <div class="flex-1">
                                <div class="text-[15px] font-semibold mb-1">Keyword:</div>
                                <textarea v-model="knowledge.Icon_Keyword" @input="$emit('update:data', data.map((g, i) => i === index ? {...g, knowledge: JSON.stringify({...JSON.parse(g.knowledge), ['Knowledge_' + (kIndex + 1)]: {...JSON.parse(g.knowledge)['Knowledge_' + (kIndex + 1)], Icon_Keyword: ($event.target as HTMLTextAreaElement).value}})} : g))" class="bg-white text-[14px] rounded-lg w-full px-2 py-2 focus:outline-none resize-y"></textarea>
                            </div>
                            
                            <!-- Visualization Section -->
                            <div class="flex-1">
                                <div class="text-[15px] font-semibold mb-1">Visualization:</div>
                                <div class="bg-white aspect-square rounded-lg"></div>
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
}

withDefaults(defineProps<{
    title?: string
    data?: GroupData[]
}>(), {
    title: "Death and Causaulities in WorldW",
    data: () => [
        {
            subtitle: 'Global casualties overview xxxxxxxxxxxxxxxxx',
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
        }
    ]
})
const applyFormat = (kIndex: number, type: string) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  if (!selectedText) return;

  // Check if selection is already formatted
  let parent: HTMLElement | null = range.commonAncestorContainer as HTMLElement;
  while (parent && parent.nodeType !== Node.ELEMENT_NODE) {
    parent = parent.parentElement;
  }
  
  const isAlreadyFormatted = parent?.classList?.contains('font-bold') &&
                           parent?.classList?.contains('text-red-600');

  let formattedText = selectedText;
  switch (type) {
    case 'H1':
      if (isAlreadyFormatted) {
        // Remove formatting by replacing with plain text
        const textNode = document.createTextNode(parent?.textContent || selectedText);
        parent?.replaceWith(textNode);
        return;
      } else {
        // Apply formatting
        formattedText = `<span class="font-bold text-red-600">${selectedText}</span>`;
      }
      break;
    case 'H2':
      formattedText = `<span class="font-bold">${selectedText}</span>`;
      break;
    case 'Icon':
      formattedText = `<span class="bg-[#FFFBBC]">${selectedText}</span>`;
      break;
  }

  const span = document.createElement('span');
  span.innerHTML = formattedText;
  range.deleteContents();
  range.insertNode(span);
  
  // Normalize text nodes to prevent nested spans
  container.parentElement?.normalize();
};
</script>
