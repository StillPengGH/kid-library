/**
 * 项目配置文件
 * 1.environment：开发环境 dev开发环境 prod生产环境
 * 2.database：数据库信息
 * 3.security：用于jwt生成令牌token
 *  |--secretKey：安全密钥，自己设置，需要复杂一些
 *  |--expiresIn：令牌过期时间，这里设置为2天
 */
module.exports = {
  environment: 'dev',
  database: {
    dbName: 'kid_library',
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: ''
  },
  security: {
    secretKey: 'kidlibrarykey',
    expiresIn: 60 * 60 * 48
  },
  wx: {
    appId: 'wx486ecba16e4f26d0',
    appSecret: 'd43143058d1f18c915017e3b846c2d70',
    loginUrl: 'https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code'
  },
  yushu: {
    detailUrl: 'http://t.yushu.im/v2/book/id/%s',
    keywordUrl: 'http://t.yushu.im/v2/book/search?q=%s&count=%s&start=%s&summary=%s'
  },
  host: 'http://localhost:3000/'
}