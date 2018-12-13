const async = require ('async');
const fn = require ('./../functions.js');
var efn = require ('./../effects.js');

//command flow: name, stat, target
exports.run = (client, message, [name, stat]) => {
  
  var user = message.author.id;//gets user ID for command author
    var roll = Math.floor(Math.random() *10)+1;
    if (stat === 'attack') stat = 'atk';
    if (stat === 'defense') stat = 'def';
    if (stat === 'damage') stat = 'dmg';
    if (stat === 'strength') stat = 'str';
    if (stat === 'dexterity') stat = 'dex';
    if (stat === 'perception') stat = 'per';
    var namestring = ('**' + name + '** ');
    var cmdgen = "charge";
    var cost = 10;
    
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  
 
 async function resolve(){
   var [owner, modifier] = await fn.getval(2, name, ['userid', stat]);
   if (!owner) return message.channel.send(' doesn\'t exist in the database, please submit the character before attempting further actions.');
   if (owner != user) return message.channel.send('You can\'t use commands for someone else\'s character!');//check ownership
   if (stat != 'atk' && stat != 'heal' && stat != 'buff') return message.channel.send('That stat isn\'t a valid stat to apply a buff to. You may charge: attack, defense, heal, or buff for your target.');
  if (stat === "wit" || stat === "res") return message.channel.send('That stat cannot be used for attack, please use one of the other available stats.');
   var roomid = message.channel.id;
   var roomstring = ('[' + roomid + ']');
   var eventstage = await fn.querydoc(7, 'room', roomstring, 'stage');
   if (eventstage != '1') return message.channel.send('The action window has ended! Please wait for the round to reset before making another action.');
   var cooldown = await fn.eventcdcheck(name, roomstring);
   var announcementchannel = client.channels.get('481931772540485648');//this should be changed to 503634158308818954 when not in DEV/QA
   if (cooldown === -1) return message.channel.send('You are not currently registered to the event taking place in this room! To register, please review the registration command for the event in ' + announcementchannel + '.');
   if (cooldown < cost) return message.channel.send(namestring + ' does not have enough action points to go through the attack! Remaining points: ' + cooldown);

  var username = await fn.getproperty(2, name, 'friendlyname');
    var roll = Math.floor(Math.random() *10) + 1;
    var [chargeval, msg] = await fn.getval(4, roll, ['chargeval', 'charge']);
    var statname = await fn.getproperty(4, stat, 'replace');
    msg = [msg.replace('#', username).replace('#', statname).replace('#', statname)];
    var newstat = (modifier + ',' + chargeval);
    await fn.setval(2, name, [name],[newstat]);
    messagehandler(msg);
   var actionpoints = +cooldown - +cost;
   fn.setcooldown(name, roomstring, actionpoints);//set cooldown
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