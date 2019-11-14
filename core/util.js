/**
 * 通用方法1：查找成员,basevalidator中使用
 * 参数：
 *  |--instance：实例
 *  |--specifiedType：规定的类型
 *  |--filter：过滤器
 */
const findMembers = function(instance, { prefix, specifiedType, filter }) {
  // 递归函数
  function _find(instance) {
    // 如果instance不是一个对象(每个对象都有__proto__属性)
    if (instance.__proto__ == null) {
      return [];
    }

    // 获取对象的所有key值，通过Reflect.ownKeys(obj)方法，返回一个数组
    let keys = keys.filter(name => {
      // 过滤掉不满足条件的属性或方法名
      return _shouldKeep(name);
    });
  }

  function _shouldKeep(value) {
    if (filter) {
      if (filter(value)) {
        return true;
      }
    }
    if (prefix) {
      if (value.startsWith(prefix)) {
        return true;
      }
    }
    if (specifiedType) {
      if (instance[value] instanceof specifiedType) {
        return true;
      }
    }
  }
  return _find(instance);
};

/**
 * 通用方法2：使用jwt第三方工具，生成token令牌
 * jwt:最流行的跨域身份验证解决方案
 * jwt生成的token最大的有点是可以携带数据，例如：uid 用户id，scope 权限级别。
 */
const generateToken = function(uid, scope) {
  let secretKey = global.config.security.secretKey; // 自定义密钥
  let expiresIn = global.config.security.expiresIn; // 过期时间

  let token = jwt.sign({
    uid,
    scope
  },secretKey,{
    expiresIn
  });

  return token;
};

module.exports = {
  findMembers,
  generateToken
}
