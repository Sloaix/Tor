// 为函数设置最短执行时间,例如: 为函数设置最短执行时间为 1000ms,如果函数执行了300ms,那么会等待700ms后再返回结果

import { ipcRenderer } from 'electron'

// 这样的目的是为了防止函数执行时间过短,导致加载动画一闪而过,给用户造成不好的体验
export function setMinExecuteTime<T = any>(fn: Promise<T> | Function, minTime: number = 1000): Promise<T> {
  return new Promise<T>(async (resolve) => {
    const startTime = Date.now()
    const value = typeof fn === 'function' ? fn() : await fn
    const endTime = Date.now()
    const executeTime = endTime - startTime
    const delayTime = minTime - executeTime
    if (delayTime > 0) {
      setTimeout(() => {
        resolve(value)
      }, delayTime)
    } else {
      resolve(value)
    }
  })
}

// 阻塞进程指定时间
export function sleep(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

// 获取当前系统平台
export function getPlatform(): Promise<string> {
  return ipcRenderer.invoke('get-platform')
}
