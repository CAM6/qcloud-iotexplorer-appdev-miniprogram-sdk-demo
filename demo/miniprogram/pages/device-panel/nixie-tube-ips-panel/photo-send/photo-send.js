// pages/device-panel/nixie-tube-ips-panel/rgb-control/rgb-control.js

import Toast from '@vant/weapp/toast/toast';

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    background: ['', '', '','', '', ''],
    currentSwiper: 0
  },

  canvasArry: [],
  ctxArry: [],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    for (var property in this.data.background) {
      this.canvasInit(property);
    }
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
      console.log(this.data.background)
    }
    for (var property in this.data.background) {
      console.log(property, this.data.background[property]);
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
    console.log(this.data.currentSwiper);
  },

  // 点击跳转到当前的图片
  goCurrent(e){
    var current = e.currentTarget.dataset.current;
    this.setData({
      currentSwiper: current
    });
    console.log(this.data.currentSwiper);
  },

  //选取裁剪图片
  chooseCropImage: function () {
    let self = this;
    wx.chooseMedia({
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success(res) {
        console.log(res.tempFiles[0].tempFilePath);
        console.log(res.tempFiles[0].size);
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

    if( this.data.background[this.data.currentSwiper].length == 0 ) {
      console.log(this.data.background[this.data.currentSwiper].length)
      wx.showToast({
        title: '请先添加图片',
        icon: 'error',
        duration: 1000
      })
      return
    }

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
        // 第二步，把图片写入到相册（请求访问相册）
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath
        })
      }
    })
  }

})