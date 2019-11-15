const { Sequelize, Model } = require("sequelize");
const { sequelize } = require("../../core/db");

/**
 * 诗词、音乐、故事
 * author:作者
 * title：标题
 * content:内容
 * image：图片
 * pubdate：创作时间
 * like_nums：喜欢数目
 * type：类型，诗词100、音乐200、故事300，书籍400
 * url：多媒体路径
 */
let commonFields = {
  author: Sequelize.STRING, //作者
  title: Sequelize.STRING, //标题
  content: Sequelize.STRING, //内容
  image: Sequelize.STRING, //图片
  pubdate: Sequelize.DATEONLY, //创作时间
  like_nums: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  type: Sequelize.TINYINT,
  url: Sequelize.STRING
};

/**
 * 诗词实体类
 */
class VerseModel extends Model {}
VerseModel.init(commonFields, {
  sequelize,
  tableName: "verse"
});

/**
 * 音乐实体类
 */
class MusicModel extends Model {}
MusicModel.init(commonFields, {
  sequelize,
  tableName: "music"
});

/**
 * 故事实体类
 */
class StoryModel extends Model {}
// 有私有的字段写法： const musicFields = Object.assign({priaveteField: Sequelize.STRING},commonFields);
// StoryModel.init(musicFields, {
StoryModel.init(commonFields, {
  sequelize,
  tableName: "story"
});

module.exports = {
  VerseModel,
  MusicModel,
  StoryModel
};
