const Router = require('koa-router');
//const bcrypt = require('bcryptjs');
const { RegisterValidator } = require('../../validators/validator');
const { UserModel } = require('../../models/user-model');
// prefix：增加前缀，不用每个接口都要写/v1/user
let router = new Router({
  prefix: '/v1/user'
});

/**
 * 用户注册API
 */
router.post('/register',async (ctx) => {
  // 如果RegisterValidator内部有异步自定义验证方法，必须前面夹上await
  const v = await new RegisterValidator().validate(ctx);

  // 可以把密码加密，在User得Model里进行操作,属性接收一个set(val)方法，对其加密，通过this.setDataValue()设置值
  // 密码加密：获取盐salt
  //let salt = bcrypt.genSaltSync(10);
  // 密码加密：生成加密密码
  //let pwd = bcrypt.hashSync(v.get('body.password1'),salt);

  // 验证成功会返回RegisterValidator对象,通过v.get('body.属性名')获取参数值;
  let user = {
    nickname:v.get('body.nickname'),
    email:v.get('body.email'),
    //password:pwd
    password:v.get('body.password1')
  }
  // 通过User的实体，调用create方法，即可把数据插入数据库
  // 返回的是一个Promise，通过await对其求值，会返回一个User对象
  // 这里我们不需要返回结果
  // let res = await UserModel.create(user);
  await UserModel.create(user);
  // 如果上面没有异常，返回个调用方success信息
  throw new global.errs.Success();
});

module.exports = router;