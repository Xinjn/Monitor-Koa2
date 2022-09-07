var config = {
  url: '',
  appID: '',
  userID: '',
  vue: {
    Vue: null,
    router: null
  }
};

function setConfig(options) {
  for (var key in config) {
    if (options[key]) {
      config[key] = options[key];
    }
  }
}

// 生成唯一ID
function generateUniqueID() {
  return "v2-".concat(Date.now(), "-").concat(Math.floor(Math.random() * (9e12 - 1)) + 1e12);
} // uuid


var uuid = '';

function getUUID() {
  if (uuid) return uuid; // 如果是手机 APP，可以调用原生方法或者设备唯一标识当成 uuid

  uuid = window.localStorage.getItem('uuid');
  if (uuid) return uuid; // 不存在则与ID相同

  uuid = generateUniqueID();
  window.localStorage.setItem('uuid', uuid);
  return uuid;
} // 监听页面 beforeunload


function onBeforeunload(callback) {
  window.addEventListener('beforeunload', callback, true);
} // 监听页面关闭/后台


function getPageURL() {
  return window.location.href;
} // 深拷贝
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
  return Object.assign({}, target);
} // 监听进入页面


function executeAfterLoad(callback) {
  // 文档的加载状态
  if (document.readyState === 'complete') {
    callback();
  } else {
    // 页面加载完毕加载
    var onLoad = function onLoad() {
      callback();
      window.removeEventListener('load', onload, true);
    };

    window.addEventListener('load', onLoad, true);
  }
}

function onBFCacheRestore(callback) {
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      callback(event);
    }
  }, true);
}

var cache = [];

function addCache() {
  cache.push(cache);
}

function getCache() {
  return deepClone(cache);
}

function clearCache() {
  cache.length = 0;
}

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

function isSupportSendBeacon() {
  var _window$navigator;

  return !!((_window$navigator = window.navigator) !== null && _window$navigator !== void 0 && _window$navigator.sendBeacon);
} // sendBeacon：不支持 sendBeacon 的浏览器下我们可以使用 XMLHttpRequest 来进行上报


var sendBeacon = isSupportSendBeacon() ? window.navigator.sendBeacon.bind(window.navigator) : reportWithXHR; // XMLHttpRequest

function reportWithXHR(data) {
  var xhr = new XMLHttpRequest();
  var originalProto = XMLHttpRequest.prototype;
  originalProto.open.call(xhr, 'post', config.url); // 建立

  originalProto.send.call(xhr, JSON.stringify(data)); // 发送
} // 上报


var sessionID = generateUniqueID();

function report(data) {
  var isImmediate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (!config.url) {
    console.error('请设置上传 URL 地址');
  }

  var reportData = JSON.stringify({
    id: sessionID,
    // 唯一ID
    appID: config.appID,
    userID: config.userID,
    data: data
  }); // 立刻上报

  if (isImmediate) {
    sendBeacon(config.url, reportData);
    return;
  } // 延时上报


  if (window.requestIdleCallback) {
    // 每次屏幕刷新时调用：可以适配不同浏览器
    window.requestIdleCallback(function () {
      sendBeacon(config.url, reportData);
    }, {
      timeout: 3000
    } // 超出时间：超出时间或为执行，下次屏幕刷新强制执行
    );
  } else {
    // 定时器
    setTimeout(function () {
      sendBeacon(config.url, reportData);
    });
  }
}

var timer$1 = null; // 懒上报（默认为3s后）

function lazyReportCache(data) {
  var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3000;
  report(data); // data 添加到缓存中

  addCache(); // 防抖

  clearTimeout(timer$1);
  timer$1 = setTimeout(function () {
    // 优先获取内存中 data
    var data = getCache();

    if (data.length) {
      report(data); // 清除缓存

      clearCache();
    }
  }, timeout);
}

var events$1 = ['mousedown', 'touchstart'];
/*
 * 防抖
 */

