import { onClick } from './onClick.js'
import { pv } from './pv.js'
import { pageChange } from './pageChange.js'
import { pageAccessDuration } from './pageAccessDuration.js'
import { pageAccessHeight } from './pageAccessHeight.js'

const behavior = {
  onClick: () => onClick(), // 用户点击
  pv: () => pv(), // pv
  pageChange: () => pageChange(), // 页面跳转
  pageAccessDuration: () => pageAccessDuration(), // 页面停留时长
  pageAccessHeight: () => pageAccessHeight() // 页面访问深度
}

export { behavior }
