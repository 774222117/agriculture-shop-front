// pages/myIndex/myIndex.js
const app = getApp();
const Message = require('../../utils/util.js').Message;
const HttpClient = require('../../utils/util.js').HttpClient;
const MyCenter = require('../../utils/config.js').HttpConfig.MyCenter;
const PageGo = require('../../utils/util.js').PageGo;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    peopleInfo:{
      nickName:'',//昵称
      icon:'',//头像
      enterpriseName:'',//企业
      balanceData:'',//余额
    },//用户信息
    countData:{//数据统计
      couponNumber:0,//优惠券数量
      noPayOrder:0,//未支付订单数量
      waitSend:0,//待发货订单数量
    },
    saleActivityList:[]//所属企业促销活动列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const userInfo = app.globalData.userInfo;
    if(userInfo==null || !userInfo.id || userInfo.id <= 0){
      wx.navigateTo({
        url: '../login/login',
      })
      return
    }
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
    const userInfo = app.globalData.userInfo;
    if(userInfo == undefined) return
    Message.Loading.loadingDefault()
    let that = this;
    HttpClient.Method.get(MyCenter.InfoUrl,{peopleId:userInfo.id}, function (res) {
      Message.Loading.close();
      if(res.data.flag) {
        that.setData({
          peopleInfo:res.data.data
        })
      }
    });
    HttpClient.Method.get(MyCenter.CountUrl,{peopleId:userInfo.id}, function (res) {
      if(res.data.flag) {
        that.setData({
          countData:res.data.data
        })
      }
    });
    HttpClient.Method.get(MyCenter.FindPeopleSaleActivityUrl,{peopleId:userInfo.id}, function (res) {
      if(res.data.flag) {
        that.setData({
          saleActivityList:res.data.data
        })
      }
    });
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
  /**
   * 点击我的订单tab
   */
  touchOrder:function (e) {
    const tab = e.currentTarget.dataset.status;
    PageGo.jump('/pages/order/order', {tab:tab})
  },
  /**
   * 点击我的订单tab
   */
  touchAfter:function (e) {
    PageGo.jump('/pages/afterorderlist/afterorderlist', {tab:0})
  },
  /**
   * 点击我的余额
   */
  touchBalance:function (e) {
    PageGo.jump('/pages/myBalance/myBalance', {})
  },
  /**
   * 点击我的优惠券
   */
  touchCoupon:function (e) {
    PageGo.jump('/pages/couponlist/couponlist', {})
  },
  goPromotion:function(e){
    let activityId = e.currentTarget.dataset.item.id
    wx.navigateTo({
      url: '../promotion/promotion?activityId=' + activityId,
      complete() {
        wx.hideLoading() //关闭loding
      }
    })
  }
})