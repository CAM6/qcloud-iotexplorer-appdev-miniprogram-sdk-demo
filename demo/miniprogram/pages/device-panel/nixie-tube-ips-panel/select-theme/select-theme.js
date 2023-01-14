// pages/device-panel/nixie-tube-ips-panel/select-theme/select-theme.js
import Toast from '@vant/weapp/toast/toast';

const app = getApp();

const { callDeviceActionSync } = require('../../../../models');
const { getErrorMsg, getTemplateShownValue, formatDate } = require('../../../../libs/utillib');
const { subscribeStore } = require('../../../../libs/store-subscribe');


Page({

  /**
   * 页面的初始数据
   */
  data: {    
    deviceInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({deviceId, isShareDevice = false }) {
    this.isShareDevice = isShareDevice;
    this.deviceId = deviceId;
    this.unsubscribeAll = subscribeStore([
      {
        selector: state => ({
          deviceInfo: (isShareDevice ? state.shareDeviceList : state.deviceList)
            .find(item => item.DeviceId === deviceId),
        }),
        onChange: this.prepareData.bind(this),
      },
    ]);
  },

  prepareData(state, oldState) {
    const dataKeys = [ 'deviceInfo' ];
    // 数据没有变化时，不重新 setData
    if (oldState && dataKeys.every(key => state[key] === oldState[key])) {
      return;
    }
    
    this.setData({ deviceInfo: state.deviceInfo });
    console.log(this.data.deviceInfo);
  },

  deviceActionSync: function(actionId, inputParams) {
    clearTimeout(this.debounceTimer);
    console.log('deviceActionSync')
    console.log(actionId)
    console.log(inputParams)
    // this.debounceTimer = setTimeout(async () => {
      try {
        Toast.loading({
          message: '设备下载中...',
          forbidClick: true,
        });
        callDeviceActionSync(this.data.deviceInfo, actionId, inputParams).then( x => {
           console.log(x.Status, x.OutputParams) 
           Toast.clear();
        });

      } catch (err) {
        console.error('callDeviceActionSync fail', err);
        wx.showModal({
          title: '控制设备失败',
          content: getErrorMsg(err),
          confirmText: '我知道了',
          showCancel: false,
        });
      }
    // }, 60000);
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

  onClickSubmit(e) {
    var id = e.target.id
    console.log(id);
    // 发送到设备上
    this.deviceActionSync('download_file', {
      url: 'http://cammaker.oss-cn-hangzhou.aliyuncs.com/nixie-tube-ips/res/clock_theme/' + id,
      local_path: '/data/clock_theme/1',
      file_type: 3,
    })
  }
})