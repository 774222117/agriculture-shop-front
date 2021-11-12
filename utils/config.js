/**
 * 项目配置
 */
//正式服
const host = "https://agriculture-api.wyouquan.cn";
//测试服
//const host = "https://agriculture-api.sgsugou.com";
// const host = "http://localhost:8080";
// const host = "http://localhost:9090";

const HttpConfig = {
  IndexUrl:{
    InfoUrl:`${host}/app/index/findIndexData`,//首页模块数据
    FindMoreUrl:`${host}/app/index/findMoreData`,//首页更多超值精选商品
    EnterpriseRechargeUrl:`${host}/app/people/enterprise/recharge`,//用户发券/余额
  },
  CategoryUrl:{
    ListUrl:`${host}/app/goods/activity/categories`,//商品详情页
  },
  GoodsUrl:{
    InfoUrl:`${host}/app/goods/getOne`,//商品详情页
    ListUrl:`${host}/app/goods/findData`,//分类列表
  },
  OrderUrl:{
    MyOrderCouponsUrl : `${host}/app/mycoupon/getMyShopCoupons`,//订单可用优惠券
    SubmitShopOrderUrl : `${host}/app/order/submitShopOrder`,//订单可用优惠券
    //取消订单支付
    PayFaildOrderUrl: `${host}/app/order/payFaildOrder`,
    //重新支付
    PayOrderUrl: `${host}/app/order/payOrder`,
    //售后订单列表
    findAfterSaleListUrl : `${host}/app/order/findAfterSaleList`,
    //售后订单详情
    getPeopleOrderAfterSaleUrl : `${host}/app/order/getPeopleOrderAfterSale`,
    //根据订单号查询订单
    searchOrderInfoUrl: `${host}/app/order/searchOrderById`,
    //提交售后
    submitAfterOrderUrl : `${host}/app/order/submitAfterOrder`,
    //上传图片
    uploadImageUrl : `${host}/app/image/upload`,
    //退款原因
    findRefundReasonUrl :  `${host}/app/order/findRefundReason`,
    //查询订单列表
    PeopleOrderInfoUrl : `${host}/app/order/getPeopleOrderInfo`,
    //申请退款，取消订单
    ApplyRefundUrl : `${host}/app/order/applyRefund`,
    //订单详情页，重新支付订单
    AgainPayOrderUrl : `${host}/app/order/againPayOrder`,
    //
  },
  RegisterUrl:{
    InfoUrl:`${host}/app/people/register`,//注册
  },
  LoginUrl:{
    InfoUrl:`${host}/app/people/loginIn`,//登录
  },
  SendCodeUrl:{
    InfoUrl:`${host}/app/people/sendCode`,//获取验证码
  },
  GetPhoneUrl:{
    InfoUrl:`${host}/app/people/getPhoneToWeChat`,//获取手机号
  },
  GetPeopleInfoByIdUrl:{
    InfoUrl:`${host}/app/people/getOne`,//获取用户信息
  },
  GetExpressInfoUrl:{
    InfoUrl:`${host}/app/order/getOrderExpressInfo`,//获取物流详情
    LastExpressInfoUrl : `${host}/app/order/getLastOrderExpressInfo`
  },
  MyCenter:{
    InfoUrl:`${host}/app/people/getOne`,//我的信息余额 我的订单
    CountUrl:`${host}/app/center/count`,//订单优惠券数量/订单数量
    OrderUrl:`${host}/app/people/order`,//我的全部订单列表
    CouponUrl:`${host}/app/people/coupon`,//我的优惠券列表
    BalanceUrl:`${host}/app/center/balance/bill`,//我的余额充值历史
    MyBalanceUrl:`${host}/app/people/balance`,//我的余额充值历史/b
    ChargeUrl:`${host}/app/center/wechat/recharge`,//立即充值
    FindPeopleSaleActivityUrl:`${host}/app/center/findPeopleSaleActivity`,//获取用户所属企业的促销活动
  },
  GetCouponListUrl:{
    UnusedCouponUrl:`${host}/app/mycoupon/getMyunUsedCouponList`,//获取待使用券
    InvalidCouponUrl:`${host}/app/mycoupon/getMyInvalidCouponList`,//获取已过期券
    UsedCouponUrl:`${host}/app/mycoupon/getMyUsedCouponList`,//获取已使用券
    GetCouponCountsUrl:`${host}/app/mycoupon/getCouponCountsList`,//获取优惠券数量
    SubmitExchangeCodeUrl:`${host}/app/mycoupon/submitExchangeCode`,//提交兑换码
  },
  PromotionUrl:{
    InfoUrl:`${host}/app/sales/activity/findData`,//获取促销活动信息
  }
}

/**
 * 缓存key
 */
const CacheKey = {
  userInfo : 'userInfo'
}
module.exports = { HttpConfig, CacheKey }