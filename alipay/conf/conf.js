

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


 var BASEURL = '/smk_alilife/'//本地开发环境
 //var BASEURL = 'https://citysvc.96225.com/exthtml/smk_alilife/'//生产环境


var extGetUserInfoByCode = BASEURL + "alipay/extGetUserInfoByCode.ext"; //支付宝用户信息
var extGetUserIdByCode = BASEURL + "alipay/extGetUserIdByCode.ext"; //支付宝ID


var extVirOpenCard = BASEURL + "vircard/extVirOpenCard.ext";//开卡
var extGetVirCardList = BASEURL + "vircard/extGetVirCardList.ext"; //卡列表
var sendCancelAccount = BASEURL + "vircard/sendCancelAccount.ext";//退卡
var cardActivate = BASEURL + "vircard/cardActivate.ext";//激活

var $searchOrder = BASEURL + "vircard/searchOrder.ext";//充值订单查询
var $getPurchaseRecord = BASEURL + "vircard/getPurchaseRecord.ext";//个人消费记录查询接口
var $createOrder = BASEURL + "vircard/createOrder.ext";//生成订单接口
var $secondPayOrder = BASEURL + "vircard/secondPayOrder.ext";//生成二次支付接口

var $searchAutoPaySetting = BASEURL + "vircard/searchAutoPaySetting.ext";//代扣设置查询
var $autoPaySetting = BASEURL + "vircard/autoPaySetting.ext";//生成代扣设置
var $cancelAutoPaySetting = BASEURL + "vircard/cancelAutoPaySetting.ext";//取消代扣设置


//支付宝生产地址
var $online = 'https://citysvc.96225.com/exthtml/alipayCard/src/pages/index.html?type=index&inSmk=true'


var $AlipayBdServlet = "/web_hzsmk/AlipayBdServlet",
$UserSystemServlet = "/web_hzsmk/UserSystemServlet",
$APPID = "com.smk.test.test",
$userSystem = "04",
$shareUrl = '';

