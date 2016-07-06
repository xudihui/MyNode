/* 读取txt文件
   readFile.js

*/


// 引入fs文件处理模块
var fs = require("fs");

fs.readFile('input.txt',function(err,data){
	if(err){
		console.log(err.stack);
		return;
	}
	console.log('文本内容:' + data.toString());
});

