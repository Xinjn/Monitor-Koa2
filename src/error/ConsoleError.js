/*
控制台报错
*/
import { getPageURL } from '../utils/index.js'
import { lazyReportCache } from '../utils/report.js'

function ConsoleError() {
  const oldConsoleError = window.console.error

  window.console.error = (...args) => {
    oldConsoleError.apply(this, args)
    lazyReportCache({
      type: 'error',
      subType: 'console-error',
      startTime: performance.now(),
      errData: args,
      pageURL: getPageURL()
    })
  }
}

export { ConsoleError }
