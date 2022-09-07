/*
 * FP(first-paint)，从页面加载开始到第一个像素绘制到屏幕上的时间。
 * 其实把 FP 理解成白屏时间也是没问题的。
 */
import { getPageURL } from '../utils/index.js'
import { isSupportPerformanceObserver } from '../utils/observer.js'
import { lazyReportCache } from '../utils/report.js'

function FPandFCP() {
  // 检测 PerformanceObserver 方法
  if (!isSupportPerformanceObserver()) return

  // 测量代码
  const entryHandler = list => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        observer.disconnect() // 监听连接
      }

      // 获取内容
      const json = entry.toJSON()
      delete json.duration // 删除无用 duration 属性

      // 数据
      const reportData = {
        ...json,
        subType: entry.name,
        type: 'performance',
        pageURL: getPageURL()
      }

      // 上报
      lazyReportCache(reportData)
    }
  }

  // 声明实例
  const observer = new PerformanceObserver(entryHandler)
  // buffered 属性表示是否观察缓存数据，也就是说观察代码添加时机比事情触发时机晚也没关系。
  observer.observe({ type: 'paint', buffered: true })

  // 浏览器往返缓存 BFC
  // onBFCacheRestore()
}
export { FPandFCP }
