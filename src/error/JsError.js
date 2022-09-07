/*
使用 window.onerror 可以监听 js 错误。
*/
import { lazyReportCache } from '../utils/report.js'

function JsError() {
  // 监听 js 错误
  window.onerror = (msg, url, line, column, error) => {
    lazyReportCache({
      msg,
      line,
      column,
      error: error.stack,
      subType: 'js',
      pageURL: url,
      type: 'error',
      startTime: performance.now()
    })
  }
}

export { JsError }
