/**
 * 权限处理中间件
 */
const basicAuth = require("basic-auth"); // 获取令牌
const jwt = require("jsonwebtoken"); // 解码令牌

class Authorize {
  // 构造器作用1：当new Authorize实例的时候设置当前api的权限等级level。
  // 构造器作用2：设置不同类型用户级别。
  // 通过数字大小的比对，来api接口的访问权限
  constructor(level) {
    this.level = level || 1; // 设置指定pai接口的访问权限级别
    Authorize.USER = 8; // 普通用户权限级别8
    Authorize.ADMIN = 16; // 管理员权限级别16
    Authorize.SUPER_ADMIN = 32; // 超级管理员权限级别32
  }

  // 获取权限控制中间件，当前用户权限级别大于api接口设置的level，执行next(),小于的话直接抛出异常，告知权限不够。
  // get middleware()：通过类的属性方式设置的方法，外部获取 new Authorize().middleware即可
  get middleware() {
    return (ctx, next) => {
      // basicAuth(request)返回的是Credentials(证书)类型的对象，有两个属性：
      // name:传过来的token
      // pass:为空
      let credentials = basicAuth(ctx.req);
      if (!credentials || !credentials.name) {
        throw new global.errs.Forbbiden("没有携带令牌，或令牌不合法");
      }
      // 获取放在credentials里的token（加密的）
      let userToken = credentials.name;

      // 解密令牌
      let decodeToken = "";
      try {
        // 对token进行解码，返回object，对象有我们之前在令牌里存入的uid和scope（用户的权限级别）。
        // jwt.verify接受两参数，第一个token第二个是当时获取token是传入的密钥。
        decodeToken = jwt.verify(userToken, global.config.security.secretKey);
      } catch (error) {
        // 如果令牌过期，抛出异常
        if (error.name == "TokenExpiredError") {
          throw new global.errs.Forbbiden("令牌已经过期");
        }
      }

      // 判断当前用户时候有权限访问api接口
      if (decodeToken.scope < this.level) {
        throw new global.errs.Forbbiden("权限不足");
      }

      // 将存储在token里的uid和scope，放在ctx上下文中的自定义属性auth中
      ctx.auth = {
        uid:decodeToken.uid,
        scope:decodeToken.scope
      }

      // 携带有效令牌，且有权限，继续后续操作
      await next();
    };
  }
}

module.exports = { Authorize };
