// pages/device-panel/nixie-tube-ips-panel/rgb-control/rgb-control.js
const app = getApp();

const util = require('../../../../utils/util.js')
const { controlDeviceData, getDevicesData } = require('../../../../redux/actions');
const { getErrorMsg, getTemplateShownValue} = require('../../../../libs/utillib');
const { subscribeStore } = require('../../../../libs/store-subscribe');
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

let colorPickerCtx = {};
let sliderCtx = {};
let _this = null

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

    // 色盘
    pickColor: '#ff0000',
    raduis: 550, //这里最大为750rpx铺满屏幕
    valueWidthOrHerght: 0,
    customColorArray: ["#fffe55", "#ea3225", "#ff00f8", "#001bf5", "#76fafd", "#76fa4c"],

    // 颜色
    brightnessId: 'rgb_hue',

    // 亮度
    brightnessValue: 50,
    brightnessId: 'rgb_brightness',

    // 速度
    speedValue: 50,
    speedId: 'rgb_speed',

    // 模式
    modeValue: '1',
    modeId: 'rgb_mode',

    // 开关
    switchValue: true,
    switchId: 'rgb_switch',

    // 睡眠模式
    activeNames: ['0'],
    sleepSwitchValue: true,
    currentDate: '00:00',
    setTime: ['22:00', '7:00'],
    setTimeId: 0,
    timePopupShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({ deviceId, isShareDevice = false  }) {
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

    _this = this
    colorPickerCtx = wx.createCanvasContext('colorPicker');
    colorPickerCtx.fillStyle = 'rgb(255, 255, 255)';
    sliderCtx = wx.createCanvasContext('colorPickerSlider');

    let isInit = true;
    wx.createSelectorQuery().select('#colorPicker').boundingClientRect(function(rect) {
      _this.setData({
        valueWidthOrHerght: rect.width,
      })
      if(isInit){
        colorPickerCtx.fillRect(0, 0, rect.width, rect.height);
        util.drawRing(colorPickerCtx, rect.width, rect.height);
        // 设置默认位置
        util.drawSlider(sliderCtx, rect.width, rect.height, 1.0);
        isInit = false;
      }
      // _this.setData({
      //   pickColor: JSON.stringify({
      //     red: 255,
      //     green: 0,
      //     blue: 0
      //   })
      // })
    }).exec();
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
  
  //设置色彩
  onClickCustomColor(e) {
    var rgb=[0,0,0];
    if(/#(..)(..)(..)/g.test(this.data.customColorArray[e.target.id])){
        rgb=[parseInt(RegExp.$1,16),parseInt(RegExp.$2,16),parseInt(RegExp.$3,16)];
    };

    let h = util.rgb2hsl(rgb[0], rgb[1], rgb[2]);
    var hue = parseInt(h[0] * 360);
    util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, _this.data.valueWidthOrHerght, h[0]);

    this.setData({
      pickColor: util.colorRGBtoHex(rgb[0], rgb[1], rgb[2]),
      'deviceData.rgb_hue.value': hue,
    })
    this.controlDeviceData('rgb_hue', this.data.deviceData.rgb_hue.value);
  },

  //设置色彩
  onSlide: function(e) {
    let that = this;
    if (e.touches && ( e.type === 'touchend')) {
      console.log("ok");
      let x = e.changedTouches[0].x;
      let y = e.changedTouches[0].y;
      if (e.type !== 'touchend') {
        x = e.touches[0].x;
        y = e.touches[0].y;
      }
      //复制画布上指定矩形的像素数据
      wx.canvasGetImageData({
        canvasId: "colorPicker",
        x: x,
        y: y,
        width: 1,
        height: 1,
        success(res) {
          // 转换成hsl格式，获取旋转角度
          let h = util.rgb2hsl(res.data[0], res.data[1], res.data[2]);
          console.log(h);
          _this.setData({
              pickColor: util.colorRGBtoHex(res.data[0], res.data[1], res.data[2]),
              'this.data.deviceData.rgb_brightness.value': parseInt(h[0] * 360),
            })
          // 判断是否在圈内
          if (h[1] !== 1.0) {
            return;
          }
          util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, _this.data.valueWidthOrHerght, h[0]);
          // 设置设备
          if (e.type !== 'touchEnd') {

            var hue = parseInt(h[0] * 360);
            if(hue != 0) {
              _this.setData({
                'deviceData.rgb_hue.value': hue,
              })
              _this.controlDeviceData('rgb_hue', _this.data.deviceData.rgb_hue.value);
            }
            // 触摸结束才设置设备属性
            return;
          }
        }
      });
    }
  },

  //亮度拖动
  onBrightnessDrag(event) {
    this.setData({
      'deviceData.rgb_brightness.value': event.detail.value,
    });
  },

  //亮度变化
  onBrightnessChange(event) {
    this.setData({
      'deviceData.rgb_brightness.value': event.detail,
    });
    this.controlDeviceData('rgb_brightness', this.data.deviceData.rgb_brightness.value);
  },

  //速度拖动
  onSpeedDrag(event) {
    this.setData({
      'deviceData.rgb_speed.value': event.detail.value,
    });
  },

  //速度变化
  onSpeedChange(event) {
    this.setData({
      'deviceData.rgb_speed.value': event.detail,
    });
    this.controlDeviceData('rgb_speed', this.data.deviceData.rgb_speed.value);
  },

  //设置模式
  onRadioChange(event) {
    const index = event.detail;
    this.setData({
      'deviceData.rgb_mode.showValue': index,
    });
    var name = this.data.deviceData.rgb_mode.properties.mappingList[index]
    this.controlDeviceData('rgb_mode', this.data.deviceData.rgb_mode.properties.mappingIndex[name].value);
  },
  
  //设置开关
  onSwitchChange({ detail }) {
    // 需要手动对 checked 状态进行更新
    this.setData({ 'deviceData.rgb_switch.value' : detail ? 1 : 0 });
    this.controlDeviceData('rgb_switch', this.data.deviceData.rgb_switch.value);
  },

  //提交休眠数据
  submitSleepData() {

  },

  onSleepSwitchChange({ detail }) {
    // 需要手动对 checked 状态进行更新
    this.setData({ sleepSwitchValue: detail });
  },

  onCollapseChange(event) {
    console.log(event)
    this.setData({
      activeNames: event.detail,
    });
  },

  onClilckSetTime(e) {
    console.log(e.target.id)
    this.data.setTimeId = e.target.id;
    this.setData({
      timePopupShow: true,
      currentDate: this.data.setTime[this.data.setTimeId]
    })
  },

  closeTimePopup: function () {
    this.setData({
      timePopupShow: false
    })
  },

  onConfirmTimePicker: function (e) {
    console.log(e)
    var s = "setTime[" + this.data.setTimeId + "]"
    this.setData({
     [s]: e.detail
    })
    this.closeTimePopup()
  },
})