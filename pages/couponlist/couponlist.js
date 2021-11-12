// pages/couponlist/couponlist.js
const app = getApp()
const HttpClient = require('../../utils/util.js').HttpClient;
const Message = require('../../utils/util.js').Message;
const GetCouponListUrl = require('../../utils/config.js').HttpConfig.GetCouponListUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    peopleId: "",
    unUsedCouponList:[],
    usedCouponList:[],
    invalidCouponList:[],
    unusedIsShow:"ischange",
    usedIsShow:"unchange",
    invalidIsShow:"unchange",
    couponStartTime : "",
    unUsedGreenIsShow:"isGreen",
    usedGreenIsShow:"unGreen",
    invalidGreenIsShow:"unGreen",
    unUsedBottomIsShow:"ischange",
    usedBottomIsShow:"unchange",
    invalidBottomIsShow:"unchange",
    unusedCounts:0,
    usedCounts:0,
    invalidCounts:0,
    exchangeCode:""
  },

  //待使用
  clickUnusedTab:function(){
    this.setData({
      unusedIsShow:"ischange",
      usedIsShow:"unchange",
      invalidIsShow:"unchange",
      unUsedGreenIsShow:"isGreen",
      usedGreenIsShow:"unGreen",
      invalidGreenIsShow:"unGreen",
      unUsedBottomIsShow:"ischange",
      usedBottomIsShow:"unchange",
      invalidBottomIsShow:"unchange"
    })
    this.getUnUsedCouponList();
  },
  //已使用
  clickUsedTab:function(){
    this.setData({
      unusedIsShow:"unchange",
      usedIsShow:"ischange",
      invalidIsShow:"unchange",
      unUsedGreenIsShow:"unGreen",
      usedGreenIsShow:"isGreen",
      invalidGreenIsShow:"unGreen",
      unUsedBottomIsShow:"unchange",
      usedBottomIsShow:"ischange",
      invalidBottomIsShow:"unchange"
    })
    this.getUsedCouponList();
  },
  //已过期
  clickInvalidTab:function(){
    this.setData({
      unusedIsShow:"unchange",
      usedIsShow:"unchange",
      invalidIsShow:"ischange",
      unUsedGreenIsShow:"unGreen",
      usedGreenIsShow:"unGreen",
      invalidGreenIsShow:"isGreen",
      unUsedBottomIsShow:"unchange",
      usedBottomIsShow:"unchange",
      invalidBottomIsShow:"ischange"
    })
    this.getInvalidCouponList();
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCouponCountsList();
    this.getUnUsedCouponList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },


  //待使用券
  getUnUsedCouponList:function(){
    if (app.globalData.userInfo == null) return
    let that = this
    that.setData({
      peopleId: app.globalData.userInfo.id
    })
    HttpClient.Method.get(GetCouponListUrl.UnusedCouponUrl, {peopleId: that.data.peopleId}, function (res) {
      if(res.data.flag){
        that.setData({
          unUsedCouponList:res.data.data.myCouponDtos
        });
      }else{
        Message.Alert.alertError(res.data.message)
      }
    })
  },

  //已使用券
  getUsedCouponList:function(){
    if (app.globalData.userInfo == null) return
    let that = this
    that.setData({
      peopleId: app.globalData.userInfo.id
    })
    HttpClient.Method.get(GetCouponListUrl.UsedCouponUrl, {peopleId: that.data.peopleId}, function (res) {
      if(res.data.flag){
        that.setData({
          usedCouponList:res.data.data.myCouponDtos
        });
      }else{
        Message.Alert.alertError(res.data.message)
      }
    })
  },

  //已过期券
  getInvalidCouponList:function(){
    if (app.globalData.userInfo == null) return
    let that = this
    that.setData({
      peopleId: app.globalData.userInfo.id
    })
    HttpClient.Method.get(GetCouponListUrl.InvalidCouponUrl, {peopleId: that.data.peopleId}, function (res) {
      if(res.data.flag){
        that.setData({
          invalidCouponList:res.data.data.myCouponDtos
        });
      }else{
        Message.Alert.alertError(res.data.message)
      }
    })
  },

  //获取优惠券数量
  getCouponCountsList:function(){
    if (app.globalData.userInfo == null) return
    let that = this
    that.setData({
      peopleId: app.globalData.userInfo.id
    })
    HttpClient.Method.get(GetCouponListUrl.GetCouponCountsUrl, {peopleId: that.data.peopleId}, function (res) {
      if(res.data.flag){
        that.setData({
          unusedCounts:res.data.data.unusedCounts,
          usedCounts:res.data.data.usedCounts,
          invalidCounts:res.data.data.invalidCounts
        });
      }else{
        Message.Alert.alertError(res.data.message)
      }
    })
  },


  //初始方法 -- key生成
  pageKeyFunc:function(id){
    if (app.globalData.userInfo == undefined) return
    let _date = new Date().getTime(),
      _peopleId = app.globalData.userInfo.id,
      _id = id;
      let _str = _peopleId +''+ _date +''+ _id;
    if (_peopleId || _peopleId == 0){
      return _str
    }else{
      console.log('用户不存在');
    }
  },

  //获取兑换码input的值
  getExchangeCode:function(e){
    this.setData({
      exchangeCode: e.detail.value
    })
  },

  //兑换券
  exchangeCoupon:function(){
    if (app.globalData.userInfo == null) return
    let that = this
    that.setData({
      peopleId: app.globalData.userInfo.id
    })
    let pageKey =  this.pageKeyFunc(that.data.peopleId); 
    let exchangeCode = that.data.exchangeCode;
    HttpClient.Method.get(GetCouponListUrl.SubmitExchangeCodeUrl, {peopleId: that.data.peopleId, exchangeCode: exchangeCode, pageKey: pageKey}, function (res) {
      if(res.data.flag){
        
      }else{
        Message.Alert.alertError(res.data.message)
      }
    })
  },

  //去使用
  toUseCoupon:function(e){
    let item = e.currentTarget.dataset.item
    if(item.activeId!=0){
      wx.navigateTo({
        url: '../promotion/promotion?activityId=' + item.activeId,
      })
    }
  }

  


})