const axios = require('axios');
const util = require('util');
const { UserModel } = require('../models/user-model');
const { generateToken } = require('../../core/util');
const { Authorize } = require('../../middlewares/authorize');
/**
 * 微信业务处理类
 *  |--小程序获取openid方式：
 *    |--通过小程序wx.login接口获得临时登录凭证code后传到开发者服务器调用此接口完成登录流程。
 *    |--请求地址：https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=JSCODE&grant_type=authorization_code
 *      |--参数1：appid 小程序的appid
 *      |--参数2：secret 小程序的appSecret
 *      |--参数3：js_code 登录时获得的code
 *      |--参数4：grant_type 授权类型，只需要填写authorization_code
 *    |--返回值是一个Object：包括以下属性
 *      |--openid：我们这里想获得的用户唯一标识。
 *      |--session_key：会话密钥
 *      |--unionid：用户在开放平台的唯一标识符，在满足UnionID下发条件的情况下会返回。
 *      |--errcode：错误码
 *        |--[-1]：系统繁忙
 *        |--[0]：请求成功
 *        |--[40029]：code无效
 *        |--[45011]：频率限制，每个用户每分钟100次
 *      |--errmsg：错误信息
 */
class WXManager {
  // 获取openid：code就是用户调用接口时传递过来的微信小程序给用户的登录凭证code
  static async getWXToken(code) {
    // util.format把作用，把loginUrl中的三个占位符%s,分别赋值为下面三个值，返回一个赋值后的url
    let url = util.format(global.config.wx.loginUrl,
      global.config.wx.appId,
      global.config.wx.appSecret,
      code);
    // 访问url获取用户openid
    let result = await axios.get(url);
    if (result.status !== 200) {
      throw new global.errs.AuthorizeException('openid获取失败');
    }
    let errcode = result.data.errcode;
    let errmsg = result.data.errmsg;
    if (errcode) {
      throw new global.errs.AuthorizeException('openid获取失败：' + errmsg);
    }
    let openid = result.data.openid;

    // 查看数据库中是否有openid的用户
    let user = await UserModel.getUserByOpenId(openid);
    // 没有用户向数据库中插入一条
    if(!user){
      user = await UserModel.registerByOpenId(openid);
    }
    // 为用户生成token
    return generateToken(user.id,Authorize.USER);
  }
}

module.exports = {
  WXManager
}