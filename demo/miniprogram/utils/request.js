import { baseUrl } from './config'

const LOGIN_API = '/social/login'

function getCookie() {
  return wx.getStorageSync('Cookie')
}

function setCookie(cookie) {
  if (cookie) {
    wx.setStorageSync('Cookie', cookie)
  }
}

function request (obj) {
  const { url, header, showToast = true } = obj
  
  return new Promise((resolve, reject) => {
    wx.request({
      ...obj,
      url: baseUrl + url,
      header: {
        ...header,
        Cookie: getCookie()
      },
      success: res => {
        setCookie(res.header['Set-Cookie'])

        const code = res.data.code
        let message = ''

        // code: 1：成功，2：失败，401：用户未登录或登录失效
        switch (code) {
          case 1:
            // 请求成功
            resolve(res.data)
            break
          case 401:
            console.log(res.data)
            if (url !== LOGIN_API) {
              const app = getApp()
              app.globalData.userInfo = null
              message = '您还未登录，请先登陆后再执行此操作'
            }
            // 延时一秒再执行reject，因为请求完成之后会执行wx.hideLoading，会把showToast关闭掉，这里延时一秒是为了让toast不会立即被关闭
            setTimeout(() => {
              reject(res.data)
            }, 1000)
            break
          default:
            console.log(url, res.data)
            message = res.data.message || '请求错误'
            // 延时一秒再执行reject，因为请求完成之后会执行wx.hideLoading，会把showToast关闭掉，这里延时一秒是为了让toast不会立即被关闭
            setTimeout(() => {
              reject(res.data)
            }, 1000)
            break
        }
        if (showToast && message) {
          wx.showToast({
            title: message,
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        if (showToast) {
          wx.showToast({
            title: err.errMsg || '请求出错',
            icon: 'none'
          })
        }
        setTimeout(() => {
          // 延时一秒再执行reject，因为请求完成之后会执行wx.hideLoading，会把showToast关闭掉，这里延时一秒是为了让toast不会立即被关闭
          reject(err)
        }, 1000)
      }
    })
  })
}

module.exports = {
  request
}
