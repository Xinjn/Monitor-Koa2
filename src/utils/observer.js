// 检测 PerformanceObserver 方法
function isSupportPerformanceObserver() {
  return !!window.PerformanceObserver
}

export { isSupportPerformanceObserver }
