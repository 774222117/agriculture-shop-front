// pages/searchPage/searchPage.js
const app = getApp()
const GoodsUrl = require('../../utils/config.js').HttpConfig.GoodsUrl;
const HttpClient = require('../../utils/util.js').HttpClient;
const Message = require('../../utils/util.js').Message;
const PageGo = require('../../utils/util.js').PageGo;
const cartUtil = require('../../utils/cart');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'',//查询标题
    current:1,//当前页
    limit:10,//1页数据量
    goodsInfos:[],//查询结果
    histories:[],//历史记录
    showHistory:false,//历史记录
    totalBuyCount : 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const showHistory = !(options.title)
    this.setData({
      title:options.title,
      histories:PageGo.getSearchCache(),
      showHistory
    });
    if(!showHistory) {
      this.loadGoodsInfos(options.title, this.data.current, this.data.limit);
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
    //底部分页
    let current = this.data.current;
    let title = this.data.title;
    this.setData({
      current: current + 1
    });
    this.loadGoodsInfos(title, this.data.current, this.data.limit);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /******************************************** 自定义方法 ***************************************************** */
  /**
   * 搜索按钮
   */
  onSearch: function (e) {
    this.setData({
      current : 1,
      goodsInfos:[],
    });
    let title = e.detail.value;
    this.loadGoodsInfos(title, this.data.current, this.data.limit);
    PageGo.cacheSearch(title);
  },
  onChange: function (e) {
    let title = e.detail.value;
    if(!title) {
      this.setData({
        showHistory:true,
        goodsInfos:[],
      })
    }
  },
  onClear:function (e) {
    this.setData({
      showHistory:true,
      title:''
    })
  },
  onUse:function (e) {
    const title = e.currentTarget.dataset.title;
    this.setData({
      showHistory:false,
      title:title,
      current : 1,
      goodsInfos:[],
    });
    this.loadGoodsInfos(title, this.data.current, this.data.limit);
  },

  /**
   * 加载标题商品
   * @param title 分类ID
   * @param current 当前页
   * @param limit 页大小
   */
  loadGoodsInfos: function (title, current, limit) {
    let that = this;
    let goodsInfos = this.data.goodsInfos;
    //加载分类
    Message.Loading.loadingDefault();
    HttpClient.Method.get(GoodsUrl.ListUrl, {title:title, current:current, limit:limit}, function (res) {
      Message.Loading.close();
      if(res.data.total > 0) {
        if(res.data.rows.length > 0) {
          goodsInfos = goodsInfos.concat(res.data.rows);
          that.setData({
            goodsInfos
          })
          that.initShopCart()          
        }
      }
    })
  },
  touchGoods:function (e) {
    const goodsId = e.currentTarget.dataset.id;
    PageGo.jump('/pages/goods/goods', {goodsId:goodsId})
  },
  /**
   * 加入购物车
   * @param e
   */
  addCart:function(e){
    if(app.globalData.userInfo==null){
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
    let goodsList = cartUtil.modifyGoodsList(this.data.goodsInfos, goods);
    this.setData({
      goodsInfos: goodsList,
    })
    if (goods.buyCount > buyCount) {
      wx.showToast({
        title: '添加购车成功',
        icon: 'none'
      })
    }
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
    let goodsList = cartUtil.modifyGoodsList(this.data.goodsInfos, goods);
    // 在商品详情中重新设置下数据
    this.setData({
      goodsInfos: goodsList,
    })
    this.refreshNum()
  },

  initShopCart: function () {
    let shopCart = cartUtil.getShopCart(cartUtil.cartType.OTO)
    let goodsInfoList = this.data.goodsInfos
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
    this.setData({goodsInfos:goodsInfoList})
    this.refreshNum()
  },

  refreshNum :function(){
    let totalBuyCount = cartUtil.getTotalBuyCount()
    this.setData({totalBuyCount:totalBuyCount})
  },

  toCart : function(){
    wx.switchTab({
      url: '../shoppingCar/shoppingCar',
    })
  }
})