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
  
})