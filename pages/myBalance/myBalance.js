// pages/myBalance/myBalance.js
// pages/myIndex/myIndex.js
const app = getApp();
const Message = require('../../utils/util.js').Message;
const HttpClient = require('../../utils/util.js').HttpClient;
const MyCenter = require('../../utils/config.js').HttpConfig.MyCenter;
const OrderUrl = require('../../utils/config.js').HttpConfig.OrderUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    change:false,
    auto:'',
    changeTitle:'',
    changeValue:'',
    peopleInfo:{//用户信息
      nickName:'',//昵称
      icon:'',//头像
      enterpriseName:'',//企业
      balanceData:'',//余额
    },
    bills:[],
    //上一个页面
    prevPage : null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2]
    if(prevPage == null) pages[pages.length - 1]
    this.setData({prevPage:prevPage})

    Message.Loading.loadingDefault();
    const userInfo = app.globalData.userInfo
    let that = this;
    HttpClient.Method.get(MyCenter.InfoUrl,{peopleId:userInfo.id}, function (res) {
      Message.Loading.close();
      if(res.data.flag) {
        that.setData({
          peopleInfo:res.data.data
        })
      }
    });
    HttpClient.Method.get(MyCenter.BalanceUrl,{peopleId:userInfo.id}, function (res) {
      Message.Loading.close();
      if(res.data.total > 0) {
        that.setData({
          bills:res.data.rows
        })
      }
    });
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
   * 点击充值
   */
  onCharge:function (e) {
    const title = e.currentTarget.dataset.title;
    this.setData({
      changeTitle:title,
      change:true,
    })
  },
  /**
   * 关闭充值
   * @param e
   */
  onClose:function (e) {
    this.setData({
      change:false,
    })
  },
  /**
   * 点击金额
   * @param e
   */
  chargeThis:function (e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      changeValue:value,
    })
  },

  /**
   * 点击金额
   * @param e
   */
  chargeAuto:function (e) {
    this.setData({
        auto:'isRecharge',
    })
  },
  /**
   * 输入金额
   * @param e
   */
  inputAuto:function (e) {
    const value = e.detail.value;
    this.setData({
      changeValue:value,
    })
  },
  /**
   * 立即充值
   * @param e
   */
  doCharge:function (e) {
    Message.Loading.loadingDefault();
    const userInfo = app.globalData.userInfo;
    let that = this;
    HttpClient.Method.get(MyCenter.ChargeUrl,{peopleId:userInfo.id, money:this.data.changeValue}, function (res) {
      Message.Loading.close();
      if(res.data.flag) {
        that.callWxPay(res.data.data)
      } else {
        Message.Alert.alertSuccess(res.data.message);
      }
    });
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
          url: OrderUrl.PayFaildOrderUrl,
          data: {
            orderId: weChatInfo.orderId,
            peopleId: this.data.peopleId
          },
          method: 'GET',
          success: function (res) {
            //如果是下单页，和商品详情页，自动返回到上一个页面
            if(that.data.prevPage.route=="pages/orderInfo/orderInfo" || that.data.prevPage.route=="pages/orderpay/orderpay"){
              wx.navigateBack()
            }
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
})