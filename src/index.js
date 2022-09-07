import { setConfig } from './config.js'
// 行为监控
import { behavior } from './behavior/index.js'
// 性能监听
import { performance } from './performance/index.js'
// 错误监听
import { error } from './error/index.js'

const monitor = {
  init(option = {}) {
    setConfig(option)
  },
  // 行为监听
  behavior,
  // 性能监听
  performance,
  // 错误监听
  error
}

// 挂载全局
window.monitor = monitor
export default monitor
