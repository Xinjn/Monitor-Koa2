/*
- 当纯 HTML 被完全加载以及解析时，DOMContentLoaded 事件会被触发，不用等待 css、img、iframe 加载完。
- 当整个页面及所有依赖资源如样式表和图片都已完成加载时，将触发 load 事件。
*/

import { lazyReportCache } from '../utils/report.js'

const events = ['load', 'DOMContentLoaded']

function Load() {
  events.forEach(type => onEvent(type))
}

// 监听 DOMContentLoaded / load 加载时间
function onEvent(type) {
  function callback() {
    lazyReportCache({
      type: 'performance',
      subType: type.toLocaleLowerCase(),
      startTime: performance.now()
    })

    window.removeEventListener(type, callback, true)
  }

  window.addEventListener(type, callback, true)
}

export { Load }
