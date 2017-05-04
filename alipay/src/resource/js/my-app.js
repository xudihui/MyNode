var getQueryString=function(name,str) {		//提取href参数ccc
	var str_; //键值对 
	if(str){
		str_ = str.split('html')[1];
	}
	else{
        str_ = window.location.search;
	}
	console.log(str_)
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = str_.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
}

var checkAge = function(sn){ //身份证号码年龄判断
	if(!sn){return false;}
	var bstr = sn.substring(6,14)
	var _now = new Date();
	var _bir = new Date(bstr.substring(0,4),bstr.substring(4,6),bstr.substring(6,8));
	var _agen = _now-_bir;
	var _age = Math.round(_agen/(365*24*60*60*1000));
	console.log(_age)
	return _age>=16 && _age<=60;
}

var setTransparentTitle = function(e,type){
	if(type == true){
		setTimeout(function() {
			if(e.detail.page.name == 'getCard'){
					AlipayReady(function(){
						AlipayJSBridge.call('setTransparentTitle', {
						transparentTitle:"always"
						});  
					});
					AlipayReady(function(){
					    AlipayJSBridge.call("setTitleColor", {
					      color: 16775138,
					      reset: false //(可选,默认为false)  是否重置title颜色为默认颜色。
					    });
					});								
			}
			else{
					AlipayReady(function(){
					    AlipayJSBridge.call("setTransparentTitle",{
					      transparentTitle:"none"
					    }); 
					});	
					AlipayReady(function(){
					    AlipayJSBridge.call("setTitleColor", {
					      color: 16775138,
					      reset: true //(可选,默认为false)  是否重置title颜色为默认颜色。
					    });
					});							
			}
		}, 300);		
	}
 
}	

var TYPE = getQueryString('type') || '';


//设置刷新不返回首页的子页面(无前后功能逻辑)
var HASHPAGE = ['smk-fitness-catalog' //校园健身目录
, 'smk-fitness-intro' //校园健身业务介绍
, 'smk-fitness-proposal' //校园健身意见建议
, 'smk-fitness-list' //校园健身学校列表
];

//获取当前子页面是否要保留在当前页面
var checkCurrentPage = function() {
		var flag = true;
		for (i in HASHPAGE) {
			if (location.hash.indexOf(HASHPAGE[i]) > -1) {
				flag = false;
				break;
			}
		}
		return flag;
	}


	//如果不是首页，直接重定向到首页
if (location.hash) {
	//最后一个参数是state的值，为空不改变state,为空格可以直接清空state	
	//	history.replaceState(null, "", checkCurrentPage() ? " " : "");
	//location.reload(); //在ios微信里面点击刷新按钮，会刷新两次回到首页
}

//localStorage.setItem('userMobile','13888888886');
//version2.6

var myApp = new Framework7({
	modalTitle: '',
	animateNavBackIcon: true,
	pushState: true,
	pushStateNoAnimation: true,
	template7Pages: true,
	precompileTemplates: true,
	modalButtonOk: '确认',
	modalButtonCancel: '取消',
	animatePages:false,
	activeState:false
});



// Expose Internal DOM library
var $$ = Dom7;
var SMK = myApp;
//加粗console
SMK.C = function(status){
	var type = typeof(status);
	if(type.indexOf('object') == -1 ){
		console.log('%c'+status,'background:#555;font-family: Georgia, serif;font-size:16px;color:#fddd05;padding:0 10px');
	}
	else{
		console.log(status);
	}	
}
var baseUrl = '';
var VIEWURL = '';
var AJAXTIME;
var REG = /^0?1[3-8|4|5|7|8][0-9]\d{8}$/;
var REG_abc = /^[A-Za-z]+$/;
var VALIDATE = { //校验正则
	mobile: /^0?1[3-8|4|5|7|8][0-9]\d{8}$/,
	//手机号码校验
	english: /^[A-Za-z]+$/,
	//纯英文校验
	card: /^[0-9a-zA-Z]*$/, //纯英文或者纯数字或者英文数字组合，适用于卡号校验
	//验证码
	code:/^\d{6}$/
};
var AJAX = null;
var FLAG = false;
var FLAG_RECHARGE = false; //是否设置自动充值
var LASTHTML = '';

var loading = false;
var FLAG_TIME = null;
var AJAXDATE = 0;
var timer = null;
var map;

var selectCardType;//卡类型
var selectCardNo;//卡号
var userInfo = {}; //实名认证信息
var ui_alipayId;
var ui_userId;
var myCard = {}; //我的卡片
// var certType = ['身份证','护照','军官证','士兵证','回乡证','临时身份证','户口簿','警官证','台胞证','营业执照','其它证件'];
var hasDetail; //用于标识当前页面是否进入过卡详情
var ui_credit = getQueryString('isCreditOpened') || '0'; //1：授信通过 2：授信不通过 0：未判定
var inSmk = getQueryString('inSmk') || 'false'; //'true':在市民卡生活号打开 'false'：在公交付款码进入

String.prototype.setStars = function(index) { //扩展字符串原型方法，隐藏某个字符为*号，默认第二位，适用于不宜显示全部字段的场景
	var self = this.replace(/ /g, ''); //去除空格

	if (VALIDATE.mobile.test(self)) {
		return self.slice(0, 3) + '****' + self.slice(-4); //使用最传统的前三后四	   
	} else {
		var arr = self.split('');
		arr[index || 1] = ' * '; //默认为第二个字符，当然也可以传入参数，位数从0开始计算
		return arr.join('');
	}
};

String.prototype.removeAllSpace = function() {
	var self = this;
	return self.replace(/\s+/g, "");
}


