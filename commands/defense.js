const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

//command flow: name, stat, target
exports.run = (client, message, [name]) => {
    
  //get all base variables for the command
    var user = message.author.id;//gets user ID for command author
    var cost = 0;
    var msg = ('[**#** defends against **#** attacks from **#** and succeeds **#** rolls!# **[#]]');
    var failmsg = (' # will take damage from # attacks if they are not covered!');
    var targetarray = [];
    var rollsarray = [];
    var failures = 0;
    var successes = 0;
    
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  
 
 async function resolve(){
   var [owner, attacks, def, bonus, pendingdmgstring, namestring] = await fn.getval(2, name, ['userid', 'attacks', 'def', 'bonus', 'damages', 'friendlyname']);
   if (owner === 'none') return message.channel.send(' doesn\'t exist in the database, please submit the character before attempting further actions.');
   if (owner != user)return message.channel.send('You can\'t use commands for someone else\'s character!');//check ownership
   var roomid = message.channel.id;
   failmsg = failmsg.replace('#', namestring);
   var roomstring = ('[' + roomid + ']');
   var eventstage = await fn.querydoc(7, 'room', roomstring, 'stage');
   if (eventstage != '2') return message.channel.send('The reaction window has ended! Please wait for the current round to end before attempting to react.');
   var cooldown = await fn.eventcdcheck(name, roomstring);
   var announcementchannel = client.channels.get('481931772540485648');//this should be changed to 503634158308818954 when not in DEV/QA
   if (cooldown === -1) return message.channel.send('You are not currently registered to the event taking place in this room! To register, please review the registration command for the event in ' + announcementchannel + '.');
   var newdamage = pendingdmgstring;
   var stringattacks = attacks.toString();
   if (!stringattacks) return message.channel.send ('You do not have any currently-pending attacks. If you\'d like to rectify this, you may attempt insulting a neighbor or colleague and an attack should be entered shortly thereafter.');
   var attack = stringattacks.split(',');
   attack = attack.filter(a => a != '');
   
for (var d = 0; d < attack.length; d++){
   var attackstring = (attack[d] + ',');
   var roll = Math.floor(Math.random() *10)+3;
   var [deftotal,defreset] = await fn.sumstring(def);
   const [attacker, attackroll, damage] = attack[d].split(' | ');//get attacker, attack roll, damage value
   var attackername = await fn.getproperty(2, attacker, 'friendlyname');
   var defense = +roll + +bonus + +deftotal; //get the total defense roll
   var state = await fn.getstate(defense, attackroll);//set the success/fail state
   var statestring = state.toString();
   if (statestring === '0') {cost = 10; failures = failures + 1;}
   console.log('state = ' + state);
   if (statestring === '1') {attackstring = ''; successes = successes + 1;}//if state = 0 set the pending damage string
   newdamage = (newdamage + attackstring);
     console.log(newdamage);
   targetarray[d] = attackername;
   rollsarray[d] = (defense + ' vs ' + attackroll);
   };
   targetarray = [...new Set(targetarray)]; 
   console.log(targetarray);
   failmsg = failmsg.replace('#', failures);
   if (failures === 0) failmsg = '';
   var targetstring;
   var rollstring = rollsarray.join('; ');
   var len = targetarray.length - 1;
   if (targetarray.length > 1 ) targetarray[len] = 'and ' + targetarray[len];
   if (attack.length === 1) msg.replace('attacks', 'attack');
   if (targetarray.length > 2) targetstring = targetarray.join(', ');
   if (targetarray.length < 3) targetstring = targetarray.join(' ');
   msg = msg.replace('#', namestring).replace('#', attack.length).replace('#', targetstring).replace('#', successes).replace('#', failmsg).replace('#', rollstring);
   var actionpoints = +cooldown - +cost;
   await fn.setval(2, name, ['def', 'bonus','editlock','attacks', 'damages'],[defreset, 0, 0, '', newdamage]);//clear bonuses from defense
   fn.setcooldown(name, roomstring, actionpoints);
   messagehandler([msg]);
 }
  
      async function messagehandler (a){
        var msgarray = a;
        var timeoutstack = []
        var urlarray = [];
        function doSetTimeout(i) {
        setTimeout(function() { 
          msgarray[i] = msgarray[i].replace('[','').replace(']]',']**').replace('||','');
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