function onClick() {
  events$1.forEach(function (eventType) {
    var timer;
    window.addEventListener(eventType, function (event) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var target = event.target; // console.log('target', target)
        // 上报统计

        lazyReportCache({
          type: 'behavior',
          subType: 'click',
          target: target.tagName,
          eventType: eventType
        });
      }, 500);
    });
  });
}

function pv() {
  lazyReportCache({
    type: 'behavior',
    subType: 'pv',
    startTime: performance.now(),
    pageURL: getPageURL(),
    referrer: document.referrer,
    uuid: getUUID()
  });
}

function pageChange() {
  // popstate
  var from = '';
  window.addEventListener('popstate', function () {
    console.log('hash 更新触发 popstate');
    var to = getPageURL();
    lazyReportCache({
      from: from,
      to: to,
      type: 'behavior',
      subType: 'popstate',
      startTime: performance.now(),
      uuid: getUUID()
    });
    from = to;
  }, true); // hashchange

  var oldURL = '';
  window.addEventListener('hashchange', function (event) {
    console.log('hash 改变触发 hashchange');
    var newURL = event.newURL;
    lazyReportCache({
      from: oldURL,
      to: newURL,
      type: 'behavior',
      subType: 'hashchange',
      startTime: performance.now() // uuid: getUUID()

    });
    oldURL = newURL;
  }, true);
}

function pageAccessDuration() {
  onBeforeunload(function () {
    report({
      type: 'behavior',
      subType: 'page-access-duration',
      startTime: performance.now(),
      pageURL: getPageURL(),
      uuid: getUUID()
    }, true);
  });
}

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
var timer; // 定时器

var hasReport = false; // 是否上报，默认不上报

var startTime = 0; // 记录代码的执行开始时间

var scrollTop = 0; // 页面 scrollTop 值

var viewportHeight = 0; // 页面可视高度

var pageHeight = 0; // 页面总高度

function toPercent(val) {
  if (val >= 1) return '100%';
  return (val * 100).toFixed(2) + '%';
} // 滚动监听


function onScroll() {
  // 防抖
  clearTimeout(timer);
  var now = performance.now(); // 记录代码的执行开始时间
  // 2.2 在回调函数中用第一点得到的数据算出页面访问深度和停留时长

  if (!hasReport) {
    hasReport = true;
    lazyReportCache({
      startTime: now,
      // 记录代码的执行开始时间
      duration: now - startTime,
      // 停留时间
      type: 'behavior',
      // 统计类型
      subType: 'page- access-height',
      // 精确类型
      pageURL: getPageURL(),
      // 当前页面
      value: toPercent((scrollTop + viewportHeight) / pageHeight),
      // 百分比
      uuid: getUUID()
    });
  } // 2.2 当用户滚动页面到某一点时，停下继续观看页面。这时记录当前时间、scrollTop 值、页面可视高度、页面总高度。


  timer = setTimeout(function () {
    hasReport = false; // 重置上报

    startTime = now;
    pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    viewportHeight = window.innerHeight;
  }, 500);
}

function pageAccessHeight() {
  // 1. 用户进入页面时，记录 当前时间、scrollTop 值、页面可视高度、页面总高度。
  executeAfterLoad(function () {
    startTime = performance.now(); // 记录代码的执行开始时间

    scrollTop = document.documentElement.scrollTop || document.body.scrollTop; // 页面 scrollTop 值

    viewportHeight = window.innerHeight; // 页面可视高度

    pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight; // 页面总高度
  }); // 2 用户滚动页面的那一刻，会触发 scroll 事件

  window.addEventListener('scroll', onScroll); // 3. 页面关闭时上报

  onBeforeunload(function () {
    var now = performance.now();
    report({
      startTime: now,
      duration: now - startTime,
      type: 'behavior',
      subType: 'page-access-height',
      pageURL: getPageURL(),
      value: toPercent((scrollTop + viewportHeight) / pageHeight),
      uuid: getUUID()
    }, true);
  });
}

