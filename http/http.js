/* http请求模块
   http.js

*/


// 引入http模块
var http = require('http');

http.createServer(function(request,response){
	request.on('end',function(){ 
		response.writeHead(200,{'Content-Type':'text/html'});
	});
	
	response.end('Welcome to here!');
	
}).listen('8888');
