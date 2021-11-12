// pages/category.js
const app = getApp()
const CategoryUrl = require('../../utils/config.js').HttpConfig.CategoryUrl;
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
    heightCategory:0,
    heightGoods:0,
    categories:[],
    goodsInfos:[],
    current:1,//当前页
    limit:10,//1页数据量
    categoryId:'',//当前使用的分类ID 分页查询使用
    firstId:'',//当前第一个商品ID
    categoryIndex:0,//当前使用的分类的索引
    dataHas:true,//当前请求是否有数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let screenHeight = 0;
    //获取滚动条可滚动高度
    wx.getSystemInfo({
      success: (res) => {
        screenHeight = res.windowHeight; //获取屏幕高度
      }
    });
    // 通过query 获取其余盒子的高度
    let query = wx.createSelectorQuery().in(this)
    query.select('.serachGoodsBox').boundingClientRect()
    query.select('.titleSort').boundingClientRect()
    // 通过query.exec返回的数组 进行减法 同时 去除margin 和border的
    query.exec(res => {
      let serachGoodsBoxHeight = res[0].height;
      let titleSortHeight = res[1].height;
      this.setData({
        heightCategory: screenHeight - serachGoodsBoxHeight - 6,
        heightGoods: screenHeight - serachGoodsBoxHeight - titleSortHeight - 6
      });
    })
    //是否有定位元素
    this.loadCategories();
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
    if(app.globalData.categoryId != -1 && app.globalData.categoryId != this.data.categoryId){
      this.setData({current:1})
      this.loadCategories();
    }
    this.initShopCart()
    cartUtil.refreshCartNum();
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

  /******************************************** 自定义方法 ***************************************************** */

  /**
   * scrollId 定位的分类ID
   * 加载全部分类
   */
  loadCategories: function () {
    let that = this;
    let categories = [];
    const scrollId = app.globalData.categoryId;
    let categoryIndex = this.data.categoryIndex;//当前分类索引
    //加载分类
    Message.Loading.loadingDefault();
    HttpClient.Method.get(CategoryUrl.ListUrl, {}, function (res) {
      Message.Loading.close();
      if(res.data.flag) {
        categories = res.data.data;
        let categoryId = categories[categoryIndex].id;
        if(scrollId > 0) {
          categoryId = scrollId;
          app.globalData.categoryId = -1;
        }
        that.setData({
          categories
        });
        that.loadGoodsInfos(categoryId, that.data.current, that.data.limit);
      }
    })
  },
  /**
   * 加载指定分类商品
   * @param categoryId 分类ID
   * @param current 当前页
   * @param limit 页大小
   * @param index 当前分类索引
   */
  loadGoodsInfos: function (cateId, current, limit) {
    let that = this;
    let goodsInfos = this.data.goodsInfos;
    let categoryId = this.data.categoryId;
    const dataHas = this.data.dataHas;
    //加载分类
    Message.Loading.loadingDefault();
    HttpClient.Method.get(GoodsUrl.ListUrl, {categoryId:cateId, current:current, limit:limit}, function (res) {
      Message.Loading.close();
      if(res.data.total > 0) {
        if(res.data.rows.length > 0) {
          const firstId = res.data.rows[0].id;
          if(categoryId !== cateId) {
            goodsInfos = res.data.rows;
          } else {
            goodsInfos = goodsInfos.concat(res.data.rows);
          }
          //设置结果 和 当前分类
          that.setData({
            goodsInfos,
            categoryId:cateId,
            dataHas:true,
          });
          //首页数据定位首个商品
          if(current === 1) {
            that.setData({
              firstId
            });
          }
          that.initShopCart()
        } else {
          //分页没有数据显示则展示下个分类
          that.setData({
            dataHas:false
          });
        }
      }
    })
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
  },
  
  /**
   * 跳转搜索页
   * @param title
   */
  gotoSearch: function (e) {
    PageGo.jump('/pages/search/search', {title:e.detail.value})
    PageGo.cacheSearch(e.detail.value)
  },
  /**
   * 点击分类页
   * @param e
   */
  touchCategory:function (e) {
    const categoryIndex = e.currentTarget.dataset.index;
    this.setData({
      current: 1,
      categoryIndex,
      goodsInfos:[],
    });
    const categoryId = e.currentTarget.dataset.id;
    this.loadGoodsInfos(categoryId, this.data.current, this.data.limit, categoryIndex);
  },

  /**
   * 点击商品
   */
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
    let goods = e.currentTarget.dataset.info
    let buyCount = 0
    if (goods.buyCount) {
      buyCount = goods.buyCount
    }
    goods = cartUtil.addShopCart(goods, cartUtil.cartType.OTO)
    let goodsList = cartUtil.modifyGoodsList(this.data.goodsInfos, goods);
    if (goods.buyCount > buyCount) {
      wx.showToast({
        title: '添加购车成功',
        icon: 'none'
      })
      this.setData({
        goodsInfos: goodsList,        
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
    if(goods.buyCount == 0) goods.buyCount = undefined
    let goodsList = cartUtil.modifyGoodsList(this.data.goodsInfos, goods);
    // 在商品详情中重新设置下数据
    this.setData({
      goodsInfos: goodsList,
    })
    cartUtil.refreshCartNum()
  },

  onLower:function (e) {
    //底部分页
    let current = this.data.current;
    this.setData({
      current: current + 1
    });
    this.loadGoodsInfos(this.data.categoryId, this.data.current, this.data.limit);
  },
  onNext:function (e) {
    const categories = this.data.categories;
    let categoryIndex = this.data.categoryIndex;
    const newIndex = categoryIndex + 1;
    const cate = categories[newIndex];
    let categoryId = this.data.categoryId;
    if(cate) {
      this.setData({
        categoryIndex:newIndex,
        current:1,
        dataHas:true,
      });
      categoryId = cate.id;
    }
    this.loadGoodsInfos(categoryId, this.data.current, this.data.limit);
  }
})