const actions = require('../../redux/actions');
const { subscribeStore } = require('../../libs/store-subscribe');
const showAddDeviceMenu = require('../add-device/addDeviceMenu');
const addDeviceByQrCode = require('../add-device/qrCode');
const app = getApp();

Page({
  data: {
    deviceList: [],
    shareDeviceList: [],
    deviceStatusMap: {},
    inited: false,
    userId: '',
  },

  onLoad() {
    this.TubeIPSProductId = '8K1Q8WTEBZ';
    this.unsubscribeAll = subscribeStore([
      'deviceList',
      'shareDeviceList',
      'deviceStatusMap',
    ].map(key => ({
      selector: state => state[key],
      onChange: value => this.setData({ [key]: value }),
    })));
  },

  onUnload() {
    this.unsubscribeAll && this.unsubscribeAll();
  },
  
    /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  onLoginReady() {
    this.setData({
      userId: app.sdk.uin,
    });
    this.fetchData();
  },

  onTapItem({ currentTarget: { dataset: { item } } }) {
    if(item.ProductId == this.TubeIPSProductId) {
      if (item.isShareDevice) {
        wx.navigateTo({
          url: `/pages/device-panel/nixie-tube-ips-panel/index/index?deviceId=${item.DeviceId}&isShareDevice=1`,
        });
      } else {
        wx.navigateTo({
          url: `/pages/device-panel/nixie-tube-ips-panel/index/index?deviceId=${item.DeviceId}`,
        });
      }
    }else {
      if (item.isShareDevice) {
        wx.navigateTo({
          url: `/pages/device-panel/panel/panel?deviceId=${item.DeviceId}&isShareDevice=1`,
        });
      } else {
        wx.navigateTo({
          url: `/pages/device-panel/panel/panel?deviceId=${item.DeviceId}`,
        });
      }
    }
    
  },

  onPullDownRefresh() {
    this.fetchData();
  },

  fetchData() {
    actions.getDevicesData()
      .then(() => {
        if (!this.data.inited) {
          this.setData({ inited: true });
        }
        wx.stopPullDownRefresh();
      })
      .catch((err) => {
        if (!this.data.inited) {
          this.setData({ inited: true });
        }
        console.error('getDevicesData fail', err);
        wx.stopPullDownRefresh();
      });
  },

  handleAddDevice() {
    // wx.showActionSheet({
    //   itemList: ['第三方插件配网', '蓝牙配网'],
    //   alertText: 'Wi-Fi 配网',
    //   success: ({ tapIndex }) => {
    //     switch (tapIndex) {
    //       case 0:
            this.handleAddDeviceByPlugin(this.TubeIPSProductId);
    //         break;
    //       case 1:
            // wx.navigateTo({
            //   url: '/pages/add-device/ble-combo/ble-combo',
            // });
    //         break;
    //     }
    //   }
    // });
  },

  handleAddDeviceByPlugin(productId) {
    const goPluginAddDevice = (productId) => {
      wx.navigateTo({
        url: `/pages/device-configuration-plugin/device-configuration-plugin?productId=${productId}`,
      });
    };

    // Todo 请填写物联网开发平台中创建的产品的产品 ID，或在弹出的提示框中输入
    // const productId = '8K1Q8WTEBZ';

    if (!productId) {
      wx.showModal({
        title: '请输入产品 ID',
        editable: true,
        success: ({ content, confirm }) => {
          if (content && confirm) {
            goPluginAddDevice(content);
          }
        },
      });
    } else {
      goPluginAddDevice(productId);
    }
  },
});