var behavior = {
  onClick: function onClick$1() {
    return onClick();
  },
  // 用户点击
  pv: function pv$1() {
    return pv();
  },
  // pv
  pageChange: function pageChange$1() {
    return pageChange();
  },
  // 页面跳转
  pageAccessDuration: function pageAccessDuration$1() {
    return pageAccessDuration();
  },
  // 页面停留时长
  pageAccessHeight: function pageAccessHeight$1() {
    return pageAccessHeight();
  } // 页面访问深度

};

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

  if (!it) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = it.call(o);
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

// 检测 PerformanceObserver 方法
function isSupportPerformanceObserver() {
  return !!window.PerformanceObserver;
}

function FPandFCP() {
  // 检测 PerformanceObserver 方法
  if (!isSupportPerformanceObserver()) return; // 测量代码

  var entryHandler = function entryHandler(list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;

        if (entry.name === 'first-contentful-paint') {
          observer.disconnect(); // 监听连接
        } // 获取内容


        var json = entry.toJSON();
        delete json.duration; // 删除无用 duration 属性
        // 数据

        var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
          subType: entry.name,
          type: 'performance',
          pageURL: getPageURL()
        }); // 上报


        lazyReportCache(reportData);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }; // 声明实例


  var observer = new PerformanceObserver(entryHandler); // buffered 属性表示是否观察缓存数据，也就是说观察代码添加时机比事情触发时机晚也没关系。

  observer.observe({
    type: 'paint',
    buffered: true
  }); // 浏览器往返缓存 BFC
  // onBFCacheRestore()
}

function LCP() {
  // 检测 PerformanceObserver 方法
  if (!isSupportPerformanceObserver()) return;

  var entryHandler = function entryHandler(list) {
    if (observer) {
      observer.disconnect();
    }

    var _iterator = _createForOfIteratorHelper(list.getEntries()),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _entry$element;

        var entry = _step.value;
        // 获取内容
        var json = entry.toJSON();
        delete json.duration; // 删除无用 duration 属性

        var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
          target: (_entry$element = entry.element) === null || _entry$element === void 0 ? void 0 : _entry$element.tagName,
          name: entry.entryType,
          subType: entry.entryType,
          type: 'performance',
          pageURL: getPageURL()
        });

        lazyReportCache(reportData);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };

  var observer = new PerformanceObserver(entryHandler);
  observer.observe({
    type: 'largest-contentful-paint',
    buffered: true
  });
}

function formatCLSEntry(entry) {
  var result = entry.toJSON();
  delete result.duration;
  delete result.sources;
  return result;
}

function CLS() {
  // 检测 PerformanceObserver 方法
  if (!isSupportPerformanceObserver()) return;
  var sessionValue = 0;
  var sessionEntries = [];
  var cls = {
    subType: 'layout-shift',
    name: 'layout-shift',
    type: 'performance',
    pageURL: getPageURL(),
    value: 0
  };

  var entryHandler = function entryHandler(list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;

        // 仅统计没有最近用户输入的布局移动。
        if (!entry.hadRecentInput) {
          var firstSessionEntry = sessionEntries[0];
          var lastSessionEntry = sessionEntries[sessionEntries.length - 1]; //如果条目发生在前一条目之后不到1秒，并且
          //会话中第一次输入后不到5秒，包括
          //当前会话中的条目。否则，请启动新会话。

          if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1000 && entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(formatCLSEntry(entry));
          } else {
            sessionValue = entry.value;
            sessionEntries = [formatCLSEntry(entry)];
          } //如果当前会话值大于当前CLS值，
          //更新CLS及其相关条目。


          if (sessionValue > cls.value) {
            cls.value = sessionValue; // value 字段就是布局偏移分数。

            cls.entries = sessionEntries;
            cls.startTime = performance.now();
            lazyReportCache(deepClone(cls));
          }
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };

  var observer = new PerformanceObserver(entryHandler);
  observer.observe({
    type: 'layout-shift',
    buffered: true
  });
}

