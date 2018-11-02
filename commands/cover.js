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
exports.run = (client, message, args) => {
    
  //get all base variables for the command
    var name = args[0];
    var target = args[1];
    var bonus = args[2]||"0";
    var user = message.author.id;//gets user ID for command author
    var roll = Math.floor(Math.random() *10)+1;

  
  if (!name) return message.channel.send('You must include your character\'s first name in your command. Please post a new command, as editing the previous will not resolve.');
  if (!target) return message.channel.send('You must include the target of your cover action!');
  if (name === target) return message.channel.send('You can\'t cover yourself!');
  
 
 async function resolve(){
   var [owner, eventstatus, locked] = await fn.getval(2, name, ['userid','inevent','editlock']);
   if (!owner) return message.channel.send(' doesn\'t exist in the database, please submit the character before attempting further actions.');
   if (owner != user)return message.channel.send('You can\'t use commands for someone else\'s character!');//check ownership
   if (eventstatus === "0") return message.channel.send ('You are not currently in any events. Combat commands are only usable in active events. If you believe this message was received in error, please reach out to a GM or Admin.');
   var room = message.channel.id;
   var announcementroom = client.channels.get('503634158308818954');
   var attacks = await fn.getproperty(2, target, "damages");//get pending damage strings
   var stringattacks = attacks.toString();
   if (!attacks) return message.channel.send(target + ' doesn\'t seem to have any pending attacks, please wait for a failed defense roll.');
   var attackstring = attacks.split(',');//split attacker from damage
   var attack = attackstring[0];
   var attackreplace = (attack + ',');
   var newstring = attacks.replace(attackreplace, '');
   var [attacker, attackroll, damage] = attack.split(' | ');
   if (+roll < 3) return message.channel.send('**'+name + '** attempted to cover **' + target + '** from **' + attacker.toString() + '** but wasn\'t quite fast enough! Can anyone else try to help? **['+ roll + ']**');
   fn.setval(2, target, ['damages'],[newstring]);
   var [def, bonus, hp, soak, cover] = await fn.getval(2, name, ['def','bonus','hp','soak', 'cover']);//get defense modifier
   var [deftotal,defreset] = await fn.sumstring(def);
   var [covertotal, coverreset] = await fn.sumstring(cover);
   var defense = +roll + +bonus + +deftotal + +covertotal; //get the total defense roll
   var state = await fn.getstate(defense, attackroll);//get state of (roll, 7)
   console.log(state);
   damage = +damage * -1;
   if (state === 1) damage = 0;
   var statestring = state.toString();
   var [string1, string2] = await fn.getval(4, statestring, ['cover1', 'cover2']);
   var msg = ('**' + name + '** covered ' + target + ' from ' + attacker + string1 + name + string2);
   message.channel.send(msg);//send success/fail message
   fn.hpresolve(name, damage);
   fn.setval(2, name, ['def', 'bonus','editlock','cover'],[defreset,0,0,coverreset]);//clear bonuses from defense
    }
  
  resolve();
}