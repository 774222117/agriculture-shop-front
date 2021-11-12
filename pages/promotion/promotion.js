const app = getApp()
const HttpClient = require('../../utils/util.js').HttpClient;
const Message = require('../../utils/util.js').Message;
const PromotionUrl = require('../../utils/config.js').HttpConfig.PromotionUrl;
let cartUtil = require('../../utils/cart')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bgColor:'red',//背景色
    saleActivityId: 0,
    saleActivityInfo: null,
    goodsList: [],
    current: 1, //当前页
    limit: 10, //1页数据量
    totalBuyCount : 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.activityId!=undefined){
      this.setData({
        saleActivityId:options.activityId
      })
      this.loadActivityGoodsInfo()
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
    this.refreshNum()
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
    this.loadActivityGoodsInfo()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /****自定义方法************************************ */
  //加载首页更多超值精选
  loadActivityGoodsInfo: function () {
    let that = this
    let peopleId = -1
    if (app.globalData.userInfo != undefined) {
      peopleId = app.globalData.userInfo.id
    }
    Message.Loading.loadingDefault();
    HttpClient.Method.get(PromotionUrl.InfoUrl, {
      peopleId: peopleId,
      saleActivityId: that.data.saleActivityId,
      current: that.data.current,
      limit: that.data.limit
    }, function (res) {
      Message.Loading.close()
      if (res.data.flag) {
        that.setData({
          saleActivityInfo: res.data.data,
          goodsList: that.data.goodsList.concat(res.data.data.goodsList),
          current: that.data.current + 1
        });
        if(res.data.data.backColor != ""){
          that.setData({bgColor:res.data.data.backColor})
        }
        that.initShopCart()
      } else {
        Message.Alert.alertError(res.data.message)
      }
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
    let goodsList = cartUtil.modifyGoodsList(this.data.goodsList, goods)
    if (goods.buyCount > buyCount) {
      wx.showToast({
        title: '添加购车成功',
        icon: 'none'
      })
    }
    this.setData({
      goodsList: goodsList,        
    })
    this.refreshNum()
  },

  /**
   * 减少购物车
   *   getShopGoodsInfo方法获得到的categoryGoodsList列表将商品信息（goodsInfo）绑定到控件上
   */
  delCart: function (e) {
    //判断登录
    if (app.globalData.userInfo == null) {
      wx.redirectTo({
        url: '../login/login'
      })
      return
    }
    let goods = e.currentTarget.dataset.goodsinfo
    goods = cartUtil.delShopCart(goods, cartUtil.cartType.OTO)
    if(goods.buyCount == 0) goods.buyCount = undefined
    let goodsList = cartUtil.modifyGoodsList(this.data.goodsList, goods);
    // 在商品详情中重新设置下数据
    this.setData({
      goodsList: goodsList,
    })
    this.refreshNum()
  },

  initShopCart: function () {
    let shopCart = cartUtil.getShopCart(cartUtil.cartType.OTO)
    let goodsInfoList = this.data.goodsList
    goodsInfoList.forEach((goods) => {
      goods.buyCount = undefined
    })
    shopCart.forEach((item) => {
      goodsInfoList.forEach((goods) => {
        if (item.goodsId == goods.id) {
          goods.buyCount = item.total
        }
      })
    })
    this.setData({goodsList:goodsInfoList})
    this.refreshNum()
  },

  refreshNum :function(){
    let totalBuyCount = cartUtil.getTotalBuyCount()
    this.setData({totalBuyCount:totalBuyCount})
  },

  //跳转商品详情
  goGoodsDetail: function (e) {
    let goods = e.currentTarget.dataset.goodsinfo
    wx.navigateTo({
      url: '../goods/goods?goodsId=' + goods.id,
    })
  },

  toCart : function(){
    wx.switchTab({
      url: '../shoppingCar/shoppingCar',
    })
  }
})