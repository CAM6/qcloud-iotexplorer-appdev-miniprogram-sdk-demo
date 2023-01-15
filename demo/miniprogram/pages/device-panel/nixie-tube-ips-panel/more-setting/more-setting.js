// pages/device-panel/nixie-tube-ips-panel/more-setting/more-setting.js

const app = getApp();

const { controlDeviceData, getDevicesData } = require('../../../../redux/actions');
const { getErrorMsg, getTemplateShownValue, formatDate } = require('../../../../libs/utillib');
const { subscribeStore } = require('../../../../libs/store-subscribe');
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    deviceInfo: {},
    deviceData: {
      properties: {},
      value: '',
      showValue: '',
    },
    deviceStatus: 0,

    // 12小时制开关
    switch12HId: 'clock_is12h',

    //是否开启网络时间
    switchNTPId: 'clock_isntp',

    //时间设置
    timeId: 'clock_time',
    timeValue: "",
    timeStamp: 0,
    timePopupShow: false,

    //时区设置
    timeZoneId: 'clock_utc',
    timeZoneList: [],
    timeZoneindex: 0,
    timeZonePopupShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({ deviceId, isShareDevice = false }) {
    this.setData({ ipx: app.globalData.isIpx });
    this.isShareDevice = isShareDevice;
    this.deviceId = deviceId;
    const productId = deviceId.split('/', 2)[0];

    this.unsubscribeAll = subscribeStore([
      {
        selector: state => ({
          productInfo: state.productInfoMap[productId],
          deviceData: state.deviceDataMap[deviceId],
          deviceInfo: (isShareDevice ? state.shareDeviceList : state.deviceList)
            .find(item => item.DeviceId === deviceId),
          deviceStatus: state.deviceStatusMap[deviceId],
        }),
        onChange: this.prepareData.bind(this),
      },
    ]);

    this.initTimeZone()
  },

  initTimeZone() {
    var list = []
    for(var i = 12; i > 0; i--) {
      list.push("UTC-" + i)
    }
    for(var i = 0; i < 13; i++) {
      list.push("UTC+" + i)
    }

    this.setData({
      timeZoneList: list,
    })     
  },

  prepareData(state, oldState) {
    const dataKeys = ['productInfo', 'deviceData', 'deviceInfo', 'deviceStatus'];
    // 数据没有变化时，不重新 setData
    if (oldState && dataKeys.every(key => state[key] === oldState[key])) {
      return;
    }

    // 数据缺失检查
    if (!dataKeys.every(key => state[key] !== undefined)) {
      return;
    }

    const deviceData = {};
    let dataTemplate = null;
    try {
      dataTemplate = JSON.parse(state.productInfo.DataTemplate);
    } catch (err) {
      console.error('panel prepareData: parse json fail', err);
      return;
    }

    dataTemplate.properties.forEach((item) => {
      if (item.define.type === 'enum') {
        // eslint-disable-next-line no-param-reassign
        item.mappingIndex = {};
        item.mappingList = [];
        Object.keys(item.define.mapping).forEach((key) => {
          item.mappingIndex[item.define.mapping[key]] = { index: item.mappingList.length,value: Number(key)};
          item.mappingList.push(item.define.mapping[key])
        });
      }

      var value = state.deviceData[item.id] === undefined ? 0 : state.deviceData[item.id].Value;
      deviceData[item.id] = {
        properties: item,
        value,
        showValue : getTemplateShownValue(item, value),
      }
      // eslint-disable-next-line no-param-reassign
    });
    
    this.setData({
      deviceData,
      deviceInfo: state.deviceInfo,
      deviceStatus: state.deviceStatus,
    });
    
    if(this.data.deviceStatus === 0) {
      Dialog.alert({
        title: '设备已离线',
        message: '请检查:\r\n 1、设备是否有电；\r\n 2、设备连接的路由器是否正常工作，网络通畅；\r\n 3、是否修改了路由器的名称或者密码，可以尝试重新连接；\r\n 4、设备是否与路由器距离过远，隔墙或有其他遮挡物。',
        messageAlign: "left",
        confirmButtonText: "返回首页",
      }).then(() => {
        // on close
        wx.redirectTo({
          url: `/pages/index/index`,
          success: (res) => {
            if (error) {
              res.eventChannel.emit('errorPassthrough', { error });
            }
          },
        });
      });
    }
  },

  controlDeviceData(id, value) {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(async () => {
      try {
        Toast.loading({
          message: '加载中...',
          forbidClick: true,
        });
        await controlDeviceData(this.data.deviceInfo, { id, value });
        Toast.clear();
      } catch (err) {
        console.error('controlDeviceData fail', err);
        wx.showModal({
          title: '控制设备属性失败',
          content: getErrorMsg(err),
          confirmText: '我知道了',
          showCancel: false,
        });
      }
    }, 250);
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

  getTimeZoneIndex(list, value) {
    for (const index in list) {
      if(list[index] == value) {
        return index
      }
    }
  },

  // 时间戳转为正常时间的公共方法，当然你也可以加上小时、分、秒
  filterTime(time) {
    const date = new Date(time)
    const Y = date.getFullYear()
    const M = date.getMonth() + 1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1 
    const D = date.getDate() + 1 < 10 ? '0'+(date.getDate()) : date.getDate()

    const H = date.getHours() + 1 < 10 ? '0'+(date.getHours()) : date.getHours()
    const MIN = date.getMinutes() + 1 < 10 ? '0'+(date.getMinutes()) : date.getMinutes()

    return `${Y}-${M}-${D} ${H}:${MIN}`
  },

  //设置12H开关
  onSwitch12HChange({ detail }) {
    // 需要手动对 checked 状态进行更新
    this.setData({ 'deviceData.clock_is12h.value' : detail ? 1 : 0 });
    this.controlDeviceData('clock_is12h', this.data.deviceData.clock_is12h.value);
  },

  //设置NTP开关
  onSwitchNTPChange({ detail }) {
    // 需要手动对 checked 状态进行更新
    this.setData({ 'deviceData.clock_isntp.value' : detail ? 1 : 0 });
    this.controlDeviceData('clock_isntp', this.data.deviceData.clock_isntp.value);
  },

  onOperationClick(e) {
    switch (e.target.id) {
      case 'timeZone':
        this.setData({
          timeZoneindex: this.getTimeZoneIndex(this.data.timeZoneList, this.data.deviceData.clock_utc.value),
          timeZonePopupShow: true,
        })
        break;
      case 'timeSet':
        var date = new Date(); //时间对象
        var str = date.getTime(); //转换成时间戳
        this.setData({
          timePopupShow: true,
          timeStamp: str,
        })
        break;
    }
  },

  closeTimePopup: function () {
    this.setData({
      timePopupShow: false
    })
  },

  // 设置时间
  onConfirmTimePicker: function (e) {
    this.setData({
      timeValue: this.filterTime(e.detail),
      timeStamp: e.detail,
    })
    this.closeTimePopup()
    this.controlDeviceData('clock_time', parseInt(this.data.timeStamp / 1000));
  },

  closeTimeZonePopup: function () {
    this.setData({
      timeZonePopupShow: false
    })
  },

  // 设置时区
  onConfirmTimeZonePicker: function (e) {
    this.setData({
      timeZoneindex: e.detail.index,
      'deviceData.clock_utc.value': e.detail.value
    })
    this.closeTimeZonePopup()
    this.controlDeviceData('clock_utc', this.data.deviceData.clock_utc.value);
  }
})