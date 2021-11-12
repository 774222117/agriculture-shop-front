// app.js
const HttpClient = require('./utils/util.js').HttpClient;
const userKey = require('./utils/config.js').CacheKey.userInfo;
const GetPeopleInfoByIdUrl = require('./utils/config.js').HttpConfig.GetPeopleInfoByIdUrl;
const div = require('./utils/util.js').div;
App({
  onLaunch(opt) {
    //OTO购物车
    this.globalData.cartList.push({
      name : "OTO",
      carts : [],
      cartTotal : {}
    })
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    //获取缓存中用户信息
    this.globalData.userInfo = wx.getStorageSync(userKey)

    if (this.globalData.userInfo == "") {
      this.globalData.userInfo = null;
      this.data = opt;      
    } else {
      //获取用户信息
      if (!this.isRegister()) {
        this.getPeopleInfoById(this.globalData.userInfo.id)
      }
    }

  },

  data: {
    path: '',
    id: '',
  },

 /**
   * 获取用户信息
   * @param {用户ID} peopleId 
   */
  getPeopleInfoById(peopleId) {
    let that = this
    HttpClient.Method.get(GetPeopleInfoByIdUrl.InfoUrl, {peopleId:peopleId}, function (res) {
      if(res.data.flag) {
        if (!!res.data.data.phone) {
          res.data.data.phone = Math.round(div(res.data.data.phone, res.data.data.id));
        }
        that.setUserInfo(res.data.data)
      } else {
        Message.Alert.alertError(res.data.message)
      }
    })
  },

  /**
   * 是否注册会员
   */
  isRegister() {
    if (this.globalData.userInfo == "") {
      return false
    } else {
      return true
    }
  },

  setUserInfo: function (userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync(userKey, userInfo)
  },

  globalData: {
    userInfo: null,
    categoryId: -1,
    //购物车列表
    cartList:[],
  }
})