/*
- 当纯 HTML 被完全加载以及解析时，DOMContentLoaded 事件会被触发，不用等待 css、img、iframe 加载完。
- 当整个页面及所有依赖资源如样式表和图片都已完成加载时，将触发 load 事件。
*/
var events = ['load', 'DOMContentLoaded'];

function Load() {
  events.forEach(function (type) {
    return onEvent(type);
  });
} // 监听 DOMContentLoaded / load 加载时间


function onEvent(type) {
  function callback() {
    lazyReportCache({
      type: 'performance',
      subType: type.toLocaleLowerCase(),
      startTime: performance.now()
    });
    window.removeEventListener(type, callback, true);
  }

  window.addEventListener(type, callback, true);
}

/*
如何判断 XML 请求是否成功？可以根据他的状态码是否在 200~299 之间。如果在，那就是成功，否则失败。
*/
var originalProto = XMLHttpRequest.prototype;
var originalOpen = originalProto.open;
var originalSend = originalProto.send;

function InterfaceXHR() {
  originalProto.open = function newOpen() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this.url = args[1];
    this.method = args[0];
    originalOpen.apply(this, args);
  };

  originalProto.send = function newSend() {
    var _this = this;

    this.startTime = Date.now();

    var onLoadend = function onLoadend() {
      _this.endTime = Date.now();
      _this.duration = _this.endTime - _this.startTime;
      var status = _this.status,
          duration = _this.duration,
          startTime = _this.startTime,
          endTime = _this.endTime,
          url = _this.url,
          method = _this.method;
      var reportData = {
        status: status,
        duration: duration,
        startTime: startTime,
        endTime: endTime,
        url: url,
        method: (method || 'GET').toUpperCase(),
        success: status >= 200 && status < 300,
        subType: 'xhr',
        type: 'performance'
      };
      lazyReportCache(reportData);

      _this.removeEventListener('loadend', onLoadend, true);
    };

    this.addEventListener('loadend', onLoadend, true);

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    originalSend.apply(this, args);
  };
}

/*
对于 fetch，可以根据返回数据中的的 ok 字段判断请求是否成功，如果为 true 则请求成功，否则失败。
*/
var originalFetch = window.fetch;

function InterfaceFetch() {
  window.fetch = function newFetch(url, config) {
    var startTime = Date.now();
    var reportData = {
      startTime: startTime,
      url: url,
      method: ((config === null || config === void 0 ? void 0 : config.method) || 'GET').toUpperCase(),
      subType: 'fetch',
      type: 'performance'
    };
    return originalFetch(url, config).then(function (res) {
      reportData.endTime = Date.now();
      reportData.duration = reportData.endTime - reportData.startTime;
      var data = res.clone();
      reportData.status = data.status;
      reportData.success = data.ok;
      lazyReportCache(reportData);
      return res;
    }).catch(function (err) {
      reportData.endTime = Date.now();
      reportData.duration = reportData.endTime - reportData.startTime;
      reportData.status = 0;
      reportData.success = false;
      lazyReportCache(reportData);
      throw err;
    });
  };
}

function ResourceLoadandCache() {
  executeAfterLoad(function () {
    observeEvent('resource');
    observeEvent('navigation');
  });
}

var hasAlreadyCollected = false;

