// pages/expressinfo/expressinfo.js
const app = getApp()
const SendCodeUrl = require('../../utils/config.js').HttpConfig.SendCodeUrl;
const GetPhoneUrl = require('../../utils/config.js').HttpConfig.GetPhoneUrl;
const HttpClient = require('../../utils/util.js').HttpClient;
const RegisterUrl = require('../../utils/config.js').HttpConfig.RegisterUrl;
const Message = require('../../utils/util.js').Message;
const div = require('../../utils/util.js').div;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: "",
    code: "",
     //以下注册所需要的信息
     openId: "",
     sessionKey: "",
     userData: {},
     encryptedData: "",
     iv: "" ,
     phoneToWeChat:"",
     sendCodeText:'获取验证码',
     sending:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      openId:options.openId,
      sessionKey:options.sessionKey,
      nickName:options.nickName,
      avatarUrl:options.avatarUrl
    })
  },

  getPhone:function(e){
    this.setData({
      phone:e.detail.value
    })
  },

  getCode:function(e){
    this.setData({
      code:e.detail.value
    })
  },

  /**
   * 获取手机号
   */
  getPhoneToWeChat(e) {
    let that = this;
    let sessionKey = that.data.sessionKey;
    let encryptedData = e.detail.encryptedData;
    let iv = e.detail.iv;
    HttpClient.Method.get(GetPhoneUrl.InfoUrl, {encryptedData:encryptedData,sessionKey:sessionKey,iv:iv}, function (res) {
      if(res.data.flag) {
        that.setData({
          phone: res.data.data
        })
      } else {
        Message.Alert.alertError(res.data.message)
      }
    })
  },

  /**
   * 获取验证码
   */
  getSendCode() {
    let that = this;
    let phone = that.data.phone;
    let time = 180
    if(phone == '' || phone == null || phone == undefined){
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '发送中...',
    })
    HttpClient.Method.get(SendCodeUrl.InfoUrl, {phone:phone}, function (res) {
      if(res.data.flag) {
        wx.hideLoading();
        wx.showToast({
          title: '发送成功！',
          icon: 'none'
        });
        let timer = setInterval(function () {
          time--
          if (time <= 0) {
            that.setData({
              sending: false,
              sendCodeText: '获取验证码'
            })
            clearInterval(timer)
            return
          }
          let text = '重新发送(' + time + ')'
          that.setData({
            sending: true,
            sendCodeText: text
          })
        }, 1000)
      } else {
        Message.Alert.alertError(res.data.message)
      }
    })
  },

  /**
   * 获取用户信息
   */
  getPhoneNumber: function (e) {
    var that = this;    
    that.bindComplete()
  },
  
  bindComplete:function(){
    var that = this
    HttpClient.Method.post(RegisterUrl.InfoUrl, 
      {
        nickName: this.data.nickName,
        avatarUrl: this.data.avatarUrl,
        openId: this.data.openId,
        sessionKey: this.data.sessionKey,       
        phone:this.data.phone,
        verificationCode:this.data.code
      }, 
      function (res) {
        if (res.data.flag) {
          if(!!res.data.data.phone) {
            res.data.data.phone = Math.round(div(res.data.data.phone, res.data.data.id));
          }
          that.setData({
            userInfo: res.data.data,
            hasUserInfo: true
          })
          app.setUserInfo(that.data.userInfo)
          console.info(res);
          that.refuseJurisdiction()
          // let redirectUrlStr = that.redirectUrlFun();
          // wx.redirectTo({
          //   url: redirectUrlStr,
          //   success: function () {
          //     console.info("success")
          //   },
          //   fail: function () {
          //     wx.switchTab({
          //       url: redirectUrlStr,
          //     })
          //   }
          // })
        } else {
          wx.showToast({
            title: "注册出错：" + res.data.message,
          })
          console.info("注册出错：" + res.data.message)
        }
      }
    )

  },
  
//拼接参数方法
redirectUrlFun:function(){
  var redirectUrl = '/' + app.data.path;
  var parameter = '';
  if (app.data.query != '') {
    for (var key in app.data.query) {
      if (parameter != "") parameter += "&"
      parameter += key + "=" + app.data.query[key];
    }
    if (parameter != "")
      redirectUrl += "?" + parameter;
  }
  return redirectUrl
},


refuseJurisdiction:function(){
  var pages = getCurrentPages();
  var options = {};
  var parameter = ""
  if (!!pages[pages.length - 2]){
    options = pages[pages.length - 2].options;
    for(var key in options){
      if(parameter != "") parameter + '&'
      parameter = key + '=' + options[key]        
    }
    pages = pages[pages.length - 2].route;
  }else{
    pages = '';
  }
      
  
  if (pages.indexOf('myIndex') > 0){
    wx.switchTab({
      url: '../../pages/index/index'
    })
  } else if (pages.indexOf('index') > 0){
    wx.switchTab({
      url: '../../pages/index/index'
    })
  } else if (pages == ''){
    wx.switchTab({
      url: '../../pages/index/index'
    })
  } else if (pages.indexOf('category')> 0) {
    wx.switchTab({
      url: '../../pages/category/category'
    })
  }
  else{
    let url = '../../' + pages
    if(parameter != ""){
      url += '?' + parameter
    }
    wx.redirectTo({        
      url: url
    })
   
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

  }
})