/**
记录页面访问深度是很有用的，例如不同的活动页面 a 和 b。a 平均访问深度只有 50%，b 平均访问深度有 80%，说明 b 更受用户喜欢.根据这一点可以有针对性的修改 a 活动页面。
除此之外还可以利用访问深度以及停留时长来鉴别电商刷单。例如:
- 有人进来页面后一下就把页面拉到底部然后等待一段时间后购买，
- 有人是慢慢的往下滚动页面，最后再购买。虽然他们在页面的停留时间一样，但明显第一个人更像是刷单的。

步骤：
1. 用户进入页面时，记录 当前时间、scrollTop 值、页面可视高度、页面总高度。
2. 用户滚动页面的那一刻，会触发 scroll 事件
  2.1 在回调函数中用第一点得到的数据算出页面访问深度和停留时长。
  2.2 当用户滚动页面到某一点时，停下继续观看页面。这时记录当前时间、scrollTop 值、页面可视高度、页面总高度。
 */
import { getUUID, onBeforeunload, executeAfterLoad, getPageURL } from '../utils/index.js'
import { report, lazyReportCache } from '../utils/report.js'

let timer // 定时器
let hasReport = false // 是否上报，默认不上报
let startTime = 0 // 记录代码的执行开始时间
let scrollTop = 0 // 页面 scrollTop 值
let viewportHeight = 0 // 页面可视高度
let pageHeight = 0 // 页面总高度

function toPercent(val) {
  if (val >= 1) return '100%'
  return (val * 100).toFixed(2) + '%'
}

// 滚动监听
function onScroll() {
  // 防抖
  clearTimeout(timer)
  const now = performance.now() // 记录代码的执行开始时间

  // 2.2 在回调函数中用第一点得到的数据算出页面访问深度和停留时长
  if (!hasReport) {
    hasReport = true
    lazyReportCache({
      startTime: now, // 记录代码的执行开始时间
      duration: now - startTime, // 停留时间
      type: 'behavior', // 统计类型
      subType: 'page- access-height', // 精确类型
      pageURL: getPageURL(), // 当前页面
      value: toPercent((scrollTop + viewportHeight) / pageHeight), // 百分比
      uuid: getUUID()
    })
  }

  // 2.2 当用户滚动页面到某一点时，停下继续观看页面。这时记录当前时间、scrollTop 值、页面可视高度、页面总高度。
  timer = setTimeout(() => {
    hasReport = false // 重置上报
    startTime = now
    pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight
    scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    viewportHeight = window.innerHeight
  }, 500)
}

function pageAccessHeight() {
  // 1. 用户进入页面时，记录 当前时间、scrollTop 值、页面可视高度、页面总高度。
  executeAfterLoad(() => {
    startTime = performance.now() // 记录代码的执行开始时间
    scrollTop = document.documentElement.scrollTop || document.body.scrollTop // 页面 scrollTop 值
    viewportHeight = window.innerHeight // 页面可视高度
    pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight // 页面总高度
  })

  // 2 用户滚动页面的那一刻，会触发 scroll 事件
  window.addEventListener('scroll', onScroll)

  // 3. 页面关闭时上报
  onBeforeunload(() => {
    const now = performance.now()
    report(
      {
        startTime: now,
        duration: now - startTime,
        type: 'behavior',
        subType: 'page-access-height',
        pageURL: getPageURL(),
        value: toPercent((scrollTop + viewportHeight) / pageHeight),
        uuid: getUUID()
      },
      true
    )
  })
}

export { pageAccessHeight }
