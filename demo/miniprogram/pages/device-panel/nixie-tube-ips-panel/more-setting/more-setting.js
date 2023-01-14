// pages/device-panel/nixie-tube-ips-panel/more-setting/more-setting.js

const app = getApp();

const { controlDeviceData, getDevicesData } = require('../../../../redux/actions');
const { getErrorMsg, getTemplateShownValue } = require('../../../../libs/utillib');
const { subscribeStore } = require('../../../../libs/store-subscribe');
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    switch12HValue: false,
    switchNTPValue: true,
    
    //时间设置
    timeValue: "",
    timeStamp: 0,
    timePopupShow: false,

    //时区设置
    timeZoneList: [],
    timeZoneindex: 0,
    timeZoneValue: "UTC+8",
    timeZonePopupShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    var date = new Date(); //时间对象
    var str = date.getTime(); //转换成时间戳
      
    var list = []
    for(var i = 12; i > 0; i--) {
      list.push("UTC-" + i)
    }
    for(var i = 0; i < 13; i++) {
      list.push("UTC+" + i)
    }

    this.setData({
      timeValue: this.filterTime(str),
      timeZoneList: list,
      timeZoneindex: this.getTimeZoneIndex(list, this.data.timeZoneValue),
    })     
    console.log(this.data)
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
    this.setData({ switch12HValue: detail });
  },

  //设置NTP开关
  onSwitchNTPChange({ detail }) {
    // 需要手动对 checked 状态进行更新
    this.setData({ switchNTPValue: detail });
  },

  onOperationClick(e) {
    switch (e.target.id) {
      case 'timeZone':
        this.setData({
          timeZonePopupShow: true,
        })
        
        break;
      case 'timeSet':
        this.setData({
          timePopupShow: true,
        })
        break;
    }
  },

  closeTimePopup: function () {
    this.setData({
      timePopupShow: false
    })
  },

  // 设置时间
  onConfirmTimePicker: function (e) {
    this.setData({
      timeValue: this.filterTime(e.detail),
      timeStamp: e.detail,
    })
    this.closeTimePopup()
  },

  closeTimeZonePopup: function () {
    this.setData({
      timeZonePopupShow: false
    })
  },

  // 设置时区
  onConfirmTimeZonePicker: function (e) {
    this.setData({
      timeZoneindex: e.detail.index,
      timeZoneValue: e.detail.value
    })
    this.closeTimeZonePopup()
  }
})