// 生成唯一ID
function generateUniqueID() {
  return `v2-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`
}

// uuid
let uuid = ''
function getUUID() {
  if (uuid) return uuid

  // 如果是手机 APP，可以调用原生方法或者设备唯一标识当成 uuid
  uuid = window.localStorage.getItem('uuid')
  if (uuid) return uuid

  // 不存在则与ID相同
  uuid = generateUniqueID()
  window.localStorage.setItem('uuid', uuid)
  return uuid
}

// 监听页面 beforeunload
function onBeforeunload(callback) {
  window.addEventListener('beforeunload', callback, true)
}

// 监听页面关闭/后台
function onHidden(callback, once) {
  const onHiddenOrPageHide = event => {
    if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
      callback(event)

      if (once) {
        window.removeEventListener('visibilitychange', onHiddenOrPageHide, true)
        window.removeEventListener('pagehide', onHiddenOrPageHide, true)
      }
    }
  }

  window.addEventListener('visibilitychange', onHiddenOrPageHide, true)
  window.addEventListener('pagehide', onHiddenOrPageHide, true)
}

// 获取页面href
function getPageURL() {
  return window.location.href
}

// 深拷贝
// function deepClone(data, cache) {
//   if (!cache) {
//     cache = new Map()
//   }

//   if (data instanceof Object) {
//     // 数组存在，取缓存数据
//     if (cache.has(data)) {
//       return cache.get(data)
//     }

//     let result = []

//     if (data instanceof Function) {
//       // 函数
//       if (data.prototype) {
//         // 普通函数:有原型
//         result = function () {
//           data.apply(this, arguments)
//         }
//       } else {
//         // 箭头函数：无原型
//         result = (...args) => {
//           data.call(undefined, ...args)
//         }
//       }
//     } else if (data instanceof Array) {
//       // 数组
//       result = []
//     } else if (data instanceof Date) {
//       // 日期
//       result = new Date(data - 0)
//     } else if (data instanceof RegExp) {
//       // 正则
//       result = new RegExp(data.source, data.flags)
//     } else {
//       result = {}
//     }
//     // 设置缓存
//     cache.set(data, result)

//     for (let key in data) {
//       if (data.hasOwnProperty(key)) {
//         result[key] = deepClone(data[key], cache)
//       }
//     }
//     return result
//   } else {
//     // 非对象
//     return data
//   }
// }
function deepClone(target) {
  return Object.assign({}, target)
}

// 监听进入页面
function executeAfterLoad(callback) {
  // 文档的加载状态
  if (document.readyState === 'complete') {
    callback()
  } else {
    // 页面加载完毕加载
    const onLoad = () => {
      callback()
      window.removeEventListener('load', onload, true)
    }

    window.addEventListener('load', onLoad, true)
  }
}

function onBFCacheRestore(callback) {
  window.addEventListener(
    'pageshow',
    event => {
      if (event.persisted) {
        callback(event)
      }
    },
    true
  )
}

export { getUUID, generateUniqueID, getPageURL, onBeforeunload, onHidden, deepClone, executeAfterLoad, onBFCacheRestore }
