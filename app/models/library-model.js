const { Op } = require('sequelize');
const { flatten } = require('lodash');
const { VerseModel, MusicModel, StoryModel } = require('./learning-model');
/**
 * 关于verse、music、story、book 的综合业务处理类LibraryModel
 */
class LibraryModel {
  // 根据id和type获取lib详细信息
  static async getData(libId, type, isScope = true) {
    let lib = null;
    let finder = {
      where: {
        id: libId
      }
    }
    const scope = isScope ? 'bh' : null;
    if (type && typeof type == 'string') {
      type = parseInt(type);
    }
    switch (type) {
      case 100:
        lib = await VerseModel.scope(scope).findOne(finder);
        break;
      case 200:
        lib = await MusicModel.scope(scope).findOne(finder);
        break;
      case 300:
        lib = await StoryModel.scope(scope).findOne(finder);
        break;
      case 400:
        const { BookModel } = require('./book-model');
        lib = await BookModel.scope(scope).findOne(finder);
        if (!lib) {
          lib = await BookModel.create({
            id: libId
          });
        }
        break;
      default:
        break;
    }
    return lib;
  }

  // 根据id、type、uid获取lib详细信息
  static async getDetail(id, type, uid) {
    // 在这里引入LikeModel是因为like-model.js引入了LibraryModel，library-model里要是再引入LikeModel会出现错误。
    let { LikeModel } = require('./like-model');
    // 这里的this.type因为通过get方式传递过来的，在path里获取，传递到LibraryModel构造函数中，将是是String类型
    // 在getData方法中，我们通过switch case比较type是Integer类型，所以如果不做修改，会获得lib为空
    let lib = await LibraryModel.getData(id, type, true);
    if (!lib) {
      throw new global.errs.NotFound();
    }
    let likeStatus = await LikeModel.getLikeStatus(id, type, uid);
    return {
      lib,
      likeStatus
    }
  }

  // 获取lib列表
  static async getLibList(likeArr) {
    let libs = []; // 返回的libs数组
    // 定义一个id对象，里面存放三种类型的id数组
    let idObj = {
      100: [],
      200: [],
      300: []
    }
    // 循环传递过来的喜欢数组，向idObj循环赋值
    for (const like of likeArr) {
      idObj[like.type].push(like.lib_id);
    }

    // 循环id对象，查询ids对应的lib数据
    for (let key in idObj) {
      let ids = idObj[key];
      if (ids.length === 0) {
        continue; //跳出本次循环，执行下一次
      }
      let type = parseInt(key);
      libs.push(await LibraryModel._getLibsByIds(ids, type))
    }
    return flatten(libs);
  }

  // 根据ids获取libs
  static async _getLibsByIds(ids, type) {
    let libs = [];
    let finder = {
      where: {
        id: {
          [Op.in]: ids
        }
      }
    }
    switch (type) {
      case 100:
        libs = await VerseModel.scope('bh').findAll(finder);
        break;
      case 200:
        libs = await MusicModel.scope('bh').findAll(finder);
        break;
      case 300:
        libs = await StoryModel.scope('bh').findAll(finder);
        break;
      case 400:
        break;
      default:
        break;
    }
    return libs;
  }
}

module.exports = {
  LibraryModel
}