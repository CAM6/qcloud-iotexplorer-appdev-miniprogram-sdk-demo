// pages/device-detail/device-info/device-info.js
const {
  getDeviceExtInfo,
} = require('../../../models');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceId: '',
    deviceExtInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      deviceId: options.deviceId
    });
    this.getDeviceInfo(this.data.deviceId);
  },

  async getDeviceInfo(DeviceId) {
    const data =  await getDeviceExtInfo({DeviceId});
    this.setData({
      deviceExtInfo: data
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})