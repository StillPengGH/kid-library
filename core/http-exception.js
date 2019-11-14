/**
 * 主动捕获异常处理类
 */
class HttpException extends Error {
  constructor(msg = "服务器异常", errorCode = 10000, code = 500) {
    super();
    this.msg = msg;
    this.errorCode = errorCode;
    this.code = code;
  }
}

// 参数错误处理类
class ParameterException extends HttpException {
  constructor(msg, errorCode) {
    super();
    this.msg = msg || "参数错误";
    this.errorCode = errorCode || 10000;
    this.code = 400;
  }
}

// 没有找到资源异常处理类
class NotFound extends HttpException {
  constructor(msg, errorCode) {
    super();
    this.msg = msg || "没有找到资源";
    this.errorCode = errorCode || 10001;
    this.code = 404;
  }
}

// 权限不足，禁止访问异常处理类
class Forbbiden extends HttpException {
  constructor(msg, errorCode) {
    super();
    this.msg = msg || "禁止访问";
    this.errorCode = errorCode || 10002;
    this.code = 403;
  }
}

// 授权异常处理类
class AuthorizeException extends HttpException {
  constructor(msg, errorCode) {
    super();
    this.msg = msg || "授权失败";
    this.errorCode = errorCode || 10003;
    this.code = 401;
  }
}

// 操作成功处理类（201操作成功 200查询成功）
class Success extends HttpException {
  constructor(msg, errorCode) {
    super();
    this.msg = msg || "ok";
    this.errorCode = errorCode || 0;
    this.code = 201;
  }
}

// 点赞异常处理类
class LikeException extends HttpException {
  constructor(msg, errorCode) {
    super();
    this.msg = msg || "您已经点过赞了";
    this.errorCode = errorCode || 60002;
    this.code = 400;
  }
}

// 取消点赞异常处理
class DislikeException extends HttpException {
  constructor(msg, errorCode) {
    super();
    this.msg = msg || "您已经取消点赞";
    this.errorCode = errorCode || 60002;
    this.code = 400;
  }
}

module.exports = {
  HttpException,
  ParameterException,
  Success,
  AuthorizeException,
  Forbbiden,
  NotFound,
  LikeException,
  DislikeException
}
