// pages/device-panel/nixie-tube-ips-panel/photo-manage/photo-manage.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: '',
    width: 243, //宽度
    height: 432, //高度
    max_width: 243,
    max_height: 432,
    min_width: 243,
    min_height: 432,
    disable_rotate: true, //是否禁用旋转
    disable_ratio: true, //锁定比例
    limit_move: true, //是否限制移动
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) { 
    //获取到image-cropper实例
    this.cropper = this.selectComponent("#image-cropper");
    //开始裁剪
    // this.setData({
    //     src:"https://oss.ulearn-ai.com/online/competition/img45638fa2ca7eaac86b6e25e9339a3f4f996da394.jpg",
    // });
    wx.showLoading({
        title: '加载中'
    })
    this.setData({
      src: options.tempFilePath
    });
    this.currentSwiper = options.currentSwiper;

    // console.log(this.data.src);
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

  submit(e) {
    this.cropper.getImg((obj) => {
      console.log(obj);
        app.globalData.imgSrc = obj.url;
        app.globalData.currentSwiper = this.currentSwiper;
        // wx.saveImageToPhotosAlbum({
        //   filePath: obj.url
        // })
        wx.navigateBack({
            delta: -1
        })
    });
  },

  cropperload(e){
    console.log("cropper初始化完成");
  },

  loadimage(e){
      console.log("图片加载完成",e.detail);
      wx.hideLoading();
      //重置图片角度、缩放、位置
      this.cropper.imgReset();
  },

  clickcut(e) {
    console.log(e.detail);
    //点击裁剪框阅览图片
    // wx.previewImage({
    //     current: e.detail.url, // 当前显示图片的http链接
    //     urls: [e.detail.url] // 需要预览的图片http链接列表
    // })
  },
})