//获取支付宝信息，opt OBJECT ，type:userId 静默获取userId; type:userInfo 蓝盾获取userInfo
window.getAlipayInfo = function(opt){
	        var opt = opt || {};
	        var type = opt.type || 'userInfo';
	        var url = '';
			if(getQueryString("auth_code")) {
				var a = getQueryString("auth_code");
			        if(type == 'userInfo'){
                        url = extGetUserInfoByCode;
			        }
			        else if(type == 'userId'){
			        	url = extGetUserIdByCode;
			        }
				    //使用auth_code换取实名信息
					ajax(url,{auth_code:a},function(data) {
					console.log(data);
					if(data.code == "0"){

				        if(type == 'userInfo'){
							userInfo = data.response;
							// 实名信息转字符串存入本地缓存
							localStorage.setItem('userInfo',JSON.stringify(data.response));
							// 支付宝Id
							ui_alipayId = userInfo.userId || '';
				        }
				        else if(type == 'userId'){
							ui_alipayId = data.response.alipayId || '';
							// userId存入本地缓存
							localStorage.setItem('ui_alipayId',ui_alipayId);
				        }
						// userId获取卡列表信息
						ajax(extGetVirCardList,{alipayId:ui_alipayId}, function(data) {
							if(data.code == "0" && data.response.cardno){
								myCard = data.response;
								mainView.router.load({url:'cardDetail.html',pushState:false});
							}
							else {
								mainView.router.load({url:'getCard.html',pushState:false});
							}
						},function(data){
							console.log("请求卡列表失败")
						})

					} else {
						myApp.alert("获取支付宝实名信息失败")
					}
					
				}, function(data) {
					myApp.alert("请稍后再试");
				})
			} else {
					if(type == 'userInfo'){
					  //蓝盾授权
					  window.location.href = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2017011104993459&scope=auth_user&redirect_uri='+location.origin+location.pathname+'?type=index&inSmk=true';
					}
					else if(type == 'userId'){
					  //静默授权
					  window.location.href = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2017011104993459&auth_skip=false&scope=auth_base&redirect_uri='+location.origin+location.pathname+'?type=index&inSmk=true';
					}	
			}   
}


//支付宝容器SDK注入
window.AlipayReady = function(callback) {
  // 如果jsbridge已经注入则直接调用
  if (window.AlipayJSBridge) {
    callback && callback();
  } else {
    // 如果没有注入则监听注入的事件
    document.addEventListener('AlipayJSBridgeReady', callback, false);
  }
};

//tips Function
window.showTips = function(content, t) {
	var p = $$('<p class="showTips"><span>' + content + '</span></p>');
	if ($$('.showTips').length > 0) return;
	$$('body').append(p);
	setTimeout(function() {
		p.css('opacity', 1);
	}, 0);
	setTimeout(function() {
		p.addClass('hide').transitionEnd(function() {
			p.remove()
		}); //优化动画，平滑过渡
	}, t || 2000)
};

window.setCopyright = function(e) { //设置版权位置
	var name_ = e.type == 'resize' ? $$('.page-on-center').attr('data-page') : e.detail.page.name;
	var el_ = ".page[data-page=" + name_ + "] .page-content";
	var el = $$(el_)[0];
	$$('.copyright').css('bottom', (el.scrollHeight > el.clientHeight ? 'auto' : '0'));
};


//新版数据初始化，删除统一用户逻辑，开卡和查询卡列表都去掉统一用户的userId
window.initDataNew = function(){
		//本地已经有用户支付宝实名信息
		if(localStorage.getItem('userInfo')){

			// 本地读取实名，转对象
			userInfo = JSON.parse(localStorage.getItem('userInfo'));

			// 支付宝Id
			ui_alipayId = userInfo.userId || '';

			// 获取卡列表信息
			ajax(extGetVirCardList,{alipayId:ui_alipayId,name:userInfo.userName,oidno:userInfo.certNo}, function(data) {
				if(data.code == "0" && data.response.cardno && ui_credit == '0'){
					myCard = data.response;
					mainView.router.load({url:'cardDetail.html',pushState:false});
				}
				else {
					mainView.router.load({url:'getCard.html',pushState:false});
				}
			},function(data){
				console.log("后台不通")
			})
					
		} else {
			getAlipayInfo({type:'userId'});
		}	
}



$$(window).resize(function(e) {
	setCopyright(e)
});
//loading Function
myApp.showIndicator();

//强塞测试用户
// localStorage.setItem('userInfo','{"certNo":"332528199009215415","certType":0,"userName":"徐迪辉","userId":"2088202911504154"}');

$$(window).on('load', function() {	

	myApp.hideIndicator();
	var hash = location.hash.slice(3) || '';
	var url = '';

	if(TYPE == 'test') {
		url = 'test.html';
	}
	// 首页
	if(TYPE == 'index') {
      initDataNew();
	}
	// 支付宝路由
	if(TYPE == 'getCardRouter') {
		url = 'getCardRouter.html';
	}		
	// 激活卡片
	if(TYPE == 'getCard') {
		url = 'getCard.html';
	}	
	// 我的卡片
	if(TYPE == 'myCards') {
		url = 'myCards.html';
	}
	// 卡详情
	if(TYPE == 'cardDetail') {
		url = 'cardDetail.html';
	}
	// 乘车记录
	if(TYPE == 'busList') {
		url = 'busList.html';
	}
	// 开通线路
	if(TYPE == 'busLine') {
		url = 'busLine.html';
	}
	// 充值记录
	if(TYPE == 'rechargeList') {
		url = 'rechargeList.html';
	}
	// 充值详情
	if(TYPE == 'rechargeDetail') {
		url = 'rechargeDetail.html';
	}
	// 市民认证
	if(TYPE == 'realName') {
		url = 'realName.html';
	}
	// 市民认证结果
	if(TYPE == 'realNameResult') {
		url = 'realNameResult.html';
	}
	// 使用帮助
	if(TYPE == 'help') {
		url = 'help.html';
	}
	// 退卡结果
	if(TYPE == 'cancelResult') {
		url = 'cancelResult.html';
	}
	// 充值
	if(TYPE == 'recharge') {
		url = 'recharge.html';
	}
	// 自动充值
	if(TYPE == 'rechargeAuto') {
		url = 'rechargeAuto.html';
	}	
	// 充值结果
	if(TYPE == 'rechargeResult') {
		url = 'rechargeResult.html';
	}
	// 余额查询
	if(TYPE == 'amount') {
		url = 'amount.html';
	}
	if(hash && localStorage.getItem('userMobile')){ //如果有hash并且有登录缓存，以hash为准
		url = hash;
	}
	if(TYPE){
		mainView.router.load({ // 此处切记，主视图初始化的变量名必须是mainView，不然跳转不了
			url : VIEWURL + url,
			animatePages : false,
			pushState : false
		});		
	}    


});

// Add main view
var mainView = myApp.addView('.view-main', {
	domCache: true //三级设置该参数
});