function observeEvent(entryType) {
  function entryHandler(list) {
    var data = list.getEntries ? list.getEntries() : list;

    var _iterator = _createForOfIteratorHelper(data),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;

        if (entryType === 'navigation') {
          if (hasAlreadyCollected) return;

          if (observer) {
            observer.disconnect();
          }

          hasAlreadyCollected = true;
        } // nextHopProtocol 属性为空，说明资源解析错误或者跨域
        // beacon 用于上报数据，所以不统计。xhr fetch 单独统计


        if (!entry.nextHopProtocol && entryType !== 'navigation' || filter(entry.initiatorType)) {
          return;
        }

        lazyReportCache({
          name: entry.name,
          // 资源名称
          subType: entryType,
          type: 'performance',
          sourceType: entry.initiatorType,
          // 资源类型
          duration: entry.duration,
          // 资源加载耗时
          dns: entry.domainLookupEnd - entry.domainLookupStart,
          // DNS 耗时
          tcp: entry.connectEnd - entry.connectStart,
          // 建立 tcp 连接耗时
          redirect: entry.redirectEnd - entry.redirectStart,
          // 重定向耗时
          ttfb: entry.responseStart,
          // 首字节时间
          protocol: entry.nextHopProtocol,
          // 请求协议
          responseBodySize: entry.encodedBodySize,
          // 响应内容大小
          responseHeaderSize: entry.transferSize - entry.encodedBodySize,
          // 响应头部大小
          resourceSize: entry.decodedBodySize,
          // 资源解压后的大小
          isCache: isCache(entry),
          // 是否命中缓存
          startTime: performance.now()
        });
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  var observer;

  if (isSupportPerformanceObserver()) {
    observer = new PerformanceObserver(entryHandler);
    observer.observe({
      type: entryType,
      buffered: true
    });
  } else {
    var data = window.performance.getEntriesByType(entryType);
    entryHandler(data);
  }
} // 不统计以下类型的资源


var preventType = ['fetch', 'xmlhttprequest', 'beacon'];
var isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

if (isSafari) {
  // safari 会把接口请求当成 other
  preventType.push('other');
}

function filter(type) {
  return preventType.includes(type);
}

function isCache(entry) {
  // 直接从缓存读取或 304
  return entry.transferSize === 0 || entry.transferSize !== 0 && entry.encodedBodySize === 0;
}

function BFCache() {
  if (!isSupportPerformanceObserver()) return;

  var entryHandler = function entryHandler(list) {
    var _iterator = _createForOfIteratorHelper(list.getEntries()),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var entry = _step.value;

        if (entry.name === 'first-contentful-paint') {
          observer.disconnect();
        }

        var json = entry.toJSON();
        delete json.duration;

        var reportData = _objectSpread2(_objectSpread2({}, json), {}, {
          subType: entry.name,
          type: 'performance',
          pageURL: getPageURL()
        });

        lazyReportCache(reportData);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };

  var observer = new PerformanceObserver(entryHandler);
  observer.observe({
    type: 'paint',
    buffered: true
  });
  onBFCacheRestore(function (event) {
    requestAnimationFrame(function () {
      ['first-paint', 'first-contentful-paint'].forEach(function (type) {
        lazyReportCache({
          startTime: performance.now() - event.timeStamp,
          name: type,
          subType: type,
          type: 'performance',
          pageURL: getPageURL(),
          bfc: true
        });
      });
    });
  });
}

/*
 */
var next = window.requestAnimationFrame ? requestAnimationFrame : function (callback) {
  setTimeout(callback, 1000 / 60);
};
var frames = [];

function FPS() {
  var frame = 0;
  var lastSecond = Date.now();

  function calculateFPS() {
    frame++;
    var now = Date.now();

    if (lastSecond + 1000 <= now) {
      // 由于 now - lastSecond 的单位是毫秒，所以 frame 要 * 1000
      var fps = Math.round(frame * 1000 / (now - lastSecond));
      frames.push(fps);
      frame = 0;
      lastSecond = now;
    } // 避免上报太快，缓存一定数量再上报


    if (frames.length >= 10) {
      // 正常为60，10便于测试
      report(deepClone({
        frames: frames,
        type: 'performace',
        subType: 'fps'
      }));
      frames.length = 0;
    }

    next(calculateFPS);
  }

  calculateFPS();
}

var performance$1 = {
  FPandFCP: function FPandFCP$1() {
    return FPandFCP();
  },
  // FPandFCP
  LCP: function LCP$1() {
    return LCP();
  },
  // LCP
  CLS: function CLS$1() {
    return CLS();
  },
  // CLS
  Load: function Load$1() {
    return Load();
  },
  // Load 事件
  FirstScreenPaint: function (_FirstScreenPaint) {
    function FirstScreenPaint() {
      return _FirstScreenPaint.apply(this, arguments);
    }

    FirstScreenPaint.toString = function () {
      return _FirstScreenPaint.toString();
    };

    return FirstScreenPaint;
  }(function () {
    return FirstScreenPaint();
  }),
  // 首屏渲染时间
  InterfaceXHR: function InterfaceXHR$1() {
    return InterfaceXHR();
  },
  // 接口请求耗时XHR
  InterfaceFetch: function InterfaceFetch$1() {
    return InterfaceFetch();
  },
  // 接口请求耗时Fetch
  ResourceLoadandCache: function ResourceLoadandCache$1() {
    return ResourceLoadandCache();
  },
  // 资源加载时间、缓存命中率
  BFCache: function BFCache$1() {
    return BFCache();
  },
  // 浏览器往返缓存
  FPS: function FPS$1() {
    return FPS();
  } // 计算卡顿

};

/*
控制台报错
*/

function ConsoleError() {
  var _this = this;

  var oldConsoleError = window.console.error;

  window.console.error = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    oldConsoleError.apply(_this, args);
    lazyReportCache({
      type: 'error',
      subType: 'console-error',
      startTime: performance.now(),
      errData: args,
      pageURL: getPageURL()
    });
  };
}

