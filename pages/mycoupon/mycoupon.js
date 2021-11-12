// pages/mycoupon/mycoupon.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //优惠券列表
    myCoupons: [],
    //所选择的优惠券
    selectCoupon: null,
    prevPage: {},

    isSelection: true, //是否选中
    choosedCouponId: '', //选中的id
    shopcouponNum: 0, //张数
    shopcouponPrice: 0, //下面抵扣的钱钱数
    couponCode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]; //上一个页面
    //优惠券列表
    this.setData({
      prevPage: prevPage,
      myCoupons: prevPage.data.myCoupons
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

  },

  /**
   * 选择玩优惠券
   */
  btnOK: function (e) {
    let choosedCouponId = this.data.choosedCouponId
    let selectCoupon = null
    console.log(this.data.choosedCouponId)
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.data.myCoupons.forEach((item) => {
      if (item.couponId == choosedCouponId) {
        selectCoupon = item
      }
    })
    if (selectCoupon != null) {
      let payAmount = parseFloat((prevPage.data.payAmount + prevPage.data.couponMonery - selectCoupon.productByMoney).toFixed(2))
      payAmount = payAmount > 0 ? payAmount : 0
      prevPage.setData({
        selectCoupon: selectCoupon,
        couponMonery: selectCoupon.productByMoney,
        couponDetail: "-￥" + selectCoupon.productByMoney,
        payAmount: payAmount
      })
    }
    wx.navigateBack({})
  },
  // 切换单选
  listRadioChange: function (e) {
    if (e.target.dataset.item.isUse == 0) {
      return
    }
    if (this.data.isSelection) { //true 标识未选择 可以点击
      this.setData({
        shopcouponPrice: e.target.dataset.item.productByMoney,
        choosedCouponId: e.target.dataset.item.couponId,
        shopcouponNum: 1,
        isSelection: false,
        couponCode: e.target.dataset.item.couponCode
      })
    } else {
      if (e.target.dataset.item.couponId == this.data.choosedCouponId && e.target.dataset.item.couponCode == this.data.couponCode) {
        this.setData({
          shopcouponPrice: 0,
          choosedCouponId: '',
          shopcouponNum: 0,
          isSelection: true,
          couponCode: ''
        })
      } else {
        wx.showToast({
          title: '与已选红包互斥，不可叠加，取消已选后在选择！',
          icon: 'none'
        })
      }
    }
  },
  //不是试用优惠券
  doChooseNone: function (e) {
    this.setData({
      shopcouponPrice: 0,
      choosedCouponId: '',
      shopcouponNum: 0,
      isSelection: true,
      couponCode: ''
    })
  }
})