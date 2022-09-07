import { deepClone } from './index.js'

// 缓存
const cache = []

function addCache() {
  cache.push(cache)
}

function getCache() {
  return deepClone(cache)
}

function clearCache() {
  cache.length = 0
}

export { addCache, getCache, clearCache }
