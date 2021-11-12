const app = getApp()
//查询订单Url
const PeopleOrderInfoUrl = require('../../utils/config.js').HttpConfig.OrderUrl.PeopleOrderInfoUrl

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderLines:0,
    pn : 0,
    //记录状态切换
    oldStatus : -1,
    //订单列表
    orderList : [],
    //订单总条数
    orderTotal : 0,
    //当前列表
    currentTab : 2,
    bottomIsShow:false,
    //订单送券Id
    couponSetId : 0,
    //订单送券详细信息
    couponSetInfo:{},
    //是否显示浮窗
    popModelIsShow : false, 
    tabsList: [
      {
        title: '所有订单'
      },
      {
        title: '待支付'
      },
      {
        title: '待提货'
      },
      {
        title: '待退款'
      }
    ],
    modalName: null,
    curOrderInfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.tab){
      this.setData({ currentTab: options.tab})
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
    this.setData({     
      pn: 0,
      //订单列表
      orderList: [],
      //订单总条数
      orderTotal: 0,
    })   
    this.getPeopleOrderInfo(this.data.currentTab)
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

  changeTab : function(e){
    this.setData({
      currentTab: e.currentTarget.dataset.index,
      pn: 0,
      //订单列表
      orderList: [],
      //订单总条数
      orderTotal: 0,
    })
    this.getPeopleOrderInfo(this.data.currentTab)
  },

  /**
   * 跳转订单详情事件
   * pages/shoporderinfo/shoporderinfo
   * shopId=1720&orderId=12003
   */
  toOrderInfo : function(e){
    console.log(e)
    let orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../orderInfo/orderInfo?orderId=' + orderId
    })
  },

   /**
   * 跳转物流信息事件
   * pages/shoporderinfo/shoporderinfo
   * shopId=1720&orderId=12003
   */
  chooseExpressGoods : function(e){
    let ordersn = e.currentTarget.dataset.ordersn;
    let item = e.currentTarget.dataset.item;
    let expressnumber = e.currentTarget.dataset.item.goodsList[0].expressNumber;
    if(!expressnumber){
      wx.showToast({
        title: '暂无快递信息',
        icon: 'none'
      });    
    }else{
      if(item.goodsList.length==1){
        this.hideModal()
        wx.navigateTo({
          url: '../expressinfo/expressinfo?ordersn=' + ordersn + '&expressNo=' + expressnumber
        })
      }else{
        this.setData({
          curOrderInfo:item,
          modalName:'chooseGoodsModal'
        })
      }
    }
  },
  toDeliveryInfo:function(e){
    let ordersn = e.currentTarget.dataset.ordersn;
    let expressnumber = e.currentTarget.dataset.expressnumber;
    this.hideModal()
    wx.navigateTo({
      url: '../expressinfo/expressinfo?ordersn=' + ordersn + '&expressNo=' + expressnumber
    })
  },
  hideModal(){
    this.setData({
      modalName:null
    })
  },

  /******************************* 自定义方法 ************************************** */
  /**
   * 获取订单
   *   orderStatus : 0 所有 1 待支付 2 待取货 3 待退款
   *   返回status说明：
   *      0 待支付，显示支付按钮
   *      1 待取货
   *      2 已完成
   *      4 待退款
   */
  getPeopleOrderInfo : function(orderStatus){
    if (app.globalData.userInfo == null) return
    //切换过状态,页码设为零
    if (this.data.oldStatus != orderStatus){
      this.data.orderList = []
      this.setData({
        pn:0,
        orderTotal : 0
      })
    }
    let data = {
      pn : this.data.pn,
      peopleId: app.globalData.userInfo.id
    }
    orderStatus = parseInt(orderStatus)
    switch (orderStatus){
      //待支付
      case 1 :
        data.status = 0
      break
      //待取货
      case 2:
        data.status = 1
      break
      //待退款
      case 3:
        data.refundState = 0
      break
    }

    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    console.log('orderStatus', orderStatus)
    console.log('data',data)
    wx.request({
      url: PeopleOrderInfoUrl,
      data : data,
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      
      success: function (res) {
        wx.hideLoading();
        if (!res.data.rows) {
          wx.showToast({
            title: res.data.message || '查询订单出错！',
            icon: 'none'
          });          
          return
        }
        if (res.data.rows.lenght == 0) {
          that.setData({ bottomIsShow: true })
        } else {
          that.setData({ bottomIsShow: false })
          let orderList = that.data.orderList.concat(res.data.rows)
          //页面加+1
          that.setData({
            bottomIsShow: false,
            oldStatus: orderStatus,
            //订单数据
            orderList: orderList,
            //订单条数
            orderTotal : res.data.total
          })
        }
        console.info(that.data.orderList)                
      }
    })
  }
})