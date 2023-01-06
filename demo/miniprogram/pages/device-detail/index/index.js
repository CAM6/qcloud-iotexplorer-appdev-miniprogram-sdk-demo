// pages/panel/detail/detail.js
const { getDevicesData } = require('../../../redux/actions');
const { subscribeStore } = require('../../../libs/store-subscribe');
const store = require('../../../redux/index');
const {
  deleteDeviceFromFamily,
  removeUserShareDevice,
  checkDeviceFirmwareUpdate,
} = require('../../../models');


const app = getApp();



Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceInfo: {}
  },

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
    this.unsubscribeAll;
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
    switch (e.target.id) {
      case 'delete-device':
        this.onDeleteDevice();
        break;
      case 'remove-share-device':
        this.onRemoveShareDevice();
        break;
      case 'check-firmware-upgrade':
        this.onCheckFirmwareUpgrade();
        break;
      case 'device-info':
        wx.navigateTo({
          url: `/pages/device-detail/device-info/device-info?deviceId=${this.data.deviceInfo.DeviceId}`,
        });
        break;
        
    }
  },

  async onDeleteDevice() {
    try {
      const { confirm } = await promisify(wx.showModal)({
        title: '确认删除设备吗？',
        content: '确认后设备列表将删除该设备，设备相关数据将全部删除。',
        confirmText: '删除',
        confirmColor: dangerColor,
      });
      if (!confirm) {
        // 用户取消
        return;
      }
    } catch (err) {
      // 用户取消
      return;
    }

    wx.showLoading({
      title: '删除中…',
      mask: true,
    });

    try {
      await deleteDeviceFromFamily({
        FamilyId: 'default',
        DeviceId: this.data.deviceInfo.DeviceId,
      });
    } catch (err) {
      console.error('deleteDeviceFromFamily fail', err);
      wx.showModal({
        title: '删除设备失败',
        content: getErrorMsg(err),
        confirmText: '我知道了',
        showCancel: false,
      });
      return;
    }

    getDevicesData();

    wx.hideLoading();
    wx.showModal({
      title: '删除设备成功',
      confirmText: '确定',
      showCancel: false,
      success: () => {
        wx.navigateBack();
      },
    });
  },

  async onRemoveShareDevice() {
    try {
      const { confirm } = await promisify(wx.showModal)({
        title: '确认移除该分享设备吗？',
        confirmText: '移除',
        confirmColor: dangerColor,
      });
      if (!confirm) {
        // 用户取消
        return;
      }
    } catch (err) {
      // 用户取消
      return;
    }

    wx.showLoading({
      title: '移除中…',
      mask: true,
    });

    try {
      await removeUserShareDevice({
        DeviceId: this.data.deviceInfo.DeviceId,
      });
    } catch (err) {
      console.error('removeUserShareDevice fail', err);
      wx.showModal({
        title: '移除分享设备失败',
        content: getErrorMsg(err),
        confirmText: '我知道了',
        showCancel: false,
      });
      return;
    } finally {
      wx.hideLoading();
    }

    getDevicesData();

    wx.showModal({
      title: '移除分享设备成功',
      confirmText: '确定',
      showCancel: false,
      success: () => {
        wx.navigateBack();
      },
    });
  },

  async onCheckFirmwareUpgrade() {
    wx.showLoading({
      title: '检查更新中…',
      mask: true,
    });

    try {
      const [ProductId, DeviceName] = this.data.deviceInfo.DeviceId.split('/');
      console.log(ProductId);
      console.log(DeviceName);
      // 检查是否存在可升级的固件
      const { CurrentVersion, DstVersion } = await checkDeviceFirmwareUpdate({
        ProductId,
        DeviceName,
      });

      if (CurrentVersion === DstVersion || !DstVersion) {
        // 无可升级固件
        wx.showModal({
          title: '固件已是最新版本',
          content: CurrentVersion ? `当前固件版本为${CurrentVersion}` : '',
          confirmText: '确定',
          showCancel: false,
        });
      } else {
        wx.showModal({
          title: '可升级固件',
          content: `当前固件版本为${CurrentVersion}\n最新固件版本为${DstVersion}\n是否升级？`,
          confirmText: '立即升级',
          cancelText: '取消',
          success: ({ confirm }) => {
            if (confirm) {
              if (this.data.deviceInfo.NetType === 'ble') {
                wx.navigateTo({
                  url: `/pages/device-detail/ble-firmware-upgrade/ble-firmware-upgrade?deviceId=${this.data.deviceInfo.DeviceId}`,
                });
              } else {
                wx.navigateTo({
                  url: `/pages/device-detail/firmware-upgrade/firmware-upgrade?deviceId=${this.data.deviceInfo.DeviceId}`,
                });
              }
            }
          },
        });
      }
    } catch (err) {
      console.error('checkFirmwareUpgrade fail', err);
      wx.showModal({
        title: '检查固件更新失败',
        content: getErrorMsg(err),
        confirmText: '我知道了',
        showCancel: false,
      });
      return;
    } finally {
      wx.hideLoading();
    }
  },

})