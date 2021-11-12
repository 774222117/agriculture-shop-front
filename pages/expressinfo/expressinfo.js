// pages/expressinfo/expressinfo.js
const app = getApp()
const HttpClient = require('../../utils/util.js').HttpClient;
const GetExpressInfoUrl = require('../../utils/config.js').HttpConfig.GetExpressInfoUrl;
const Message = require('../../utils/util.js').Message;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ordersn:'',
    expressNo:'',
    expName: '',
    //物流详情
    logisticsData:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.ordersn == undefined){
      wx.showToast({
        title: '订单号异常',
        icon: 'none'
      })
    }
    if (options.expressNo == undefined) {
      wx.showToast({
        title: '快递单号异常',
        icon: 'none'
      })
    }
    this.setData({
      ordersn: options.ordersn,
      expressNo: options.expressNo
    })
    this.getExpressInfo(options.expressNo)
  },

  //获取物流详情
  getExpressInfo: function (expressNo) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    HttpClient.Method.get(GetExpressInfoUrl.InfoUrl, {expressNo:expressNo}, function (res) {
      wx.hideLoading()
      if(res.data.flag) {
        let list = res.data.data.result.list
        if(list.length == 0) {
          wx.showToast({
            title: '暂无快递信息',
            icon: 'none'
          })
        }
        that.setData({
          logisticsData:list
        })
      } else {
        Message.Alert.alertError(res.data.message)
      }
    })
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

  }
})