//提示冒泡封装
$$(document).on('click', 'i.information', function(evt) {
	var self = $$(this);
	myApp.modal({
		text: self.attr('text'),
		title: self.attr('title'),
		buttons: [{
			text: '知道了',
			bold: true
		}]
	})
});

// 开卡函数
function FunKaika(){	

	//如果没有授信
    if(ui_credit == '0'){
    	 console.log('https://fengdie.alipay.com/p/f/public_transit/card_entry.html?scene=TRANSIT&subScene=310100&redirectUrl='+encodeURIComponent($online)+'&action=sign&isSupportPrepay=true&cardTitle='+encodeURIComponent('杭州通电子公交卡')+'&source=HZ_BUS_ISSUE')
    	 window.location.href = 'https://fengdie.alipay.com/p/f/public_transit/card_entry.html?scene=TRANSIT&subScene=310100&redirectUrl='+encodeURIComponent($online)+'&action=sign&isSupportPrepay=true&cardTitle='+encodeURIComponent('杭州通电子公交卡')+'&source=HZ_BUS_ISSUE';
    }
    else{
	 	ajax(extVirOpenCard,{alipayId:ui_alipayId,credit:ui_credit=='true' ? '1' : '2',mobile:userInfo.mobile,name:userInfo.userName,oidno:userInfo.certNo},function(data) {
				console.log(data.response);
				if(data.code != "0") return myApp.alert(data.msg,'开卡失败');
				// 开卡成功
				myCard = data.response;
				if(data.response.cardsubtype == "11"){
					// 先充值
					myApp.modal({
					    title:  '领卡成功',
					    text: '<div class="jhsucess"><img src="../resource/images/img_ts.jpg"></div><div class="tt"><div class="modal_img_det">将公交码靠近公交车扫码器即可付款</div><p class="modal_dd1">*您的信用分未满足芝麻信用征信条件，该卡需要充值后才能享受扫码乘车服务</p><p class="modal_dd2"><i class="iconfont icon-gouxuan1"></i>使用该服务将关注杭州市民卡生活号</p></div>',							    
					    cssClass:'pop-success',
					    buttons: [
					      {
					        text: '查看卡片',
					        onClick: function() {
					            // 跳转到查看卡片
					            if(hasDetail){
						            // 先重新初始化页面
									mainView.router.reloadPreviousPage('cardDetail.html')
									// 回到卡详情页面
									mainView.router.back({url:'cardDetail.html',reload:true,context:data.response});
								} else {
					          		mainView.router.load({url:'cardDetail.html',context:data.response})

								}
							}
					      },
					      {
					        text: '立即充值',
					        onClick: function() {
					          // 跳转到立即充值，并把卡号带过去，存储进session，防止同步支付成功后卡号丢失
					          sessionStorage.setItem('selectCardNo',data['response']['cardno']);
					          mainView.router.load({url:'recharge.html',context:{cardNumber:data['response']['cardno']}});
					        }
					      }
					   	]
					});
				} else if(data.response.cardsubtype == "12"){
					// 先用				
					myApp.modal({
					    title:  '领卡成功',
					    text: '<div class="jhsucess"><img src="../resource/images/img_ts.jpg"></div><div class="tt"><div class="modal_img_det">将公交码靠近公交车扫码器即可付款</div><p class="modal_dd1">*您的信用分满足芝麻信用征信条件，该卡可享受先扫码乘车后付款服务</p><p class="modal_dd2"><i class="iconfont icon-gouxuan1"></i>使用该服务将关注杭州市民卡生活号</p></div>',							    
					    cssClass:'pop-success',
					    buttons: [
					      {
					        text: '查看卡片',
					        onClick: function() {
					          // 跳转到卡片
					          // 跳转到查看卡片
					            if(hasDetail){
						            // 先重新初始化页面
									mainView.router.reloadPreviousPage('cardDetail.html')
									// 回到卡详情页面
									mainView.router.back({url:'cardDetail.html',reload:true,context:data.response});
								} else {
					          		mainView.router.load({url:'cardDetail.html',context:data.response})

								}
								}
					        },
					        {
						        text: '立即充值',
						        onClick: function() {
						          // 跳转到立即充值，并把卡号带过去，存储进session，防止同步支付成功后卡号丢失
						          sessionStorage.setItem('selectCardNo',data['response']['cardno']);
						          mainView.router.load({url:'recharge.html',context:{cardNumber:data['response']['cardno']}});
						        }
					      	}
					      ]
					});
				}
			},function(data){
				// 激活失败
				myApp.alert(data.msg,'领卡失败');
			})   	
    }

}

// 卡片领取
myApp.onPageInit('getCard', function(page) {
	userInfo = JSON.parse(localStorage.getItem('userInfo'));	
	if(ui_credit != '0'){
		FunKaika();
	}
	// 请求开卡
	$$('#getCard').on('click',function(){
		// 开卡，姓名身份证手机号		
		FunKaika();
	})

})


// 开卡路由—新增用于支付宝跳转
myApp.onPageInit('getCardRouter', function(page) {
	//强制塞入数据
    localStorage.setItem('userInfo','{"certNo":"332528199009215415","certType":0,"userName":"徐迪辉","userId":"2088202911504154"}');
	selectCardType = getQueryString('CardType') || '0'
    if(selectCardType == 'T0330100'){
    	selectCardType = 0
    }
    else if(selectCardType == 'T1330100'){
    	selectCardType = 1
    }
    //数据初始化	
    initDataNew();
})

