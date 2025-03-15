<template>
  <Teleport to="body">
    <transition name="notification-fade">
      <div v-if="visible" 
           :class="['notification', `notification-${type}`]"
           @click="close">
        {{ message }}
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}>()

const emit = defineEmits(['destroy'])

const visible = ref(false)
const timer = ref<number | null>(null)

const close = () => {
  visible.value = false
  setTimeout(() => {
    emit('destroy')
  }, 300) // 等待动画结束
}

watch(visible, (newVal) => {
  if (!newVal) {
    setTimeout(() => {
      emit('destroy')
    }, 300) // 等待动画结束
  }
})

onMounted(() => {
  visible.value = true
  
  if (props.duration !== 0) {
    timer.value = window.setTimeout(() => {
      visible.value = false
    }, props.duration || 3000)
  }
})

onUnmounted(() => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
})
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  min-width: 200px;
  text-align: center;
}

.notification-success {
  background-color: #67C23A;
}

.notification-error {
  background-color: #F56C6C;
}

.notification-warning {
  background-color: #E6A23C;
}

.notification-info {
  background-color: #909399;
}

.notification-fade-enter-active,
.notification-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.notification-fade-enter-from,
.notification-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style> 