const { sequelize } = require("../../core/db");
const { Sequelize, Model, Op } = require("sequelize");
const { LibraryModel } = require("./library-model");

/**
 * 喜欢Model
 */
class LikeModel extends Model {
  // 获取当前用户对当前期刊的喜欢状态
  static async getLikeStatus(lib_id, type, uid) {
    let likeModel = await LikeModel.findOne({
      where: {
        lib_id,
        type,
        uid
      }
    });
    return likeModel ? true : false;
  }

  // 进行点赞操作
  static async like(lib_id, type, uid) {
    //1.查询like表里是否有点赞信息
    let likeModel = await LikeModel.findOne({
      where: {
        lib_id,
        type,
        uid
      }
    });
    //2.如果有返回：您已经点过赞了
    if (likeModel) {
      throw new global.errs.LikeError();
    }
    //3.如果没有，向like表里插入一条点赞数据
    //插入点赞数据同时，还要向对应的verse、music、story表里的点赞数量+1
    //注意：这里要用到sequelize的事务处理，一定要注意transaction:t的位置
    return sequelize.transaction(async t => {
      // like表插入一条数据
      await LikeModel.create(
        {
          lib_id,
          type,
          uid
        },
        {
          transaction: t
        }
      );
      // 修改lib的某一个实体表中的点赞数量+1,这里false代表需要查出来created_updated_deleted_at
      // 因为在通过lib.increment更新lib中某个表时，要修改者三个字段的某几个。
      let lib = await LibraryModel.getData(lib_id, type, false);
      // sequelize提供的增长方法，即将字段like_nums加1
      await lib.increment("like_nums", {
        by: 1,
        transaction: t
      });
    });
  }

  // 取消掉赞
  static async dislike(lib_id, type, uid) {
    let likeModel = await LikeModel.findOne({
      where: {
        lib_id,
        type,
        uid
      }
    });

    if (!likeModel) {
      throw new global.errs.DislikeError();
    }

    return sequelize.transaction(async t => {
      // 删除like中数据,通过上面获得的like的destory方法进行删除
      // force：true：物理删除
      // force：false：虚拟删除
      await likeModel.destroy({
        force: true,
        transaction: t
      });

      let lib = await LibraryModel.getData(lib_id, type, false);
      await lib.decrement("like_nums", {
        by: 1,
        transaction: t
      });
    });
  }

  // 获取我喜欢的期刊
  static async getMyLearningLikes(uid) {
    // 通过uid获取我喜欢的期刊，like表中还有对于book的收藏，这里我们只要verse、music、story
    // 所以要通过sequelize提供的[Op.not]来排出type为400的数据,Op需要在引入。
    // 对象的key可以用""表示，也可以用[],“”字符串，而[]里可以是表达式
    // findAll返回的是一个数组
    let likeArr = await LikeModel.findAll({
      where: {
        uid,
        type: {
          [Op.not]: 400
        }
      }
    });

    if (likeArr.length === 0) {
      return likeArr;
      // throw new global.errs.NotFound();
    } else {
      return await LibraryModel.getLibList(likeArr);
    }
  }

  // 获取单本书籍点赞情况（包含用户是否对这个本进行了点赞）
  static async getBookLike(book_id, uid) {
    let count = await LikeModel.count({
      where: {
        lib_id: book_id,
        type: 400
      }
    });
    let likeModel = await LikeModel.findOne({
      where: {
        lib_id: book_id,
        type: 400,
        uid: uid
      }
    });
    return {
      like_nums: count,
      id: book_id,
      like_status: likeModel ? 1 : 0
    };
  }
}

LikeModel.init(
  {
    uid: Sequelize.INTEGER,
    lib_id: Sequelize.INTEGER,
    type: Sequelize.INTEGER
  },
  {
    sequelize,
    tableName: "like"
  }
);

module.exports = {
  LikeModel
};
