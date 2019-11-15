const { Sequelize, Model, Op } = require("sequelize");
const { LikeModel } = require("./like-model");
const { sequelize } = require("../../core/db");

class HotBookModel extends Model {
  static async getAll() {
    // 获取热门书籍
    let books = await HotBookModel.findAll({
      order: [["index", "ASC"]]
    });
    // 把热门书籍的id存放在一个数组中
    let ids = [];
    books.forEach(book => {
      ids.push(book.id);
    });
    // 根据ids查询每本人们书籍的点赞数，最后和id封装成一个[{id:1,count:2},{...},{...}]
    // group是按照lib_id分组，attributes是查询的字段，Sequelize.fn是使用cout(*)这个函数，最后'count'是别名，相当于as
    let likeArr = await LikeModel.findAll({
      where: {
        lib_id: {
          [Op.in]: ids
        },
        type: 400
      },
      group: ["lib_id"],
      attributes: ["lib_id", [Sequelize.fn("COUNT", "*"), "count"]]
    });
    // 循环books，将我们得到的每本书count封装在book里。
    books.forEach(book => {
      HotBookModel._setBookData(book, likeArr);
    });
    return books;
  }

  static _setBookData(book, likeArr) {
    let count = 0;
    likeArr.forEach(likeModel => {
      if (book.id === likeModel.lib_id) {
        count = likeModel.get("count");
      }
    });
    book.setDataValue("like_nums", count);
  }
}

HotBookModel.init(
  {
    book_id: Sequelize.INTEGER,
    index: Sequelize.INTEGER,
    image: Sequelize.STRING,
    author: Sequelize.STRING,
    title: Sequelize.STRING
  },
  {
    sequelize,
    tableName: "hot_book"
  }
);

module.exports = {
  HotBookModel
};
