//抽奖代码

var do_ticket = function(money){
    var people = 0,residue = 0,_5people = 0,_10people = 0,_20people = 0,_50people = 0,j = 0,a = 0,b = 0,c = 0,d = 0;
	/**
	红包金额区间：5元、10元、20元、50元
    红包比例：75%、10%、10%、5%
	
	设置四个时钟，分别对应10进制，20进制，30进制，100进制

	*/
    var _5 = function(){ //获得五元红包
		 a++;
	}
    var _10 = function(){ //获得10元红包
		 b++;
	}
    var _20 = function(){ //获得20元红包
		 c++;
	}
    var _50 = function(){ //获得50元红包
		 d++;
	}	
    var getTotle =function(){ //获得总金额
		return _5people*5+_10people*10+_20people*20+_50people*50
	}
	
	while( getTotle() < money)
	{
		 _5();
		 if(a==10){
			 a=0;
			 j++;
			 _5people++;
			 if(getTotle() > money){
			   _5people--;
			   residue = getTotle() - money;
			   break;
			 }
			 continue;
		 }
		 _10();
		 if(b==20){
			 b=0;j++;
			 _10people++;
			 if(getTotle() > money){
			   _10people--;
			   residue = getTotle() - money;
			 }
			 continue;
		 }
         _20();		 
		 if(c==30){
			 c=0;j++;
			 _20people++;
			 if(getTotle() > money){
			   _20people--;
			   residue = getTotle() - money;
			 }
			 continue;
		 }
		 _50();
		 if(d==100){
			 d=0;j++;
			 _50people++;
			 if(getTotle() > money){
			   _50people--;
			   residue = getTotle() - money;
			 }
			 continue;
		 }
         j++;	
	}
	/*
	return{
		'5元:':_5people,
		'10元:':_10people,
		'20元:':_20people,
		'50元:':_50people,
		totle:_5people*5+_10people*10+_20people*20+_50people*50
	}
	*/
	var str = '';
	str = '5元:'+_5people+'</br>' +
	      '10元:'+_10people+'</br>' +
	      '20元:'+_20people+'</br>' +
	      '50元:'+_50people+'</br>'+
          '总金额:'+ 
		  getTotle()+
		  '元'+'</br>'+
		  '人数：'+j+'</br>'
    str += '</br>剩余：' + (money-getTotle()) +'元'
	return str;
}
console.log(do_ticket(200000000))  //node速度是最快的，算2亿元的红包只要1秒