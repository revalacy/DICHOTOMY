const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

//command flow: name, stat, target
exports.run = (client, message, [name, stat, ...target]) => {
    
  //get all base variables for the command
    var user = message.author.id;//gets user ID for command author
    var roll = Math.floor(Math.random() *10)+1;
    if (stat === 'attack') stat = 'atk';
    if (stat === 'defense') stat = 'def';
    if (stat === 'damage') stat = 'dmg';
    if (stat === 'strength') stat = 'str';
    if (stat === 'dexterity') stat = 'dex';
    if (stat === 'perception') stat = 'per';
    var cmdgen = "buff";
    var extracost = target.length - 1;
    var cost = 5 + +extracost;
    var targetlength = target.length;
    var msg = ('');
    var messagearray = [];
    
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  
 
 async function resolve(){
   var [owner, buff, bonus, namestring] = await fn.getval(2, name, ['userid','buff', 'bonus', 'friendlyname']);
   
   if (!owner) return message.channel.send(name + ' doesn\'t exist in the database, please submit the character before attempting further actions.');
   if (owner != user)return message.channel.send('You can\'t use commands for someone else\'s character!');//check ownership
   var roomid = message.channel.id;
   var messagesarray = [];
   var roomstring = ('[' + roomid + ']');
   var eventstage = await fn.querydoc(7, 'room', roomstring, 'stage');
   if (eventstage != '1') return message.channel.send('The action window has ended! Please wait for the round to reset before making another action.');
   var cooldown = await fn.eventcdcheck(name, roomstring);
   
   var announcementchannel = client.channels.get('481931772540485648');//this should be changed to 503634158308818954 when not in DEV/QA
   if (cooldown === -1) return message.channel.send('You are not currently registered to the event taking place in this room! To register, please review the registration command for the event in ' + announcementchannel + '.');
   if (cooldown < cost) return message.channel.send(namestring + ' does not have enough action points to go through the attack! Remaining points: ' + cooldown);
  var total = +roll + +buff + +bonus;
   if (stat != 'atk' && stat != 'def' && stat!= 'damage' && stat != 'heal' && stat != 'cover' && stat != 'dmg' && stat != 'str' && stat != 'dex' && stat != 'per') return message.channel.send('That stat isn\'t a valid stat to apply a buff to. You may buff: attack, defense, damage, strength, dexterity, perception, heal, or cover for your targets.');
   
   
for (var u = 0; u < targetlength; u++){
   var actiontarget = target[u];
   var targetname = await fn.getproperty(2, actiontarget, 'friendlyname');
  if (targetname === 'none') return message.channel.send(actiontarget + ' doesn\'t exist in the database, please make sure the character is submitted before attempting further actions, or check your spelling and try again.');
   var totalstring = total.toString();
   var statstring = await fn.getproperty(4, stat, 'replace')
   var msg = await fn.getproperty(4, totalstring, 'buff');//pull buff response and value
   msg = msg.replace('#',name).replace('#',targetname).replace('#',statstring).replace('#', name);
   var buffval = await fn.getproperty(4, totalstring, 'buffval');
   if (+buffval > 0) {//if buff value is > 0 pull target's stat string and apply the buff
     var targetstat = await fn.getproperty(2, actiontarget, stat);
     var newstat = (targetstat + ',' + buffval);
    fn.setval(2, actiontarget, [stat],[newstat]);
     messagearray[u] = msg;
   };
  
};
   await fn.setval(2, name, ['bonus'],[0]);
   var actionpoints = +cooldown - +cost;
   messagehandler(messagearray);
   fn.setcooldown(name, roomstring, actionpoints);//set cooldown
 }
  
      async function messagehandler (a){
        var msgarray = a;
        var timeoutstack = []
        var urlarray = [];
        function doSetTimeout(i) {
        setTimeout(function() { 
          msgarray[i] = msgarray[i].replace('[','').replace(']','').replace('||','');
          msgarray[i] = msgarray[i] + '**';
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