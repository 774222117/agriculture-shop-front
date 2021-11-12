// pages/afterorder/afterorder.js
const app = getApp()
const getPeopleOrderAfterSaleUrl = require('../../utils/config.js').HttpConfig.OrderUrl.getPeopleOrderAfterSaleUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderInfo : null,
    orderDesc : ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let afterSaleId=options.afterSaleId
    wx.showLoading({
      title: '加载中...'
    })
    let that = this
    //访问数据
    wx.request({
      url: getPeopleOrderAfterSaleUrl,
      data: {
        afterSaleId:afterSaleId
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          that.setData({
            orderInfo: res.data.data
          })
          let orderDesc = ''
          if(res.data.data.status =='WAITING_REVIEW'){
            orderDesc = '请耐心等待客服审核'
          }
          else if(res.data.data.status =='CANCELED'){
            orderDesc = '申请被客服驳回'
          }
          else{
            orderDesc = '退单已完成'
          }
          that.setData({orderDesc:orderDesc})
        }
        else {
          console.log("获取店铺营业信息出错");
        }
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取店铺营业信息网络异常！',
          icon: 'none'
        });
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