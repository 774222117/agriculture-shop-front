// pages/goods/goods.js
const app = getApp()
const GoodsUrl = require('../../utils/config.js').HttpConfig.GoodsUrl;
const HttpClient = require('../../utils/util.js').HttpClient;
const Message = require('../../utils/util.js').Message;
const cartUtil = require('../../utils/cart');
const PageGo = require('../../utils/util.js').PageGo;

//html解析模块
let htmlParse = require('../../component/wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoPlay:0, //视频是否播放
    // 轮播的配置
    indicatorDots: true,//是否需要指示点
    indicatorColor: "rgba(255,255,255,0.65)",//指示点颜色
    indicatorActiveColor: "rgba(145,196,61,1)",//当前选中指示点颜色
    autoplay: false, //是否自动切换
    interval: 2000, //自动时长
    duration: 500,//滑动动画时长
    goodsInfo:{},
    totalBuyCount:0,//购物车商品数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let goodsInfo = {};
    //是否有商品Id
    if(options.goodsId){
      Message.Loading.loadingDefault()
      HttpClient.Method.get(GoodsUrl.InfoUrl, {goodsId:options.goodsId}, function (res) {
        Message.Loading.close();
        if(res.data.flag) {
          goodsInfo = res.data.data;
          that.setData({
            goodsInfo
          })
          // 模板渲染
          let ruleInfo = goodsInfo.content;
          if (ruleInfo){
            htmlParse.wxParse('commodityDetails', 'html', ruleInfo, that, 5);
          } 
        }
      })
      
    }
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (res) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let totalBuyCount = cartUtil.getTotalBuyCount();
    this.setData({
      totalBuyCount
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
    let goodsInfo = this.data.goodsInfo;
    let title = goodsInfo.title + '(规格:' + goodsInfo.spec + ')★售价:' + goodsInfo.marketPrice
    let shopId = this.data.shopId    
    let goodsId = goodsInfo.id
    let parentId = app.globalData.userInfo.peopleId
    let urlPath = '/pages/goods/goods?shopId=' + shopId +
      '&goodsId=' + goodsId + '&parentId=' + parentId
    return {
      title: title,
      path: urlPath,
      imageUrl: goodsInfo.thumb,
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },
  /**
   * 加入购物车
   * @param e
   */
  addCart:function(e) {
    if(app.globalData.userInfo==null){
      wx.navigateTo({
        url: '../login/login',
      })
      return
    }
    let goods = e.currentTarget.dataset.info
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
    let totalBuyCount = cartUtil.getTotalBuyCount();
    this.setData({
      totalBuyCount
    });
  },
  // 视频点击
  // videoClick(){
  //   var videoContext = wx.createVideoContext('myVideo')
  //   if(this.data.videoPlay == 0){
  //     this.setData({
  //       videoPlay:1
  //     })
  //     videoContext.play()
  //   }else{
  //     this.setData({
  //       videoPlay:0
  //     })
  //     videoContext.pause()
  //   }
  // },
  gotoIndex:function () {
    PageGo.switchTo('/pages/index/index');
  },
  gotoCart:function () {
    PageGo.switchTo('/pages/shoppingCar/shoppingCar');
  },
  handlerVideo:function (e) {
    const source = e.detail.source;
    const current = e.detail.current;
    const myVideo = wx.createVideoContext('myVideo');
    if(current === 0 && source === 'touch') {
      myVideo.play();
    } else {
      myVideo.pause();
    }
  }
})