//卡详情页面
myApp.onPageInit('cardDetail', function(page) {
	hasDetail = 1;
	$$('.J_cardjihuo').hide();
	var $cardNo = $$('.cardDetail .J_cardNo');
  	var $J_itemRecharge = $$('.J_itemRecharge');
  	var $J_linkall = $$('.J_linkall .item-link');
  	var $detailBtn = $$('#detailBtn'); //使用按钮
// 防止卡页面直接刷新
setTimeout(function(){
	// 渲染卡列表
	if(myCard){
		$cardNo.text(myCard.cardno);
		$cardNo.attr("tip",myCard.cardsubtype);
		selectCardNo = $cardNo.text();
		chageCard();

	} else { //出现都是销的卡,正常情况不应该出现
		myApp.alert("您目前没有有效卡,请开卡");
	}
},200)
	
// 对卡变化的一些处理
	function chageCard(){
	    // 禁用不能使用的功能
		var status = myCard['status'];	

		// 是否有卡号：显示激活按钮还是使用，// 某些功能禁用
		if(status != "4"){
			// 有卡
			$$('.J_cardjihuo').hide();	
			$detailBtn.show();
			$J_linkall.removeClass('link-disabled');
			if(status == "2"){
				// 如果已冻结
				$detailBtn.text("立即激活");
				$detailBtn.removeClass('J_cardDetbtn').addClass('J_afresh');
				$$('.cardDetail .icon_static').addClass('ydj');
			} else if(status == "5"){
				// 退卡中,按钮不可点击
				$$('.cardDetail .icon_static').addClass('tkz');
				$$('.cardDetail .J_cStatus').addClass("link-disabled");
				$detailBtn.addClass('btn-disabled');

			} else if(status == "3"){
				// 挂失
				$$('.cardDetail .icon_static').addClass('ygs');
			}
			if(status == "2" ||status == "3"){
				// 禁用不可点击按钮
				$$('.cardDetail .J_cStatus').addClass("link-disabled");
				$$('.cardDetail .J_tuika').addClass("link-disabled");
			} 
			if(status == "1"){
				// 正常卡
				$J_linkall.removeClass("link-disabled");
			}
		} else {
			// 注销成功，开卡
			$detailBtn.hide();
			$$('.J_cardjihuo').show();
			$J_linkall.addClass('link-disabled');

		}			
        if(inSmk=='true'){
            $$('.cardDetail .toolbar').show();
		}


	}

	// 监听卡处理

	$$('.cardDetail .item-content a').on("click",function(){
		var self = $$(this);
		var $cardNo = $$('.cardDetail .J_cardNo');
		if($cardNo.text()){
			selectCardNo = $cardNo.text();
			selectCardType = $cardNo.attr("tip");
			
		}
		status = myCard['status'];		
	})
	// 查询余额
	$$('.J_amount').on("click",function(){
		if(!selectCardNo || $$(this).hasClass('link-disabled')) return 0; 
		var amount = new Number(myCard.wmoney); //使用Number对象的toFixed方式进行小数位数转换
		mainView.router.load({url:'amount.html',context:{amount:amount.toFixed(2)}});
	})
	// 充值功能判断卡是否正常
	$$('.cardDetail .J_cStatus').on("click",function(){
		if(!selectCardNo || status != "1") return 0; 

		sessionStorage.setItem('selectCardNo',selectCardNo);
		if($$(this).hasClass('J_autoRecharge') && $$(this).hasClass('link-disabled') != true){
			mainView.router.load({url:'rechargeAuto.html',context:{cardNumber:selectCardNo}});
		} else {
			mainView.router.load({url:'recharge.html',context:{cardNumber:selectCardNo}});
		}
		
	})
	// 退卡
	$$('.cardDetail .J_tuika').on("click",function(){
		if(!selectCardNo) return 0; 		
		if(selectCardNo && $$(this).hasClass('link-disabled') != true){
			switch (status){
			  case "1": myApp.modal({
				    text: '退卡后您将不能继续享受刷手机乘公交的便捷服务',
				    title:  '',
				    buttons: [
				      {
				        text: '残忍退卡',
				        onClick: function() {
				            ajax(sendCancelAccount,{cardNo:selectCardNo}, function(data) {
				            	if(data.code == "0"){

					            	var status = data.response.status;
                                    //修改成功退卡后状态status
									myCard['status'] = parseInt(status);						            	
					            	if(status == "5")
					          			// 退卡申请中
					          			mainView.router.load({url:'cancelResult.html',context:''});
					          	} else {
					          		myApp.alert(data.msg, '退卡失败');
					          	}
							},function(datd){
				          		// 退卡失败
								 myApp.alert(data.msg, '请稍后再试');
							})
				        }
				      },
				      {
				        text: '我再想想',
				        onClick: function() {
				        }
				      }]
				});
			    break;
			  case "5": mainView.router.load({url:'cancelResult.html'});
			 //  myApp.modal({
				//     text: '您的退卡申请已提交，正在审核中',
				//     title:  '',
				//     buttons: [
				//       {
				//         text: '我知道了',
				//         onClick: function() {
				//       }},
				//       {
				//         text: '查看进度',
				//         onClick: function() {
				//             mainView.router.load({url:'cancelResult.html'})
				        
				//         }
				//       }]
				// });
			    break;
			 
			}
		}
			
	})
	// 开通线路
	$$('.cardDetail .J_busLine').on("click",function(){
		if($$(this).hasClass('link-disabled') != true){
			mainView.router.load({url:'busLine.html',context:''});
		}
	})
	// 使用帮助
	$$('.cardDetail .J_help').on("click",function(){
		if($$(this).hasClass('link-disabled') != true){
			mainView.router.load({url:'help.html',context:''});
		}
	})
	// 乘车记录
	$$('.cardDetail .J_busList').on("click",function(){
		if(selectCardNo && $$(this).hasClass('link-disabled') != true){
			mainView.router.load({url:'busList.html',context:''});

		}
	})
	// 激活卡
	$$('#detailBtn').on("click",function(){
		if($$(this).hasClass('J_afresh') && selectCardNo){
			// 激活
			ajax(cardActivate,{cardNo:selectCardNo}, function(data) {
            	if(data.code == "0"){
	            	myCard['status'] = data.response.status;
	          		myApp.alert('激活成功',function(){
	          			// 刷新当前页面
	          			mainView.router.refreshPage();	          			
	          		});
                    				            	
	          	} else {
	          		myApp.alert(data.msg, '激活失败');
	          	}
			},function(datd){
          		// 激活失败
				 myApp.alert(data.msg, '激活失败');
			})
		}
	})

	// 立即使用
	$$('.J_cardDetbtn').on('click',function(){
		var $cardNo = $$('.J_cardNo');
		if($cardNo.text()){
			selectCardNo = $cardNo.text();
			var status = myCard['status'];
			if(status == "1"){
				// 充值卡内余额不足，提示
				if(myCard.cardsubtype == "11" && myCard.wmoney<"1"){
					myApp.modal({
					    title:  '',
						text: '余额不足<br/>不能使用公交付款服务',							    
					    buttons: [
					      {
					        text: '稍后充值',
					        onClick: function() {}
					      },
					      {
					        text: '立即充值',
					        onClick: function() {
					          // 跳转到立即充值，并把卡号带过去，存储进session，防止同步支付成功后卡号丢失
					          sessionStorage.setItem('selectCardNo',selectCardNo);
					          mainView.router.load({url:'recharge.html',context:{cardNumber:selectCardNo}});
					        }
					      }
					      ]
					});
				} else{
				// 跳支付页面
				/*
	              document.addEventListener('AlipayJSBridgeReady', function () {				
					AlipayJSBridge.call('pushWindow', {
					    url: selectCardType == "0" ? $card01 : $card02,
					    param: {
					        closeCurrentWindow: true
					    }
					}); 
				  }, false); 	
                */
               
    	        window.location.href = 'https://fengdie.alipay.com/p/f/public_transit/card_entry.html?scene=TRANSIT&cardType='
    	                               + (myCard.cardsubtype== '12' ? 'T0330100' : 'T1330100') 
    	                               +'&cardNo='
    	                               + myCard.cardno
    	                               +'&subScene=310100&action=use&source=HZ_BUS_USE';
                    
					
				}
			}
			else{
				return console.log('当前卡不是有效状态,无法使用');
			}
			
		}
	})


})

