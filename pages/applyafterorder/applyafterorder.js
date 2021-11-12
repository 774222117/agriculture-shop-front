// pages/applyafterorder/applyafterorder.js
const app = getApp()
//查询订单Url
const searchOrderInfoUrl = require('../../utils/config.js').HttpConfig.OrderUrl.searchOrderInfoUrl
//提交售后订单
const submitAfterOrderUrl = require('../../utils/config.js').HttpConfig.OrderUrl.submitAfterOrderUrl
//上传图片
const uploadImageUrl = require('../../utils/config.js').HttpConfig.OrderUrl.uploadImageUrl
//退货原因
const FindRefundReasonUrl = require('../../utils/config.js').HttpConfig.OrderUrl.findRefundReasonUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId : 0,
    orderInfo : {},
    goodsItems : {},
    //退款金额
    moneyReturned : 0,
    //售后方式
    applyTypeList : [
      {name : '仅退款',value:'REFUND'},
      {name : '有实物退货',value:'RETURN_GOODS'}
    ],
    applyType : 'RETURN_GOODS',
    //问题图片
    questionPicList : [],
    //退款原因
    reason : '*',
    //问题描述
    questionDescription : "",
    /******************************** */
    dispatchTitle: '未选择',
    //是否隐藏选择配送方式
    hideSelectDispatchType: false,
    updateImg:["","","",""],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ 
      peopleId: options.peopleId,
      orderId: options.orderId
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

  caulTotal(goods){
    let goodsItems = this.data.goodsItems
    let moneyReturned = 0
    let totalReturned = 0    
    goodsItems.forEach((item)=>{
      if(item.goodsId == goods.goodsId){
        item.quantity = goods.quantity
        item.totalRefund = goods.totalRefund
      }
      moneyReturned += item.totalRefund
      totalReturned += item.quantity
    })
    this.setData({
      goodsItems : goodsItems,
      moneyReturned : parseFloat(moneyReturned.toFixed(2)),
      totalReturned : totalReturned
    })
  },

  /**
   * 添加退货
   * @param {*} goods 
   */
  addRefund(e){
    let goods = e.currentTarget.dataset.item
    //订单购买数量
    let total = goods.total
    //退退货数量
    let quantity = goods.quantity + 1

    if(quantity > total){
      return
    }
    let totalRefund = goods.executePrice * quantity
    if(quantity == total){
      totalRefund = goods.realPrice - goods.discountPrice
    }
    totalRefund = parseFloat(totalRefund.toFixed(2));
    goods.quantity = quantity
    goods.totalRefund = totalRefund
    this.caulTotal(goods)    
  },

  /**
   * 减少退货
   * @param {*} goods 
   */
  delRefund(e){
    let goods = e.currentTarget.dataset.item
    
    //退退货数量
    let quantity = goods.quantity - 1
    if(quantity < 0) {
      return
    }

    let totalRefund = goods.executePrice * quantity
    totalRefund = parseFloat(totalRefund.toFixed(2));
    goods.quantity = quantity
    goods.totalRefund = totalRefund
    this.caulTotal(goods)    
  },

  /**
   * 生成退款订单
   */
  createOrderInfo(){
    if(this.data.moneyReturned == 0){
      wx.showToast({
        title: '退款金额不能为零！',
        icon: 'none'
      });
      return null
    }

    if(this.data.applyType == '' ){
      wx.showToast({
        title: '请选择售后类型！',
        icon: 'none'
      });
      return null
    }

    if(this.data.reason == ''  || this.data.reason == '*'){
      wx.showToast({
        title: '请选择退款原因!',
        icon: 'none'
      });
      return null
    }
    
    if(this.data.questionDescription == '' ){
      wx.showToast({
        title: '请填写问题描述!',
        icon: 'none'
      });
      return null
    }

    if(this.data.questionPicList.length == 0){
      wx.showToast({
        title: '请上传问题图片!',
        icon: 'none'
      });
      return null
    }

    let questionPic = ''
    for(let i = 0; i < this.data.questionPicList.length; i ++){
      if(questionPic != '') questionPic += ','
      questionPic += this.data.questionPicList[i]
    }

    let orderInfo = {
      outerOrderId : this.data.orderId,
      outerOrdersn : this.data.orderInfo.ordersn,
      peopleId : this.data.orderInfo.peopleId,
      applyType : this.data.applyType,
      applyReason : this.data.reason,
      questionDescription : this.data.questionDescription,
      questionPic : questionPic,
      moneyReturned : this.data.moneyReturned
    }

    let afterSaleGoodsList = []
    this.data.goodsItems.forEach((item)=>{
      if(item.quantity > 0){
        let afterSaleGoods = {}
        afterSaleGoods.goodsId = item.goodsId
        afterSaleGoods.title = item.title
        afterSaleGoods.goodssn = item.goodssn
        afterSaleGoods.productsn = item.productsn
        afterSaleGoods.quantity = item.quantity
        afterSaleGoods.executePrice = item.executePrice
        afterSaleGoods.price = item.price
        afterSaleGoods.totalRefund = item.totalRefund
        afterSaleGoodsList.push(afterSaleGoods)
      }
    })
    if(afterSaleGoodsList.length == 0){
      wx.showToast({
        title: '请选择需要退货的商品!',
        icon: 'none'
      });
      return null
    }

    orderInfo.orderAfterSaleGoodsList = afterSaleGoodsList
    return orderInfo
  },

  //********************************************************************************** */

  findRefundReason : function(){
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
        that.setData({resonList:resons})        
      }
    })
  },

  /**
   * 查询订单
   */
  searchOrderInfo : function(){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: searchOrderInfoUrl,
      data : {
        peopleId: this.data.peopleId,
        orderId : this.data.orderId
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
        
        /**
         * 循环商品
         */
        res.data.data.goodsItems.forEach((item)=>{
          //设置退货数量为零
          item.quantity = 0
          item.totalRefund = 0
        });
        that.setData({ 
          orderInfo : res.data.data,
          goodsItems : res.data.data.goodsItems
        })
        console.info(that.data.orderInfo)       
        console.info(that.data.goodsItems)
      }
    })
  },

  /**
   * 提交订单
   */
  submitAfterOrder : function(){
    if(this.data.isSubmit) return
    this.setData({isSubmit : true})
    let orderInfo = this.createOrderInfo();
    if (orderInfo == null){
      this.setData({isSubmit : false})
      return
    }
    console.log(JSON.stringify(orderInfo))

     //提交数据
     wx.showLoading({
      title: '正在提交订单，请稍后...',
      mask: true
    })

    let that = this
    wx.request({
      url: submitAfterOrderUrl,
      method: 'post',
      data: orderInfo,
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '售后订单提交出错,网络异常！',
          icon: 'none'
        });
      },
      success : function(res){
        wx.hideLoading()
        that.setData({ isSubmit: false })
        //判断是否有错
        if(!res.data.flag){
          wx.showToast({
            title: res.data.message || '售后订单异常！',
            icon: 'none'
          });
          return
        }
        
       
        wx.showModal({
          title: '提示',
          content :'售后订单已提交，售后工作人员稍后与您联系！',    
          showCancel : false,      
          success : function(){
            //跳转到我的页面
            wx.switchTab({
              url : '../index/index'
            })
          }
        })
        
      },
      fail:function(){
        that.setData({ isSubmit: false })
      }
    })

  },


    /************************************************** */
  /**
   * 选择退货类型
   * @param {*} e 
   */
  changeApplyType: function (e) {
    this.setData({
      applyType: e.currentTarget.dataset.applytype
    })
  },
  /**
   * 双向绑定退款原因输入
   */
  reasonRefundInput(e){
    this.setData({
      questionDescription:e.detail.value
    })
  },
  /**
   * 底部提交申请
   */
  submitBtn(){
    if(this.data.moneyReturned == 0){
      wx.showToast({
        title: '退款金额不能为零！',
        icon: 'none'
      });
      return
    }

    if(this.data.applyType == ''){
      wx.showToast({
        title: '请选择售后类型！',
        icon: 'none'
      });
      return
    }

    if(this.data.reason == ''){
      wx.showToast({
        title: '请填写退款原因!',
        icon: 'none'
      });
      return
    }

    if(this.data.questionPicList.length == 0){
      wx.showToast({
        title: '请上传问题图片!',
        icon: 'none'
      });
      return
    }
    let that = this
    wx.showModal({
      title: '提示',
      content :'确认退款吗，提交后客户人员与您联系',
      showCancel : true,
      cancelColor: 'cancelColor',
      success : function(){
        that.submitAfterOrder()
      }
    })
  },
  /**拍照或者选择图片上传 */
  
  uploadPhoto(e) {
    var that = this;    
    let index = e.currentTarget.dataset.index
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var tempFilePath = tempFilePaths[0]
        that.uploads(index, tempFilePath)
        // var tempFilePaths = res.tempFilePaths;
        // console.log('本地图片的路径:', tempFilePaths[0])
        // //设置进updateImg
        // tempFilePaths.forEach(function(val,s){
        //   if (val != ''){
        //     for (var i = 0; i < that.data.updateImg.length;i++){
        //       if (that.data.updateImg[i] == '') {
        //         that.data.updateImg[i] = tempFilePaths[s]
        //         return;
        //       }
        //     }
        //   }
        // })

        // that.setData({
        //   updateImg: that.data.updateImg
        // })
        // console.log(that.data.updateImg)
        //that.uploads(that, tempFilePaths)
      }
    })
  },

  // 上传图片
  uploads(index, files) {
    let that = this
    let path = 'afterorder/' + this.data.orderId
    wx.showToast({
      icon: "loading",
      title: "正在上传"
    })
    
    wx.uploadFile({
      url: uploadImageUrl,
      filePath: files,
      name: 'file',
      header: { "Content-Type": "multipart/form-data" },
      formData: {
        //和服务器约定的token, 一般也可以放在header中
        'path': path
      },
      success: function (res) {
        //上传成功返回数据
        
        if (res.statusCode != 200) {
          wx.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          })
          return;
        }
        if(res.data == '404'){
          wx.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          })
          return;
        }
        let image = res.data
        that.data.questionPicList.push(JSON.parse(image))
        that.setData({questionPicList:that.data.questionPicList})
      },
      fail: function (e) {
        console.log(e);
        wx.showModal({
          title: '提示',
          content: '上传失败',
          showCancel: false
        })
      },
      complete: function () {
        wx.hideToast(); //隐藏Toast
      }
    })
  },

  clearImage(e){
    let index = e.currentTarget.dataset.index
    let questionPicList = []
    for (var i = 0; i < this.data.questionPicList.length;i++){
      if(index!=i){
        questionPicList.push[that.data.questionPicList[i]]
      }
    }
    this.setData({questionPicList:questionPicList})
  },

  showResoneModal : function(){
    this.setData({modalName : "resoneModal"})
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  confirmRefund : function(e){
    this.hideModal()
    let reason = e.currentTarget.dataset.value
    this.setData({reason : reason})   
  },
})