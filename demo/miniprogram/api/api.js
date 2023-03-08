import { request } from '../utils/request'

module.exports = {
  fetchDicts(data) {
    return request({
      url: '/dicts',
      method: 'GET',
      data
    })
  },
  getAddress(data) {
    return request({
      url: '/address/get',
      method: 'GET',
      data
    })
  },

  setAddress(data) {
    return request({
      url: '/address/add',
      method: 'POST',
      data
    })
  },

  setSettings(data) {
    return request({
      url: '/user/settings/set',
      method: 'POST',
      data
    })
  },
  fetchBanner(data) {
    return request({
      url: '/banners',
      method: 'GET',
      data
    })
  },
  getAccseeToken(data) {
    return request({
      url: '/qrcode/accessToken',
      method: 'GET',
      data
    })
  },
  getSpeech(data) {
    return request({
      url: '/speech/synthesis',
      method: 'GET',
      data
    })
  },
  // 获取字库图片
  getWordImg(data) {
    return request({
      url: '/word/one',
      method: 'GET',
      data
    })
  }
}
