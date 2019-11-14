/**
 * 初始化管理器
 */
const requireDirectory = require("require-directory");
const Router = require("koa-router");

class InitManager {
  // 初始化管理器入口方法
  static initCore(app) {
    InitManager.app = app;
    InitManager.initLoadRouters();
    InitManager.loadConfig();
    InitManager.loadException();
  }

  // 初始化路由
  static initLoadRouters() {
    let requirePath = `${process.cwd()}/app/api/v1`; // 路由路径
    requireDirectory(module, requirePath, {
      visit: function(moduleRouter) {
        if (moduleRouter instanceof Router) {
          InitManager.app.use(moduleRouter.routes());
        }
      }
    });
  }

  // 把config配置文件中配置对象，存储在global的config属性上，方便使用
  static loadConfig() {
    configPath = process.cwd() + "/config/pro-config.js";
    const proConfig = require(configPath);
    global.config = proConfig;
  }

  // 把异常处理类保存在global.errs属性上，方便使用
  static loadException() {
    const errors = require("./http-exception");
    global.errs = errors;
  }
}

module.exports = { InitManager };
