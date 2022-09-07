/*
如何判断 XML 请求是否成功？可以根据他的状态码是否在 200~299 之间。如果在，那就是成功，否则失败。
*/

import { lazyReportCache } from '../utils/report.js'

const originalProto = XMLHttpRequest.prototype
const originalOpen = originalProto.open
const originalSend = originalProto.send

function InterfaceXHR() {
  originalProto.open = function newOpen(...args) {
    this.url = args[1]
    this.method = args[0]
    originalOpen.apply(this, args)
  }

  originalProto.send = function newSend(...args) {
    this.startTime = Date.now()

    const onLoadend = () => {
      this.endTime = Date.now()
      this.duration = this.endTime - this.startTime

      const { status, duration, startTime, endTime, url, method } = this
      const reportData = {
        status,
        duration,
        startTime,
        endTime,
        url,
        method: (method || 'GET').toUpperCase(),
        success: status >= 200 && status < 300,
        subType: 'xhr',
        type: 'performance'
      }

      lazyReportCache(reportData)

      this.removeEventListener('loadend', onLoadend, true)
    }

    this.addEventListener('loadend', onLoadend, true)
    originalSend.apply(this, args)
  }
}

export { InterfaceXHR }
