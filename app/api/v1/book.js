const Router = require('koa-router');
const { Authorize } = require('../../../middlewares/authorize');
const { HotBookModel } = require('../../models/hot-book-model');
const { IntegerValidator, SearchValidator, AddCommentValidator } = require('../../validators/validator');
const { BookModel } = require('../../models/book-model');
const { LikeModel } = require('../../models/like-model');
const { CommentModel } = require('../../models/comment-model');
let router = new Router({
  prefix: '/v1/book'
});

/**
 * 一、获取热门书籍
 */
router.get('/hot_list', new Authorize(2).middleware, async (ctx) => {
  ctx.body = await HotBookModel.getAll();
});

/**
 * 二、获取书籍详细信息
 */
router.get('/:id/detail', new Authorize(2).middleware, async (ctx) => {
  let v = await new IntegerValidator().validate(ctx);
  let id = v.get('path.id');
  let book = new BookModel();
  let bookDetail = await book.getDetail(id);
  ctx.body = bookDetail;
});

/**
 * 三、书籍搜索
 * 接收参数：
 *  |--q：搜索关键字
 *  |--start：开始记录数，默认0
 *  |--count：获取条数，默认20
 *  |--summary：是否返回完整书籍内容，0是完整 1返回简单字段
 */
router.get('/search', new Authorize(2).middleware, async (ctx) => {
  let v = await new SearchValidator().validate(ctx);
  let q = v.get('query.q');
  let start = v.get('query.start');
  let count = v.get('query.count');
  let summary = ctx.request.query.summary;

  let books = await BookModel.searchBooks(q, start, count, summary);
  ctx.body = books;
});

/**
 * 四、获取喜欢书籍数量
 */
router.get('/like/count', new Authorize(2).middleware, async ctx => {
  let uid = ctx.auth.uid;
  let count = await BookModel.getMyLikeCount(uid);
  ctx.body = {
    count
  }
});

/**
 * 五、获取单本书籍点赞情况
 * 接收参数：book_id
 * 方法：GET
 * 返回：{"like_num":0,"id":1,"like_status":0}
 */
router.get('/:book_id/like', new Authorize(2).middleware, async (ctx) => {
  let v = await new IntegerValidator().validate(ctx, {
    id: 'book_id'
  });

  let likeData = await LikeModel.getBookLike(v.get('path.book_id'), ctx.auth.uid);
  ctx.body = likeData;
});

/**
 * 六、新增短评
 * 接收参数：
 *  |--book_id：书籍id
 *  |--content：评论内容
 * 方法：POST
 */
router.post('/add/short_comment', new Authorize(2).middleware, async (ctx) => {
  let v = await new AddCommentValidator().validate(ctx, {
    id: 'book_id'
  });
  let book_id = v.get('body.book_id');
  let content = v.get('body.content');
  CommentModel.addComment(book_id, content);
  throw new global.errs.Success('添加短评成功');
});

/**
 * 七、获取书籍短评
 * 参数：book_id
 * 方法：GET  http://localhost:3000/v1/book/1002/short_comment
 */
router.get('/:book_id/short_comment', new Authorize(2).middleware, async (ctx) => {
  let v = await new IntegerValidator().validate(ctx, {
    id: 'book_id'
  });
  let book_id = v.get('path.book_id');
  let comments = await CommentModel.getCommentById(book_id);
  ctx.body =  {
    comments,
    book_id
  }
});

/**
 * 八、获取热搜关键字
 */
router.get('/hot_keyword',new Authorize(2).middleware,async (ctx)=>{
  ctx.body = {
    'hot':[
      '哈利·波特',
      '村上春树',
      '东野圭吾',
      '白夜行',
      '韩寒',
      '金庸',
      '王小波'
    ]
  }
});
module.exports = router;