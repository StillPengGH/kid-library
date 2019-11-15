const Router = require("koa-router");
const { Authorize } = require("@middlewares/authorize");
const { FlowModel } = require("@models/flow-model");
const { LibraryModel } = require("@models/library-model");
const { LikeModel } = require("@models/like-model");
const {
  IntegerValidator,
  LearningValidator
} = require("../../validators/validator");
let router = new Router({
  prefix: "/v1/learning"
});

/**
 * 一、获取最新一期期刊
 * router.get里可以使用多个中间件，new Authorize(2).middleware就是自定义的一个中间件
 * 作用有两个：
 *  |--1.设置接口的权限级别值，即Authorize(2)里的2，用来和用户级别值做对比
 *  |--2.判断是否有权限访问这个接口
 * 使用类自定义中间件的好处，就是new 出来的对象可以存放状态，而函数不可以。
 */
router.get("/latest", new Authorize(2).middleware, async ctx => {
  // 获取最新一起信息,倒序获取一条即最新一期
  let flowModel = await FlowModel.findOne({
    order: [["index", "DESC"]]
  });
  // 根据flow表中的lib_id和type获取最新一期期刊具体信息
  let lib = await LibraryModel.getData(flowModel.lib_id, flowModel.type);
  // 获取用户当前是否喜欢该期刊
  let likeStatus = await LikeModel.getLikeStatus(
    flowModel.lib_id,
    flowModel.type,
    ctx.auth.uid
  );

  // 将期刊表中的期刊号放入lib中返回
  lib.setDataValue("index", flowModel.index);
  // 将用户是否喜欢当前期刊的状态放入lib中返回
  lib.setDataValue("like_status", likeStatus);
  ctx.body = lib;
});

/**
 * 二、获取当前一期的下一期
 */
router.get("/:index/next", new Authorize(2).middleware, async ctx => {
  let v = await new IntegerValidator().validate(ctx, {
    id: "index"
  });
  // 获取get请求参数，是path.index
  let index = v.get("path.index");
  let flowModel = await FlowModel.findOne({
    where: {
      index: index + 1
    }
  });
  if (!flowModel) {
    throw new global.errs.NotFound();
  }
  // 获取lib信息
  let lib_id = flowModel.lib_id;
  let type = flowModel.type;
  let lib = await LibraryModel.getData(lib_id, type);
  // 获取喜欢状态
  let likeStatus = await LikeModel.getLikeStatus(lib_id, type, ctx.auth.uid);
  lib.setDataValue("index", flowModel.index);
  lib.setDataValue("like_status", likeStatus);
  ctx.body = lib;
});

/**
 * 三、获取当前一期的上一期
 */
router.get("/:index/previous", new Authorize(2).middleware, async ctx => {
  let v = await new IntegerValidator().validate(ctx, {
    id: "index"
  });
  let index = v.get("path.index");
  let flowModel = await FlowModel.findOne({
    where: {
      index: index - 1
    }
  });
  if (!flowModel) {
    throw new global.errs.NotFound();
  }
  let lib_id = flowModel.lib_id;
  let type = flowModel.type;
  let lib = await LibraryModel.getData(lib_id, type);
  let likeStatus = await LikeModel.getLikeStatus(lib_id, type, ctx.auth.uid);
  lib.setDataValue("index", flowModel.index);
  lib.setDataValue("like_status", likeStatus);
  ctx.body = lib;
});

/**
 * 四、获取某一期的详细信息
 */
router.get("/:type/:id", new Authorize(2).middleware, async ctx => {
  let v = await new LearningValidator().validate(ctx);
  let id = v.get("path.id");
  let type = v.get("path.type");
  let libDetail = await LibraryModel.getDetail(id, type, ctx.auth.uid);
  libDetail.lib.setDataValue("like_status", libDetail.likeStatus);
  ctx.body = libDetail.lib;
});

/**
 * 五、获取点赞信息
 * 方法：GET
 * 接收参数：*type，*id
 * 返回：{like_nums，id，like_status}
 */
router.get("/:type/:id/like", new Authorize(2).middleware, async ctx => {
  let v = await new LearningValidator().validate(ctx);
  let id = v.get("path.id");
  let type = v.get("path.type");
  let libDetail = await LibraryModel.getDetail(id, type, ctx.auth.uid);

  ctx.body = {
    id: libDetail.lib.id,
    like_nums: libDetail.lib.like_nums,
    like_status: libDetail.likeStatus
  };
});

/**
 * 获取我喜欢的期刊
 * 方法：GET
 * 接受参数：无
 * 返回：[{期刊1},{期刊2},{期刊3}...]
 */
router.get("/like", new Authorize(2).middleware, async ctx => {
  let uid = ctx.auth.uid;
  ctx.body = await LikeModel.getMyLearningLikes(uid);
});

module.exports = router;
