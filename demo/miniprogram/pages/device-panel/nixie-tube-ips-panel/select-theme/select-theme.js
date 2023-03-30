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
    theme_arr: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({deviceId, isShareDevice = false }) {
    this.isShareDevice = isShareDevice;
    this.deviceId = deviceId;

    var list = []
    for(var i = 0; i < 41; i++) {
      list.push(i)
    }
    this.setData({
      theme_arr: list,
    }) 
    console.log(this.data.theme_arr)
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
        callDeviceActionSync(this.deviceId.split('/', 2)[0], this.deviceId.split('/', 2)[1], actionId, inputParams).then( x => {
           console.log(x.Status, x.OutputParams) 
           Toast.clear();
           var obj = JSON.parse(x.OutputParams)
          if(obj.code != 0) {
            Toast.loading({
              message: '请稍后尝试',
              type: "fail",
            });
          }
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



  onClickSubmit(e) {
    var id = e.target.id
    console.log(id);
    // 发送到设备上
    this.deviceActionSync('download_file', {
      url: 'http://www.explorm.com/oss/tube-ips/theme/' + id,
      local_path: '/data/clock_theme/1',
      file_type: 3,
      value: 1,
    })
  }
})