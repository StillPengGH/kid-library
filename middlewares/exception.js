/**
 * 全局异常处理中间件
 */
const HttpException = require("../core/http-exception");

const catchException = async (ctx, next) => {
  try {
    // 如果没有异常，执行next()
    await next();
  } catch (error) {
    // 是否是开发环境
    let isDev = global.config.environment == "dev";
    // 判断是不是HttpException类型错误，即是不是我们已经捕获处理的异常
    let isHttpException = error instanceof HttpException;

    // 如果是开发环境，且不是HttpException类型错误，那么就把error抛出，方便开发调试
    if (isDev && !isHttpException) {
      throw error; // 抛出异常，代码不会再向下执行
    }

    if (isHttpException) {
      // 如果是已知错误，即我们捕获处理的错误
      // 设置自定义的错误返回对象
      ctx.body = {
        msg: error.msg,
        error_code: error.errorCode,
        request: `${ctx.method} ${ctx.path}`
      };
      // 设置错误的http状态码
      ctx.status = error.code;
    } else {
      //如果是未知错误，即我们没有捕获处理的错误
      // 统一返回自定义信息
      ctx.body = {
        msg: "抱歉，发生一个未知错误",
        error_code: 99999,
        request: `${ctx.method} ${ctx.path}`
      };
      ctx.status = 500;
    }
  }
};

module.exports = { catchException };
