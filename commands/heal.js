const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

//command flow: name, stat, target
exports.run = (client, message, [name, ...target]) => {
    
  //get all base variables for the command
    var user = message.author.id;//gets user ID for command author
    var roll = Math.floor(Math.random() *10)+1;
    var cmdgen = "heal";
    var targetlength = target.length;
    var extracost = target.length - 1;
    var cost = 5 + +extracost;
    var messagearray = [];
  
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a **new** command, as editing the previous will not resolve.');
  if (!target) return message.channel.send('You are required to indicate a target in your command. Post a new command with a target specified.');
 
 async function resolve(){
   var [owner, int, bonus, heal, namestring] = await fn.getval(2, name, ['userid','int','bonus','heal', 'friendlyname']);
   if (owner === 'none') return message.channel.send(' doesn\'t exist in the database, please submit the character before attempting further actions.');
   if (owner != user)return message.channel.send('You can\'t use commands for someone else\'s character!');//check ownership
   var roomid = message.channel.id;
   var roomstring = ('[' + roomid + ']');
   var cooldown = await fn.eventcdcheck(name, roomstring);
   var announcementchannel = client.channels.get('481931772540485648');//this should be changed to 503634158308818954 when not in DEV/QA
   if (cooldown === -1) return message.channel.send('You are not currently registered to the event taking place in this room! To register, please review the registration command for the event in ' + announcementchannel + '.');
   if (cooldown < cost) return message.channel.send(namestring + ' does not have enough action points to go through the heal! Remaining points: ' + cooldown);
   var [healtotal, newheal] = await fn.sumstring(heal);
   var [inttotal, newint] = await fn.sumstring(int);
   console.log('roll = ' + roll + '; inttotal = ' + inttotal + '; bonus = ' + bonus + '; healtotal = ' + healtotal);
   var total = +roll + +inttotal + +bonus + +healtotal;//get roll+modifiers total
   console.log(total);
   var healval = await fn.getproperty(4, total, 'healeffect');
   
   for (var i = 0; i < targetlength; i++){
   var actiontarget = target[i];
   var targetname = await fn.getproperty(2, actiontarget, 'friendlyname');
     if (targetname === 'none') return message.channel.send(actiontarget + ' doesn\'t exist in the database, please make sure the character is submitted before attempting further actions, or check your spelling and try again.');
   var msg = await fn.getproperty(4, total, 'heal');
   msg = msg.replace('#', namestring).replace('#', namestring).replace('#', targetname);
   await fn.hpres(actiontarget, cmdgen, healval);
   messagearray[i] = msg;
 };
   
   fn.setval(2, name, ['int', 'bonus', 'heal'], [newint, 0, newheal]);
   messagehandler(messagearray);
   var actionpoints = +cooldown - +cost;
   fn.setcooldown(name, roomstring, actionpoints);
 }
  
      async function messagehandler (a){
        var msgarray = a;
        var timeoutstack = []
        var urlarray = [];
        function doSetTimeout(i) {
        setTimeout(function() { 
          msgarray[i] = msgarray[i].replace('[','').replace(']','').replace('||','');
          var n = msgarray[i].indexOf('|');
          console.log('n = ' + n);
          if (n != -1) {var [replacemsg, url] = msgarray[i].split('|'); console.log(url); msgarray[i] = replacemsg; console.log(msgarray[i] + ';' + url); message.channel.send(msgarray[i], {files: [url]});};
          if (n === -1) message.channel.send(msgarray[i]);
        }, timeoutstack[i]);
        }
        for (var i = 0; i < msgarray.length; i++){
         timeoutstack[i] = 5000 * i;
         doSetTimeout(i);
        }}
  resolve();
  
}