// 返回卡详情页
$$(document).on('click','.J_backCardDeatil',function(){

	//退出当前活动中的appId
	AlipayReady(function(){
      AlipayJSBridge.call('exitApp'); 
	});	
	// 先重新初始化页面
	mainView.router.reloadPreviousPage('cardDetail.html')
	// 回到卡详情页面
	mainView.router.back({url:'cardDetail.html',reload:true});
})
// 退卡结果
myApp.onPageInit('cancelResult', function(page) {

	//隐藏后退按钮
	AlipayReady(function(){
      AlipayJSBridge.call('hideBackButton'); 
	});		
	if(status == '5'){
		$$('.J_jindu').text("退卡申请审核中");
		setTimeout(function(){
			document.title = "退卡进度";
		},1000)
	}
	myCard['status'] = 5;
})

// 查询余额页面
myApp.onPageInit('amount', function(page) {
	if(myCard.cardsubtype =="12"){
		$$('.amount .J_typeText').text("您的信用分满足芝麻征信条件，该卡可享受先扫码乘车后付款服务");
	}
	if(myCard.status == '5'){
		$$('.amount .btn-blue').attr('href','#').addClass('btn-gray')
		
	}
})

//测试

FLAGE = 0;
myApp.onPageInit('test', function(page) {
	 var n = ++FLAGE;
     var inputCardNo = $$('#cardNo');
	//如果用事件代理方式，由于绑定在document上面，页面卸载不会移除document元素，导致再次进入的时候会重复绑定，并且上次传入的inputCardNo会被闭包记录在执行内存中
	// $$(document).on("click","#cardNo_",function(){
	// console.log('第'+n+'次的值：'+inputCardNo.val()+';');
	// console.log(inputCardNo);
	// })
     
     $$("#cardNo_").on("click",function(){
		// console.log('第'+n+'次的值：'+inputCardNo.val()+';');
		console.log("000")
	 }) 

	// 测试输入实名信息
	$$(document).on("click","#testInfo",function(){
		if($$('#test-mobile').val()) userInfo.mobile = $$('#test-mobile').val();
		if($$('#test-No').val()) userInfo.certNo = $$('#test-No').val();
		if($$('#test-userId').val()) userInfo.userId= $$('#test-userId').val();
		if($$('#test-Name').val()) userInfo.userName = $$('#test-Name').val();
		localStorage.setItem('userInfo',JSON.stringify(userInfo));
		localStorage.setItem('ui_userId',"");
		window.location.href = window.location.href.split("?")[0]+"?type=index";
	})
	$$(document).on("click","#testClear",function(){
		localStorage.setItem('userInfo',"");
		localStorage.setItem('ui_userId',"");
		window.location.href = window.location.href.split("?")[0]+"?type=test";
	})



	$$('#test').on('click',function(){
		document.addEventListener('AlipayJSBridgeReady', function () {
	       AlipayJSBridge.pushWindow({
	            url: "alipays://platformapi/startapp?appId=60000098&url=%2Fwww%2Fcard_entry.html%3Fscene%3DTRANSIT%26subScene%3D330100%26cardType%3DT0330100%26source%3DHZ_BUS_STOP%26__webview_options__%3DcanPullDown%253DYES%2526pullRefresh%253DYES",
	            param: {
	                closeCurrentWindow: true
	            }
	        });		   
		}, false);    	
	})

})

//卡充值页面

//消费结果列表
myApp.onPageInit('busList', function(page) {
	var month = $$('.page[data-page="busList"] .topbar span i');
	var container = $$('.page[data-page="busList"] .scroll_content_current .list-record .list-group ul');
	var lastMonth = '';//上次选择的日期
	var CardNo = getQueryString('cardNo') || '';
    //获取请求入参
    var getData = function(){
    	return {
    	   cardNo:CardNo ? CardNo : selectCardNo,
    	   isPage:1,
    	   page:1,
    	   pageSize:15,
    	   month:month.eq(1).html(),
    	   year:month.eq(0).html()
    	}
    }

    //页面数据初始化
    var doSearch = function(){
    	    container.html('');
    	    $$('.page[data-page="busList"] .currentPage').val(0);
    	    $$('.page[data-page="busList"] .maxPage').removeAttr('value');
    	    container.parents('.list-record').find('.tips_nomore').remove();
    	    loading = false;
            $$('.page[data-page="busList"] .infinite-scroll').trigger('infinite')    	
    } 

    //制造选择框数据   	
	var makeData = function(min,max){
		var temp = [];
		do{
		    temp.push(min++)
		}
		while(min <= max)
		return temp;	
	}
	var pickerData = myApp.picker({
	    input: '.icon-rili',
	    rotateEffect: true,
	    toolbarCloseText:'完成',
	    cols: [
	        {
	            textAlign: 'center',
	            cssClass:'picker-widthPadding',
	            values: makeData(2001,2027)
	        },        
	        {
	            textAlign: 'center',
	            cssClass:'picker-widthPadding',
	            values: makeData(1,12)
	        },
	    ],
	     onClose:function(p){
	     	    console.log(p);
	     	    var totalVal = p.value[0]+''+p.value[1];
	     	    month.eq(0).html(p.value[0]);
	     	    month.eq(1).html(p.value[1]);
	     	    if(lastMonth != totalVal){
                     doSearch();
                     lastMonth = totalVal;
	     	    }
	     	    

	     },
	     onOpen:function(p){
	     	    pickerData.setValue([ month.eq(0).html(),month.eq(1).html()]); 
	     }    
	}); 
	
	myApp.ajaxNextPage({
		target: "busList",
		//当前点击的对象 String
		view: "consumeList",
		data: getData,
		wrap: container,
		url: $getPurchaseRecord,
		pageno:'page',
		//请求地址 String
		tips: '列表加载完毕!' //加载完毕提示文字，可不填，默认为'已经没有更多了~'
	});
	doSearch();
})



