const { Sequelize, Model } = require("sequelize");
const { unset, clone, isArray } = require("lodash");

// 在配置文件中获取db相关信息
const {
  dbName,
  host,
  port,
  user,
  password
} = require("../config/pro-config").database;

/**
 * 创建Sequelize对象
 * 1.Sequelize构造器接受四个参数：
 *  |--dbName：数据库名
 *  |--user：用户名
 *  |--password：密码
 *  |--obj：其他配置
 * 2.obj的属性：
 *  |--dialect：用的什么数据库，数据库类型，mysql，postgres，sqlite，mariadb和mssql之一。
 *  |--host：数据库主机
 *  |--port：端口号
 *  |--pool：数据库连接池
 *    |--max：最大连接数
 *    |--min：最小连接数
 *    |--idle：连接释放之前可以空闲的最长时间（毫秒）
 *  |--logging：每当Sequelize操作数据库，都会把原始sql在命令行中显示出来。
 *  |--timezone：时区，如果timezone不加8小时，那么通过Sequelize生成的时间回和北京时间差8小时
 */
const sequelize = new Sequelize(dbName, user, password, {
  dialect: "mysql",
  host,
  port,
  pool: {
    min: 0,
    max: 10,
    idle: 10000
  },
  logging: true,
  timezone: "+08:00",
  define: {
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    underscored: true,
    scopes: {
      bh: {
        attributes: {
          exclude: ["updated_at", "created_at", "deleted_at"]
        }
      }
    }
  }
});

/**
 * 将模型创建到数据库中的方法,sequelize监听到有模型就会帮你创建表
 */
sequelize.sync({
  force: false
});

/**
 * 在Model上原型上定义toJSON方法，进行全局序列化操作
 */
Model.prototype.toJSON = function() {
  // this.dataValues：获取继承Model实体所有数据
  let data = clone(this.dataValues);

  // 调用toJSON方法，就会删除数据对象中的updated_at、created_at、deleted_at
  unset(data, "created_at");
  unset(data, "updated_at");
  unset(data, "deleted_at");

  // 处理图片信息，将没有http...的图片加上http..../image.....jpg
  for (let key in data) {
    if (key == "image") {
      if (!data[key].startsWith("http")) {
        data[key] = global.config.host + data[key];
      }
    }
  }

  // 可以在model里使用model.exclude=['name','age']把结果中name和age去除。
  if (isArray(this.exclude)) {
    this.exclude.forEach(value => {
      unset(data,value);
    });
  }
  return data;
};

/**
 * 将Sequelize对象导出，通过Sequelize对象就可以创建模型了
 */
module.exports = { sequelize };
