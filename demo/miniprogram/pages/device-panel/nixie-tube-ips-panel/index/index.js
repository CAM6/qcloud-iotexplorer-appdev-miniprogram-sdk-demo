const app = getApp();
const {
  deleteDeviceFromFamily,
  removeUserShareDevice,
  checkDeviceFirmwareUpdate,
} = require('../../../../models');
const { controlDeviceData, getDevicesData } = require('../../../../redux/actions');
const { getErrorMsg } = require('../../../../libs/utillib');
const promisify = require('../../../../libs/wx-promisify');
const { subscribeStore } = require('../../../../libs/store-subscribe');
const { dangerColor } = require('../../../../constants');

const getTemplateShownValue = (templateInfo, value) => {
  let shownValue;

  switch (templateInfo.define.type) {
    case 'bool':
      shownValue = templateInfo.define.mapping[value];
      break;
    case 'enum':
      shownValue = templateInfo.mappingList.findIndex(item => item.value === value);
      break;
    case 'int':
    case 'float':
      if (typeof value === 'undefined') {
        shownValue = templateInfo.define.start;
      } else {
        shownValue = value;
      }
      break;
    default:
      shownValue = value;
  }

  return shownValue;
};

Page({
  data: {
    deviceInfo: {},
    dataTemplate: {
      properties: [],
    },
    deviceData: {},
    deviceStatus: 0,
    numberDialog: {
      visible: false,
      panelConfig: null,
    },

    brightnessValue: 50,
    speedValue: 50,
    modeValue: '1',
    switchValue: true,

    timeThemeValue: "主题0",
    timeThemeIndex: 0,
    timeThemeList: ['主题0','主题1','主题2','主题3','主题4','主题5'],
    timeThemePopupShow: false,
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
    Object.keys(state.deviceData).forEach((id) => {
      deviceData[id] = state.deviceData[id].Value;
    });

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
        item.mappingList = [];
        Object.keys(item.define.mapping).forEach((key) => {
          item.mappingList.push({ label: item.define.mapping[key], value: Number(key) });
        });
      }

      // eslint-disable-next-line no-param-reassign
      item.value = getTemplateShownValue(item, deviceData[item.id]);
    });

    this.setData({
      dataTemplate,
      deviceData,
      deviceInfo: state.deviceInfo,
      deviceStatus: state.deviceStatus,
    });
  },

  onClickMoreBtn(e) {
    console.log(this.data.deviceInfo);
    console.log(this.data.dataTemplate);
    console.log(this.data.deviceData);
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
        await controlDeviceData(this.data.deviceInfo, { id, value });
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

  onTapItem({ currentTarget: { dataset: { item } } }) {
    switch (item.define.type) {
      case 'bool':
        this.controlDeviceData(item.id, !this.data.deviceData[item.id] ? 1 : 0);
        break;
      case 'int':
      case 'float':
        this.dialogValue = this.data.deviceData[item.id];
        this.setData({
          numberDialog: {
            visible: true,
            panelConfig: item,
          },
        });
        break;
    }
  },

  onNumberDialogChange({ detail: { value } }) {
    this.dialogValue = value;
  },

  onHideNumberDialog() {
    this.setData({
      numberDialog: {
        visible: false,
        panelConfig: null,
      },
    });
  },

  onNumberDialogSubmit() {
    this.controlDeviceData(this.data.numberDialog.panelConfig.id, this.dialogValue);
    this.onHideNumberDialog();
  },

  onPickerChange({ detail: { value }, currentTarget: { dataset: { item } } }) {
    this.controlDeviceData(item.id, item.mappingList[value].value);
  },
  

  //亮度变化
  onBrightnessChange(event) {
    this.setData({
      brightnessValue: event.detail.value,
    });
  },

  //设置亮度
  onBrightnessEnd() {
    console.log("onBrightnessEnd")
  },

  //速度变化
  onSpeedChange(event) {
    this.setData({
      speedValue: event.detail.value,
    });
  },

  //设置速度
  onSpeedEnd() {
    console.log("onSpeedEnd")
  },

  //设置模式
  onRadioChange(event) {
    const { name } = event.currentTarget.dataset;
    this.setData({
      modeValue: name,
    });
  },
  
  //设置开关
  onSwitchChange({ detail }) {
    // 需要手动对 checked 状态进行更新
    this.setData({ switchValue: detail });
  },

  showTimeThemePopup: function () {
    this.setData({
      timeThemePopupShow: true
    })
  },
  closeTimeThemePopup: function () {
    this.setData({
      timeThemePopupShow: false
    })
  },
  onConfirmTimeThemePicker: function (e) {
    const { index, value } = e.detail
    console.log(e.detail)
    console.log(this.data.timeThemeValue)
    this.setData({
      timeThemeValue: value,
      timeThemeIndex: e.detail.index
    })
    this.closeTimeThemePopup()
  },
});
