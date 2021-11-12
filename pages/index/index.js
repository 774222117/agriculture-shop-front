// index.js
// 获取应用实例
const app = getApp()
const HttpClient = require('../../utils/util.js').HttpClient;
const Message = require('../../utils/util.js').Message;
const IndexUrl = require('../../utils/config.js').HttpConfig.IndexUrl;
const PageGo = require('../../utils/util.js').PageGo;
let cartUtil = require('../../utils/cart')
Page({
  data: {
    // 轮播的配置
    indicatorDots: true, //是否需要指示点
    indicatorColor: "rgba(255,255,255,0.65)", //指示点颜色
    indicatorActiveColor: "rgba(255,255,255,1)", //当前选中指示点颜色
    autoplay: true, //是否自动切换
    interval: 2000, //自动时长
    duration: 500, //滑动动画时长

    peopleId: -1,
    allDataObj: {},
    current: 1, //当前页
    limit: 10, //1页数据量
    goodsList: [],
    //企业福利发放结果
    rechargeList: [],
    //企业福利弹框
    showBulletFrame: false
  },
  // 事件处理函数
  bindViewTap() {
    // wx.navigateTo({
    //   url: '../logs/logs'
    // })
    wx.redirectTo({
      url: '../login/login'
    })
  },
  onLoad() {
    this.loadIndexInfo()
    this.loadMoreGoodsInfo()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    cartUtil.refreshCartNum()
    this.initShopCart()
    //企业福利券发券
    this.enterpriseRecharge()
  },
  onReachBottom: function () {
    this.loadMoreGoodsInfo()
  },
  /****************自定义方法**************************************** */
  //加载首页模块数据
  loadIndexInfo: function () {
    let that = this
    let peopleId = -1
    if (app.globalData.userInfo != undefined) {
      peopleId = app.globalData.userInfo.id
    }
    HttpClient.Method.get(IndexUrl.InfoUrl, {
      peopleId: peopleId
    }, function (res) {
      that.distributeAllData(res)
    })
  },
  // 分发所有数据到allDataObj
  distributeAllData: function (data) {
    let that = this;
    that.setData({
      allDataObj: {}
    })
    for (var i = 0; i < data.data.length; i++) {
      that.data.allDataObj[data.data[i].code] = data.data[i].banners;
      if (data.data[i].code == "enjoy") {
        that.setData({
          enjoyName: data.data[i].name
        })
      }
    }
    that.setData({
      allDataObj: that.data.allDataObj
    })
  },
  //加载首页更多超值精选
  loadMoreGoodsInfo: function (limit) {
    let that = this
    let peopleId = -1
    if (app.globalData.userInfo != undefined) {
      peopleId = app.globalData.userInfo.id
    }
    Message.Loading.loadingDefault();
    HttpClient.Method.get(IndexUrl.FindMoreUrl, {
      peopleId: peopleId,
      current: that.data.current,
      isRecommend: 1,
      limit: that.data.limit
    }, function (res) {
      Message.Loading.close()
      if (res.data.flag) {
        that.setData({
          goodsList: that.data.goodsList.concat(res.data.data.rows),
          current: that.data.current + 1
        });
        that.initShopCart()
      }
    })
  },
  //企业福利发放
  enterpriseRecharge: function (limit) {
    let that = this
    if (app.globalData.userInfo == undefined) {
      return
    }
    let peopleId = app.globalData.userInfo.id
    Message.Loading.loadingDefault();
    HttpClient.Method.get(IndexUrl.EnterpriseRechargeUrl, {
      peopleId: peopleId,
    }, function (res) {
      Message.Loading.close()
      if (res.data.flag && res.data.code == '1') {
        that.setData({
          rechargeList: res.data.data,
          showBulletFrame: true
        })
      }
    })
  },
  onjumpPage: function (e) {
    let contentid = ''
    let popcontent = ''
    switch (e.currentTarget.dataset.item.bannerType) {
      case 1:
        contentid = e.currentTarget.dataset.item.navigateId
        popcontent = e.currentTarget.dataset.item.navigateName
        wx.navigateTo({
          url: '../coupondetail/coupondetail?source=' + clicktype + '&id=' + e.currentTarget.dataset.item.navigateId,
          success() {
            console.log('success')
          },
          fail() {
            console.log('fail')
          },
          complete() {
            wx.hideLoading() //关闭loding
          }
        })
        break;

      case 5:
        popcontent = e.currentTarget.dataset.item.navigateUrl
        //如果跳转目标是分类页
        if (popcontent.indexOf("category/category") != -1) {
          if (popcontent.indexOf("?") != -1) {
            const params = popcontent.split('?')[1];
            app.globalData.categoryId = params.split('=')[1];
          }
          wx.switchTab({
            url: "../category/category",
            complete() {
              wx.hideLoading() //关闭loding
            },
            fail(res) {
              console.info(res)
            }
          })
        }
        break
      case 8:
        contentid = e.currentTarget.dataset.item.navigateId
        wx.navigateTo({
          url: '../promotion/promotion?activityId=' + contentid,
          complete() {
            wx.hideLoading() //关闭loding
          }
        })
        break
      case 9:
        contentid = e.currentTarget.dataset.item.navigateId
        wx.navigateTo({
          url: '../promotion/promotion?activityId=' + contentid,
          complete() {
            wx.hideLoading() //关闭loding
          }
        })
        break

    }
  },
  goPromotion: function (e) {
    let activityId = e.currentTarget.dataset.item.navigateId
    wx.navigateTo({
      url: '../promotion/promotion?activityId=' + activityId,
      complete() {
        wx.hideLoading() //关闭loding
      }
    })
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
    this.setData({
      goodsList: goodsInfoList
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
    let goodsList = cartUtil.modifyGoodsList(this.data.goodsList, goods);
    if (goods.buyCount > buyCount) {
      wx.showToast({
        title: '添加购车成功',
        icon: 'none'
      })
      this.setData({
        goodsList: goodsList,
      })
      cartUtil.refreshCartNum()
    }
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
    let goods = e.currentTarget.dataset.info
    goods = cartUtil.delShopCart(goods, cartUtil.cartType.OTO)
    if (goods.buyCount == 0) goods.buyCount = undefined
    let goodsList = cartUtil.modifyGoodsList(this.data.goodsList, goods);
    // 在商品详情中重新设置下数据
    this.setData({
      goodsList: goodsList,
    })
    cartUtil.refreshCartNum()
  },
  //跳转商品详情
  goGoodsDetail: function (e) {
    let goods = e.currentTarget.dataset.goodsinfo
    wx.navigateTo({
      url: '../goods/goods?goodsId=' + goods.id,
    })
  },
  //关闭企业弹框
  hideBulletFrame: function () {
    this.setData({
      showBulletFrame: false
    })
  },
  /**
   * 跳转搜索页
   * @param title
   */
  gotoSearch: function () {
    PageGo.jump('/pages/search/search', {
      title: ''
    })
  },
  toUse: function (e) {
    let item = e.currentTarget.dataset.item
    this.hideBulletFrame()
    if (item.rechargeType == 2) {
      if (item.saleActivityId != '') {
        wx.navigateTo({
          url: '../promotion/promotion?activityId=' + item.saleActivityId,
        })
      } else {
        wx.navigateTo({
          url: '../mycoupon/mycoupon',
        })
      }
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})