//充值结果列表
myApp.onPageInit('rechargeList', function(page) {
	var month = $$('.page[data-page="rechargeList"] .topbar span i');
	var container = $$('.page[data-page="rechargeList"] .scroll_content_current .list-record .list-group ul');
	var lastMonth = month.eq(0).html()+''+month.eq(1).html();//上次选择的日期
	var CardNo = getQueryString('cardNo') || '';
	if(page['fromPage']['name'] == "rechargeResult"){
		CardNo = sessionStorage.getItem('selectCardNo') || '';
	}	
    //获取请求入参
    var getData = function(){
    	return {
    	   cardNo:CardNo ? CardNo : selectCardNo,
		   year: month.eq(0).html(),
		   month: month.eq(1).html(),
    	   isPage:1,
    	   page:1,
    	   pageSize:15
    	}

    }

    //页面数据初始化
    var doSearch = function(){
    	    container.html('');
    	    container.parents('.list-record').find('.tips_nomore').remove();
    	    $$('.page[data-page="rechargeList"] .currentPage').val(0);
    	    $$('.page[data-page="rechargeList"] .maxPage').removeAttr('value');
    	    loading = false;
            $$('.page[data-page="rechargeList"] .infinite-scroll').trigger('infinite')    	
    } 

    //制造选择框数据   	
	var makeData = function(min,max){
		var temp = [];
		do{
		    temp.push(min++)
		}
		while(min <= max)
		return temp;	
	}
	var pickerData = myApp.picker({
	    input: '.icon-rili',
	    rotateEffect: true,
	    toolbarCloseText:'完成',
	    cols: [
	        {
	            textAlign: 'center',
	            cssClass:'picker-widthPadding',
	            values: makeData(2001,2027)
	        },        
	        {
	            textAlign: 'center',
	            cssClass:'picker-widthPadding',
	            values: makeData(1,12)
	        },
	    ],
	     onClose:function(p){
	     	    console.log(p);
	     	    var totalVal = p.value[0]+''+p.value[1];
	     	    month.eq(0).html(p.value[0]);
	     	    month.eq(1).html(p.value[1]);
	     	    if(lastMonth != totalVal){
                     doSearch();
                     lastMonth = totalVal;
	     	    }
	     	    

	     },
	     onOpen:function(p){
	     	    pickerData.setValue([ month.eq(0).html(),month.eq(1).html()]); 
	     }    
	}); 
	
	myApp.ajaxNextPage({
		target: "rechargeList",
		//当前点击的对象 String
		view: "rechargeList",
		data: getData,
		wrap: container,
		url: $searchOrder,
		pageno:'page',
		//请求地址 String
		tips: '列表加载完毕!' //加载完毕提示文字，可不填，默认为'已经没有更多了~'
	});
	doSearch();
})



//二次支付
myApp.onPageInit('rechargeDetail', function(page) {
	var money = $$('.page[data-page="rechargeDetail"] .money i').html();
	var orderNo = $$('.page[data-page="rechargeDetail"] .orderno').html();

	hashMap = {
        money:parseFloat(money)*100,
        orderNo:orderNo,
        subject:'测试'
	};
    $$('.page[data-page="rechargeDetail"] .btn-big').on('click',function(){
	    var self = $$(this);
	    ajax($secondPayOrder,hashMap,function(data){ 
	            if(data['code'] == 0){
	            	sessionStorage.setItem('selectCardNo',$$('.page[data-page="rechargeDetail"] .detMain').attr('cardno'));
					var html = SMK.templates['List'](data['response']);
					self.append(html);
					console.log(html);
					self.find('form').eq(0).submit();
					myApp.showIndicator();
	            } 
	            else{
	            	showTips(data['msg'])
	            } 
	
         
	    },function(){showTips('请求数据失败！')})


    })



})


//自动充值页面

