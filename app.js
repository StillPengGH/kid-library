/**
 * 入口文件app.js
 */

// 引入模块别名第三方工具
require('module-alias/register');

// 模块引入
const Koa = require("koa"); // 引入koa框架
const bodyParser = require("koa-bodyparser"); // 获取post请求data参数
const static = require("koa-static"); // 处理静态文件
const path = require("path"); //node内置

// 自定义中间件,捕获全局异常
const { catchException } = require("./middlewares/exception");

// 自定义初始化类
const { InitManager } = require("./core/init");

// 通过Koa创建应用程序对象app
let app = new Koa();

// app对象上use中间件
app.use(catchException);
app.use(bodyParser());
app.use(static(path.join(__dirname + "/static")));

// 进行初始化操作
InitManager.initCore(app);

// 设置监听端口3000
app.listen(3000);
