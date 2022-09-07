import { report } from '../utils/report.js'
import { onBeforeunload, getPageURL, getUUID } from '../utils/index.js'

function pageAccessDuration() {
  onBeforeunload(() => {
    report(
      {
        type: 'behavior',
        subType: 'page-access-duration',
        startTime: performance.now(),
        pageURL: getPageURL(),
        uuid: getUUID()
      },
      true
    )
  })
}

export { pageAccessDuration }
