// pages/device-panel/nixie-tube-ips-panel/rgb-control/rgb-control.js

import Toast from '@vant/weapp/toast/toast';

const app = getApp();

const { callDeviceActionSync } = require('../../../../models');
const { getErrorMsg, getTemplateShownValue, formatDate } = require('../../../../libs/utillib');
const { subscribeStore } = require('../../../../libs/store-subscribe');
import { upload } from '../../../../api/file'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceInfo: {},
    
    background: ['', '', '', '', '', '', '', '', '', ''],
    currentSwiper: 0,
  },

  canvasArry: [],
  ctxArry: [],

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

    for (var property in this.data.background) {
      this.canvasInit(property);
    }
  },

  prepareData(state, oldState) {
    const dataKeys = [ 'deviceInfo' ];
    // 数据没有变化时，不重新 setData
    if (oldState && dataKeys.every(key => state[key] === oldState[key])) {
      return;
    }
    
    this.setData({ deviceInfo: state.deviceInfo });
  },

  deviceActionSync: function(actionId, inputParams) {
    clearTimeout(this.debounceTimer);
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
    if (app.globalData.imgSrc) {
      var s = "background[" + app.globalData.currentSwiper +"]";
        this.setData({
          [s]: app.globalData.imgSrc
      })
    }
    for (var property in this.data.background) {
      this.draw(property, this.data.background[property]);  // 执行绘制
    }
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
  
  // swiper 监听事件
  swiperChange: function (e) {
    this.setData({
      currentSwiper: e.detail.current
    });
  },

  // 点击跳转到当前的图片
  goCurrent(e){
    var current = e.currentTarget.dataset.current;
    this.setData({
      currentSwiper: current
    });
  },

  //选取裁剪图片
  chooseCropImage: function () {
    let self = this;
    wx.chooseMedia({
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      count: 1,
      success(res) {
        console.log("fileSize" + res.tempFiles[0].size);
        wx.navigateTo({
          url: `/pages/device-panel/nixie-tube-ips-panel/cropImage/cropImage?tempFilePath=${res.tempFiles[0].tempFilePath}&currentSwiper=${self.data.currentSwiper}`
        })
      },
      fail(res) {
        console.log(res);
      },
    })
  },

  rpx2px (arg) {
    const info = wx.getSystemInfoSync()
    const width = info.screenWidth
    return arg * width / 750
  },

  // 获取图片对象
  async getImage (url) {  
    const off = wx.createOffscreenCanvas({type:'2d'})
    const image = off.createImage()   
    await new Promise((resolve, reject)=>{      
      image.onload = resolve  // 绘制图片逻辑
      image.src = url
    })
    return image
  },

  canvasInit(id) {
    const $ = wx.createSelectorQuery()
    $.select('#cam' + id)
      .fields({ node: true, size: true })
      .exec((res) => {
        // Canvas 对象
        var canvas = res[0].node
        this.canvasArry[id] = canvas

        // Canvas 画布的实际绘制宽高
        const width = res[0].width
        const height = res[0].height
        this.width = width
        this.height = height

        // 创建canvas渲染上下文
        var ctx = this.canvasArry[id].getContext('2d')
        this.ctxArry[id] = ctx;
        const dpr = wx.getWindowInfo().pixelRatio
        console.log('---dpr', dpr)
        // 手动改变canvas的宽和高
        this.canvasArry[id].width = width * dpr
        this.canvasArry[id].height = height * dpr
        this.ctxArry[id].scale(dpr, dpr)
        // 以上代码都是基础工作，给canvas写css样式时可以使用rpx单位。

        this.ctxArry[id].fillStyle = '#ffffff'
        this.ctxArry[id].fillRect(0,0, width, height)
      })
  },

  draw (id, url) {
    this.getImage(url).then(image=>{
      this.ctxArry[id].drawImage(
        image, 
        0, 0, this.width, this.height
      )
    })
  },

  save () {

  },

  submit() {
    var that = this

    if( this.data.background[this.data.currentSwiper].length == 0 ) {
      wx.showToast({
        title: '请先添加图片',
        icon: 'error',
        duration: 1000
      })
      return
    }

    Toast.loading({
      message: '上传中...',
      forbidClick: true,
    });
    // 第一步，把canvas画布转换成临时图片    
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      canvas: this.canvasArry[this.data.currentSwiper],  // canvas实例对象
      destWidth: 135,
      destHeight: 240,
      fileType: "jpg", 
      success (res) {

        console.log('生成图片成功', res)
        // 将图片上传至云存储空间

        const file = res.tempFilePath;
        const fileData = {
          type: 'TUBE_IPS_TMP_IMG'
        }
        upload(file, fileData).then(res => {        
          const url = "http://www.explorm.com/oss/" + res.obj;
          console.log(url)

          // 发送到设备上
          that.deviceActionSync('download_file', {
            url,
            local_path: '/data/photo/' + that.data.currentSwiper + '.jpg',
            file_type: 4,
            value: that.data.currentSwiper,
          })
        }).catch(() => {
          
        })
      }
    })
  }

})