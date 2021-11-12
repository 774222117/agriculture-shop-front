//获取应用实例
const app = getApp()
const HttpClient = require('../../utils/util.js').HttpClient;
const LoginUrl = require('../../utils/config.js').HttpConfig.LoginUrl;
const div = require('../../utils/util.js').div;
Page({
  data: {
    //以下注册所需要的信息
    openId: "",
    sessionKey: "",
    userData: {},
    encryptedData: "",
    iv: "" 
  },
  onLoad: function () {
    // 判断用户信息存在与否
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
  },
  /**
   * 后台登录
   */
  loginBySystem: function () {
    wx.showLoading({//开始加载loding
      title: '加载中',
      mask: true
    })
    var that = this
    wx.login({
      success: res => {
        HttpClient.Method.get(LoginUrl.InfoUrl, {code:res.code}, function (res) {
            if(!!res.data.data.phone) {
              res.data.data.phone = Math.round(div(res.data.data.phone, res.data.data.id));
            }
            if (res.data.code == 1) {
              //记录openID，和 sessionkey
              that.setData({
                openId: res.data.data.openId,
                sessionKey: res.data.data.sessionKey,
              })
              console.info("openId:" + that.data.openId)
              console.info("sessionkey:" + that.data.sessionKey)
              let openId = that.data.openId;
              let sessionKey = that.data.sessionKey;
              let userInfo = that.data.userData;
              let nickName = userInfo.nickName;
              let avatarUrl = userInfo.avatarUrl;

              wx.redirectTo({
                url: '../bindingphone/bindingphone?openId=' + openId + "&sessionKey=" + sessionKey + "&nickName=" + nickName + "&avatarUrl=" + avatarUrl,
                complete() {
                  wx.hideLoading()//关闭loding
                }
              })  
          
            }//获取到了信息
            else if (res.data.code == 2) {
              that.setData({
                userInfo: res.data.data,
                hasUserInfo: true,
              });
              app.setUserInfo(that.data.userInfo)              
              that.refuseJurisdiction();
            }
            //服务器错误
            else if (res.data.code == 0) {
              console.info(res.data.message)
            }
        })
        wx.hideLoading()//关闭loding
      }
    })
  },

  /**
   * 获取用户信息
   */
  getUserProfile: function (e) {
    var that = this;
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        that.loginBySystem()
        that.setData({
          userData: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  // //拼接参数方法
  // redirectUrlFun:function(){
  //   var redirectUrl = '/' + app.data.path;
  //   var parameter = '';
  //   if (app.data.query != '') {
  //     for (var key in app.data.query) {
  //       if (parameter != "") parameter += "&"
  //       parameter += key + "=" + app.data.query[key];
  //     }
  //     if (parameter != "")
  //       redirectUrl += "?" + parameter;
  //   }
  //   return redirectUrl
  // },

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
