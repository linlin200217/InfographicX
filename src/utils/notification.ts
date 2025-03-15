import { createApp, h } from 'vue'
import Notification from '../components/Notification.vue'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationOptions {
  message: string
  type: NotificationType
  duration?: number
}

export const showNotification = (options: NotificationOptions) => {
  const { message, type, duration = 3000 } = options
  
  // 创建一个挂载点
  const mountNode = document.createElement('div')
  document.body.appendChild(mountNode)
  
  // 创建通知实例
  const app = createApp({
    render() {
      return h(Notification, {
        message,
        type,
        duration,
        onDestroy: () => {
          // 组件销毁后移除挂载点
          setTimeout(() => {
            app.unmount()
            document.body.removeChild(mountNode)
          }, 10)
        }
      })
    }
  })
  
  // 挂载组件
  app.mount(mountNode)
}

// 便捷方法
export const notify = {
  success: (message: string, duration?: number) => 
    showNotification({ message, type: 'success', duration }),
  
  error: (message: string, duration?: number) => 
    showNotification({ message, type: 'error', duration }),
  
  warning: (message: string, duration?: number) => 
    showNotification({ message, type: 'warning', duration }),
  
  info: (message: string, duration?: number) => 
    showNotification({ message, type: 'info', duration })
} 