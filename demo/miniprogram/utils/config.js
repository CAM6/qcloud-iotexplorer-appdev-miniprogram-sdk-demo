// 基础版本库2.10.0以上可区分开发版，体验版和正式版
const accountInfo = wx.getAccountInfoSync()
let env = accountInfo.miniProgram.envVersion || 'release'  // 开发版 develop 体验版 trial 正式版 release
const baseApi = {
  // develop: 'https://www.explorm.com',
  develop: 'http://127.0.0.1:8193', // 开发环境的ip地址
  trial: 'https://www.explorm.com',
  release: 'https://www.explorm.com'
}

if (env === 'develop') {
  // 开发有时候需要连接测试和生产的库进行调试，在这里修改，不会影响体验版和正式版
  // env = 'trial'
}

module.exports = {
  // baseUrl: baseApi[env] + '/api/em-ma',
  baseUrl: baseApi[env],

  fileBaseUrl: baseApi[env] + '/oss/',
  env
}
