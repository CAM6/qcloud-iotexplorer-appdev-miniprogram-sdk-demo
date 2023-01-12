// pages/device-panel/nixie-tube-ips-panel/rgb-control/rgb-control.js
const util = require('../../../../utils/util.js')
let colorPickerCtx = {};
let sliderCtx = {};
let _this = null

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pickColor: '#ff0000',
    raduis: 550, //这里最大为750rpx铺满屏幕
    valueWidthOrHerght: 0,
    customColorArray: ["#fffe55", "#ea3225", "#ff00f8", "#001bf5", "#76fafd", "#76fa4c"],
    brightnessValue: 50,
    speedValue: 50,
    modeValue: '1',
    switchValue: true,

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
  onLoad(options) {
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
    util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, _this.data.valueWidthOrHerght, h[0]);

    this.setData({
      pickColor: util.colorRGBtoHex(rgb[0], rgb[1], rgb[2])
      })
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
              pickColor: util.colorRGBtoHex(res.data[0], res.data[1], res.data[2])
            })
          // 判断是否在圈内
          if (h[1] !== 1.0) {
            return;
          }
          util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, _this.data.valueWidthOrHerght, h[0]);
          // 设置设备
          if (e.type !== 'touchEnd') {
            // 触摸结束才设置设备属性
            return;
          }
        }
      });
    }
  },

  //设置亮度
  onBrightnessChange(event) {
    this.setData({
      brightnessValue: event.detail.value,
    });
  },

  //设置速度
  onSpeedChange(event) {
    this.setData({
      speedValue: event.detail.value,
    });
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