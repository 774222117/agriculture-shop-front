let cartUtil = require('../../utils/cart')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sumPrice: 0,
    shopCart: [],
    cartTypeName: cartUtil.cartType.OTO,
    isChoosedAll: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.getShopCartData();
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
  /**自定义方法**************************************** */
  /**
   * 选择结算商品
   */
  chooseCartGoods: function (e) {
    //获取商品
    let goods = e.currentTarget.dataset.goodsinfo
    let allChoosed = true
    this.data.shopCart.forEach((item) => {
      if (item.goodsId == goods.goodsId) {
        item.isChoosed = !item.isChoosed
        if (!item.isChoosed) {
          this.setData({
            isChoosedAll: false
          })
          allChoosed = false
        }
      }
    })
    this.setData({
      isChoosedAll: allChoosed,
      shopCart: this.data.shopCart
    })
    //更新缓存
    this.updateShopCartCatch(this.data.shopCart)
    cartUtil.refreshCartNum()
  },
  /**
   * 全选所有购物车商品
   */
  chooseAllCartGoods: function (e) {
    this.setData({
      isChoosedAll: !this.data.isChoosedAll
    })
    this.data.shopCart.forEach((item) => {
      item.isChoosed = this.data.isChoosedAll
    })
    this.setData({
      shopCart: this.data.shopCart
    })
    //更新缓存
    this.updateShopCartCatch(this.data.shopCart)
    cartUtil.refreshCartNum()
  },
  /**
   * 获取购物车数据
   */
  getShopCartData: function () {
    let shopCart = cartUtil.getShopCart(this.data.cartTypeName)
    let cartTotal = cartUtil.getShopCartTotal(this.data.cartTypeName);
    if(!cartTotal.sumPrice) {
      cartTotal.sumPrice = 0;
    }
    this.setData({
      shopCart: shopCart,
      sumPrice: cartTotal.sumPrice
    })
  },

  /**
   * 购物车增加商品
   * @param {*} e 
   */
  cartAdd(e) {
    let shopCart = this.data.shopCart

    //获取购物车商品
    let cart = e.currentTarget.dataset.goodsinfo
    //最小起订量
    let addTotal = cart.minBuyCount;
    if (addTotal == undefined || addTotal == null) addTotal = 1;

    //用户购买数量是否大于最大购买数
    if (cart.userMaxBuy > 0) {
      if (cart.userMaxBuy < cart.userBuy + cart.total + addTotal) {
        wx.showToast({
          title: '该商品已经超过最大购买数！',
          icon: 'none'
        });
        return;
      }
    }
    //判断库存
    if (cart.goodsTotal < cart.total + addTotal) {
      wx.showToast({
        title: '该商品已经没有库存不能添加！',
        icon: 'none'
      });
      return;
    }

    cart.total += addTotal;
    let index = cartUtil.shopCartIndex(cart.goodsId, shopCart)
    shopCart[index] = cart;
    cart = cartUtil.caulCartRealPrice(cart, cart)
    //金额
    // cart.realPrice = cart.total * cart.price
    // cart.realPrice = parseFloat(cart.realPrice.toFixed(2));
    //原价金额
    cart.realProductPrice = cart.total * cart.productPrice
    cart.realProductPrice = parseFloat(cart.realProductPrice.toFixed(2));
    this.modifyShopCartList(cart)
    //更新缓存
    this.updateShopCartCatch(shopCart)
    cartUtil.refreshCartNum()
  },

  /**
   * 购物车内减少商品
   */
  cartDel: function (e) {
    let cart = e.currentTarget.dataset.goodsinfo
    //最小起订量
    let addTotal = cart.minBuyCount;
    if (addTotal == undefined || addTotal == null) addTotal = 1;
    let shopCart = this.data.shopCart
    if (cart.total - addTotal < addTotal) {
      let index = cartUtil.shopCartIndex(cart.goodsId, shopCart)
      shopCart.splice(index, 1)
    } else {
      //减少数量
      cart.total -= addTotal;
      //金额
      // cart.realPrice = cart.total * cart.price
      // cart.realPrice = parseFloat(cart.realPrice.toFixed(2));
      let index = cartUtil.shopCartIndex(cart.goodsId, shopCart)
      shopCart[index] = cart;
      cart = cartUtil.caulCartRealPrice(cart, cart)
      //原价金额
      cart.realProductPrice = cart.total * cart.productPrice
      cart.realProductPrice = parseFloat(cart.realProductPrice.toFixed(2));
      this.modifyShopCartList(cart)

    }

    //更新缓存
    this.updateShopCartCatch(shopCart)
    cartUtil.refreshCartNum()
  },
  /**
   * 修改购物车内商品数
   */
  modifyShopCartList: function (cart) {
    this.data.shopCart.forEach((item) => {
      if (item.goodsId == cart.goodsId) {
        //数量
        item.total = cart.total
        //金额
        item.realPrice = cart.realPrice
        //原价金额
        item.realProductPrice = cart.realProductPrice
        return item
      }
    })
  },
  /**
   * 更新缓存
   * @param {购物车} shopCart 
   */
  updateShopCartCatch(shopCart) {
    cartUtil.setShopCart(shopCart, this.data.cartTypeName)
    cartUtil.caulTotal(this.data.cartTypeName)
    let cartTotal = cartUtil.getShopCartTotal(this.data.cartTypeName)
    this.setData({
      shopCart: shopCart,
      buyCount: cartTotal.buyCount,
      sumPrice: cartTotal.sumPrice,
      sumProductPrice: cartTotal.sumProductPrice
    })
  },
  topay: function () {
    if(this.data.shopCart.length<=0){
      return
    }
    wx.navigateTo({
      url: '../orderpay/orderpay',
    })
  }
})