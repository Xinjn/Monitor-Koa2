import { lazyReportCache } from '../utils/report.js'
import { getPageURL, getUUID } from '../utils/index.js'

function pageChange() {
  // popstate
  let from = ''
  window.addEventListener(
    'popstate',
    () => {
      console.log('hash 更新触发 popstate')
      const to = getPageURL()

      lazyReportCache({
        from,
        to,
        type: 'behavior',
        subType: 'popstate',
        startTime: performance.now(),
        uuid: getUUID()
      })

      from = to
    },
    true
  )

  // hashchange
  let oldURL = ''
  window.addEventListener(
    'hashchange',
    event => {
      console.log('hash 改变触发 hashchange')
      const newURL = event.newURL

      lazyReportCache({
        from: oldURL,
        to: newURL,
        type: 'behavior',
        subType: 'hashchange',
        startTime: performance.now()
        // uuid: getUUID()
      })

      oldURL = newURL
    },
    true
  )
}

export { pageChange }
