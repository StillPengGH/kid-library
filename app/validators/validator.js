const { BaseValidator, Rule } = require("../../core/base-validator");
const { UserModel } = require("../models/user-model");
const { LoginType, Library } = require("../lib/enum");

/**
 * 用户注册验证器
 */
class RegisterValidator extends BaseValidator {
  constructor() {
    super();
    (this.email = [new Rule("isEmail", "不符合Email规范")]),
      (this.password1 = [
        new Rule("isLength", "密码至少6个字符，最多32个字符", {
          min: 6,
          max: 32
        }),
        new Rule(
          "matches",
          "密码不符合规范",
          "^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]"
        )
      ]),
      (this.password2 = this.password1),
      (this.nickname = [
        new Rule("isLength", "昵称不符合长度规范", {
          min: 4,
          max: 32
        })
      ]);
  }

  // 验证两次密码必须相同
  validatePassword(vals) {
    const pwd1 = vals.body.password1;
    const pwd2 = vals.body.password2;
    if (pwd1 !== pwd2) {
      throw new Error("两个密码必须相同");
    }
  }

  // 验证多次提交，email不能重复
  async validateEmail(vals) {
    let email = vals.body.email;
    // 根据指定条件，查询一条符合条件数据，条件可以为多个，返回一个Promise，通过await获取得一个User实例对象
    let user = await UserModel.findOne({
      where: {
        email: email
      }
    });

    if (user) {
      throw new Error("email已存在");
    }
  }
}

/**
 * 用户登录验证器
 */
class LoginInfoValidator extends BaseValidator {
  constructor() {
    super();
    // 验证账户、密码是否符合规则，为什么用account命名，因为账户可以代表email登陆，微信code登陆等等情况
    this.account = [
      new Rule("isLength", "不符账户规则", {
        min: 4,
        max: 32
      })
    ];
    this.password = [
      // isOptional：BaseValidator自定义的，表示可为空（选填）
      new Rule("isOptional"),
      new Rule("isLength", "不符合密码规则,至少6位字符", {
        min: 6,
        max: 128
      })
    ];
  }

  // 验证登录类型：小程序，邮箱，手机，管理员...
  validateLoginType(vals) {
    let userType = vals.body.type; // 接受的type
    if (!userType) {
      throw new Error("type为必须参数");
    }
    if (!LoginType.isThisType(userType)) {
      throw new Error("type参数不合法");
    }
  }
}

/**
 * 不能为空验证器
 */

class NotEmptyValidator extends BaseValidator {
  constructor() {
    super();
    this.token = [
      new Rule("isLength", "令牌token不能为空", {
        min: 1
      })
    ];
  }
}

/**
 * 是否是Int类型验证器
 */
class IntegerValidator extends BaseValidator {
  constructor() {
    super();
    this.id = [
      new Rule("isInt", "必须是正整数", {
        min: 1
      })
    ];
  }
}

/**
 * 点赞验证器
 */
class LikeValidator extends IntegerValidator {
  constructor() {
    super();
    this.validateType = checkLibraryType;
  }
}

/**
 * learning的id和type验证器
 * 其实就是点赞验证器，直接继承就行
 */
class LearningValidator extends IntegerValidator {}

/**
 * 验证library的type类型是否合法
 */
function checkLibraryType(vals) {
  // post请求从body里获取，get请求从path里获取
  let type = vals.body.type || vals.path.type;
  if (!type) {
    throw new Error("type为必须参数");
  }
  if (!LibraryType.isThisType(type)) {
    throw new Errow("type参数不合法");
  }
}

/**
 * 搜索书籍验证
 */
class SearchValidator extends BaseValidator {
  constructor() {
    super();
    this.q = [
      new Rule("isLength", "搜索关键字应在1-16字符", {
        min: 1,
        max: 16
      })
    ];
    this.start = [
      new Rule("isInt", "必须是数字", {
        min: 0,
        max: 6000
      }),
      new Rule("isOptional", "", 0)
    ];
    this.count = [
      new Rule("isInt", "必须是1-20数字", {
        min: 1,
        max: 20
      }),
      new Rule("isOptional", "", 20)
    ];
  }
}

/**
 * 添加短评验证
 */
class AddCommentValidator extends IntegerValidator {
  constructor() {
    super();
    this.content = [
      new Rule("isLength", "必须在1-12字符之间", {
        min: 1,
        max: 12
      })
    ];
  }
}

module.exports = {
  RegisterValidator,
  LoginInfoValidator,
  NotEmptyValidator,
  LikeValidator,
  IntegerValidator,
  LearningValidator,
  SearchValidator,
  AddCommentValidator
};
