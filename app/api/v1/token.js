const Router = require("koa-router");
const {
  LoginInfoValidator,
  NotEmptyValidator
} = require("../../validators/validator");
const { LoginType } = require("../../common/enum");
const { UserModel } = require("../../models/user-model");
const { generateToken } = require("../../../core/util");
const { Authorize } = require("../../../middlewares/authorize");
const { WXManager } = require("../../services/wx-service");
let router = new Router({
  prefix: "/v1/token"
});

/**
 * 令牌的获取：
 *  |--令牌的作用：我们定义的API接口有开放的和私有的，
 *    |--私有的要登录成功后，我们给客户端颁发一个令牌，当请求私有API必须携带令牌，
 *       令牌里可以存放信息，比如uid或用的的权限标识，如果匹配不成功，则不返回结果
 *    |--开放的不需要令牌。
 */
router.post("/", async ctx => {
  // 1.验证用户名、密码、用户登录类型
  let v = await new LoginInfoValidator().validate(ctx);
  // 2.用户登录信息输入合法，根据不同的登录类型获取令牌token。
  let token = "";
  switch (v.get("body.type")) {
    case LoginType.USER_EMAIL:
      // 普通用户邮箱登录，通过邮箱和密码进行用户验证，并获取响应的令牌
      // account：代表email
      token = await _getUserToken(
        v.get("body.account"),
        v.get("body.password")
      );
      break;
    case LoginType.USER_MINI_PROGRAM:
      // 微信小程序登陆
      // account：代表微信小程序登陆，微信给用户的一个code凭证
      token = await WXManager.getWXToken(v.get("body.account"));
      break;
    case LoginType.ADMIN_EMAIL:
      break;
    default:
      throw new global.errs.ParameterException("没有响应的处理函数");
  }
  // 3.返回token
  ctx.body = {
    token
  };
});

/**
 * 验证令牌是否有效（包含是否过期）
 * @param token 令牌
 */
router.post("/verify", async ctx => {
  let result = false;
  // 先判断token是否为空
  let v = await new NotEmptyValidator().validate(ctx);
  let token = v.get("body.token");
  // 验证token是否有效
  result = Authorize.verifyToken(token);
  ctx.body = {
    is_valid: result
  };
});

/**
 * 获取token（普通用户登录 email+password）
 */
async function _getUserToken(email, password) {
  let token = "";
  // 先验证数据库中是否有该用户，通过接收的email和password
  let user = await UserModel.getUserByEP(email, password);
  // 如果返回user，即存在用户，并且通过相关的验证，生成token返回给调用方
  // 我们在令牌里存入用户的id和用户的权限级别
  token = generateToken(user.id, Authorize.USER);
  return token;
}

module.exports = router;