myApp.onPageInit('rechargeAuto', function(page) {
	var picker_a = $$('.page[data-page="rechargeAuto"] .picker_a'),
	picker_b = $$('.page[data-page="rechargeAuto"] .picker_b'),
	cardNoInput = $$('.page[data-page="rechargeAuto"] .J_cardNo'),
	cardNo = getQueryString('cardNo') || '',
	arrayData = '', //上一次阈值和金额
	btn = $$('.page[data-page="rechargeAuto"] .btn-blue'),
	myPicker_a = myApp.picker({
			    input: '.picker_a',
			    rotateEffect: true,
			    toolbarCloseText:'完成',		    
			    cols: [
			       {
			         textAlign: 'center',
			         values: ['10元','20元','30元','40元','50元'],
	                 cssClass:'picker-widthAll'
			       }
			     ],
			     onClose:function(p){
			     	    picker_a.html(p.value[0]);
			     	    saveIt();
			     	    
			     },	    
			     onOpen:function(p){
                        myPicker_a.setValue([ picker_a.html()]); 
			     }
	}),
	myPicker_b = myApp.picker({
			    input: '.picker_b',
			    rotateEffect: true,
			    toolbarCloseText:'完成',			    
			    cols: [
			       {
			         textAlign: 'center',
			         values: ['50元','100元','200元','300元'],
	                 cssClass:'picker-widthAll'
			       }
			     ],
			     onClose:function(p){
			     	    picker_b.html(p.value[0]);
			     	    saveIt();
			     },	    
			     onOpen:function(p){
                        myPicker_b.setValue([ picker_b.html()]); 
			     }
	}),
	saveIt = function(){ //判断用户是否修改了阈值或充值金额，判断并显示保存按钮
		if(arrayData){
			if(picker_a.html()+picker_b.html() != arrayData){
				btn.hide();btn.eq(1).show();
			}
			else{
	            btn.hide();btn.eq(2).show();
			}
		}
	},
    autoPaySetting = function(){ //设置阈值
    	var threshold =  picker_a.html(); //阈值
        var money =  picker_b.html(); //充值金额
	    ajax($autoPaySetting,{cardNo:cardNo,money:parseInt(money),threshold:parseInt(threshold)},function(data){ 
	            if(data['code'] == 0){           	
                    showTips(data['response']['retmsg']);
                    btn.hide();
                    btn.eq(2).show();
                    arrayData = threshold + money;
	            } 
	            else{
	            	showTips(data['msg'])
	            } 
	    },function(){showTips('请求数据失败！')})       
    };
    
    cancelAutoPaySetting = function(){ //取消阈值
	    ajax($cancelAutoPaySetting,{cardNo:cardNo},function(data){ 
	            if(data['code'] == 0){           	
                    showTips('取消自动充值成功');
                    btn.hide();
                    btn.eq(0).show();
	                picker_a.html('20元');
	                picker_b.html('50元');   
	                arrayData = '';                 
	            } 
	            else{
	            	showTips(data['msg'])
	            } 
	    },function(){showTips('请求数据失败！')})       
    };
	//优先使用url中传过来的卡号
	//其次全局selectCardNo
	//最后使用session，当支付宝同步支付回调的时候无法保存全局变量
	if(!cardNo){
		cardNo = selectCardNo ? selectCardNo : sessionStorage.getItem('selectCardNo') || '暂时无法获取您的卡号'
	} 
	cardNoInput.html(cardNo);
    ajax($searchAutoPaySetting,{cardNo:cardNo},function(data){ 
            if(data['code'] == 0){
            	if(data['response']['hasset'] == '0'){
                     showTips('自动充值未开启');
                     picker_a.html('20元');
                     picker_b.html('50元');
                     btn.eq(0).show();
            	}
            	else if(data['response']['hasset'] == '1'){
            		 showTips('自动充值已开启');
                     picker_a.html(data['response']['threshold']+'元');
                     picker_b.html(data['response']['money']+'元');
                     btn.eq(2).show();
                     arrayData = data['response']['threshold']+'元' + data['response']['money']+'元';
            	}


            	//初次设置自动充值
            	btn.eq(0).on('click',autoPaySetting);
            	//设置自动充值
            	btn.eq(1).on('click',autoPaySetting);
            	//取消自动充值
            	btn.eq(2).on('click',cancelAutoPaySetting);         	

            } 
            else{
            	showTips(data['msg'])
            } 

     
    },function(){showTips('请求数据失败！')})



})


//充值
myApp.onPageInit('recharge', function(page) {
	var cardNo = $$('.page[data-page="recharge"] .cardNo');
    var cardValue = getQueryString('cardNo') || '';
	//优先使用url中传过来的卡号
	//其次全局selectCardNo
	//最后使用session，当支付宝同步支付回调的时候无法保存全局变量
	if(cardValue){
		cardNo.val(cardValue);
	}
	else{
		cardNo.val(selectCardNo ? selectCardNo : sessionStorage.getItem('selectCardNo') || '暂时无法获取您的卡号');
	}
	
	// 选中类型和钱
	$$('.page[data-page="recharge"] span.rechage_type').on('click',function(e) {
		var self = $$(this);
		// 默认选中其他金额
		var parent = self.parents('.row_wrap').eq(0);
		parent.find('span.rechage_type').removeClass('rechage_checked flipInX animated');
		// 变化样式
		self.toggleClass('rechage_checked').addClass('flipInX animated');

		hashMap = {};
		hashMap.put = function(key,value){
		hashMap[key] = value
		}
		hashMap.put("cardNo", $$('.page[data-page="recharge"] .cardNo').val());
		hashMap.put("oType", "1");
		hashMap.put("subject", "abc");
		hashMap.put("money", parseFloat(self.find('small').html())*100);
		hashMap.put("oSource", "1");
		delete hashMap.put;	
	    ajax($createOrder,hashMap,function(data){ 
	          if(data['code'] == 0){
	          	sessionStorage.setItem('selectCardNo',hashMap['cardNo']);
	          	var html = SMK.templates['List'](data['response']);
	          	self.append(html);
	          	console.log(html);
	          	self.find('form').eq(0).submit();
	          	myApp.showIndicator();	
	          }
	          else{
	          	 showTips(data['msg'])
	          }
         
	    },function(){showTips('请求数据失败！')})				
	}) 


})	

//充值结果页
myApp.onPageInit('rechargeResult', function(page) {

    var STATE = getQueryString('status',location.hash) || '';	
	var el = '.page[data-page="rechargeResult"] .state_' + STATE;
	var rechargeAuto = $$('.page[data-page="rechargeResult"] .list-block');
    $$(el).show();
    if(FLAG_RECHARGE){
    	rechargeAuto.show();
    }   

    //支付成功
    if(STATE == '01'){
    	
    }
    //支付失败
    else if(STATE == '02'){

    }
    //支付处理中，但是暂时给出的是支付取消
    else if(STATE == '03'){

    }
    else{

    }    
})

 

$$(document).on('pageBeforeRemove', function(e) {
	if (FLAG_TIME) {
		clearTimeout(FLAG_TIME)
	}
	FLAG = false; //页面初始化的时候把ajax的toast强制消灭
	myApp.hideIndicator();
});

$$(document).on('pageBack', function(e) {
	//返回到免密登录时直接关闭支付宝webview
	if(e.detail.page.view.activePage.name == 'smk-catalog'){
		 AlipayJSBridge.call('closeWebview')
	}
});



$$(document).once('pageInit', function(e) {
	myApp.params.pushStateNoAnimation = false;
});

$$(document).on('pageInit', function(e) {
	FLAG_TIME = setTimeout(function() {
		FLAG = true; //页面初始化的时候把ajax的弹窗激活
	}, 4900) //如果用户在100ms以内完成了返回+新跳转的话，toast还是会出现！
});


$$(document).on('pageAfterAnimation', function(e) {	

	//充值界面卸载后不进行隐藏modal
	if(e.detail.page.name != 'smk-recharge'){
		myApp.closeModal();
	}
	setTimeout(function() {
		changeTitle(e);
	}, 20)
})

