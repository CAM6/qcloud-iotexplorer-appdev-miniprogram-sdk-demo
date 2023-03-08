// 使用 Dialog 需在相应的页面引入 Dialog 组件
import Dialog from '../miniprogram_npm/@vant/weapp/dialog/dialog'
import { decryptUserInfo, decryptPhone, uploadUserInfo } from '../api/user'

const app = getApp()
const canIUseGetUserProfile = wx.getUserProfile

// wx.getUserProfile可用时使用wx.getUserProfile，不可用时使用button的open-type=`getUserInfo`
export function showLoginDialog () {
  Dialog.confirm({
    title: '提示',
    message: '您还未登录，请先登录后再执行此操作',
    confirmButtonText: '登录',
    confirmButtonOpenType: 'getUserInfo',
    lang: "zh_CN"
  })
}

export function bindGetUserInfo(e) {
  if (canIUseGetUserProfile && e.detail.userInfo) {
    uploadUserInfoData(e.detail.userInfo)
  } else if (e.detail.encryptedData) {
    decryptUserInfoData(e.detail)
  }
}

function uploadUserInfoData(userInfo) {
  const data = {
    appId: app.globalData.appId,
    ...userInfo
  }
  
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  uploadUserInfo(data).then(res => {
    // 存在手机号则直接登录即可，不存在则获取手机号
    const phoneNumber = res.obj
    if (phoneNumber) {
      app.login()
    } else {
      showPhoneNumberDialog()
    }
  }).finally(() => {
    wx.hideLoading()
  })
}

// 解密用户信息
function decryptUserInfoData(detail) {
  const { encryptedData, iv } = detail
  const data = {
    appId: app.globalData.appId,
    encryptedData,
    ivStr: iv
  }
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  decryptUserInfo(data).then(res => {
    // 存在手机号则直接登录即可，不存在则获取手机号
    const phoneNumber = res.obj
    if (phoneNumber) {
      app.login()
    } else {
      showPhoneNumberDialog()
    }
  }).finally(() => {
    wx.hideLoading()
  })
}

function showPhoneNumberDialog() {
  Dialog.confirm({
    title: '提示',
    message: '您还未绑定手机号，请先绑定手机号后再执行此操作',
    confirmButtonText: '绑定手机号',
    confirmButtonOpenType: 'getPhoneNumber'
  })
}

// 绑定手机号
export function bindGetPhoneNumber(e) {
  const { encryptedData, iv } = e.detail
  const data = {
    appId: app.globalData.appId,
    encryptedData,
    ivStr: iv
  }
  console.log("bindGetPhoneNumber")
  // if (!encryptedData || !iv) return
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  decryptPhone(data).then(() => {
    app.login()
  }).finally(() => {
    wx.hideLoading()
  })
}
