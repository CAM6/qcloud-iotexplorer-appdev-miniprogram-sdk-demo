import { baseUrl } from './config'

function getCookie() {
  return wx.getStorageSync('Cookie')
}

function setCookie(cookie) {
  if (cookie) {
    wx.setStorageSync('Cookie', cookie)
  }
}

const fileUpload = (obj) => {
  const { url, header, showToast = true } = obj

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      ...obj,
      name: obj.formData && obj.formData.fileName || 'file',
      url: baseUrl + url,
      header: {
        ...header,
        'Content-type': 'multipart/form-data;',
        Cookie: getCookie()
      },
      success(res) {
        setCookie(res.header['Set-Cookie'])
        
        let data = {}
        try {
          data = JSON.parse(res.data)
        } catch(err) {

        }
        const { statusCode } = res
        const { code } = data
        let message = ''

        switch (code) {
          case 1:
            // 请求成功
            resolve(data)
            break
          case 7:
            // code为7的时候，代表微信识别二维码次数用完，并且腾讯云的二维码次数并发量不够
            reject(data)
            break
          case 401:
            // 用户未登录
            message = '您还未登录，请先登陆后再执行此操作'
            getApp().globalData.hasUserInfo = false
            getApp().globalData.userInfo = {}
            reject(data)
            break
          default:
            console.log(res.data)
            message = data.message || '请求出错'
            reject(data)
            break
        }

        if (showToast && message) {
          wx.showToast({
            title: message,
            icon: 'none'
          })
        }
      },
      fail(err) {
        if (showToast) {
          wx.showToast({
            title: err.errMsg || '请求出错',
            icon: 'none'
          })
        }
        reject(err)
      }
    })
  })
}

module.exports = {
  fileUpload
}
