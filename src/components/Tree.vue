<template>
  <div ref="container" class="h-full w-full bg-[#EDE3E7] rounded-lg"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import 'vis-network/styles/vis-network.css'

interface GroupData {
  subtask_title: string
  subtask_relation: string
  related_subtask: {
    title: string | null
    relation: string | null
  }
}

const props = defineProps<{
  data: GroupData[]
  title: string
}>()

const container = ref<HTMLElement | null>(null)
let networkInstance: Network | null = null

const initNetwork = () => {
  if (!container.value) return
  if (networkInstance) {
    networkInstance.destroy()
    networkInstance = null
  }

  // 定义节点：root 在 level 0，其余子节点固定在 level 1，保持水平排列
  const nodes = new DataSet([
    {
      id: 'root',
      label: props.title,
      shape: 'box',
      color: '#A7535A',
      font: { size: 16, color: '#FFF' },
      level: 0
    },
    ...props.data.map((group, index) => ({
      id: `group${index}`,
      label: `Visual Group ${index + 1}`,
      shape: 'box',
      color: '#E5D5D9',
      font: { size: 14 },
      level: 1
    }))
  ])

  const edges = new DataSet<any>([])

  // root 到各子节点的边：直接连线
  props.data.forEach((group, index) => {
    edges.add({
      id: `edge-root-${index}`,
      from: 'root',
      to: `group${index}`,
      label: group.subtask_relation,
      smooth: { enabled: true, type: 'cubicBezier', forceDirection: 'none', roundness: 0 }
    })
  })

  // 子节点之间的连线（例如 VG4→VG5、VG4→VG7）
  // 如果同一源节点发出多条边，则第一条直接连线，后续边设置 forceDirection 为 vertical，并增加 roundness 使连线先垂直延伸
  const childEdgeCount: Record<string, number> = {}
  props.data.forEach((group, index) => {
    if (group.related_subtask?.title) {
      // 根据 related_subtask.title 找到对应的源节点
      const sourceIndex = props.data.findIndex(
        g => g.subtask_title === group.related_subtask!.title
      )
      if (sourceIndex !== -1) {
        const sourceId = `group${sourceIndex}`
        const targetId = `group${index}`
        const count = childEdgeCount[sourceId] || 0
        childEdgeCount[sourceId] = count + 1

        let smoothOption
        if (count === 0) {
          // 第一条边直接水平连接
          smoothOption = { enabled: true, type: 'cubicBezier', forceDirection: 'none', roundness: 0 }
        } else {
          // 后续边：forceDirection 为 vertical，固定 roundness 为 0.8
          smoothOption = { enabled: true, type: 'cubicBezier', forceDirection: 'vertical', roundness: 0.8 }
        }

        edges.add({
          id: `edge-${sourceId}-${targetId}`,
          from: sourceId,
          to: targetId,
          label: group.related_subtask.relation || '',
          smooth: smoothOption
        })
      }
    }
  })

  const dataObj = { nodes, edges }

  // 使用 hierarchical 布局：direction 为 'UD'（上到下），但由于 blockShifting 关闭，所有子节点固定在同一水平线上
  const options = {
    layout: {
      hierarchical: {
        enabled: true,
        direction: 'UD',
        sortMethod: 'directed',
        levelSeparation: 150,
        nodeSpacing: 150,
        blockShifting: false
      }
    },
    edges: {
      arrows: { to: { enabled: true, scaleFactor: 0.5 } },
      font: { size: 12, strokeWidth: 0 }
    },
    physics: { enabled: false }
  }

  networkInstance = new Network(container.value, dataObj, options)
}

onMounted(() => {
  initNetwork()
})

watch(() => props.data, () => {
  initNetwork()
}, { deep: true })
</script>

<style scoped>
:deep(.vis-network) {
  height: 100%;
  width: 100%;
}
</style>
