import { Message } from '@arco-design/web-react/es'

type MessageType = 'info' | 'success' | 'error' | 'warn' | 'load'

const globalOption = {
  closable: true,
  duration: 1500
}

export default {
  show(message: string, type: MessageType, id?: string) {
    switch (type) {
      case 'info':
        Message.info({
          ...globalOption,
          id,
          content: message
        })
        break
      case 'success':
        Message.success({
          ...globalOption,
          id,
          content: message
        })
        break
      case 'error':
        Message.error({
          ...globalOption,
          id,
          content: message
        })
        break
      case 'warn':
        Message.warning({
          ...globalOption,
          id,
          content: message
        })
        break
      case 'load':
        Message.loading({
          ...globalOption,
          id,
          content: message,
          duration: 0
        })
        break
    }
  },
  i(message: string, id?: string) {
    this.show(message, 'info', id)
  },
  s(message: string, id?: string) {
    this.show(message, 'success', id)
  },
  e(message: string, id?: string) {
    this.show(message, 'error', id)
  },
  w(message: string, id?: string) {
    this.show(message, 'warn', id)
  },
  // 默认不会自动关闭
  l(message: string, id?: string) {
    this.show(message, 'load', id)
  },
  clear() {
    Message.clear()
  }
}
