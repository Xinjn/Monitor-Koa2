/*
bfcache 是一种内存缓存，它会将整个页面保存在内存中。当用户返回时可以马上看到整个页面，而不用再次刷新。
*/
import { onBFCacheRestore, getPageURL } from '../utils/index.js'
import { isSupportPerformanceObserver } from '../utils/observer.js'
import { lazyReportCache } from '../utils/report.js'

function BFCache() {
  if (!isSupportPerformanceObserver()) return

  const entryHandler = list => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        observer.disconnect()
      }

      const json = entry.toJSON()
      delete json.duration

      const reportData = {
        ...json,
        subType: entry.name,
        type: 'performance',
        pageURL: getPageURL()
      }

      lazyReportCache(reportData)
    }
  }

  const observer = new PerformanceObserver(entryHandler)
  observer.observe({ type: 'paint', buffered: true })

  onBFCacheRestore(event => {
    requestAnimationFrame(() => {
      ;['first-paint', 'first-contentful-paint'].forEach(type => {
        lazyReportCache({
          startTime: performance.now() - event.timeStamp,
          name: type,
          subType: type,
          type: 'performance',
          pageURL: getPageURL(),
          bfc: true
        })
      })
    })
  })
}

export { BFCache }
