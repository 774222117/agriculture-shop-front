const app = getApp()
//获取优惠券
const myOrderCouponsUrl = require('../../utils/config.js').HttpConfig.OrderUrl.MyOrderCouponsUrl;
//获取我的余额
const PeopleBalanceUrl = require('../../utils/config.js').HttpConfig.MyCenter.MyBalanceUrl;
//提交订单
const SubmitShopOrderUrl = require('../../utils/config.js').HttpConfig.OrderUrl.SubmitShopOrderUrl;
//放弃支付
const PayFaildOrderUrl = require('../../utils/config.js').HttpConfig.OrderUrl.PayFaildOrderUrl;
//重新支付
const PayOrderUrl = require('../../utils/config.js').HttpConfig.OrderUrl.PayOrderUrl;

//购物车
let shopcartUtil = require('../../utils/cart')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //是否去过充值界面
    isChangeBalance : false,    
    cartTypeName: shopcartUtil.cartType.OTO,
    //点击展开更多
    lookmore: false,
    //订单号
    orderId: 0,
    //用户Id,
    peopleId: 0,
    //促销ID
    saleActivityId: 0,
    //接受的数据
    shopCart: [],
    //支付金额
    payAmount: 0,
    //用户余额
    peopleBalance: 0,
    //是否显示余额充值按钮
    isShowBalanceRecharge: false,

    /*********** 优惠券相关 ********** */
    //优惠券描述
    couponDetail: '',
    //优惠券列表
    myCoupons: [],
    //可用红包个数
    useCouponCount: 0,

    /*********** 配送费相关 ********** */
    //配送费 暂时写死
    dispatchPrice: 0,
    //配送优惠金额
    dispatchDiscountPrice: 0,
    //是否显示配送费 写死不显示
    isShowDispatchPrice: false,

    /*********** 界面录入 ********** */
    //选择的红包
    selectCoupon: null,
    couponMonery: 0,
    //支付方式 1 余额 2 优惠金额
    payType: 2,
    //配送区域
    regionInfo: '配送地址',
    //详细地址
    detailInfo: '选择&录入配送地址',
    //提货人
    pickerName: '',
    //提货人联系电话
    pickerMobile: '',
    //订单备注
    buyRemark: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      peopleId: app.globalData.userInfo.id
    })


    if (options.saleActivityId) {
      this.setData({
        saleActivityId: options.saleActivityId
      })
    }

    //购物车数据
    let shopCart = shopcartUtil.getShopCart(this.data.cartTypeName)
    let cartTotal = shopcartUtil.getShopCartTotal(this.data.cartTypeName)
    let payAmount = cartTotal.sumPrice + this.data.dispatchPrice
    payAmount = parseFloat(payAmount).toFixed(2)
    this.setData({
      shopCart: shopCart,
      cartTotal: cartTotal,
      payAmount: payAmount,
      buyCount: cartTotal.buyCount,
    })

    //获取优惠券
    this.getMyOrderCoupon()
    //获取默认配送信息
    this.getPeopleInfo()
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
    //进入余额充值页面后，重新获取用户余额
    if(this.data.isChangeBalance){
      //获取余额
      this.getPeopleBalance()
      this.setData({isChangeBalance:false})
    }
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
   * 缓存获取用户信息
   */
  getPeopleInfo() {
    //获取配送信息
    let regionInfo = wx.getStorageSync("regionInfo")
    let detailInfo = wx.getStorageSync("detailInfo")
    if (!regionInfo) regionInfo = '配送地址'
    if (!detailInfo) detailInfo = '选择&录入配送地址'

    let pickerName = wx.getStorageSync("pickerName")
    let pickerMobile = wx.getStorageSync("pickerMobile")

    if (!pickerName) {
      pickerName = app.globalData.userInfo.nickName
      wx.setStorageSync("pickerName", pickerName)
    }

    if (!pickerMobile) {
      pickerMobile = app.globalData.userInfo.phone
      wx.setStorageSync("pickerMobile", pickerMobile)
    }
  },


  /**
   * 生成订单
   */
  createOrderInfo: function () {
    if (this.data.regionInfo == "" || this.data.regionInfo == "配送地址") {
      wx.showToast({
        title: '请选择配送地址！',
        icon: 'none'
      });
      return null
    }
    if (this.data.detailInfo == "" || this.data.regionInfo == "选择&录入配送地址") {
      wx.showToast({
        title: '请选择配送地址！',
        icon: 'none'
      });
      return null
    }
    if (this.data.pickerName == undefined || this.data.pickerName == "") {
      wx.showToast({
        title: '请录入收获人',
        icon: 'none'
      });
      return null
    }

    if (this.data.pickerMobile == undefined || this.data.pickerMobile == "") {
      wx.showToast({
        title: '请录入收获人电话',
        icon: 'none'
      });
      return null
    }

    if (this.data.payType == 1 && this.data.peopleBalance < this.data.payAmount) {
      wx.showToast({
        title: '余额小于支付金额，请先充值！',
        icon: 'none'
      });
      return null
    }

    let orderInfo = {
      merchantId: 1,
      supplierId: -1,
      //提货人
      pickerName: this.data.pickerName,
      //提货人电话
      pickerMobile: this.data.pickerMobile,
      //配送各区域
      regionInfo: this.data.regionInfo,
      //配送地址
      detailInfo: this.data.detailInfo,
      //用户ID
      peopleId: this.data.peopleId,
      //openId
      openId: app.globalData.userInfo.wxMinOpenId,

      //订单备注 
      buyRemark: this.data.buyRemark,
      //支付金额
      price: this.data.payAmount,
      //商品金额
      goodsPrice: this.data.payAmount,
      //优惠金额
      discountPrice: 0,
      //使用优惠券Id
      useCouponId: 0,
      //优惠券卡
      useCouponCode: "",
      //优享卡Id
      couponId: 0,
      //配送费
      dispatchPrice: this.data.dispatchPrice,
      //包装费
      packPrice: this.data.packPrice,
      //支付方式
      payType: this.data.payType,
      //促销活动id
      saleActivityId: this.data.saleActivityId
    }
    //优惠券金额
    if (this.data.selectCoupon) {
      orderInfo.useCouponId = this.data.selectCoupon.couponId
      orderInfo.useCouponCode = this.data.selectCoupon.couponCode
      orderInfo.discountPrice = this.data.selectCoupon.productByMoney
    }

    //商品数据
    let orderGoods = []
    let that = this
    let sumTotal = 0
    this.data.shopCart.forEach((item) => {
      if (item.isChoosed) {
        sumTotal += item.total
        let goods = {
          goodsId: item.goodsId,
          total: item.total,
          price: item.price,
          realPrice: item.realPrice,
          productPrice: item.productPrice
        }
        orderGoods.push(goods)
      }

    })
    if (sumTotal == 0) {
      wx.showToast({
        title: '商品数量为零！',
        icon: 'none'
      });
      return null
    }
    //添加商品数据
    orderInfo.goodsItems = orderGoods
    //设置提货人缓存
    wx.setStorageSync("pickerName", this.data.pickerName)
    wx.setStorageSync("pickerMobile", this.data.pickerMobile)

    return orderInfo
  },

  /**
   * 获取我的优惠券
   */
  getMyOrderCoupon: function () {
    let that = this
    //组织数据
    let orderInfo = {
      //用户ID
      peopleId: this.data.peopleId,
      //支付金额
      price: this.data.payAmount,
    }
    //商品数据
    let orderGoods = []
    this.data.shopCart.forEach((item) => {
      let goods = {
        goodsId: item.goodsId,
        total: item.total,
        price: item.price,
        realPrice: item.realPrice
      }
      orderGoods.push(goods)
    })
    orderInfo.goodsItems = orderGoods

    wx.showLoading({
      title: '正在加载数据，请稍后...',
      mask: true
    })

    wx.request({
      url: myOrderCouponsUrl,
      method: 'post',
      data: orderInfo,
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取优惠券出错,网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取优惠券信息失败！',
            icon: 'none'
          });
          return
        }
        console.info(res.data.data)
        that.setData({
          //可用红包个数
          useCouponCount: res.data.code,
          //红包描述
          couponDetail: res.data.message,
          //优惠券列表
          myCoupons: res.data.data
        })
        //有可用红包
        if (that.data.useCouponCount == 1) {
          let couponMonery = res.data.data[0].productByMoney
          let cartTotal = shopcartUtil.getShopCartTotal(that.data.cartTypeName)
          let payAmount = parseFloat((cartTotal.sumPrice - couponMonery + (that.data.dispatchPrice - that.data.dispatchDiscountPrice)).toFixed(2))
          payAmount = payAmount > 0 ? payAmount : 0
          that.setData({
            selectCoupon: res.data.data[0],
            couponDetail: "-￥" + couponMonery,
            couponMonery: couponMonery,
            payAmount: payAmount
          })
        }

        //获取我的余额
        that.getPeopleBalance()
      }
    })

  },

  /**
   * 获取我的余额
   */
  getPeopleBalance: function () {
    let that = this
    wx.request({
      url: PeopleBalanceUrl,
      method: 'get',
      data: {
        peopleId: that.data.peopleId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取我的余额出错,网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取我的余额失败！',
            icon: 'none'
          });
          return
        }
        console.info("用户余额：" + res.data.data)
        let peopleBalance = res.data.data
        let payAmount = that.data.payAmount
        //支付方式
        let payType = 2
        //是否显示余额充值按钮
        let isShowBalanceRecharge = true
        //给默认支付方式
        if (peopleBalance > payAmount) {
          payType = 1
          isShowBalanceRecharge = false
        }
        that.setData({
          //余额
          peopleBalance: peopleBalance,
          //支付方式
          payType: payType,
          //充值余额是否显示
          isShowBalanceRecharge: isShowBalanceRecharge
        })

      }
    })
  },

  /**
   * 提交订单
   */
  submitShopOrder: function () {
    let that = this
    if (this.data.isSubmit) return
    this.setData({
      isSubmit: true
    })
    let orderInfo = this.createOrderInfo();
    if (orderInfo == null) {
      this.setData({
        isSubmit: false
      })
      return
    }

    console.log("订单数据：" + JSON.stringify(orderInfo))

    //首次提交
    let url = SubmitShopOrderUrl
    if (that.data.orderId > 0) {
      url = PayOrderUrl
      orderInfo.id = this.data.orderId
    }
    //提交数据
    wx.showLoading({
      title: '正在提交订单，请稍后...',
      mask: true
    })

    wx.request({
      url: url,
      method: 'post',
      data: orderInfo,
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '订单提交出错,网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        that.setData({
          isSubmit: false
        })
        //判断是否有错
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '提交订单异常！',
            icon: 'none'
          });
          return
        }
        //无需支付
        if (res.data.code == 1) {
          setTimeout(function () {
            that.toBack(that)
          }, 200)
        }
        //发起支付
        else {
          that.setData({
            orderId: res.data.data.orderId,
          })
          that.callWxPay(res.data.data)
        }
      },
      fail: function () {
        that.setData({
          isSubmit: false
        })
      }
    })
  },

  /**
   * 调用微信支付
   */
  callWxPay: function (weChatInfo) {
    let that = this
    wx.requestPayment({
      timeStamp: weChatInfo.timeStamp,
      nonceStr: weChatInfo.nonceStr,
      package: weChatInfo.package1,
      signType: weChatInfo.signType,
      paySign: weChatInfo.paySign,
      //用户放弃支付，只给提示
      fail: function (err) {
        console.log(err);
        let _msg = err.message
        if (_msg == undefined) {
          _msg = "支付失败!"
        }
        wx.showToast({
          title: _msg,
          icon: 'none'
        });

        wx.request({
          url: PayFaildOrderUrl,
          data: {
            orderId: weChatInfo.orderId,
            peopleId: that.data.peopleId
          },
          method: 'GET',
          success: function (res) {
            // wx.switchTab({
            //   url: '../shoporder/shoporder?tab=1',
            // })         
          },
          fail: function (res) {},
          complete: function (res) {},
        })
      },
      //支付成功
      success: function (res) {
        that.clearShopCart()
        //售卡，直接跳转卡界面        
        setTimeout(function () {
          that.toBack(that)
        }, 200)
      }
    })
  },


  /***********************************  事件  *************************************************/

  /**
   * 支付按钮
   * @param {} e 
   */
  btnPay: function (e) {
    let that = this
    if(this.data.payType == 1){
      wx.showModal({
        title: '提示',
        content: '确定下单并使用余额支付？',
        success (res) {
          if (res.confirm) {
            that.submitShopOrder()
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }else{
      that.submitShopOrder()
    }
    
    
  },

    /**
   * 取消支付按钮
   * @param {} e 
   */
  cancelBtnPay: function (e) {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 余额充值
   * @param {*} e 
   */
  toBalance: function (e) {
    wx.navigateTo({
      url: '/pages/mybalance/mybalance',
    })
  },

  /**
   * 选择优惠券
   */
  toShopCoupon: function (e) {
    wx.navigateTo({
      url: '/pages/mycoupon/mycoupon',
    })
  },

  /**
   * 选择配送地址
   */
  chooeAddress: function () {
    let that = this
    wx.chooseAddress({
      success: (res) => {
        that.setData({
          regionInfo: res.provinceName + '-' + res.cityName + '-' + res.countyName,
          detailInfo: res.detailInfo,
          pickerName: res.userName,
          pickerMobile: res.telNumber
        })
        wx.setStorageSync("regionInfo", that.data.regionInfo)
        wx.setStorageSync("detailInfo", that.data.detailInfo)
        wx.setStorageSync("pickerName", that.data.pickerName)
        wx.setStorageSync("pickerMobile", that.data.pickerMobile)
      }
    })
  },

  /**
   * 跳转支付完成
   */
  toBack() {
    this.clearShopCart()
    //跳转订单
    wx.redirectTo({
      url: '../paySuccess/paySuccess?payAmount=' + this.data.payAmount
    })
  },

  /**
   * 点击查看更多商品
   */
  develop() {
    this.setData({
      lookmore: !this.data.lookmore
    })
  },
  /**
   * 切换支付方式
   */
  changePayment(e) {
    this.setData({
      payType: e.currentTarget.dataset.isradio
    })
  },
  /**
   * 清空父页面购物车数据
   */
  clearShopCart: function () {
    shopcartUtil.clearShopCart(this.data.cartTypeName)
    shopcartUtil.caulTotal(this.data.cartTypeName)
  },

  /**
   * 去余额支付
   * @param {*} e 
   */
  toMyBalance(e){
    this.setData({isChangeBalance:true})
    wx.navigateTo({
      url: '../myBalance/myBalance',
    })
  },
  toChooseCoupon:function(){
    wx.navigateTo({
      url: '../mycoupon/mycoupon',
    })
  }
})