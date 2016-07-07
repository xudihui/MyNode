/* 事件发射器以及事件回调
   eventEmitter.js
   
   js事件在前端浏览器中，每个事件都会伴随和它相关的DOM元素一起出现，甚至可以通过event对象来溯源targetElement或者srcElement；
   在nodeJs中，事件不伴随DOM元素，表示在事件处理或者http阶段不同的状态。
*/
// 引入 events 模块
var events = require('events');
// 创建 eventEmitter 对象
var eventEmitter = new events.EventEmitter();

// 创建事件处理程序
var connectHandler = function connected() {
   console.log('连接成功。');
  
   // 触发 data_received 事件 
   eventEmitter.emit('data_received');
}

// 绑定 connection 事件处理程序
eventEmitter.on('connection', connectHandler);
 
// 使用匿名函数绑定 data_received 事件
eventEmitter.on('data_received', function(){
   console.log('数据接收成功。');
});

// 触发 connection 事件 
eventEmitter.emit('connection');

console.log("程序执行完毕。");

