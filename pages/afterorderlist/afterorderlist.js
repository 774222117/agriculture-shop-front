// pages/afterorderlist/afterorderlist.js
const app = getApp()
const findAfterSaleListUrl = require('../../utils/config.js').HttpConfig.OrderUrl.findAfterSaleListUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    peopleId : 0,

    pn : 0,
    //记录状态切换
    oldStatus : -1,
    //订单列表
    orderList : [],
    //订单总条数
    orderTotal : 0,
    //当前列表
    currentTab : 1,
    bottomIsShow : false,

    tabsList: [
      {
        title: '所有订单'
      },
      {
        title: '待审核'
      },
      {
        title: '已完成'
      },
      {
        title: '已驳回'
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(app.globalData.userInfo == null) return
    this.setData({
      peopleId : app.globalData.userInfo.id
    })
    if (options.tab){
      this.setData({ currentTab: options.tab})
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
    this.setData({     
      pn: 0,
      //订单列表
      orderList: [],
      //订单总条数
      orderTotal: 0,
    })
    this.getPeopleOrderInfo(this.data.currentTab)
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
   * 获取订单
   * @param {*} orderStatus 
   */
  getPeopleOrderInfo : function(orderStatus){
    if (this.data.peopleId == null || this.data.peopleId == 0) return

    //切换过状态,页码设为零
    if (this.data.oldStatus != orderStatus){
      this.data.orderList = []
      this.setData({
        pn:0,
        orderTotal : 0
      })
    }
    orderStatus = parseInt(orderStatus)
    let data = {
      pn : this.data.pn,
      status : orderStatus,
      peopleId: this.data.peopleId
    }
    
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    console.log('data',data)
    wx.request({
      url: findAfterSaleListUrl,
      data : data,
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      
      success: function (res) {
        wx.hideLoading();
        if (!res.data.rows) {
          wx.showToast({
            title: res.data.message || '查询订单出错！',
            icon: 'none'
          });          
          return
        }
        if (res.data.rows.lenght == 0) {
          that.setData({ bottomIsShow: true })
        } else {
          that.setData({ bottomIsShow: false })
          let orderList = that.data.orderList.concat(res.data.rows)
          //页面加+1
          that.setData({
            bottomIsShow: false,
            oldStatus: orderStatus,
            //订单数据
            orderList: orderList,
            //订单条数
            orderTotal : res.data.total
          })
        }
        console.info(that.data.orderList)                
      }
    })
  },


  changeTab : function(e){
    this.setData({
      currentTab: e.currentTarget.dataset.index,
      pn: 0,
      //订单列表
      orderList: [],
      //订单总条数
      orderTotal: 0,
    })
    this.getPeopleOrderInfo(this.data.currentTab)
  },

  toOrderInfo : function(e){
    console.log(e)
    let afterSaleId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/afterorder/afterorder?afterSaleId=' + afterSaleId
    })
  },
})