const { Sequelize, Model, Op } = require('sequelize');
const { sequelize } = require('../../core/db');
const { isArray,unset } = require('lodash');

/**
 * 书籍短评相关
 */
class CommentModel extends Model {
  // 新增短评
  static async addComment(book_id, content) {
    let comment = await CommentModel.findOne({
      where: {
        book_id,
        content
      }
    });
    if (!comment) {
      return await CommentModel.create({
        content,
        nums: 1,
        book_id
      });
    } else {
      return await comment.increment('nums', {
        by: 1
      })
    }
  }

  // 获取书籍短评
  static async getCommentById(book_id) {
    //let comments = await CommentModel.scope('bh').findAll({
    let comments = await CommentModel.findAll({ // 通过toJSON来序列化想要的数据
      where: {
        book_id
      }
    });
    // 使用全局JSON序列化结果，不要book_id和id，通过个model.exclude = ['字段1','字段1']
    if(isArray(comments)){
      comments.forEach(comment=>{
        comment.exclude = ['book_id','id'];
      })
    }
    return comments;
  }

  // toJSON(){
  //   return {
  //     content:this.getDataValue('content'),
  //     nums:this.getDataValue('nums')
  //   }
  // }
}

CommentModel.init({
  content: Sequelize.STRING(12),
  nums: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  book_id: Sequelize.INTEGER
}, {
  sequelize,
  tableName: 'comment'
});

module.exports = {
  CommentModel
}