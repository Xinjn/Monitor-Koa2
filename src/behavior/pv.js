import { lazyReportCache } from '../utils/report.js'
import { getPageURL, getUUID } from '../utils/index.js'

function pv() {
  lazyReportCache({
    type: 'behavior',
    subType: 'pv',
    startTime: performance.now(),
    pageURL: getPageURL(),
    referrer: document.referrer,
    uuid: getUUID()
  })
}

export { pv }
