/*
CLS(layout-shift)，从页面加载开始和其生命周期状态变为隐藏期间发生的所有意外布局偏移的累积分数。

布局偏移分数的计算方式如下：
布局偏移分数 = 影响分数 * 距离分数

取所有会话窗口中的最大值:这种方式是目前最优的计算方式，每次只取所有会话窗口的最大值，用来反映页面布局偏移的最差情况。
 */

import { getPageURL, deepClone } from '../utils/index.js'
import { isSupportPerformanceObserver } from '../utils/observer.js'
import { lazyReportCache } from '../utils/report.js'

function formatCLSEntry(entry) {
  const result = entry.toJSON()
  delete result.duration
  delete result.sources

  return result
}

function CLS() {
  // 检测 PerformanceObserver 方法
  if (!isSupportPerformanceObserver()) return

  let sessionValue = 0
  let sessionEntries = []

  const cls = {
    subType: 'layout-shift',
    name: 'layout-shift',
    type: 'performance',
    pageURL: getPageURL(),
    value: 0
  }

  const entryHandler = list => {
    for (const entry of list.getEntries()) {
      // 仅统计没有最近用户输入的布局移动。
      if (!entry.hadRecentInput) {
        const firstSessionEntry = sessionEntries[0]
        const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

        //如果条目发生在前一条目之后不到1秒，并且
        //会话中第一次输入后不到5秒，包括
        //当前会话中的条目。否则，请启动新会话。
        if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1000 && entry.startTime - firstSessionEntry.startTime < 5000) {
          sessionValue += entry.value
          sessionEntries.push(formatCLSEntry(entry))
        } else {
          sessionValue = entry.value
          sessionEntries = [formatCLSEntry(entry)]
        }

        //如果当前会话值大于当前CLS值，
        //更新CLS及其相关条目。
        if (sessionValue > cls.value) {
          cls.value = sessionValue // value 字段就是布局偏移分数。
          cls.entries = sessionEntries
          cls.startTime = performance.now()
          lazyReportCache(deepClone(cls))
        }
      }
    }
  }

  const observer = new PerformanceObserver(entryHandler)
  observer.observe({ type: 'layout-shift', buffered: true })
}

export { CLS }
