const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [eventlabel, ...targetvals]) => {
  
var target = targetvals.join(' ');
  //Arguments: Name, Object

async function resolve(){
    
    var targetindex = await fn.getproperty(13, target, 'indexval');
    var revealmsg = await fn.getproperty(targetindex, target, 'description');
    var room = await fn.getproperty(7, eventlabel, 'room');
    room = room.replace('[', '').replace(']', '');
    var roomid = client.channels.get(room);
    messagehandler(['```' + revealmsg + '```'], roomid);
    }
  
  async function messagehandler (a, b){
var msgarray = a;
var channelid = b;
var timeoutstack = []
function doSetTimeout(i) {
setTimeout(function() { 
  msgarray[i] = msgarray[i].replace('[','').replace(']','').replace('<>','');
  var n = msgarray[i].indexOf('<');
  console.log('n = ' + n);
  if (n != -1) {var [replacemsg, url] = msgarray[i].split('<'); console.log(url); msgarray[i] = (replacemsg + '```'); url = url.replace('>```', ''); console.log(msgarray[i] + ';' + url); channelid.send(msgarray[i], {files: [url]});};
  if (n === -1) channelid.send(msgarray[i]);
}, timeoutstack[i]);
}
for (var i = 0; i < msgarray.length; i++){
 timeoutstack[i] = 5000 * i;
 doSetTimeout(i);
}}
  
  resolve();
}