const app = getApp()
//查询订单Url
const SearchOrderInfoUrl = require('../../utils/config.js').HttpConfig.OrderUrl.searchOrderInfoUrl
//申请退款
const ApplyRefundUrl = require('../../utils/config.js').HttpConfig.OrderUrl.ApplyRefundUrl
//支付订单
const AgainPayOrderUrl = require('../../utils/config.js').HttpConfig.OrderUrl.AgainPayOrderUrl
//支付失败
const PayFaildOrderUrl = require('../../utils/config.js').HttpConfig.OrderUrl.PayFaildOrderUrl
//退货原因
const FindRefundReasonUrl = require('../../utils/config.js').HttpConfig.OrderUrl.findRefundReasonUrl;
//快递信息
const LastExpressInfoUrl = require('../../utils/config.js').HttpConfig.GetExpressInfoUrl.LastExpressInfoUrl;
//获取我的余额
const PeopleBalanceUrl = require('../../utils/config.js').HttpConfig.MyCenter.MyBalanceUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isChangeBalance: false,
    orderId: 0,
    peopleId: 0,
    orderInfo: {},
    peopleBalance: 0,
    expressInfo: {

    },
    //退款原因
    reason: '',
    //弹框显示
    modelIsShow: true,
    //配送方式：0 全部 1 门店自提 2 配送到家 wyx 2020-03-16 append it
    deliveryWay: 1,
    resonList: [],
    payType: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId: options.orderId,
      peopleId: app.globalData.userInfo.id
    })
    this.searchOrderInfo()
    this.findRefundReason()
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
    if (this.data.isChangeBalance) {
      //获取余额
      this.getPeopleBalance()
      this.setData({
        isChangeBalance: false
      })
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

  /****************************************** 自定义方法 ************************************** */
  findRefundReason: function () {
    let that = this
    wx.request({
      url: FindRefundReasonUrl,
      fail: function (err) {
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取退货原因出错！',
            icon: 'none'
          });
          return
        }
        let resons = res.data.data
        that.setData({
          resonList: resons
        })
      }
    })
  },

  searchOrderInfo: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: SearchOrderInfoUrl,
      data: {
        peopleId: this.data.peopleId,
        orderId: this.data.orderId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '查询订单出错！',
            icon: 'none'
          });
          return
        }
        if (res.data.data) {
          let status = res.data.data.status
          res.data.data.showRefund = false;
          res.data.data.showPay = false;
          res.data.data.showState = false;
          if (status > 0 && status < 4 && res.data.data.afterStatus == 'NO') {
            res.data.data.showRefund = true;
            res.data.data.showState = true;
          }
          res.data.data.showPay = status == 0;
        }
        that.setData({
          orderInfo: res.data.data
        })
        that.setData({
          payType: res.data.payType
        })

        //未支付订单查询余额
        if (that.data.orderInfo.status == 0) {
          that.getPeopleBalance(that.data.orderInfo.peopleId)
        }
        console.info(that.data.orderInfo)
      }
    })
  },

  /**
   * 获取我的余额
   */
  getPeopleBalance: function (peopleId) {
    let that = this
    wx.request({
      url: PeopleBalanceUrl,
      method: 'get',
      data: {
        peopleId: peopleId
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
   * 快递信息
   */
  getExpressInfo(e) {
    let ordersn = e.currentTarget.dataset.ordersn;
    let expressNumber = e.currentTarget.dataset.expressnumber;
    wx.navigateTo({
      url: '../expressinfo/expressinfo?ordersn=' + ordersn + '&expressNo=' + expressNumber
    })
  },

  /**
   * 付款
   * 传入order集合
   */
  payOrder: function () {
    if (this.data.isPay) return
    this.setData({
      isPay: true
    })
    //提交数据
    wx.showLoading({
      title: '加载中，请稍后...',
      mask: true
    })

    let that = this
    wx.request({
      url: AgainPayOrderUrl,
      data: {
        orderId: this.data.orderInfo.id,
        peopleId: this.data.orderInfo.peopleId,
        payType: this.data.payType
      },
      fail: function (err) {
        this.setData({
          isPay: false
        })
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        that.setData({
          isPay: false
        })
        //判断是否有错
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '支付订单单异常！',
            icon: 'none'
          });
          return
        }
        //发起支付
        if (that.data.payType == 2) {
          that.callWxPay(res.data.data)
        } else {
          wx.redirectTo({
            url: '../order/order?tab=2',
          })
        }
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
            peopleId: that.data.orderInfo.peopleId,
            orderId: that.data.orderInfo.id,
          },
          method: 'GET',
          success: function (res) {
            // wx.redirectTo({
            //   url: '../order/order?tab=2',
            // })
          },
          fail: function (res) {},
          complete: function (res) {},
        })
      },
      //支付成功
      success: function (res) {

      }
    })
  },

  /**
   * 申请退款
   */
  applyRefund: function () {
    wx.showLoading({
      title: '申请退款中...',
      mask: true
    })

    let that = this
    wx.request({
      url: ApplyRefundUrl,
      data: {
        peopleId: this.data.orderInfo.peopleId,
        orderId: this.data.orderInfo.id,
        reason: this.data.reason
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '查询订单出错！',
            icon: 'none'
          });
          return
        }
        wx.showToast({
          title: '申请成功，请耐心等待！',
          icon: 'none'
        });
        wx.redirectTo({             
          url: '../order/order?tab=3',
        })   
        //TODO：重新获取一下订单
      }
    })
  },

  showResoneModal: function () {
    this.setData({
      modalName: "resoneModal"
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  confirmRefund: function (e) {
    this.hideModal()
    let reason = e.currentTarget.dataset.value
    this.setData({
      reason: reason
    })
    console.info(e)
    this.applyRefund()
  },

  refundOrder: function () {
    let that = this
    //完成状态的订单，需要申请售后
    if (this.data.orderInfo.status == 3) {
      //门店商品订单 售后 直接调 取消订单
      if (this.data.orderInfo.orderType == 1) {
        wx.showModal({
          title: '退款',
          content: '点击“确定”选择退款原因',
          confirmText: '确定',
          cancelText: '取消',
          success: function (res) {
            if (res.confirm) {
              //that.applyRefund()
              that.showResoneModal()
            }
          }
        })
      } else {
        if (this.data.orderInfo.afterStatus == 'NO') {
          wx.navigateTo({
            url: '../applyafterorder/applyafterorder?orderId=' + this.data.orderInfo.id + '&peopleId=' + this.data.orderInfo.peopleId
          })
        } else {
          wx.showToast({
            title: '订单已经申请退款',
            icon: 'none'
          })
        }
      }
    } else {
      wx.showModal({
        title: '退款',
        content: '点击“确定”选择退款原因',
        confirmText: '确定',
        cancelText: '取消',
        success: function (res) {
          if (res.confirm) {
            //that.applyRefund()
            that.showResoneModal()
          }
        }
      })
    }
  },

  /*************************************************************************************** */
  /**
   * 切换支付方式
   */
  changePayment(e) {
    this.setData({
      payType: e.currentTarget.dataset.isradio
    })
  },

  /**
   * 支付
   * @param {*} e 
   */
  toPay(e) {
    this.payOrder()
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
   * 退款 
   * @param {*} e 
   */
  toRefund(e) {
    if (this.data.orderInfo.status > 1) {
      wx.redirectTo({
        url: '../applyafterorder/applyafterorder?orderId=' + this.data.orderInfo.id + '&peopleId=' + this.data.orderInfo.peopleId,
      })
    } else {
      this.showResoneModal()
    }
  },
  /**
   * 去余额支付
   * @param {*} e 
   */
  toMyBalance(e) {
    this.setData({
      isChangeBalance: true
    })
    wx.navigateTo({
      url: '../myBalance/myBalance',
    })
  },

  showResoneModal: function () {
    this.setData({
      modalName: "resoneModal"
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  confirmRefund: function (e) {
    this.hideModal()
    let reason = e.currentTarget.dataset.value
    this.setData({
      reason: reason
    })
    console.info(e)
    this.applyRefund()
  },
  goExpressDetail: function () {
    let ordersn = this.data.orderInfo.ordersn
    let expressNo = this.data.orderInfo.expressNumber
    wx.navigateTo({
      url: '../expressinfo/expressinfo?ordersn=' + ordersn + '&expressNo=' + expressNo,
    })
  }
})