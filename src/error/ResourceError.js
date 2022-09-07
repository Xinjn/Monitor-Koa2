/*
使用 addEventListener() 监听 error 事件，可以捕获到资源加载失败错误。
*/
import { lazyReportCache } from '../utils/report.js'
import { getPageURL } from '../utils/index.js'

function ResourceError() {
  // 捕获资源加载失败错误 js css img...
  window.addEventListener(
    'error',
    e => {
      const target = e.target
      if (!target) return

      if (target.src || target.href) {
        const url = target.src || target.href
        lazyReportCache({
          url,
          type: 'error',
          subType: 'resource',
          startTime: e.timeStamp,
          html: target.outerHTML,
          resourceType: target.tagName,
          paths: e.path.map(item => item.tagName).filter(Boolean),
          pageURL: getPageURL()
        })
      }
    },
    true
  )
}

export { ResourceError }
