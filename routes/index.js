const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.post('/api/reportData', async (ctx, next) => {
  const { request } = ctx
  console.log('采集数据', request.body)
  ctx.body = '上报成功'
})

router.get('/api/getList', async (ctx, next) => {
  ctx.body = "{msg:'请求列表成功',code:200,data:{}}"
})

module.exports = router
