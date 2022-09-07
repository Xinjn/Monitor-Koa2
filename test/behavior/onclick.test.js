import { config, setConfig } from '../../src/config'
import { report } from '../../src/utils/report.js'

/* 接口测试 */
test('测试 setConfig 函数', () => {
  setConfig({ url: 'http://localhost:3000/api/reportData' })

  expect(config).toEqual({
    url: 'http://localhost:3000/api/reportData',
    appID: '',
    userID: '',
    vue: { Vue: null, router: null }
  })
})

test('测试 report 函数', () => {
  setConfig({ url: 'http://localhost:3000/api/reportData' })
  console.log('report', report())
})
