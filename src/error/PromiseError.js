/*
使用 addEventListener() 监听 unhandledrejection 事件，可以捕获到未处理的 promise 错误。
*/
import { lazyReportCache } from '../utils/report.js'
import { getPageURL } from '../utils/index.js'

function PromiseError() {
  // 监听 promise 错误 缺点是获取不到列数据
  window.addEventListener('unhandledrejection', e => {
    lazyReportCache({
      reason: e.reason?.stack,
      subType: 'promise',
      type: 'error',
      startTime: e.timeStamp,
      pageURL: getPageURL()
    })
  })
}

export { PromiseError }
