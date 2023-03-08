// pages/device-panel/nixie-tube-ips-panel/more-setting/more-setting.js

const app = getApp();

const { controlDeviceData, getDevicesData } = require('../../../../redux/actions');
const { getErrorMsg, getTemplateShownValue, formatDate } = require('../../../../libs/utillib');
const { subscribeStore } = require('../../../../libs/store-subscribe');
import { getAddress, setAddress } from '../../../../api/api'

import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';
import { areaList } from '../../../../miniprogram_npm/@vant/area-data/area-data';

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

    //时区设置
    timeZoneId: 'clock_utc',
    timeZoneList: [],
    timeZoneindex: 0,

    //地址设置
    areaList,
    addressCode: '',
    addressStr: '',
    addressInfo: {},

    popupShow: false,
    popupKey: ''
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
    this.getDeviceAddressInfo()
  },

  getDeviceAddressInfo: function () {
    getAddress({ deviceId: this.deviceId.split('/', 2)[1] }).then(res => {
      this.setData( {
        addressInfo: res.obj,
        addressStr: (res.obj.province) + (" ") + (res.obj.city) + (" ") + (res.obj.county)
      })
    })
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
          popupShow: true,
          popupKey: "timeZone",
        })
        break;
      case 'timeSet':
        var date = new Date(); //时间对象
        var str = date.getTime(); //转换成时间戳
        this.setData({
          popupShow: true,
          popupKey: "time",
          timeStamp: str,
        })
        break;
      case 'address':
        this.setData({
          popupShow: true,
          popupKey: "address",
 
        })
        break;
    }
  },

  closePopup: function () {
    this.setData({
      popupShow: false,
      popupKey: ''
    })
  },

  // 设置时间
  onConfirmTimePicker: function (e) {
    this.setData({
      timeValue: this.filterTime(e.detail),
      timeStamp: e.detail,
    })
    this.closePopup()
    this.controlDeviceData('clock_time', parseInt(this.data.timeStamp / 1000));
  },

  // 设置时区
  onConfirmTimeZonePicker: function (e) {
    this.setData({
      timeZoneindex: e.detail.index,
      'deviceData.clock_utc.value': e.detail.value
    })
    this.closePopup()
    this.controlDeviceData('clock_utc', this.data.deviceData.clock_utc.value);
  },

  // 设置地区
  onConfirmAddressPicker: function (e) {
    const areas = e.detail.values
    console.log(areas);
    const addressStr = areas.map(item => item.name).join(" ")
    this.setData({
      addressInfo: {
        deviceId: this.deviceId.split('/', 2)[1],
        province: areas[0].name,
        city: areas[1].name,
        county: areas[2].name,
      },
      addressCode: areas[areas.length - 1].code,
      addressStr: addressStr,
    })
    console.log(this.data.addressInfo);

    setAddress(this.data.addressInfo).then(() => {
      wx.showToast({
        title: '修改成功'
      })
    })

    this.closePopup()
  },

  //设置语音识别开关
  onSwitchSpeechRecChange({ detail }) {
    // 需要手动对 checked 状态进行更新
    this.setData({ 'deviceData.speech_rec.value' : detail ? 1 : 0 });
    this.controlDeviceData('speech_rec', this.data.deviceData.speech_rec.value);
  },

  //设置提示音开关
  onSwitchSpeechToneChange({ detail }) {
    // 需要手动对 checked 状态进行更新
    this.setData({ 'deviceData.speech_tone.value' : detail ? 1 : 0 });
    this.controlDeviceData('speech_tone', this.data.deviceData.speech_tone.value);
  },

  //设置静音开关
  onSwitchSpeechMuteChange({ detail }) {
    // 需要手动对 checked 状态进行更新
    this.setData({ 'deviceData.speech_mute.value' : detail ? 1 : 0 });
    this.controlDeviceData('speech_mute', this.data.deviceData.speech_mute.value);
  },
})