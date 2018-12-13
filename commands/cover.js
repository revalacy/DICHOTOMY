const async = require ('async');
const GoogleSpreadsheet = require('google-spreadsheet');
    const creds = require('./../client_secret.json');
    const doc1 = new GoogleSpreadsheet('1kxcMdb0Gsyg9Oe3NbWMXx1vHopFjqLzneXehoURAN6M');//Character database
    const doc2 = new GoogleSpreadsheet('16bWQdKPv4elUPb8UKqD3NP-Ve5TwHGjQWBdAhbkOBLI');//objects and sets database
    const doc3 = new GoogleSpreadsheet('1fuXzJ1_rvlHIFRRwTZXfnDrxzyn2yrvukXe0Th_i8-8');//events database
    doc1.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});
    doc2.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});
    doc3.useServiceAccountAuth(creds, function (err) {
    if (err)
    console.log(err)});

var fn = require ('./../functions.js');

//command flow: name, stat, target
exports.run = (client, message, [name, target]) => {
    
  //get all base variables for the command
    var announcementchannel = client.channels.get('481931772540485648');//this should be changed to 503634158308818954 when not in DEV/QA
    var user = message.author.id;//gets user ID for command author     ☑          ☐
    var roll = Math.floor(Math.random() *10)+1;
    var cmdgen = "cover";
    var cost = 0;

  
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  if (!target) return message.channel.send('You must include the target of your cover action!');
  if (name === target) return message.channel.send('You can\'t cover yourself!');
  
 
 async function resolve(){
   var [owner, namestring] = await fn.getval(2, name, ['userid', 'friendlyname']);
   if (owner === 'none') return message.channel.send(name + ' doesn\'t exist in the database, please submit the character before attempting further actions.');
   if (owner != user)return message.channel.send('You can\'t use commands for someone else\'s character!');//check ownership
   var roomid = message.channel.id;
   var targetname = await fn.getproperty(2, target, 'friendlyname');
   if (targetname === 'none') return message.channel.send(target + ' doesn\'t exist in the database, please make sure the character is submitted before attempting further actions, or check your spelling and try again.');
   var roomstring = ('[' + roomid + ']');
   var eventlabel = await fn.querydoc(7, 'room', roomstring, 'label');
   var roundstage = await fn.getproperty(7, eventlabel, 'stage');
   if (roundstage != '2') return message.channel.send('Please wait for the reaction window to attempt to cover a target.');
   var cooldown = await fn.eventcdcheck(name, roomstring);
   
   if (cooldown === -1) return message.channel.send('You are not currently registered to the event taking place in this room! To register, please review the registration command for the event in ' + announcementchannel + '.');
  if (cooldown < cost) return message.channel.send(namestring + ' does not have enough action points to go through the attack! Remaining points: ' + cooldown);

   var attacks = await fn.getproperty(2, target, "damages");//get pending damage strings
   var stringattacks = attacks.toString();
   if (!attacks) return message.channel.send(target + ' doesn\'t have any pending damage, please wait for a failed defense roll.');
   var attackstring = attacks.split(',');//split attacker from damage
   var attack = attackstring[0];
   var attackreplace = (attack + ',');
   var newstring = attacks.replace(attackreplace, '');
   var [attacker, attackroll, damage] = attack.split(' | ');
   var attackername = await fn.getproperty(2, attacker, 'friendlyname');
   if (+roll < 3) return message.channel.send('**'+name + '** attempted to cover **' + target + '** from **' + attacker.toString() + '** but wasn\'t quite fast enough! Can anyone else try to help? **['+ roll + ']**');
   fn.setval(2, target, ['damages'],[newstring]);
   var [def, bonus, hp, soak, cover] = await fn.getval(2, name, ['def','bonus','hp','soak', 'cover']);//get defense modifier
   var damagestring = (+damage - +soak);
   var [deftotal,defreset] = await fn.sumstring(def);
   var [covertotal, coverreset] = await fn.sumstring(cover);
   var defense = +roll + +bonus + +deftotal + +covertotal; //get the total defense roll
   var state = await fn.getstate(defense, attackroll);//get state of (roll, 7)
   console.log(state);
   damage = +damage * -1;
   if (state === 1) damage = 0;
   var statestring = state.toString();
   var msg = await fn.getproperty(4, statestring, 'cover');
   msg = [msg.replace('#',namestring).replace('#', defense).replace('#',targetname).replace('#',attackername).replace('#',attackroll).replace('#',namestring).replace('#',damagestring).replace('#', defense).replace('#', attackroll)];
   messagehandler(msg);
   await fn.hpres(name, cmdgen, attack);
   await fn.setval(2, name, ['def', 'bonus','editlock','cover'],[defreset,0,0,coverreset]);//clear bonuses from defense
   var actionpoints = +cooldown - +cost;
   fn.setcooldown(name, roomstring, actionpoints);//set cooldown
    }
  
  
  
      async function messagehandler (a){
        var msgarray = a;
        var timeoutstack = []
        var urlarray = [];
        function doSetTimeout(i) {
        setTimeout(function() { 
          msgarray[i] = msgarray[i].replace('[','').replace(']]',']**').replace('{}','');
          var n = msgarray[i].indexOf('{');
          console.log('n = ' + n);
          if (n != -1) {var [replacemsg, url] = msgarray[i].split('{'); console.log(url); msgarray[i] = replacemsg; console.log(msgarray[i] + ';' + url); message.channel.send(msgarray[i], {files: [url]});};
          if (n === -1) message.channel.send(msgarray[i]);
        }, timeoutstack[i]);
        }
        for (var i = 0; i < msgarray.length; i++){
         timeoutstack[i] = 5000 * i;
         doSetTimeout(i);
        }}
  
  resolve();
}