/*
使用 addEventListener() 监听 error 事件，可以捕获到资源加载失败错误。
*/

function ResourceError() {
  // 捕获资源加载失败错误 js css img...
  window.addEventListener('error', function (e) {
    var target = e.target;
    if (!target) return;

    if (target.src || target.href) {
      var url = target.src || target.href;
      lazyReportCache({
        url: url,
        type: 'error',
        subType: 'resource',
        startTime: e.timeStamp,
        html: target.outerHTML,
        resourceType: target.tagName,
        paths: e.path.map(function (item) {
          return item.tagName;
        }).filter(Boolean),
        pageURL: getPageURL()
      });
    }
  }, true);
}

/*
使用 window.onerror 可以监听 js 错误。
*/

function JsError() {
  // 监听 js 错误
  window.onerror = function (msg, url, line, column, error) {
    lazyReportCache({
      msg: msg,
      line: line,
      column: column,
      error: error.stack,
      subType: 'js',
      pageURL: url,
      type: 'error',
      startTime: performance.now()
    });
  };
}

/*
使用 addEventListener() 监听 unhandledrejection 事件，可以捕获到未处理的 promise 错误。
*/

function PromiseError() {
  // 监听 promise 错误 缺点是获取不到列数据
  window.addEventListener('unhandledrejection', function (e) {
    var _e$reason;

    lazyReportCache({
      reason: (_e$reason = e.reason) === null || _e$reason === void 0 ? void 0 : _e$reason.stack,
      subType: 'promise',
      type: 'error',
      startTime: e.timeStamp,
      pageURL: getPageURL()
    });
  });
}

var error = {
  ConsoleError: function ConsoleError$1() {
    return ConsoleError();
  },
  // 控制台报错
  ResourceError: function ResourceError$1() {
    return ResourceError();
  },
  // 资源加载错误
  JsError: function JsError$1() {
    return JsError();
  },
  // JS 错误
  PromiseError: function PromiseError$1() {
    return PromiseError();
  } // PromiseError 错误

};

var monitor = {
  init: function init() {
    var option = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    setConfig(option);
  },
  // 行为监听
  behavior: behavior,
  // 性能监听
  performance: performance$1,
  // 错误监听
  error: error
}; // 挂载全局

window.monitor = monitor;

export { monitor as default };
//# sourceMappingURL=monitor.esm.js.map
