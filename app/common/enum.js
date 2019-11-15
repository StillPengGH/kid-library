/**
 * 用来判断传递来的类型是否是符合我们规定的登录类型
 */
function isThisType(val) {
  for (let key in this) {
    if (val === this[key]) {
      return true;
    }
  }
  return false;
};

/**
 * 使用类似于枚举的形式把用户登录方式存入LoginType对象中
 *  USER_MINI_PROGRAM:100, 微信小程序登录
 *  USER_EMAIL:101,        用户邮箱登录
 *  USER_MOBILE:102,       用户手机号登录
 *  ADMIN_EMAIL:201,       管理员邮箱登录
 *  isThisType             判断是否符合规定的登录类型
 */
const LoginType = {
  USER_MINI_PROGRAM: 100,
  USER_EMAIL: 101,
  USER_MOBILE: 102,
  ADMIN_EMAIL: 201,
  isThisType
};

/**
 * library的类型
 */
const LibraryType = {
  VERSE: 100,
  MUSIC: 200,
  STORY: 300,
  BOOK: 400,
  isThisType
}

module.exports = { LoginType, LibraryType };