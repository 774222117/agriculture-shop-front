const app = getApp()
const HttpClient = require('../../utils/util.js').HttpClient;
const Message = require('../../utils/util.js').Message;
const IndexUrl = require('../../utils/config.js').HttpConfig.IndexUrl;
let cartUtil = require('../../utils/cart')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    peopleId: -1,
    payAmount: 0,
    current: 1, //当前页
    limit: 10, //1页数据量
    goodsList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      payAmount: options.payAmount
    })
    this.loadMoreGoodsInfo()
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
  /******自定义方法**************************************************/
  //加载首页更多超值精选
  loadMoreGoodsInfo: function (limit) {
    let that = this
    Message.Loading.loadingDefault();
    HttpClient.Method.get(IndexUrl.FindMoreUrl, {
      peopleId: that.data.peopleId,
      current: that.data.current,
      FindMoreUrl : 1,
      limit: that.data.limit
    }, function (res) {
      Message.Loading.close()
      if (res.data.flag) {
        that.setData({
          goodsList: res.data.data.rows
        });
      } else {
        Message.Alert.alertError(res.data.message)
      }
    })
  },
  addcart: function (e) {
    let goods = e.currentTarget.dataset.goodsinfo
    let buyCount = 0
    if (goods.buyCount) {
      buyCount = goods.buyCount
    }
    goods = cartUtil.addShopCart(goods, cartUtil.cartType.OTO)
    if (goods.buyCount > buyCount) {
      wx.showToast({
        title: '添加购车成功',
        icon: 'none'
      })
    }
  },
  goIndex:function(){
    wx.switchTab({
      url: '../index/index',
    })
  },
  goOrder:function(){
    wx.navigateTo({
      url: '../order/order',
    })
  },
  addcart: function (e) {
    if (app.globalData.userInfo == null) {
      wx.navigateTo({
        url: '../login/login',
      })
      return
    }
    let goods = e.currentTarget.dataset.goodsinfo
    let buyCount = 0
    if (goods.buyCount) {
      buyCount = goods.buyCount
    }
    goods = cartUtil.addShopCart(goods, cartUtil.cartType.OTO)
    if (goods.buyCount > buyCount) {
      wx.showToast({
        title: '添加购车成功',
        icon: 'none'
      })
    }
  },
  //跳转商品详情
  goGoodsDetail: function (e) {
    let goods = e.currentTarget.dataset.goodsinfo
    wx.navigateTo({
      url: '../goods/goods?goodsId=' + goods.id,
    })
  }
})