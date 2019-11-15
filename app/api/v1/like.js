const Router = require('koa-router');
const { Authorize } = require('@middlewares/authorize');
const { LikeValidator } = require('@validator');
const { LikeModel } = require('../../models/like-model');

const router = new Router({
  prefix: '/v1/like'
})

/**
 * 点赞
 */
router.post('/', new Authorize(2).middleware, async (ctx) => {
  // 这里validate的第二个参数的意思是，LikeValidate继承了正整数验证器
  // 而正整数验证器验证的是id字段，但是这里我们可以通过这种方式，改为验证lib_id
  let v = await new LikeValidator().validate(ctx, {
    id: 'lib_id'
  });
  // 验证lib_id和type都没问题，进行点赞相关操作
  await LikeModel.like(v.get('body.lib_id'),v.get('body.type'),ctx.auth.uid);
  // 返回操作成功
  throw new global.errs.Success();
});

/**
 * 取消点赞
 */
router.post('/cancel', new Authorize(2).middleware,async (ctx) => {
  let v = await new LikeValidator().validate(ctx,{
    id:'lib_id'
  });
  await LikeModel.dislike(v.get('body.lib_id'),v.get('body.type'),ctx.auth.uid);
  throw new global.errs.Success();
});

module.exports = router;