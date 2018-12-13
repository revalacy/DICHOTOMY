const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

exports.run = (client, message, [name, stat, ...target]) => {
    
  //get all base variables for the command
    var user = message.author.id;//gets user ID for command author
    
    var cmdgen = "attack";
    var extracost = target.length - 1;
    var cost = 5 + extracost;
    var targetlength = target.length;
  
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  if (!stat) return message.channel.send('You must include the relevant stat in your command. Please post a new command, as editing the previous will not resolve.');


 
 async function resolve(){
   var [owner, modifier, atk, dmg, bonus, namestring] = await fn.getval(2, name, ['userid', stat, "atk", "dmg", 'bonus', 'friendlyname']);
   if (owner === 'none') return message.channel.send(name + ' doesn\'t exist in the database, please make sure the character is submitted before attempting further actions, or check your spelling and try again.');
   if (owner != user)return message.channel.send('You can\'t use commands for someone else\'s character!');//check ownership
   if (stat === "wit" || stat === "res") return message.channel.send('That stat cannot be used for attack, please use one of the other available stats.');
   var roomid = message.channel.id;
   var msg = ('[**#** launches **#** attacks on **#**! When the round ends, # will need to roll defense! **[** # **]]');
   var actionlog = ('# launched attacks on #.');
   var messagesarray = [];
   var targetsarray = [];
   var rollarray = [];
   
   var roomstring = ('[' + roomid + ']');
   var eventlabel = await fn.querydoc(7, 'room', roomstring, 'label');
   var [eventstage] = await fn.getval(7, eventlabel, ['stage']);
   if (eventstage != '1') return message.channel.send('The action window has ended! Please wait for the round to reset before making another action.');
   var cooldown = await fn.eventcdcheck(name, roomstring);
   var announcementchannel = client.channels.get('481931772540485648');//this should be changed to 503634158308818954 when not in DEV/QA
   if (cooldown === -1) return message.channel.send('You are not currently registered to the event taking place in this room! To register, please review the registration command for the event in ' + announcementchannel + '.');
   if (cooldown < cost) return message.channel.send(namestring + ' does not have enough action points to go through the attack! Remaining points: ' + cooldown);
  
   
   var [modtotal, newstat] = await fn.sumstring(modifier);
   var [attacktotal, newatk] = await fn.sumstring(atk);
   var [damagetotal, newdmg] = await fn.sumstring(dmg);
   
for (var i = 0; i < targetlength; i++){
   var roll = Math.floor(Math.random() *10)+1;
   var attacktarget = target[i];
   if (name === attacktarget) return message.channel.send("Why are you attacking ***yourself***? Please choose a target other than you!");
  console.log('Executing attack setup for ' + attacktarget);
   var targetname = await fn.getproperty(2, attacktarget, 'friendlyname');
   if (targetname === 'none') return message.channel.send(attacktarget + ' doesn\'t exist in the database, please make sure the character is submitted before attempting further actions, or check your spelling and try again.');
   var total = +roll + +modtotal + +bonus + +attacktotal;//get total of roll
   console.log('roll = ' +roll +'; mod = ' +modtotal + '; bonus = ' +bonus + '; attacktotal = ' +attacktotal)
   var searchval = total.toString();
   var damage = await fn.getproperty(4, searchval, "dmgtarget");//get damage min for total
   var fulldmg = +damage + +damagetotal;
    if (+total <= 1) fn.doom(name);//if total = 1 run Doom
   var pendingattackstring = await fn.getproperty(2, attacktarget, "attacks");//get target's pending attack string
   var newstring = (name + " | " + total + " | " + fulldmg + ",")//create new attack string
   var setstring = (pendingattackstring + newstring);//add new string to the end of pending attack string
   if(+total > 4 ) fn.setval(2, attacktarget, ["attacks"],[setstring]);//set new attack string
    targetsarray[i] = targetname;
    rollarray[i] = '**' + total + '** vs ' + targetname;
   };
   
   targetsarray = [...new Set(targetsarray)]; 
   console.log(targetsarray + '; length = ' + targetsarray.length);
   var targetstring;
   var t_index = targetsarray.length - 1;
   if (targetsarray.length > 1) targetsarray[t_index] = ('and ' + targetsarray[t_index]);
   if (targetlength === 1) msg = msg.replace('attacks', 'attack');
  if (targetsarray.length > 2) targetstring = targetsarray.join(', ');
  if (targetsarray.length < 3) targetstring = targetsarray.join(' ');
   
   var rollstrings = rollarray.join('; ');
   msg = msg.replace('#', namestring).replace('#', targetlength).replace('#',targetstring).replace('#', targetstring).replace('#',rollstrings);
   await fn.setval(2, name, ['atk','dmg','bonus',stat],[newatk,newdmg,0,newstat]);//reset name's attack and dmg minimums
   var actionpoints = +cooldown - +cost;
   fn.setcooldown(name, roomstring, actionpoints);
   var messagesarray = [msg];
   return messagehandler(messagesarray);
 }
  
      async function messagehandler (a){
        var msgarray = a;
        var timeoutstack = []
        function doSetTimeout(i) {
        setTimeout(function() { 
          msgarray[i] = msgarray[i].replace('[','').replace(']]',']**').replace('<>','');
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