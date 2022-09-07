import { ConsoleError } from './ConsoleError.js'
import { ResourceError } from './ResourceError.js'
import { JsError } from './JsError.js'
import { PromiseError } from './PromiseError.js'

const error = {
  ConsoleError: () => ConsoleError(), // 控制台报错
  ResourceError: () => ResourceError(), // 资源加载错误
  JsError: () => JsError(), // JS 错误
  PromiseError: () => PromiseError() // PromiseError 错误
}

export { error }
