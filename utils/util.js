const app = getApp()
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/*-----------------------------HTTP工具-Start------------------------------*/
/**
 * POST请求工具
 * @param url 请求路径
 * @param param 请求参数{}
 * @param callback 回调函数
 * @constructor
 */
const HttpClient = {
  Method:{
    get:(url, param, callback) => GET(url, param, callback),
    post:(url, param, callback) => POST(url, param, callback)
  }
}

const GET = (url, param, callback) => {
  wx.request({
    url: url,
    dataType:'json',//返回JSON
    method:'GET',
    header: {'content-type': 'application/json'},// 默认值
    data: param,
    success: callback
  })
}

const POST = (url, param, callback) => {
  wx.request({
    url: url,
    dataType:'json',//返回JSON
    method:'POST',
    header: {'content-type': 'application/json'},// 默认值
    data: param,
    success: callback
  })
}
/*-----------------------------HTTP工具-END------------------------------*/
/*-----------------------------对象转get请求参数-Start------------------------------*/
const DoGetParam = (paramObj) => {
  let _result = [];
  for (let key in paramObj) {
    let value = paramObj[key];
    if (value.constructor == Array) {
      value.forEach(function(_value) {
        _result.push(key + "=" + _value);
      });
    } else {
      _result.push(key + '=' + value);
    }
  }
  return '?' + _result.join('&');

}
/*-----------------------------对象转get请求参数-END------------------------------*/
/*-----------------------------消息工具-Start------------------------------*/
/**
 * 消息工具
 * @param message 显示信息
 * @param second 延迟关闭 秒
 * @param icon 图标 success error loading none
 * @constructor
 */
const Message = {
  Loading: {//加载
    loadingDefault: () => {
      LoadingMessage('加载中...');
    },
    loadingMessage: (message, second) => LoadingMessage(message, second),
    close: () => wx.hideLoading(),
  },
  Alert:{//弹层
    alertSuccess : (message) => AlertSuccess(message),//最多显示7个汉字
    alertError : (message) => AlertError(message),//最多显示7个汉字
    alertDefault : (message) => AlertDefault(message),//最多可显示两行
    alertMessage : (message, icon, second) => AlertMessage(message, icon, second)
  }
}


const LoadingMessage = (message, second) => {
  wx.showLoading({
    title: message,
    mask: true
  });
}

/**
 * 提示成功
 */
const AlertSuccess = (message) => {
  AlertMessage(message, 'success', 2);
}

const AlertError = (message) => {
  AlertMessage(message, 'error', 2);
}

const AlertDefault = (message) => {
  AlertMessage(message, 'none', 2);
}

/**
 * 弹层消息提示框
 * @param message 显示信息
 * @param second 延迟关闭 秒
 * @constructor
 */
const AlertMessage = (message, icon, second) => {
  if(!second) {
    second = 2;
  }
  wx.showToast({
    title: message,
    icon: icon,
    mask: true,
    duration: second * 1000
  })
}

/*-----------------------------消息工具-END------------------------------*/
/*-----------------------------跳转页面工具-Start------------------------------*/
/**
 * 页面跳转工具
 * @param url 本地页面路径
 * @param param 携带对象参数
 */
const PageGo = {
  jump:(url, param) => {
    wx.navigateTo({
      url: url + DoGetParam(param),
    })
  },
  cacheSearch:(title) => {
    let newHistories = new Set();
    newHistories.add(title);
    let histories = wx.getStorageSync('histories') || [];
    histories.forEach((history) => {
      if(!newHistories.has(history) && newHistories.size < 5) {
        newHistories.add(history);
      }
    });
    histories = Array.from(newHistories);
    wx.setStorageSync('histories', histories);
  },
  getSearchCache:() => {
    return wx.getStorageSync('histories') || [];
  },
  switchTo:(url) => {
    wx.switchTab({
      url: url,
      complete() {
        wx.hideLoading();
      },
      fail(res) {
        console.info(res);
      }
    })
  },
}
/*-----------------------------跳转页面工具-END------------------------------*/

/**
 * @description 除法函数，用来得到精确的除法结果, 该函数已扩展到Math对象中
 * @param {Float/Int} arg1  数值1
 * @param {Float/Int} arg2  数值2
 * @returns {float/Int}
 **/
const div = (arg1, arg2) => {
  var t1 = 0, t2 = 0, r1, r2;
  try {
    t1 = arg1.toString().split(".")[1].length;
  }
  catch (e) {
  }
  try {
    t2 = arg2.toString().split(".")[1].length;
  }
  catch (e) {
  }
  r1 = Number(arg1.toString().replace(".", ""));
  r2 = Number(arg2.toString().replace(".", ""));
  return (r1 / r2) * Math.pow(10, t2 - t1);
}

module.exports = {
  formatTime,
  formatNumber,
  HttpClient,
  Message,
  PageGo,
  div:div,
}
