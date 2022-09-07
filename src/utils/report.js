/* 数据上报
- 上报方法
    1. sendBeacon (数据可靠，传输异步并且不会影响下一页面的加载,而 XMLHttpRequest 和image 会)
    2. XMLHttpRequest
    3. image
- 上报时机
    1. 采用 requestIdleCallback/setTimeout 延时上报。
    2. 在 beforeunload 回调函数里上报。
    3. 缓存上报数据，达到一定数量后再上报。

将三种方式结合一起上报：

1. 先缓存上报数据，缓存到一定数量后，利用 requestIdleCallback/setTimeout 延时上报。
2. 在页面离开时统一将未上报的数据进行上报。
*/
import { addCache, getCache, clearCache } from './cache.js'
import { generateUniqueID } from './index.js'
import { config } from '../config.js'

// 判断浏览器是否存在 sendBeacon 属性
function isSupportSendBeacon() {
  return window ? !!window?.navigator?.sendBeacon : ''
}

// sendBeacon：不支持 sendBeacon 的浏览器下我们可以使用 XMLHttpRequest 来进行上报
const sendBeacon = isSupportSendBeacon() ? window.navigator.sendBeacon.bind(window.navigator) : reportWithXHR
// XMLHttpRequest
function reportWithXHR(data) {
  const xhr = new XMLHttpRequest()

  const originalProto = XMLHttpRequest.prototype

  originalProto.open.call(xhr, 'post', config.url) // 建立
  originalProto.send.call(xhr, JSON.stringify(data)) // 发送
}

// 上报
const sessionID = generateUniqueID()
function report(data, isImmediate = false) {
  if (!config.url) {
    console.error('请设置上传 URL 地址')
  }

  const reportData = JSON.stringify({
    id: sessionID, // 唯一ID
    appID: config.appID,
    userID: config.userID,
    data
  })

  // 立刻上报
  if (isImmediate) {
    sendBeacon(config.url, reportData)
    return
  }

  // 延时上报
  if (window.requestIdleCallback) {
    // 每次屏幕刷新时调用：可以适配不同浏览器
    window.requestIdleCallback(
      () => {
        sendBeacon(config.url, reportData)
      },
      { timeout: 3000 } // 超出时间：超出时间或为执行，下次屏幕刷新强制执行
    )
  } else {
    // 定时器
    setTimeout(() => {
      sendBeacon(config.url, reportData)
    })
  }
}

let timer = null
// 懒上报（默认为3s后）
function lazyReportCache(data, timeout = 3000) {
  report(data)
  // data 添加到缓存中
  addCache(data)

  // 防抖
  clearTimeout(timer)
  timer = setTimeout(() => {
    // 优先获取内存中 data
    const data = getCache()
    if (data.length) {
      report(data)
      // 清除缓存
      clearCache()
    }
  }, timeout)
}

export { report, lazyReportCache }
