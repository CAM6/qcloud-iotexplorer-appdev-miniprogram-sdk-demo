// pages/device-detail/device-info/device-info.js

const { getDeviceExtInfo, callDeviceActionSync, } = require('../../../models');

import Toast from '@vant/weapp/toast/toast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceName: '',
    deviceExtInfo: {},
    wifiRssi: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({deviceId}) {
    this.deviceId = deviceId;
    this.setData({
      deviceName: deviceId.split('/', 2)[1]
    });
    this.getDeviceInfo(this.deviceId);
    this.getWifiRssi(this.deviceId);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getWifiRssi(this.deviceId);
    wx.stopPullDownRefresh()
  },

  async getDeviceInfo(DeviceId) {
    const data =  await getDeviceExtInfo({DeviceId});
    this.setData({
      deviceExtInfo: data
    });
  },

  getWifiRssi(deviceId) {
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
    });
    callDeviceActionSync(deviceId.split('/', 2)[0], deviceId.split('/', 2)[1], "get_wifi_rssi", {"switch": 1}).then( x => {
      var obj = JSON.parse(x.OutputParams)
      if(obj.code < 0) {
        this.setData({
          wifiRssi: obj.code
        });
      }
      Toast.clear();
    });
  },

  clickWifiRssi() {
    this.getWifiRssi(this.deviceId);
  }
})