// pages/device-detail/device-name/device-name.js
import Toast from '@vant/weapp/toast/toast';
const { getDevicesData } = require('../../../redux/actions');
const {
  updateDeviceInFamily,
} = require('../../../models');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    aliasName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({aliasName, productId, deviceName}) {
    this.productId = productId;
    this.deviceName = deviceName;
    this.setData({
      aliasName: aliasName
    });
    console.log(this.data.aliasName);
    console.log(this.productId);
    console.log(this.deviceName);
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

  },

  onOperationButtonClick(e) {
    this.onSaveDeviceName();
  },


  async onSaveDeviceName() {
 
    Toast.loading({
      message: '加载中...',
      forbidClick: true,
    });

    try {
      await updateDeviceInFamily({
        ProductId: this.productId, 
        DeviceName: this.deviceName, 
        AliasName: this.data.aliasName
      });
    } catch (err) {
      console.error('removeUserShareDevice fail', err);
      wx.showModal({
        title: '修改失败',
        content: getErrorMsg(err),
        confirmText: '我知道了',
        showCancel: false,
      });
      return;
    } finally {
      wx.hideLoading();
    }

    getDevicesData();

    Toast.success('成功');

    setTimeout(() => {
      wx.navigateBack();
      }, 1000);
  },
})