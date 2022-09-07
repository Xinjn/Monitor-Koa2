import { FPandFCP } from './FPandFCP.js'
import { LCP } from './LCP.js'
import { CLS } from './CLS.js'
import { Load } from './Load.js'
import { InterfaceXHR } from './InterfaceXHR.js'
import { InterfaceFetch } from './InterfaceFetch.js'
import { ResourceLoadandCache } from './ResourceLoadandCache.js'
import { BFCache } from './BFCache.js'
import { FPS } from './FPS.js'

const performance = {
  FPandFCP: () => FPandFCP(), // FPandFCP
  LCP: () => LCP(), // LCP
  CLS: () => CLS(), // CLS
  Load: () => Load(), // Load 事件
  FirstScreenPaint: () => FirstScreenPaint(), // 首屏渲染时间
  InterfaceXHR: () => InterfaceXHR(), // 接口请求耗时XHR
  InterfaceFetch: () => InterfaceFetch(), // 接口请求耗时Fetch
  ResourceLoadandCache: () => ResourceLoadandCache(), // 资源加载时间、缓存命中率
  BFCache: () => BFCache(), // 浏览器往返缓存
  FPS: () => FPS() // 计算卡顿
}

export { performance }
