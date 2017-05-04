

//地址配置
/* nginx增加配置行
 *      location /web_hzsmk/AlipayBdServlet {
 *           proxy_pass   http://weixin.96225.com/web_hzsmk/AlipayBdServlet;
 *      }
 *
 * $AlipayBdServlet       公交充值唯一接口
 * $APPID      ajax请求头HEADER 
 * $userSystem 用户系统
 * 
 * 在app外部   ?activityCode=qmdb&channelId=360&inviteCode=xxx&mobile=15067425400
 * 在app内部   ?activityCode=qmdb&channelId=360&isApp=true
 *
 *
 * 
 */


//本地开发环境
//localStorage.clear();//测试阶段强制清空离线存储
var extGetUserInfoByCode = "/smk_alilife/alipay/extGetUserInfoByCode.ext"; //支付宝用户信息
var extGetUserIdByCode = "/smk_alilife/alipay/extGetUserIdByCode.ext"; //支付宝ID


var extVirOpenCard = "/smk_alilife/vircard/extVirOpenCard.ext";//开卡
var extGetVirCardList = "/smk_alilife/vircard/extGetVirCardList.ext"; //卡列表
var sendCancelAccount = "/smk_alilife/vircard/sendCancelAccount.ext";//退卡
var cardActivate = "/smk_alilife/vircard/cardActivate.ext";//激活

var $searchOrder = "/smk_alilife/vircard/searchOrder.ext";//充值订单查询
var $getPurchaseRecord = "/smk_alilife/vircard/getPurchaseRecord.ext";//个人消费记录查询接口
var $createOrder = "/smk_alilife/vircard/createOrder.ext";//生成订单接口
var $secondPayOrder = "/smk_alilife/vircard/secondPayOrder.ext";//生成二次支付接口

var $searchAutoPaySetting = "/smk_alilife/vircard/searchAutoPaySetting.ext";//代扣设置查询
var $autoPaySetting = "/smk_alilife/vircard/autoPaySetting.ext";//生成代扣设置
var $cancelAutoPaySetting = "/smk_alilife/vircard/cancelAutoPaySetting.ext";//取消代扣设置





//预付卡消费schema地址
var $card01 = "alipays://platformapi/startapp?appId=60000098&url=%2Fwww%2Fcard_entry.html%3Fscene%3DTRANSIT%26subScene%3D330100%26cardType%3DT0330100%26source%3DHZ_BUS_STOP%26__webview_options__%3DcanPullDown%253DYES%2526pullRefresh%253DYES";

//后付卡消费schema地址
var $card02 = "alipays://platformapi/startapp?appId=60000098&url=%2Fwww%2Fcard_entry.html%3Fscene%3DTRANSIT%26subScene%3D330100%26cardType%3DT1330100%26source%3DHZ_BUS_STOP%26__webview_options__%3DcanPullDown%253DYES%2526pullRefresh%253DYES";

//支付宝生产地址
var $online = 'http://115.236.162.166:18081/exthtml/src/pages/index.html?type=index'


var $AlipayBdServlet = "/web_hzsmk/AlipayBdServlet",
$UserSystemServlet = "/web_hzsmk/UserSystemServlet",
$APPID = "com.smk.test.test",
$userSystem = "04",
$shareUrl = '',
$refund = {9000:"退款成功",
			9001:"原交易金额（可退款金额）小于请求退款金额",
			9002:"原交易已退款成功,重复退款",
			9003:"用户和订单不符",
			9006:"退款中",
			9999:"系统异常",
			9100:"该订单已退款",
			9200:"该订单不能退款",
			9300:"该订单不存在",
			9400:"退款失败"},
$cardType = {0:"普通卡",
			1:"老人优惠月卡",
			3:"学生优惠月卡",
			4:"成人优惠月卡",
			5:"成人优惠系卡",
			6:"成人优惠旬卡",
			7:"老人优惠卡",
			8:"老年年卡",
			9:"学生优惠期卡",
			10:"员工卡",
			11:"司机A卡",
			13:"停车管理员卡",
			14:"普通调度员卡",
			15:"公务A卡",
			16:"公务B卡",
			17:"杭州通",
			18:"市民卡",
			19:"Z卡",
			23:"旅游消费卡",
			26:"专用Z0卡",
			27:"停车卡",
			29:"淳安停车卡",
			33:"学生市民卡"};


/*
//生产环境地址配置
var $AlipayBdServlet = "/web_hzsmk/AlipayBdServlet";


var $APPID = "com.smk.h5.tg";
var $userSystem = "";
var $shareUrl = '';
*/

