const util = require("util");
const axios = require("axios");
const { Sequelize, Model, Op } = require("sequelize");
const { sequelize } = require("../../core/db");
const { LikeModel } = require("./like-model");

class BookModel extends Model {
  // 获取详细信息
  async getDetail(id) {
    // let url = util.format(global.config.yushu.detailUrl, id);
    // let bookDetail = await axios.get(url);
    let bookDetail = await BookModel.findOne({
      where: {
        id: id
      }
    });
    return bookDetail;
  }

  // 书籍搜索
  static async searchBooks(q, start, count, summary = 1) {
    // 这里要对搜索关键字进行转码，使用nodejs的内置方法encodeURI(q)即可
    // let url = util.format(
    //   global.config.yushu.keywordUrl,
    //   encodeURI(q),
    //   count,
    //   start,
    //   summary
    // );
    // let result = await axios.get(url);
    let result = await BookModel.findAndCountAll({
      where: {
        title:{
          [Op.like]: '%'+q+'%'
        }
      },
      offset: start,
      limit: count
    });
    let total = result.count;
    let bookArr = result.rows;
    return {
      books: bookArr,
      count: count,
      start: start,
      total: total
    };
  }

  // 获取我喜欢的书籍总数量
  static async getMyLikeCount(uid) {
    let count = await LikeModel.count({
      where: {
        uid: uid,
        type: 400
      }
    });
    return count;
  }
}

BookModel.init(
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    title: Sequelize.STRING,
    subtitle: Sequelize.STRING,
    publisher: Sequelize.STRING,
    author: Sequelize.STRING,
    pubdate: Sequelize.DATE,
    price: Sequelize.STRING,
    package: Sequelize.STRING,
    category: Sequelize.STRING,
    summary: Sequelize.STRING,
    translator: Sequelize.STRING,
    isbn: Sequelize.STRING,
    image: Sequelize.STRING,
    images: Sequelize.STRING,
    pages: Sequelize.INTEGER,
    like_nums: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    }
  },
  {
    sequelize,
    tableName: "book"
  }
);

module.exports = {
  BookModel
};
