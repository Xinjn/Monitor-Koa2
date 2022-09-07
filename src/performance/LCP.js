/*
LCP(largest-contentful-paint)，从页面加载开始到最大文本块或图像元素在屏幕上完成渲染的时间。
LCP 指标会根据页面首次开始加载的时间点来报告可视区域内可见的最大图像或文本块完成渲染的相对时间。
一个良好的 LCP 分数应该控制在 2.5 秒以内。
 */
import { getPageURL } from '../utils/index.js'
import { isSupportPerformanceObserver } from '../utils/observer.js'
import { lazyReportCache } from '../utils/report.js'

function LCP() {
  // 检测 PerformanceObserver 方法
  if (!isSupportPerformanceObserver()) return

  const entryHandler = list => {
    if (observer) {
      observer.disconnect()
    }

    for (const entry of list.getEntries()) {
      // 获取内容
      const json = entry.toJSON()
      delete json.duration // 删除无用 duration 属性

      const reportData = {
        ...json,
        target: entry.element?.tagName,
        name: entry.entryType,
        subType: entry.entryType,
        type: 'performance',
        pageURL: getPageURL()
      }

      lazyReportCache(reportData)
    }
  }

  const observer = new PerformanceObserver(entryHandler)
  observer.observe({ type: 'largest-contentful-paint', buffered: true })
}
export { LCP }