//输入框蓝色光标闪烁时，点击左上角返回，页面返回到前一页后蓝色光标还会短暂停留才消失。（仅IOS有)
$$(document).on('pageBeforeAnimation', function(e) {
	$$('input:focus,textarea:focus').hide();
	setTransparentTitle(e,true);

})
$$(document).on('pageInit', function(e) {
	// Page Data contains all required information about loaded and initialized page 
	changeTitle(e);
	setTransparentTitle(e,true);
})

//网页标题修改
var changeTitle = function(e) {
		var page = e.detail.page;
		var name = page.name;
		var title = '杭州通';
		if (name.indexOf('getCard') > -1) {
			title = '杭州通';
		}
		if (name.indexOf('activeCard') > -1) {
			title = '激活';
		}
		if (name.indexOf('realName') > -1) {
			title = '实名认证';
		}
		if (name.indexOf('cardDetail') > -1) {
			title = '卡详情';
		}
		if (name.indexOf('busLine') > -1) {
			title = '开通线路';
		}
		if (name.indexOf('help') > -1) {
			title = '使用帮助';
		}
		if (name.indexOf('cancelResult') > -1) {
			title = '退卡结果';
		}
		if (name.indexOf('rechargeResult') > -1) {
			title = '支付结果';
		}
		if (name.indexOf('busList') > -1) {
			title = '乘车记录';
		}
		if (name.indexOf('recharge') > -1) {
			title = '充值';
		}
		if (name.indexOf('rechargeAuto') > -1) {
			title = '自动充值';
		}		
		if (name.indexOf('rechargeDetail') > -1) {
			title = '充值详情';
		}		
		if (name.indexOf('rechargeList') > -1) {
			title = '充值记录';
		}
		if (name.indexOf('rechargeResult') > -1) {
			title = '充值结果';
		}
		if (name.indexOf('amount') > -1) {
			title = '查询余额';
		}





		var $body = $$('body')
		document.title = title;
		var $iframe = $$('<iframe src="../resource/images/blank.html"></iframe>');
		$iframe.on('load', function() {
			setTimeout(function() {
				$iframe.off('load').remove();
			}, 0)
		})
		$body.append($iframe);
	}


//用事件委托，为未来元素绑定事件，只用iframe来模拟同一框架中跳转
$$(document).on('click', '.frame_detail', function(e) {
	var self = $$(this);
	var url = self.attr('url') || '';
	if (!url) {
		return showTips('暂无');
	}
	// alert(self.attr('url'));
	mainView.router.load({ //此处切记，主视图初始化的变量名必须是mainView，不然跳转不了
		url: VIEWURL + 'frame_detail.html',
		context: {
			url: url
		}
	});
});

	//增加输入框清空图标
$$(document).on('input', 'input[type=text]', function(evt) {
	var self = $$(this);
	var i = self.parent().find('i.empty');
	var l = i.length;
	if (self.val() == '') {
		i.addClass('zoomOut animated');
		setTimeout(function() {
			i.remove()
		}, 200);
		return;
	}
	if (l == 0 && self.val() != '') {
		var el = $$('<i class="empty bounceIn animated iconfont icon-qingchu"></i>');
		el.insertAfter(self);
	}

});

//增加搜索框清空图标
$$(document).on('input', 'input[type=search]', function(evt) {
	var self = $$(this);
	var i = self.parent().find('i.empty');
	var l = i.length;
	if (self.val() == '') {
		i.addClass('zoomOut animated');
		setTimeout(function() {
			i.remove()
		}, 200);
		return;
	}
	if (l == 0 && self.val() != '') {
		var el = $$('<i class="empty bounceIn animated iconfont icon-qingchu"></i>');
		el.insertAfter(self)
	}
});


//增加输入框清空图标
$$(document).on('focusin', 'input[type=text]', function(evt) {
	var self = $$(this);
	var i = self.parent().find('i.empty');
	var l = i.length;
	if (self.val() == '') {
		i.addClass('zoomOut animated');
		setTimeout(function() {
			i.remove()
		}, 200);
		return;
	}
	if (l == 0 && self.val() != '') {
		var el = $$('<i class="empty bounceIn animated iconfont icon-qingchu"></i>');
		el.insertAfter(self)
	}
});

//增加搜索框清空图标
$$(document).on('focusin', 'input[type=search]', function(evt) {
	var self = $$(this);
	var i = self.parent().find('i.empty');
	var l = i.length;
	if (self.val() == '') {
		i.addClass('zoomOut animated');
		setTimeout(function() {
			i.remove()
		}, 200);
		return;
	}
	if (l == 0 && self.val() != '') {
		var el = $$('<i class="empty bounceIn animated iconfont icon-qingchu"></i>');
		el.insertAfter(self)
	}
});




//失去焦点清空图标
$$(document).on('focusout', 'input[type=text]', function(evt) {
	var self = $$(this);
	var i = self.parent().find('i.empty');
	var l = i.length;
	self.parent().find('.js-max-input').remove();
	if (l > 0) {
		i.addClass('zoomOut animated');
		setTimeout(function() {
			i.remove()
		}, 200);
	}
});

//失去焦点清空图标
$$(document).on('focusout', 'input[type=search]', function(evt) {
	var self = $$(this);
	var i = self.parent().find('i.empty');
	var l = i.length;
	if (l > 0) {
		i.addClass('zoomOut animated');
		setTimeout(function() {
			i.remove()
		}, 200);
	}
});


//清空输入框
$$(document).on('click', 'i.empty', function(evt) {
	var self = $$(this);
	self.parent().find('.js-max-input').remove();
	self.prev().val('');
	self.addClass('zoomOut animated');
	setTimeout(function() {
		self.remove()
	}, 200);
	
});


$$(document).on('input', 'input.maxInput[type=text]', function(evt) {
	var self = $$(this);
	var inputer = self.parent().find('.js-max-input');
	if (self.val() == '') {
		inputer.remove();
		return;
	}
	if (inputer.length == 0 && self.val() != '') {
		var inputTip = $$('<div class="js-max-input bounceIn animated"></div>');
		inputTip.html(self.val());
		inputTip.insertAfter(self);
	} else {
		inputer.html(self.val());
	}
});
