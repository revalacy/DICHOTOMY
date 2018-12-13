const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, eventlabel, ...objectvals]) => {
  
var object = objectvals.join(' ');
  //Arguments: Name, Object

async function resolve(){
    
    var username = await fn.getproperty(2, name, 'friendlyname');
    var revealmsg = await fn.getproperty(9, object, 'description');
    var room = await fn.getproperty(7, eventlabel, 'room');
    room = room.replace('[', '').replace(']', '');
    var roomid = client.channels.get(room);
    var msg = ('```Something new has been revealed by ' + username + '! \n\n\n\n' + revealmsg + '```');
    var clueval = await fn.querydoc(10, 'friendlyname', object, 'label');
    console.log(clueval);
    var target = await fn.getproperty(10, clueval, 'revealclear');
    var targetindex = await fn.getproperty(13, target, 'indexval');
    var targetclues = await fn.getproperty(targetindex, target, 'hasclues');
    var cluestring = clueval + ',';
    targetclues = targetclues.replace(cluestring, '').replace(',,',',');
    await fn.setval(targetindex, target, ['hasclues'], [targetclues]);
    messagehandler([msg], roomid);
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