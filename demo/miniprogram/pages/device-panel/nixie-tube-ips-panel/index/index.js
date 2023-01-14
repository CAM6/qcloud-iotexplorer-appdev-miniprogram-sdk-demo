const app = getApp();

const { controlDeviceData, getDevicesData } = require('../../../../redux/actions');
const { getErrorMsg, getTemplateShownValue} = require('../../../../libs/utillib');
const { subscribeStore } = require('../../../../libs/store-subscribe');
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  data: {
    deviceInfo: {},
    deviceData: {
      properties: {},
      value: '',
      showValue: '',
    },
    deviceStatus: 0,

    // 睡眠开关
    switchId: 'power_switch',

    // 显示模式
    modeId: '"display_mode"',

    // 亮度
    brightnessId: '"display_backlight"',

    // 时间主题
    timeThemePopupShow: false,
    timeThemeId: 'display_theme',
  },

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

      deviceData[item.id] = {
        properties: item,
        value: state.deviceData[item.id].Value,
        showValue : getTemplateShownValue(item, state.deviceData[item.id].Value),
      }
      // eslint-disable-next-line no-param-reassign
    });
    
    this.setData({
      deviceData,
      deviceInfo: state.deviceInfo,
      deviceStatus: state.deviceStatus,
    });

    if(this.data.deviceStatus === 0) {
      console.log("deviceStatus")
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

  onClickMoreBtn(e) {
    if(this.isShareDevice) {
      wx.navigateTo({
        url: `/pages/device-detail/index/index?deviceId=${this.data.deviceInfo.DeviceId}&isShareDevice=1`,
      });
    }
    else {
      wx.navigateTo({
        url: `/pages/device-detail/index/index?deviceId=${this.data.deviceInfo.DeviceId}`,
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

  //亮度变化
  onBrightnessChange(event) {
    console.log(event.detail)
    this.setData({
      'deviceData.display_backlight.value': event.detail,
    });
    this.controlDeviceData('display_backlight', this.data.deviceData.display_backlight.value);
  },

  //设置模式
  onRadioChange(event) {
    const index = event.detail
    this.setData({
      'deviceData.display_mode.showValue': index,
    });
    var name = this.data.deviceData.display_mode.properties.mappingList[index]
    this.controlDeviceData('display_mode', this.data.deviceData.display_mode.properties.mappingIndex[name].value);
  },
  
  //设置开关
  onSwitchChange({ detail }) {
    // 需要手动对 checked 状态进行更新
    this.setData({ 'deviceData.power_switch.value' : detail ? 1 : 0 });
    console.log(this.data.deviceData.power_switch.value)
    this.controlDeviceData('power_switch', this.data.deviceData.power_switch.value);
  },

  showTimeThemePopup: function () {
    this.setData({
      timeThemePopupShow: true
    })
    console.log(this.data.deviceData)
  },

  closeTimeThemePopup: function () {
    this.setData({
      timeThemePopupShow: false
    })
  },

  onConfirmTimeThemePicker: function (e) {
    this.setData({
      'deviceData.display_theme.showValue': e.detail.index,
    })
    this.closeTimeThemePopup()
    this.controlDeviceData('display_theme', this.data.deviceData.display_theme.properties.mappingIndex[e.detail.value].value);
  },

  onClickCell: function(e) {
    switch (e.target.id) {
      case 'rgb-control':
        wx.navigateTo({
          url: `/pages/device-panel/nixie-tube-ips-panel/rgb-control/rgb-control?deviceId=${this.data.deviceInfo.DeviceId}`,
        });
        break;
      case 'photo-send':
        wx.navigateTo({
          url: `/pages/device-panel/nixie-tube-ips-panel/photo-send/photo-send?deviceId=${this.data.deviceInfo.DeviceId}`,
        });
        break;
      case 'select-theme':
        wx.navigateTo({
          url: `/pages/device-panel/nixie-tube-ips-panel/select-theme/select-theme?deviceId=${this.data.deviceInfo.DeviceId}`,
        });
        break;
      case 'more-setting':
        wx.navigateTo({
          url: `/pages/device-panel/nixie-tube-ips-panel/more-setting/more-setting?deviceId=${this.data.deviceInfo.DeviceId}`,
        });
        break;
    }
  }
});
