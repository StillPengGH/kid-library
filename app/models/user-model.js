const bcrypt = require("bcryptjs");
const { sequelize } = require("../../core/db");
const { Sequelize, Model } = require("sequelize");

/**
 * 用户Model
 */
class UserModel extends Model {
  // 通过email判断数据库是否存在该用户，并验证密码是否正确
  static async getUserByEP(email, password) {
    let user = await UserModel.findOne({
      where: {
        email: email
      }
    });
    if (!user) {
      throw new global.errs.AuthorizeException("账号不存在");
    }
    // 判断密码是否正确,通过bcryptjs的compareSync方法，参数：用户传来的密码，数据库中的密码
    let isRight = bcrypt.compareSync(password, user.password);
    if (!isRight) {
      throw new global.errs.AuthorizeException("密码不正确");
    }
    return user;
  }

  // 通过openid获取用户
  static async getUserByOpenId(openid) {
    let user = await UserModel.findOne({
      where: {
        openid: openid
      }
    });
    return user;
  }

  // 通过openid向用户表插入一条用户信息
  static async registerByOpenId(openid) {
    return await UserModel.create({
      openid: openid
    });
  }
}

UserModel.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nickname: Sequelize.STRING,
    email: {
      type: Sequelize.STRING(128),
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      // 观察者模式，每当为password赋值得化就会调用set方法
      set(val) {
        // 密码加密：获取盐salt
        let salt = bcrypt.genSaltSync(10);
        // 密码加密：生成加密密码
        let pwd = bcrypt.hashSync(val, salt);
        this.setDataValue("password", pwd);
      }
    },
    mobile: Sequelize.STRING,
    openid: {
      type: Sequelize.STRING(64),
      unique: true
    }
  },
  {
    sequelize,
    tableName: "user"
  }
);

module.exports = {
  UserModel
};
