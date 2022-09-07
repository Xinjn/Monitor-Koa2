/*
对于 fetch，可以根据返回数据中的的 ok 字段判断请求是否成功，如果为 true 则请求成功，否则失败。
*/

import { lazyReportCache } from '../utils/report.js'

const originalFetch = window.fetch

function InterfaceFetch() {
  window.fetch = function newFetch(url, config) {
    const startTime = Date.now()
    const reportData = {
      startTime,
      url,
      method: (config?.method || 'GET').toUpperCase(),
      subType: 'fetch',
      type: 'performance'
    }

    return originalFetch(url, config)
      .then(res => {
        reportData.endTime = Date.now()
        reportData.duration = reportData.endTime - reportData.startTime

        const data = res.clone()
        reportData.status = data.status
        reportData.success = data.ok

        lazyReportCache(reportData)

        return res
      })
      .catch(err => {
        reportData.endTime = Date.now()
        reportData.duration = reportData.endTime - reportData.startTime
        reportData.status = 0
        reportData.success = false

        lazyReportCache(reportData)

        throw err
      })
  }
}

export { InterfaceFetch }
